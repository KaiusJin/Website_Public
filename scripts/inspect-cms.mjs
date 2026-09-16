import fs from 'node:fs';
import { parseEnv } from 'node:util';
const env = parseEnv(fs.readFileSync('.env', 'utf8'));
const other = parseEnv(fs.readFileSync('../Website_Admin/.env', 'utf8'));
const headers = { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` };
console.log('Public and Admin target same project:',env.VITE_SUPABASE_URL===other.VITE_SUPABASE_URL);
const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/`,{headers,signal:AbortSignal.timeout(20000)});
const api=await response.json();
const tables = ['projects','experiences','awards','skills'];
const report = {};
for(const table of tables){
 const r=await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${table}?select=*&order=order.asc`,{headers,signal:AbortSignal.timeout(20000)});
 const data=await r.json();
 if(!r.ok) throw new Error(`${table} failed (${r.status})`);
 report[table]={count:data.length, columns: api.definitions?.[table]?.properties || Object.fromEntries(Object.keys(data[0]||{}).map(k=>[k,{sampleType:typeof data[0][k]}]))};
 console.log(table, data.length, 'records; columns:',Object.keys(report[table].columns).join(', '));
 fs.mkdirSync('.local', {recursive:true});
 fs.writeFileSync(`.local/${table}.json`,JSON.stringify(data,null,2));
}
fs.writeFileSync('docs/cms-schema-observed.json',JSON.stringify(report,null,2));
