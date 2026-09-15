export function localize(item,lang){
 const translation=item.translations?.[lang]||{};
 const translated=Object.fromEntries(Object.entries(translation).filter(([,v])=>v!==null&&v!==undefined&&v!==''&&(!Array.isArray(v)||v.length)));
 return {...item,...translated,id:item.id};
}
export function safeUrl(value,{email=false}={}){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,typeof window==='undefined'?'https://kaiusjin.com':window.location.origin);return ['https:','http:',...(email?['mailto:']:[])].includes(url.protocol)?url.href:null;}catch{return null;}
}
export function visibleItems(items=[]){return items.filter(i=>i.visibility==='public'||i.visibility===undefined).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));}
export function deriveSkills(projects=[],experiences=[]){return [...new Set([...projects,...experiences].flatMap(i=>(i.skills||[]).map(s=>s.tag)).filter(Boolean))];}
