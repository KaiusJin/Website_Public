import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCMSData(collectionPath) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const tableName = collectionPath.split('/').pop();

                const { data: items, error: supabaseError } = await supabase
                    .from(tableName)
                    .select('*');

                if (supabaseError) throw supabaseError;

                setData(items || []);
            } catch (err) {
                console.error(`Error fetching from ${collectionPath}:`, err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [collectionPath]);

    return { data, loading, error };
}

export function getSortDate(item) {
    const dateStr = item.start_date || item.date_badge;
    if (!dateStr) return new Date(0);
    const years = dateStr.match(/\d{4}/g);
    if (!years) return new Date(0);
    const year = Math.max(...years.map(Number));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let latestMonth = 0;
    months.forEach((m, i) => { if (dateStr.toLowerCase().includes(m.toLowerCase())) latestMonth = i; });
    if (item.is_present || (item.date_badge && item.date_badge.includes("Present"))) return new Date(2100, 0);
    return new Date(year, latestMonth);
}
