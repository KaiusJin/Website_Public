export function safeUrl(value,{email=false}={}){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,typeof window==='undefined'?'https://kaiusjin.com':window.location.origin);return ['https:','http:',...(email?['mailto:']:[])].includes(url.protocol)?url.href:null;}catch{return null;}
}
export const experienceTables=['work_experiences','club_experiences','volunteer_experiences'];
