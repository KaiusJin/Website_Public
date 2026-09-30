-- Awards now use title, organization, year, and an optional credential URL.
-- Existing values in the retired columns were verified empty before migration.
set lock_timeout = '5s';
alter table public.awards
  drop column if exists description,
  drop column if exists bullets,
  drop column if exists link_text;
notify pgrst, 'reload schema';
