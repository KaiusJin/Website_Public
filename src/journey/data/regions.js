export const REGION_WIDTH=2400;
export const WORLD_HEIGHT=800;
export const GROUND_Y=728;
export const MOBILE_HOTSPOT_Y=477;
export const townExperienceHotspots=[
 {id:'work_experiences',offset:520,y:430,icon:'town'},
 {id:'club_experiences',offset:1030,y:300,icon:'star'},
 {id:'volunteer_experiences',offset:1660,y:420,icon:'leaf'},
];
export const libraryDoorHotspot={y:485};
export const libraryExitHotspot={y:445};
export const libraryProjectHotspots=[
 {id:'library-project-0',index:0,offset:500,y:540,icon:'book'},
 {id:'library-project-1',index:1,offset:920,y:485,icon:'book'},
 {id:'library-project-2',index:2,offset:1270,y:485,icon:'book'},
 {id:'library-project-3',index:3,offset:1700,y:540,icon:'book'},
];
export const libraryOtherHotspot={id:'library-other-projects',offset:2150,y:540,icon:'more'};
export const libraryHotspotsFor=projectCount=>[
 ...libraryProjectHotspots.slice(0,Math.max(0,Math.min(projectCount,libraryProjectHotspots.length))),
 ...(projectCount>=libraryProjectHotspots.length?[libraryOtherHotspot]:[]),
];
export const regions=[
 {id:'cottage',title:['The little cottage','魔女的小屋'],description:['Where curiosity packs its bags.','把好奇心装进行囊。'],section:'about',anchor:1240,hotspot:{offset:1020,y:430},icon:'home',image:'/journey/regions/cottage-hd.webp'},
 {id:'meadow',title:['The open meadow','风起的草原'],description:['The skills gathered along the way.','一路积累的技能与本领。'],section:'skills',anchor:480,hotspot:{offset:260,y:455},icon:'star',image:'/journey/regions/meadow-hd.webp'},
 {id:'town',title:['The town of stories','故事停留的小镇'],description:['The places that shaped my work.','每一段经历，都是走过的地方。'],section:'experiences',anchor:1270,icon:'town',image:'/journey/regions/town-hd.webp'},
 {id:'library',title:['The wandering library','漫游图书馆'],description:['Ideas, bound into things that work.','把想法写进书里，把它们变成现实。'],section:'projects',anchor:720,icon:'book',image:'/journey/regions/library-hd.webp'},
 {id:'academy',title:['The skyward academy','仰望星空的学院'],description:['Field notes from beyond the code.','代码之外的旅途手记。'],section:'personal',anchor:1730,hotspot:{offset:1510,y:390},icon:'camera',image:'/journey/regions/academy-hd.webp'},
 {id:'lake',title:['The lake of stars','星光落下的湖'],description:['Small milestones. A sky full of possibility.','点点里程碑，照亮更远的天空。'],section:'awards',anchor:1100,hotspot:{offset:1420,y:250},icon:'moon',image:'/journey/regions/lake-hd.webp'},
 {id:'station',title:['Until the next journey','下一次旅途之前'],description:['Some goodbyes are invitations.','有些告别，是下一次相遇的邀请。'],section:'contact',anchor:1500,hotspot:{offset:2160,y:470},icon:'letter',image:'/journey/regions/station-hd.webp'},
].map((r,i)=>({...r,index:i,x:i*REGION_WIDTH}));
export const regionText=(region, key, lang)=>region[key][lang==='zh-CN'?1:0];

export function sceneText(region, key, lang, records) {
 const record=records.find(item=>item.scene_id===region.id);
 return record ? record[key] ?? '' : regionText(region,key,lang);
}
