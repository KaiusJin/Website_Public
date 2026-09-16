# Journey CMS migrations

The final schema keeps one live English record per entry. Admin writes directly to those records. There is no content status, visibility, draft/publish workflow, or translated content copy.

The content tables are `projects`, `work_experiences`, `club_experiences`, `volunteer_experiences`, `awards`, `skills`, `site_profile`, `personal_entries`, and `journey_scene_content`. Media metadata remains in `media_assets`; uploads go directly to the public `journey-media` bucket.

## Local verification

Use an isolated PostgreSQL instance. Never run the fixture against Supabase or another existing database.

1. Run `tests/cms-fixture.sql`.
2. Apply `migrations/202609150001_journey_cms.sql`.
3. Apply `migrations/202609150002_split_experience_tables.sql`.
4. Apply `migrations/202609150003_remove_content_status.sql`.
5. Run `tests/cms-database.sql` with `ON_ERROR_STOP=1`.

The third migration removes `visibility`, `translations`, `content_drafts`, and the draft/publish functions. It replaces visibility-based read policies with ordinary public read access while retaining administrator-only writes.

## Rollout

Back up the affected tables before production execution. Apply all pending migrations before deploying the matching Admin build. The experience split moves legacy `experiences` rows into `work_experiences`, creates the club and volunteer tables, and then removes the legacy table.
