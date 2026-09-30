-- Neither Classic nor Journey consumes this retired top-level field.
-- Journey contact copy remains in journey_en / journey_zh.
set lock_timeout = '5s';
alter table public.site_profile drop column contact_slogans;
notify pgrst, 'reload schema';
