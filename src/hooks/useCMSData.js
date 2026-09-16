import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCMSData(tableName) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        let active = true;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const { data: items, error: supabaseError } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('order', { ascending: true })
                    .abortSignal(abortController.signal);

                if (supabaseError) throw supabaseError;
                if (!active) return;
                setData(items || []);
            } catch (err) {
                if (!active) return;
                console.error(`Error fetching from ${tableName}:`, err);
                setData([]);
                setError(err);
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchData();
        return () => {
            active = false;
            abortController.abort();
        };
    }, [tableName]);

    return { data, loading, error };
}
