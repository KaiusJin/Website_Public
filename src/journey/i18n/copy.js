export const copy = {
 en: {
  brand: 'KAIUS’S JOURNEY', subtitle: 'A developer’s travel journal', classic: 'Classic portfolio', map:'Travel map', journal:'Field notes', settings:'Travel essentials', language:'切换为中文', clearScreen:'Clear screen',showInterface:'Show interface',
  eyebrow:'A LITTLE MAGIC. A LONG WAY TO GO.', hero:'Every journey\nbegins with curiosity.',
  loading:'Unfolding the world', loadError:'This part of the world couldn’t load.', retry:'Try again', close:'Close', next:'Next stop', visit:'Travel here', chapter:'CHAPTER',
  move:'Move', jump:'Jump', fly:'Take flight', land:'Land', interact:'Explore', faceFront:'Face front', faceBack:'Face away', help:'A / D to walk · Space to jump · F to fly · Q / E front / back · Enter to explore', flyHelp:'W A S D to fly · F to land · Q / E front / back · Enter to explore', touchHelp:'Use the joystick to move. Tap the broom to fly; tap Elaina to switch front / back.',
  rotate:'A wider world awaits.', rotateBody:'Turn your device sideways to continue your journey. Your place is saved.', rotateBack:'Or visit the classic portfolio',
  libraryDoor:'Enter the library',leaveRoom:'Back to the town',
  about:'About me', projects:'Projects', otherProjects:'Other Projects', noOtherProjects:'More projects are on the way.', experiences:'Experience', work_experiences:'Work Experience', club_experiences:'Clubs & Design Teams', volunteer_experiences:'Volunteer Experience', skills:'Skills', awards:'Milestones', contact:'Let’s keep in touch', personal:'Beyond the code', all:'All',
  photography:'Photography', travel:'Travel', daily:'Everyday moments', music:'Music', notesIntro:'Photographs, places, everyday moments, and the music along the way.', emptyNotes:'A page waiting for its first story.', emptyNotesBody:'Photography, travel, everyday moments, and music — there will be more to discover here as the journal grows.',
  noItems:'No entries yet.', dataError:'The journal is temporarily unavailable. You can keep exploring and try again.', source:'Source code', website:'Visit website', certificate:'View credential', present:'Present', resume:'Download résumé', email:'Send a letter', github:'GitHub', linkedin:'LinkedIn',
  replay:'Back to the beginning',
  touch:'Touch controls', touchSetting:'Show the joystick and action buttons.', controls:'How to explore', step:'Walk', ascend:'Fly up / down', pause:'Open panels pause your journey.', credits:'Illustrations created for this journey with AI image generation.', built:'A SMALL WORLD BY KAIUS JIN', photo:'Open photograph', saved:'Language and touch preferences are saved on this device.',
 },
 'zh-CN': {
  brand:'KAIUS 的魔女旅途', subtitle:'一位开发者的旅行手记', classic:'经典作品集', map:'旅行地图', journal:'旅途手记', settings:'旅行设置', language:'Switch to English',clearScreen:'清屏',showInterface:'显示界面',
  eyebrow:'带上一点魔法，去往更远的地方。', hero:'每一段旅程，\n都始于好奇。',
  loading:'世界正在缓缓展开', loadError:'这片风景暂时未能加载。', retry:'重新尝试', close:'关闭', next:'下一站', visit:'前往这里', chapter:'旅程',
  move:'移动', jump:'跳跃', fly:'骑上扫帚', land:'降落', interact:'探索', faceFront:'正面', faceBack:'背面', help:'A / D 移动 · 空格跳跃 · F 飞行 · Q / E 正面 / 背面 · Enter 探索', flyHelp:'W A S D 自由飞行 · F 降落 · Q / E 正面 / 背面 · Enter 探索', touchHelp:'摇杆移动，轻点扫帚飞行；点击人物切换正面 / 背面。',
  rotate:'换个方向，看更远的风景。', rotateBody:'请将设备转为横屏，继续这段旅途。你的位置已经保留。', rotateBack:'也可以浏览经典作品集',
  libraryDoor:'进入图书馆',leaveRoom:'返回小镇',
  about:'关于我', projects:'项目作品', otherProjects:'其他项目', noOtherProjects:'更多项目正在路上。', experiences:'经历', work_experiences:'工作经历', club_experiences:'社团与设计团队', volunteer_experiences:'志愿者经历', skills:'技能魔法', awards:'旅途里程碑', contact:'让我们保持联系', personal:'代码之外', all:'全部',
  photography:'摄影', travel:'旅行', daily:'日常记录', music:'音乐', notesIntro:'用照片留住风景，用文字记下日常，让音乐陪伴旅途。', emptyNotes:'一页等待故事的手记。', emptyNotesBody:'摄影、旅行、日常记录与音乐——更多真实的片段，会随着这本手记慢慢展开。',
  noItems:'这里还没有记录。', dataError:'手记暂时无法读取。你可以继续探索，或稍后重试。', source:'查看源码', website:'访问网站', certificate:'查看证书', present:'至今', resume:'下载简历', email:'寄一封信', github:'GitHub', linkedin:'LinkedIn',
  replay:'回到旅途起点',
  touch:'触控操作', touchSetting:'显示虚拟摇杆和动作按钮。', controls:'旅行指南', step:'行走', ascend:'飞行上升 / 下降', pause:'打开阅读面板时，旅途会暂停。', credits:'本旅途插画使用 AI 图像生成工具制作。', built:'KAIUS JIN 的小小世界', photo:'打开照片', saved:'语言和触控偏好会保存在当前设备。',
 }
};
export function initialLanguage() {
 try { const saved=localStorage.getItem('journey-language'); if(copy[saved])return saved; } catch { /* Storage may be disabled. */ }
 return navigator.language?.startsWith('zh') ? 'zh-CN' : 'en';
}
