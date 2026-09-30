import {useCallback,useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
import {loadContentTables} from '../../data/content';
const initial={projects:[],work_experiences:[],club_experiences:[],volunteer_experiences:[],skills:[],awards:[],personal_entries:[],site_profile:[],journey_scene_content:[]};
export default function useJourneyContent(){
 const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[failedTables,setFailedTables]=useState([]),[revision,setRevision]=useState(0);
 const retry=useCallback(()=>setRevision(n=>n+1),[]);
 useEffect(()=>{
  const abort=new AbortController();let active=true;
  setLoading(true);setFailedTables([]);
  loadContentTables(supabase,Object.keys(initial),abort.signal).then(result=>{
   if(!active)return;
   setData(result.data);setFailedTables(result.failedTables);setLoading(false);
  });
  return()=>{active=false;abort.abort();};
 },[revision]);
 return {data,loading,failedTables,retry};
}
