export function localize(item){
 return {...item};
}
export function safeUrl(value,{email=false}={}){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,typeof window==='undefined'?'https://kaiusjin.com':window.location.origin);return ['https:','http:',...(email?['mailto:']:[])].includes(url.protocol)?url.href:null;}catch{return null;}
}
export function visibleItems(items=[]){return [...items].sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));}
export function deriveSkills(projects=[],experiences=[]){return [...new Set([...projects,...experiences].flatMap(i=>(i.skills||[]).map(s=>s.tag)).filter(Boolean))];}
export const experienceTables=['work_experiences','club_experiences','volunteer_experiences'];
export function collectExperiences(data={}){return experienceTables.flatMap(table=>data[table]||[]);}
