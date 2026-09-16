import {useCallback,useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
export const initial={projects:[],work_experiences:[],club_experiences:[],volunteer_experiences:[],skills:[],awards:[],personal_entries:[],site_profile:[],journey_scene_content:[]};
export default function useJourneyContent(){
 const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[failedTables,setFailedTables]=useState([]),[revision,setRevision]=useState(0);
 const retry=useCallback(()=>setRevision(n=>n+1),[]);
 useEffect(()=>{
  const abort=new AbortController();let active=true;
  setLoading(true);setFailedTables([]);
  Promise.all(Object.keys(initial).map(async table=>{
   const {data,error}=await supabase.from(table).select('*').order('order',{ascending:true}).abortSignal(abort.signal);
   return {table,data,error};
  })).then(results=>{
   if(!active)return;
   setData(Object.fromEntries(results.map(r=>[r.table,r.data||[]])));
   setFailedTables(results.filter(result=>result.error).map(result=>result.table));setLoading(false);
  }).catch(()=>{if(active){setLoading(false);setFailedTables(Object.keys(initial));}});
  return()=>{active=false;abort.abort();};
 },[revision]);
 return {data,loading,failedTables,retry};
}
