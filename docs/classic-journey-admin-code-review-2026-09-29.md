# Journey Classic Admin 代码审查

审查日期：2026 年 9 月 29 日（多伦多）。对象是当前本地工作区，包含此前尚未提交的改动。本轮已删除确认无调用的代码，并合并重复查询和表单编辑逻辑。代码审查阶段没有修改 Journey 布局、数据库结构或内容；随后按用户要求删除了未使用的 `site_profile.contact_slogans` 字段，其他资料保持不变。按用户要求，老旧插画素材和图片不纳入清理范围。

## 范围与方法

- Public：扫描 `src` 下全部 JavaScript、JSX、CSS 及角色图集配置，覆盖 Classic、Journey、共享数据层和游戏模块；精简后共 40 个文件。
- Admin：扫描 `src` 下全部 JavaScript、JSX、CSS；精简后共 15 个文件。
- 同时检查两个入口 HTML、依赖声明、Vite 与 ESLint 配置、测试，以及与字段使用有关的迁移记录；只读核对在线表结构和公共内容查询。
- 用导入与导出引用、AST、CSS 选择器及变量扫描找候选，再结合动态类名、动态 section、双语字典、Phaser 回调和实际表结构逐项确认。未把“搜索不到字面量”直接等同于“无用”。
- 保留本轮开始时的源码快照，用有效 CMS 数据做重构前后 HTML 对比。未使用浏览器控制，因此不声称完成真实浏览器交互、像素或登录保存验证。

## 已修复的问题

| 编号 | 范围 | 发现与证据 | 处理结果 |
| --- | --- | --- | --- |
| R01 | Classic | `src/utils/smoothScroll.js` 的两个滚动导出均没有调用；当前导航使用锚点、CSS 滚动及原生滚动方法。 | 删除整个 43 行孤立模块，保留当前滚动实现。 |
| R02 | 公共入口 | `index.html` 仍加载 Plus Jakarta Sans、Inter、JetBrains Mono。正文样式已分别使用各页面的字体，只有临时加载提示还写着 Inter。 | 删除旧字体请求；Classic 加载提示使用系统字体。保留 Classic/Journey 各自的字体声明及实际仍使用的 Font Awesome。 |
| R03 | Journey | `ContentPanel` 的通用 Record 读取 `r.description`，但其实际内容表均没有这个字段；一个测试恰好用不存在的项目 description 伪造了数据。 | 删除无效读取，测试改为真实的 `bullets[].text`。在线 schema 已只读确认；场景的 description 属于另一条有效路径，继续保留。 |
| R04 | Journey | Record 的 `hideTitle` 参数始终采用默认值，没有任何调用方传入。 | 删除参数与恒真的条件，标题结构不变。 |
| R05 | Journey | `regionText`、`initial`、`OUTDOOR_ROUTE` 仅在各自模块内部使用，却对外导出。 | 改为模块内部常量；保留函数、路由数据与行为。 |
| R06 | 两个前端 | Classic 从 Journey 目录导入通用 URL 校验与经验表清单，形成不必要的目录依赖。 | 移到 [共享 content 模块](../src/data/content.js)，两种前端都直接使用它，删除旧位置而非添加转发层。 |
| R07 | 两个前端 | 两个 Hook 各自写了一遍查询、排序、结果提取；Journey 的总 catch 会把抛出异常造成的失败扩大为全部表失败。 | 查询已合入 [content](../src/data/content.js)，删除独立包装模块；多表读取用 Promise.allSettled 按表记录失败。各 Hook 继续拥有自己的加载、取消和重试状态。 |
| R08 | Admin | highlights、skills、图片列表重复实现输入、添加和删除；旧数组修改逻辑从闭包中的 formData 取值，再混用函数式更新。 | 提取 [ArrayEditor](/Users/kaius/Project/Website_Admin/src/components/ArrayEditor.jsx)，三个列表共享编辑流程。更新从最新状态计算，保留行内其他字段，并兼容 null/未定义数组。图片 URL、说明、caption、标签与删除按钮仍在。 |
| R09 | Admin | MediaLibrary 与 MediaPicker 重复读取媒体表和生成 Storage URL，取消与失败处理不一致。 | 保留 [useMediaAssets](/Users/kaius/Project/Website_Admin/src/cms/useMediaAssets.js)，查询合入已有 [contentStore](/Users/kaius/Project/Website_Admin/src/cms/contentStore.js)，删除 mediaStore 包装模块；读取时一次生成公开 URL。选择器从同一份完整媒体记录中过滤类型；上传成功仍触发刷新。 |
| R10 | Admin | 编辑器的数字转换分支没有 number 类型调用；MediaPicker 的 PDF 分支没有调用入口。 | 删除这两条无调用分支。媒体库本身仍支持上传、预览和复制 PDF URL，未删除有效功能。 |
| R11 | Admin | 经验表清单在编辑器和保存过滤器中重复定义；保存时 EditModal 与 DataManager 连续过滤同一份数据。 | 表清单集中在 [contentLabels](/Users/kaius/Project/Website_Admin/src/cms/contentLabels.js)。保留编辑器初始化过滤及 DataManager 写入边界过滤，删除提交中间那次重复过滤。 |
| R12 | Admin | `.btn-danger` 和 hover 规则没有对应元素；`--success` 无读取，`--danger-hover` 仅供该废弃规则使用。 | 删除废弃规则与变量。保留真实删除按钮使用的 `.btn-danger-small`、`.delete-action` 和 `--danger`。 |

第二轮相较第一轮完成状态，生产源码净减少 114 行、1,537 个非空白字符，删除 2 个包装模块，没有新增源码文件。删除了重复字段渲染、状态更新、项目面板分支及可推导的演示数据；原媒体测试并入已有查询测试文件。未新增依赖，现有 58 项测试和 24 组 HTML 对比继续通过。

## 确认仍有用途的代码

| 对象 | 保留理由 |
| --- | --- |
| `site_profile.journey_en` / `journey_zh` | heading、focus、intro、bio、教育、地点说明及联系文案仍由 Journey 消费。Classic 顶层字段是否使用，不能据此判断 Journey 嵌套字段是否使用。 |
| `projects.image_url` / `image_alt` 与 Admin 图片输入 | Journey 项目面板仍展示封面。Classic 不展示数据库图片，并不意味着这些字段在整个系统中无效。 |
| `featuredPreviews`、ProjectPreview 的固定数据 | Classic 的前两个展示位置绑定固定演示，是已确认的产品要求；项目替换或排序后演示可保持不变。其他项目仍无图片与占位图。 |
| 项目简介与固定缩略交互 | 后续已删除 `projectPresentation` 的固定摘要与仓库匹配函数。Classic 使用数据库第一条 bullet 作简介，其余作 highlights；原两句简介已写入对应项目。仅固定缩略交互保留代码配置。 |
| `editableContent` 对旧字段的排除 | 防止旧缓存表单把已删除字段写回数据库，属于兼容保护。保留写入边界，而不是因数据库已删列就移除保护。 |
| `AbortController` 与 `active` 标志 | 前者取消请求，后者阻止已完成但晚到的回调更新卸载后的状态，职责不同。 |
| `.company-1`、`.company-2` | 由 ProjectPreview 的 `company-${index}` 动态产生，静态字面量扫描会误报。 |
| Journey 双语 copy、Icon 图形、地区与热点配置 | 存在 `t[section]`、`t[item.kind]`、区域图标等动态读取，不能只查 `t.xxx` 或显式 Icon 标签后删除。 |
| Journey 的分散 CSS 规则 | `.world-hotspot` 后续补充坐标与渲染提示；`.journey-position small` 后续覆盖 margin；button 规则承担不同属性。不是整块重复代码。本轮保留 CSS 顺序与布局。 |
| 游戏回调与物理工具 | Phaser 生命周期、每帧渲染、移动/朝向/动画/视差/旅行逻辑均有调用；按各自职责保留，不为减少函数数量合并物理与视觉阶段。 |
| 两个仓库各自的 Supabase 客户端与查询函数 | 两个独立应用的认证、排序和发布边界不同。没有为少量相似代码增加跨仓库源码引用或新共享包。 |
| 历史迁移与旧字段回归测试 | 迁移记录用于数据库历史；测试中的旧字段用于证明旧缓存不会恢复被移除内容。它们不是页面死代码。 |

## 保留的观察项

1. **`site_profile.contact_slogans` 已处理。** 按用户后续要求，通过迁移 `20260930002902_remove_unused_contact_slogans.sql` 从在线数据库删除该列及其默认值、数组约束。Admin 保留对旧缓存字段的过滤。迁移前后，排除该字段后的整条资料记录哈希一致；11 项数据库契约检查全部通过。
2. **JourneyApp 与 createJourneyGame 的单行 JSX/方法很密集。** 本轮未发现应直接删除的大段游戏逻辑。未来为可维护性拆分地图、设置面板或场景职责，应作为独立改动验证交互时序；这不等同于死代码。
3. **构建仍有大 chunk 提示。** Journey 主 chunk 约 1,250 kB，Admin 主 chunk 约 548 kB（压缩前）。Phaser、拖拽、认证与路由都有实际用途，不能按包体积判断无用。Classic/Journey 已分别懒加载；若后续做性能优化，应测量运行时下载与交互耗时再决定拆包。
4. **目前没有发现其他可确认的孤立业务模块或应删除的生产依赖。** 这是本轮源码与测试范围内的结论，不代表动态运行路径获得了完整覆盖。

## 验证结果

| 验证 | 结果 |
| --- | --- |
| Public `npm run lint` | 通过 |
| Public `npm test` | 45 / 45 通过 |
| Public `npm run build` | 通过，仅上述 chunk 大小提示 |
| Admin `npm run lint` | 通过 |
| Admin `npm test` | 13 / 13 通过 |
| Admin `npm run build` | 通过，仅上述 chunk 大小提示 |
| 重构前后 HTML 对比 | 24 / 24 一致：Classic 首页和全部项目页，加 Journey 11 种内容面板 × 两种语言 |
| 真实公共内容读取 | 重构后的共享函数成功读取九张表；失败表为空。项目 3、工作 2、社团 6、志愿 3、技能 4、奖项 4、个人记录 0、资料 1、场景覆盖 0 |
| 在线字段核对 | Record 所用内容表无 description；项目图片、bullets、项目 link_text 等实际字段仍存在 |
| 布局保护 | Classic 与 Journey 的 CSS 文件未改；Journey 的有效数据 HTML 输出一致；游戏算法未改，仅收起一个内部常量的 export |

新回归覆盖：单表排序与取消信号、多表部分失败、空表成功、Journey 项目封面与 highlights、三个列表的编辑/添加/删除与连续更新、空数组兼容、媒体查询错误和 URL 生成。查询测试使用真实 Supabase 客户端和受控 fetch，不需要管理员密码或修改在线数据。

未进行浏览器控制、真实管理员保存操作或触控手工测试。24 组 HTML 对比只证明所测数据的内容结构一致，不替代浏览器滚动、布局和输入焦点验证。

## 文件覆盖清单

以下列出重构后的全部生产源码，便于后续复核；旧滚动模块与旧位置的 content 模块已在 R01、R06 说明。

### Public

- 入口与配置：`src/main.jsx`、`src/ClassicApp.jsx`、`src/App.jsx`、`src/lib/supabase.js`。
- Classic：`src/components/NavBar.jsx`；`src/components/sections/` 下的 `About.jsx`、`AllProjects.jsx`、`Awards.jsx`、`Contact.jsx`、`Experience.jsx`、`Hero.jsx`、`ProjectPreview.jsx`、`ProjectRow.jsx`、`Projects.jsx`、`Skills.jsx`。
- 共享内容：`src/data/content.js`、`profile.js`、`projectPresentation.js`；`src/hooks/useCMSData.js`。
- Journey 页面：`src/journey/JourneyApp.jsx`；`components/ContentPanel.jsx`、`Icon.jsx`、`Modal.jsx`、`TouchControls.jsx`。
- Journey 数据与语言：`src/journey/data/regions.js`、`useJourneyContent.js`、`character-atlas.json`；`src/journey/i18n/copy.js`。图集仅检查代码引用关系，不处理对应插画文件。
- Journey 游戏：`src/journey/game/ambience.js`、`animation.js`、`createJourneyGame.js`、`display.js`、`facing.js`、`motion.js`、`travel.js`。
- 音乐与样式：`src/components/MusicPlayer.jsx`、`MusicPlayer.css`；`src/styles.css`、`src/scrollbars.css`、`src/journey/journey.css`。

### Admin

- 入口与页面：`src/main.jsx`、`src/App.jsx`、`src/lib/supabase.js`、`src/pages/Dashboard.jsx`、`Login.jsx`。
- 内容管理：`src/components/DataManager.jsx`、`EditModal.jsx`、`ArrayEditor.jsx`。
- CMS：`src/cms/MediaLibrary.jsx`、`MediaPicker.jsx`、`contentLabels.js`、`contentStore.js`、`useMediaAssets.js`。
- 样式：`src/index.css`、`src/cms/cms.css`。
