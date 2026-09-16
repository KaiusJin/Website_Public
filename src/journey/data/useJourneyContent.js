import {useCallback,useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
import {visibleItems} from './content';
export const initial={projects:[],work_experiences:[],club_experiences:[],volunteer_experiences:[],skills:[],awards:[],personal_entries:[],site_profile:[],journey_scene_content:[]};
export default function useJourneyContent(){
 const [preview,setPreview]=useState(null);
 const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[error,setError]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const token=new URLSearchParams(location.search).get('preview');
  if(!token||window.parent===window)return;
  const allowed=['https://admin.kaiusjin.com',...(import.meta.env.DEV?['http://127.0.0.1:5174','http://localhost:5174']:[])];
  const receive=e=>{if(e.source!==window.parent||!allowed.includes(e.origin)||e.data?.type!=='journey-preview'||e.data.token!==token)return;
   const snapshot=e.data.data;if(!snapshot||Object.keys(initial).some(k=>!Array.isArray(snapshot[k])))return;
   setPreview(Object.fromEntries(Object.keys(initial).map(k=>[k,visibleItems(snapshot[k])])));
  };
  window.addEventListener('message',receive);
  const ready=()=>window.parent.postMessage({type:'journey-preview-ready',token},'*');ready();
  const timer=setInterval(ready,1000);
  return()=>{window.removeEventListener('message',receive);clearInterval(timer);};
 },[]);
 const retry=useCallback(()=>setRevision(n=>n+1),[]);
 useEffect(()=>{
  const abort=new AbortController();let active=true;
  setLoading(true);setError(false);
  Promise.all(Object.keys(initial).map(async table=>{
   const {data,error}=await supabase.from(table).select('*').abortSignal(abort.signal);
   return {table,data,error};
  })).then(results=>{
   if(!active)return;
   setData(Object.fromEntries(results.map(r=>[r.table,visibleItems(r.data||[])])));
   setError(results.some(r=>r.error&&(!['personal_entries','site_profile','journey_scene_content'].includes(r.table)||!['PGRST205','42P01'].includes(r.error.code))));setLoading(false);
  }).catch(()=>{if(active){setLoading(false);setError(true);}});
  return()=>{active=false;abort.abort();};
 },[revision]);
 return {data:preview||data,loading:preview?false:loading,error:preview?false:error,retry,preview:!!preview};
}
