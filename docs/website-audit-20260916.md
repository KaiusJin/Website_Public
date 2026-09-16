**修复状态：** 此文件保留修复前的审查证据。已完成的修复及当前数据库状态见 [修复记录](implementation-progress.md) 与 [CMS 说明](../supabase/README.md)。按用户后续指示，旧图、人物动画和场景资源全部保留；新增测试已精简。

**Website 审查记录 — 2026-09-16**

审查对象是当前工作区的 Website_Public，以及相邻 Website_Admin 的实际读写代码。当前工作区已有大量未提交修改；本次未修改应用代码、Admin 或线上数据，仅新增此报告。线上核查通过 `.env.local` 中的凭据完成，报告不包含凭据。

结论：有一个阻止两种前端启动的问题、多个 CMS 展示和写入缺口，以及可移出发布目录的旧资源。旧发布/草稿逻辑已从运行中的前后端移除，不能因为历史 SQL 仍包含这些词就把整条迁移链删除。

**已验证的线上状态**

| 表 | 数据库行数 | 匿名读取行数 |
| --- | ---: | ---: |
| projects | 3 | 3 |
| work_experiences | 2 | 2 |
| club_experiences | 1 | 1 |
| volunteer_experiences | 1 | 1 |
| awards | 4 | 4 |
| skills | 4 | 4 |
| site_profile | 0 | 0 |
| personal_entries | 0 | 0 |
| journey_scene_content | 0 | 0 |
| media_assets | 0 | 未尝试公开读取，属于后台元数据 |

- 已不存在 `experiences`、`content_drafts`、`visibility`、`translations`、`date_badge`，也不存在 `journey_fields`、`journey_reorder`、保存草稿和发布 RPC。public 中仅保留 `journey_is_admin` 和 `journey_touch` 两个函数。
- projects、skills、awards 的管理员策略已统一为 `journey_is_admin()`，符合最后一个清理迁移的结果。
- `journey-drafts` bucket 仍存在，0 个对象；`journey-media` 也为 0 个对象。Storage 管理策略只允许操作 `journey-media`。
- `supabase_migrations` 下没有查询到迁移历史表。结构已经完成清理，不等于迁移历史已经登记。
- 3 个项目均有开始和结束日期，但均无非空 bullets、封面；4 个 skills 类别均无非空技能数组。这些空内容并非前端过滤造成。

**需要优先修复的问题**

1. **[P1] 两种前端的入口引用了未导入的 React。**
   [src/main.jsx:7](/Users/kaius/Project/Website_Public/src/main.jsx:7) 使用 `<React.StrictMode>`，但只导入了 `Suspense` 和 `lazy`。生产构建中仍为 `React.StrictMode`，HTML 也没有提供 React 全局。对经过 Vite 转换的入口模块执行验证，得到 `ReferenceError: React is not defined`。此处在选择 classic/journey 之前执行，因此影响两个入口。应显式导入 `StrictMode` 并使用 `<StrictMode>`，或导入 React。JSX automatic runtime 不会自动定义这个标识符。现有 lint 和 build 都未捕获它。

2. **[P2] classic 完全没有接入 Profile & Contact 的 CMS 内容。**
   [About.jsx:1](/Users/kaius/Project/Website_Public/src/components/sections/About.jsx:1)、[Hero.jsx:13](/Users/kaius/Project/Website_Public/src/components/sections/Hero.jsx:13)、[Contact.jsx:11](/Users/kaius/Project/Website_Public/src/components/sections/Contact.jsx:11) 使用静态内容，没有读取 `site_profile`。Admin 编辑的 `heading/intro/bio/location/email/github/linkedin/resume_url` 不会反映到 classic；简历也无展示入口。当前线上该表为空，因此这是录入后的确定缺口。应让 classic 读取同一资料记录，并明确只有“没有记录”时才使用默认内容。

3. **[P2] classic 漏掉已存在的全部项目日期。**
   [ProjectRow.jsx:24](/Users/kaius/Project/Website_Public/src/components/sections/ProjectRow.jsx:24) 展示标题、bullets、技能和链接，但不使用 `start_date/end_date/is_present`。首页与 AllProjects 共用该组件，两个位置都遗漏。线上 3 个项目都有日期；构造带日期标记的记录并实际渲染后，两个日期标记均未出现在 HTML 中。Journey 的 Record 已展示这些字段。应补日期展示，不能把数据库日期字段当作无用字段删除。

4. **[P2] Journey 的日志读取错误被伪装成空内容。**
   [ContentPanel.jsx:25](/Users/kaius/Project/Website_Public/src/journey/components/ContentPanel.jsx:25) 只将 about/contact 映射到 `site_profile`，遗漏 `personal → personal_entries`。hook 返回失败表名 `personal_entries`，面板却查找 `personal`，于是落入“等待第一篇故事”的空状态。实际渲染已复现：日志错误提示为 false、空状态为 true；projects 的同类错误提示正常。应统一 section 与源表的映射。

5. **[P2] Admin 的排序写入方式不适用于新增 CMS 表。**
   [DataManager.jsx:40](/Users/kaius/Project/Website_Admin/src/components/DataManager.jsx:40) 用只有 `id/order` 的数组执行 upsert。`personal_entries.kind/title`、`journey_scene_content.scene_id/title` 是无默认值的 NOT NULL 列；INSERT 路径会先违反约束，不能靠已有 id 冲突消除必填要求。在隔离 PostgreSQL 的完整迁移后结构上，对已有日志执行相同 SQL，复现 `null value in column "kind" ... violates not-null constraint`。应采用真正的更新方式；不要恢复已经退役的 draft/publish 系统。现有 SQL 测试使用普通 UPDATE，因而掩盖了 Admin 的真实问题。

6. **[P2] Journey 的场景 CMS 文案只覆盖章节字幕。**
   [JourneyApp.jsx:63](/Users/kaius/Project/Website_Public/src/journey/JourneyApp.jsx:63) 查找场景记录，并在章节字幕中使用；但地图卡片仍在 [JourneyApp.jsx:87](/Users/kaius/Project/Website_Public/src/journey/JourneyApp.jsx:87) 直接读取 `regions` 的静态标题和描述，路牌、mini-map 的标签也使用静态标题。Admin 修改场景后，同一地点会显示两套名称。应统一一个场景文案解析入口。当前场景表为空，尚无线上记录受影响。

7. **[P2] 清空 Journey 联系方式会重新显示硬编码的旧值。**
   [ContentPanel.jsx:29](/Users/kaius/Project/Website_Public/src/journey/components/ContentPanel.jsx:29) 使用 `profile.email || 默认邮箱`、`profile.github || 默认 GitHub`、`profile.linkedin || 默认 LinkedIn`。即使资料记录已经存在，Admin 主动清空字段仍不能隐藏该链接。应区分“还未创建 profile”与“已有 profile，但字段留空”。heading/intro/bio 的逐字段回退也有同样的编辑语义问题。当前空表仍需要默认资料；不能不分情况地删除所有默认值。

8. **[P2] classic 丢失经历的类别语义。**
   [Experience.jsx:10](/Users/kaius/Project/Website_Public/src/components/sections/Experience.jsx:10) 将工作、社团、志愿经历合并，统一放在 Work Experience 标题下，也没有在记录中显示来源类别。线上已有 1 条社团和 1 条志愿经历，内容本身有显示，但被标成工作经历。应分组或加类别标签；不要重新恢复旧 `experiences` 表。

**Admin 字段到前端的覆盖情况**

| Admin/数据库内容 | classic | Journey | 判断 |
| --- | --- | --- | --- |
| 项目标题、bullets、skills、源码/网站及标签、封面及 alt | 展示；额外 bullets 需展开 | 展示 | 链路存在 |
| 项目起止日期、Present | 不展示 | 展示 | 实际遗漏，见问题 3 |
| 三类经历的内容、日期、skills、网站及标签 | 展示，但类别合并 | 分类别展示 | classic 类别语义丢失 |
| 经历 role_icon | 展示 | 不使用 FontAwesome 图标字段 | 视觉差异，不能据此删掉数据库字段 |
| 奖项标题、组织、年份、说明、bullets、证书链接及标签 | 展示 | 展示 | 链路存在 |
| skills.category、skills[].tag | 展示 | 展示 | 当前无技能标签是源数据为空 |
| skills.category_slug | 无消费 | 无消费 | 只剩 Admin 列表副标题，未参与 URL、分组或过滤 |
| site_profile 的编辑字段 | 全部未接入 | 资料、联系方式、简历已接入 | classic 缺口；Journey 有清空后回退问题 |
| personal_entries 的标题、种类、正文、日期、图片/alt/说明、外链 | 无入口 | 展示 | classic 未提供此功能；是否新增属于产品范围选择 |
| journey_scene_content.title/description | 不适用 | 仅章节字幕生效 | 地图和路牌漏接入 |
| journey_scene_content.order | 不适用 | 不改变世界/地图顺序 | 世界顺序由固定 regions 决定，Admin 拖动不应暗示能重排章节 |
| site_profile.order | 不使用 | 单例记录，无排序意义 | 不应为单例提供通用新增/排序界面 |
| media_assets | 不直接读取 | 不直接读取 | 正常：后台素材库，复制 URL 到内容后才展示 |

MediaLibrary 上传时填写的 alt 只写入 `media_assets.alt`。目前复制按钮仅复制 URL，前端取的是项目 `image_alt` 或日志 `images[].alt`，不会自动继承素材库描述。因此管理员仍需在目标记录重复填写。`media_assets.caption` 当前没有编辑或展示路径，只有数据库空字符串默认值，可作为结构精简候选。

日志中 music 的 `external_url` 会显示为普通外链，并非完全不显示；没有内嵌音频播放器。顶部背景音乐固定为仓库内两首 MP3，不读取素材库或日志。不能把“上传文件”自动等同于“已加入背景播放列表”。

**确定可精简的代码和发布资源**

- **移除旧列读取。** [Admin DataManager.jsx:115](/Users/kaius/Project/Website_Admin/src/components/DataManager.jsx:115) 仍读取 `item.date_badge`，线上列已删除，新编辑器也不再写入；这是确定失效的兼容残留。
- **删除重复的 skills 渲染分支。** [ContentPanel.jsx:32](/Users/kaius/Project/Website_Public/src/journey/components/ContentPanel.jsx:32) 的 skills 专用分支与紧接着的通用 Record 渲染相同，通用分支对 skills 也不会输出 awards 的简历链接。保留两份没有业务价值。
- **删除多余的中间值。** [JourneyApp.jsx:63](/Users/kaius/Project/Website_Public/src/journey/JourneyApp.jsx:63) 的 `sceneRecord` 再转为 `sceneRecord || null`，随后又使用 optional chaining；可直接使用 find 的结果。
- **内部不可达的回退可删除。** [createJourneyGame.js:107](/Users/kaius/Project/Website_Public/src/journey/game/createJourneyGame.js:107) 退出图书馆的 `returnX ?? LIBRARY_DOOR_X`：两个设置 library room 的入口都先设置 returnX，室外自动路线又明确排除图书馆，所以当前调用图下该回退不会触发。[ambience.js:5](/Users/kaius/Project/Website_Public/src/journey/game/ambience.js:5) 的未知区域云透明度 `.07` 同理，运行时只传固定 0–6 索引。这类删除收益较小，不应压过实际故障。
- **category_slug 应考虑完整退役。** [Admin EditModal.jsx:83](/Users/kaius/Project/Website_Admin/src/components/EditModal.jsx:83) 仍提供 url-safe slug 编辑，但两个前端没有对应 URL 机制，线上 4 个类别均未填该值。若不需要后台副标题，应连同编辑控件、列表读取和数据库列一起移除，避免只藏界面而留下虚假功能。
- **旧资源应移出 public。** 运行时实际使用 7 张 `*-hd.webp` 背景，以及 character-atlas.json 指向的当前角色资源。下面 24 个受版本控制文件没有当前运行时引用，合计 **11,857,077 bytes（约 11.86 MB）**，但已经在本次 dist 构建中被复制。需要保留美术历史时，应移到非发布的存档位置，而非继续放 public；这不代表访问者首次打开页面就会下载全部旧图。

| 文件组 | 数量 |
| --- | ---: |
| public/journey/regions 下 7 张无版本后缀的旧背景 | 7 |
| public/journey/regions 下 7 张 `*-v2.webp` 旧背景 | 7 |
| public/journey/characters/witch.webp、elaina-walk.webp、elaina-walk-v2.webp | 3 |
| public/journey/characters/directions 下 4 张 PNG 原图（运行时用对应 WebP） | 4 |
| directions/poses.json、directions/preview.jpg | 2 |
| public/icons.svg | 1 |

另有 public/.DS_Store，虽已被 Git ignore，当前构建仍复制了它。美术生成 JSON 是出处记录，并非运行时兼容逻辑；可以归档，不能把所有旧文档都当成可随意抹掉的代码。

**迁移与测试：哪些过时，哪些仍有用途**

- [docs/cms-schema-observed.json](/Users/kaius/Project/Website_Public/docs/cms-schema-observed.json) 仍列出已经不存在的 date_badge，空表则是空 columns；`sampleType: object` 还混淆了 null 与真实 JSON 类型。这份采样不能继续充当当前 schema 定义，应更新成 information_schema 结构记录，或明确归档为历史快照。
- [supabase/README.md:35](/Users/kaius/Project/Website_Public/supabase/README.md:35) 称只有前四个迁移生效、第五个还需执行，已经与实测结构和策略不符。迁移历史确实仍缺失，但不能照旧说明把“未登记”当“未执行”。应核对五个迁移的实际效果后更新登记方案。
- **delete-retired-draft-bucket.mjs 还未完成使命。** bucket 仍存在且为空；脚本不能仅因名字含 retired 就删除。本次审查没有执行 Storage 删除。待 bucket 删除并复核后，再同时删除脚本、package.json 命令和操作说明。
- **历史 migration 不是运行中的旧兼容层。** 第一、二个迁移创建草稿机制，第三至第五个删除它们。这些 SQL 当前仍被本地重建测试使用，而且生产没有登记历史；不宜直接剪掉文件中间的草稿代码。若要精简，应以已验证的最终结构建立新的 baseline，并协调历史登记和测试入口。
- **tests/cms-fixture.sql 和 tests/cms-database.sql 仍有效。** 本次在全新隔离 PostgreSQL 中顺序执行 fixture、五个 migration、数据库测试，全部通过。它们不属于只跑过一次就失效的迁移脚本，也没有进入前端 bundle。
- **数据库测试覆盖宣称过强。** [cms-database.sql:37](/Users/kaius/Project/Website_Public/tests/cms-database.sql:37) 只测 UPDATE 排序，没有测 Admin upsert；fixture 没有旧 experiences 样本，也就未证明迁移保留了真实旧记录；最终 PASS 文案中的 split experiences 超出了实际断言。应补有代表性的旧记录保留验证，并测试实际写入路径。
- **29 个 JS 测试大部分应保留。** 惯性、镜头不倒退、方向、动画锚点、URL 协议、移动输入等都覆盖现存行为。可以删除或改写 [journey.test.mjs:29](/Users/kaius/Project/Website_Public/tests/journey.test.mjs:29) 那种仅对常量数组作原样比对的测试，以及只锁死 MOBILE_HOTSPOT_Y 数字的断言。图书馆测试标题声称“允许飞行进入”，实际只给 canEnterLibrary 传 x，没有覆盖飞行状态；语言测试只验证键集合一致，不等于每个 UI 引用都有翻译。
- **缺少真正的入口和 CMS 展示检查。** lint、全部 JS 测试和生产 build 都通过，但漏掉了入口崩溃、日期缺失与日志错误映射。应优先补少量能检查这三个行为的测试，而非继续增加常量测试。

**不能误删的空值/兼容处理**

- 线上许多 bullets、skills、link、role_icon 等列允许 NULL，且现有记录确有空值。`|| []`、空链接判断等不是“不可能边界”。
- 当前 site_profile、personal_entries、scene 内容确实为空。空状态和缺省资料现在有实际用途，应修正缺省资料的触发条件，而非一律移除。
- 当前所有项目都没有封面，ProjectRow 的备用图路径正在使用。如果不想要图库占位，应明确改成无封面的布局，不能把该分支称为死代码。
- 请求取消/卸载保护、localStorage 失败处理、图片加载失败重试均对应真实浏览器或网络生命周期。safeUrl 的无 window 分支也服务于现有 Node 测试。
- ClassicApp.jsx 虽然只有三行，但用于按 classic 入口加载独立样式，具有隔离两个版本 CSS 的作用。
- 未发现可按“完全无调用组件/整模块”直接删除的运行时代码；主要问题集中在残留字段、重复分支、旧资源和写入/展示契约。

**另外两项应避免继续保留的行为**

- [MusicPlayer.jsx:51](/Users/kaius/Project/Website_Public/src/components/MusicPlayer.jsx:51) 在默认关声音时仍 load/play，audio 使用 preload=auto，关闭声音也只 muted，不暂停，甚至在 paused 时又尝试播放。两首本地音轨总计约 18.95 MB。这会在允许播放的浏览器中产生静音播放与加载工作；本次未测量实际网络下载字节数。可以将加载/播放与 soundOn 绑定，关闭时暂停，同时保留必要的用户交互解锁逻辑。
- [Admin Dashboard.jsx:54](/Users/kaius/Project/Website_Admin/src/pages/Dashboard.jsx:54) 在切换表时复用同一个 DataManager；[DataManager.jsx:17](/Users/kaius/Project/Website_Admin/src/components/DataManager.jsx:17) 没有请求取消、过期结果保护或错误处理。快速切表时旧请求可能覆盖新表数据；新表查询失败也会显示旧 data。应按 table 隔离请求生命周期，并明确显示错误。此项为代码路径审查，未做真实浏览器延迟注入复现。

**验证范围**

- `npm run lint`：通过。
- `npm test`：29/29 通过。
- `npm run build`：通过，保留现有 Phaser 大 chunk 提示。
- Vite 转换后的入口模块执行：复现 React 未定义；以模块执行环境模拟最小 DOM，没有声称做过完整浏览器测试。
- React 静态渲染：复现 classic 日期缺失、Journey 日志错误显示成空状态。
- 独立 PostgreSQL：fixture + 五个迁移 + 现有数据库测试全部通过；额外复现 Admin 排序的 NOT NULL 错误。临时数据库已关闭并清理。
- 线上数据库和 Storage：仅 SELECT/读取，未修改数据、策略、迁移历史或 bucket；匿名内容读取与实际表行数一致。

建议实施顺序：修复入口 → 修复 Admin 排序及读取生命周期 → 接通 classic 资料/项目日期和统一场景文案 → 修复错误状态与空字段语义 → 移走旧资源、删除死分支 → 更新迁移状态文档并针对性改进测试。
