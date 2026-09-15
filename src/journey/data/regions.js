export const REGION_WIDTH=2400;
export const WORLD_HEIGHT=800;
export const GROUND_Y=728;
export const regions=[
 {id:'cottage',title:['The little cottage','魔女的小屋'],description:['Where curiosity packs its bags.','把好奇心装进行囊。'],section:'about', color:'#7d815c', anchor:740, icon:'home'},
 {id:'meadow',title:['The open meadow','风起的草原'],description:['A little about the traveler.','在微风里，认识旅行的人。'],section:'about',color:'#708559',anchor:1150,icon:'leaf'},
 {id:'town',title:['The town of stories','故事停留的小镇'],description:['The places that shaped my work.','每一段经历，都是走过的地方。'],section:'experiences',color:'#a06e47',anchor:1270,icon:'town'},
 {id:'library',title:['The wandering library','漫游图书馆'],description:['Ideas, bound into things that work.','把想法写进书里，把它们变成现实。'],section:'projects',color:'#9c7847',anchor:1110,icon:'book'},
 {id:'academy',title:['The skyward academy','仰望星空的学院'],description:['A collection of useful little spells.','一路学会的，小小魔法。'],section:'skills',color:'#8b7992',anchor:1340,icon:'star'},
 {id:'lake',title:['The lake of stars','星光落下的湖'],description:['Small milestones. A sky full of possibility.','点点里程碑，照亮更远的天空。'],section:'awards',color:'#68738c',anchor:1100,icon:'moon'},
 {id:'station',title:['Until the next journey','下一次旅途之前'],description:['Some goodbyes are invitations.','有些告别，是下一次相遇的邀请。'],section:'contact',color:'#75719c',anchor:1500,icon:'letter'},
].map((r,i)=>({...r,index:i,x:i*REGION_WIDTH,image:`/journey/regions/${r.id}-v2.webp`}));
export const regionText=(region, key, lang)=>region[key][lang==='zh-CN'?1:0];
