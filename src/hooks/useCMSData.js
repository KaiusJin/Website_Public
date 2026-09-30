import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadContent } from '../data/content';

export function useCMSData(tableName) {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    setState(previous => ({ ...previous, loading: true, error: null }));
    loadContent(supabase, tableName, abort.signal).then(
      data => { if (active) setState({ data, loading: false, error: null }); },
      error => { if (active) setState({ data: [], loading: false, error }); },
    );
    return () => { active = false; abort.abort(); };
  }, [tableName]);
  return state;
}
