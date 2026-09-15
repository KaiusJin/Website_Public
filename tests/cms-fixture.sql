create role anon; create role authenticated;
create schema auth; create schema storage;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create table projects(id uuid primary key default gen_random_uuid(),title text,date_badge text,bullets jsonb,skills jsonb,github_link text,start_date text,end_date text,is_present boolean,visibility text default 'public',"order" integer,created_at timestamptz default now(),link_text text,link text);
create table experiences(id uuid primary key default gen_random_uuid(),title text,date_badge text,role text,role_icon text,bullets jsonb,link text,link_text text,start_date text,end_date text,is_present boolean,visibility text default 'public',"order" integer,created_at timestamptz default now(),skills jsonb);
create table awards(id uuid primary key default gen_random_uuid(),title text,organization text,year text,description text,bullets jsonb,visibility text default 'public',"order" integer,created_at timestamptz default now(),link text,link_text text);
create table skills(id uuid primary key default gen_random_uuid(),category text,category_slug text,skills jsonb,visibility text default 'public',"order" integer,created_at timestamptz default now());
grant usage on schema public to anon,authenticated;
grant select on all tables in schema public to anon;
grant select,insert,update,delete on all tables in schema public to authenticated;
do $$ declare t text; begin foreach t in array array['projects','experiences','awards','skills'] loop
execute format('create policy "Admin full access" on %I for all to authenticated using (auth.jwt()->>''email''=''kaixuan.jin@outlook.com'')',t);
execute format('create policy "Allow public select" on %I for select to anon using(true)',t);
end loop; end $$;
