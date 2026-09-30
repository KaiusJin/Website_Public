-- Resume links have been removed from the public site and admin editor.
-- The existing resume_url value was verified null before migration.
set lock_timeout = '5s';
alter table public.site_profile drop column if exists resume_url;
notify pgrst, 'reload schema';
