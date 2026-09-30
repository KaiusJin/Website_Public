-- Experience links use the organization title; custom labels are retired.
set lock_timeout = '5s';
do $$
begin
  if exists (select 1 from public.work_experiences where nullif(link_text, '') is not null)
    or exists (select 1 from public.club_experiences where nullif(link_text, '') is not null)
    or exists (select 1 from public.volunteer_experiences where nullif(link_text, '') is not null) then
    raise exception 'Experience link labels contain content; review before removing';
  end if;
end $$;
alter table public.work_experiences drop column link_text;
alter table public.club_experiences drop column link_text;
alter table public.volunteer_experiences drop column link_text;
notify pgrst, 'reload schema';
