# Journey CMS migration

**Status: prepared and tested locally; production execution paused at the user's request.**

The migration preserves existing records and the current administrator identity. It adds bilingual fields, profile, journal, scenes, independent drafts and media metadata. It narrows anonymous reads to `visibility = 'public'`. It must be applied once, transactionally, before deploying the new Admin.

## Local verification

Use an isolated PostgreSQL instance; `tests/cms-fixture.sql` creates a minimal disposable approximation of the observed schema and roles. Do not run the fixture against Supabase or any existing application database.

1. Create a disposable database and run `tests/cms-fixture.sql`.
2. Apply `migrations/202609150001_journey_cms.sql`.
3. Apply `migrations/202609150002_split_experience_tables.sql`.
4. Run `tests/cms-database.sql` with `ON_ERROR_STOP=1`. Assertions roll back all test records.

The fixture covers Postgres functions and RLS, not the hosted Storage API. Hosted upload/copy and the authenticated Admin flow need verification when database work resumes.

## Content workflow

Admin uses `journey_save_draft` to keep drafts separate from live records. `journey_publish` locks and checks both the draft revision and live revision, then publishes atomically. Reordering checks all record revisions. Archive via visibility rather than deleting records.

Uploads initially use private `journey-drafts`. The administrator explicitly publishes an asset by copying it to `journey-media`, then uses its public URL. Publishing an asset is separate from publishing an entry. Archiving an entry does not revoke an already published asset URL.

Storage design follows [Supabase bucket access models](https://supabase.com/docs/guides/storage/buckets/fundamentals) and [cross-bucket copy](https://supabase.com/docs/guides/storage/management/copy-move-objects).

Set Admin `VITE_PUBLIC_ORIGIN` to the Public origin; localhost defaults to `http://127.0.0.1:5173`. Run Admin development on port 5174. Public preview only accepts the production Admin origin and, in development, the two local port-5174 origins.

## Rollout and recovery

Before production execution, export affected records and current policies, verify the administrator still matches the inspected policy, and review the transaction. The existing public app can keep running because English columns remain compatible. Deploy Admin only after migration succeeds. The migration includes no content seed or fabricated journal records.

The second migration moves all legacy `experiences` rows and drafts into `work_experiences`, creates separate club/design-team and volunteer tables, then removes the legacy table. Back up the four original content tables before production execution.

For an application rollback, restore the database backup before deploying the previous Admin/Public build because that build reads the legacy `experiences` table. Restore an accidentally unpublished item through Admin by publishing it with Public visibility. Existing anonymous access is deliberately restricted rather than restoring unconditional SELECT policies.
