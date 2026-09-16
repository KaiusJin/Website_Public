-- The draft workflow was removed in 202609150003. Storage tables are read-only:
-- the retired bucket is deleted separately through the Storage API. This
-- migration only removes its database access path.
begin;

drop policy if exists "Journey media administrator" on storage.objects;
create policy "Journey media administrator"
on storage.objects for all to authenticated
using (bucket_id = 'journey-media' and public.journey_is_admin())
with check (bucket_id = 'journey-media' and public.journey_is_admin());

commit;
