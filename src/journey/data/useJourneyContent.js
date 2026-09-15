import {useCallback,useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
import {visibleItems} from './content';
const initial={projects:[],experiences:[],skills:[],awards:[],personal_entries:[],site_profile:[],journey_scene_content:[]};
export default function useJourneyContent(){
 const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[error,setError]=useState(false),[revision,setRevision]=useState(0);
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
   setError(results.some(r=>['projects','experiences','awards','skills'].includes(r.table)&&r.error));setLoading(false);
  }).catch(()=>{if(active){setLoading(false);setError(true);}});
  return()=>{active=false;abort.abort();};
 },[revision]);
 return {data,loading,error,retry};
}
