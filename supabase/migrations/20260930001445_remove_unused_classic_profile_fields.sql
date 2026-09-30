-- Retire unused top-level Classic profile fields only.
-- Journey uses journey_en/journey_zh objects; neither object is modified.
set lock_timeout = '5s';
alter table public.site_profile
  drop column heading,
  drop column hero_tags,
  drop column focus_areas;
notify pgrst, 'reload schema';
