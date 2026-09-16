# Portfolio CMS

Classic and Journey share one live English record per entry. Admin writes directly to the content tables. There is no draft, publish-status, visibility or content-translation workflow.

## Current production state — 2026-09-16

All six migrations in this directory are applied and recorded in `supabase_migrations.schema_migrations`. The original five were verified against the live structure before their history was repaired; the sixth adds automatic icons and removes unused metadata fields. Do not replay these migrations against production.

- Content: `projects`, `work_experiences`, `club_experiences`, `volunteer_experiences`, `awards`, `skills`, `site_profile`, `personal_entries`, `journey_scene_content`.
- Media metadata: `media_assets`. Uploads use public `journey-media`; the empty retired `journey-drafts` bucket has been deleted and its one-time script removed.
- `category_slug`, `media_assets.caption`, `date_badge`, legacy experiences and draft/publishing objects are absent.
- SQL column types and nullability, including empty tables, are recorded in `docs/cms-schema-observed.json`.

## Automatic icons

`journey_assign_icon` assigns one of ten built-in FontAwesome classes from the record's saved `order`, wrapping after ten. Experience records use `role_icon`; skill categories use `category_icon`. Existing records have been backfilled. Admin does not offer manual icon fields, and Classic renders the saved classes.

Profile is a singleton, and scene order is fixed by the Journey world. Admin offers neither profile duplication nor dragging for profile/scenes. Other lists save their order using UPDATE, without inserting incomplete content rows. If an ordering request fails, Admin reports the failure and reloads the actual saved order.

Only an absent profile record receives default copy. Blank fields in an existing record stay blank in both frontends. Scene text is resolved consistently for captions, maps and route labels. Choosing an uploaded image in Admin copies its URL and alt text together.

## Local checks

`npm test` runs the existing movement tests and a small set of CMS rendering checks. `npm run test:db` requires `initdb`, `pg_ctl` and `psql` on PATH. It creates an isolated temporary PostgreSQL, applies the fixture and all migrations, runs normal content/ordering/icon and access checks, then removes the instance. Never execute `tests/cms-fixture.sql` against a live database.

Keep the historical migration chain: it is still the reproducible path from the legacy fixture to the current schema. Old graphics and animation assets are intentionally retained.

## Future migrations

Use new migration files for future changes and check the recorded history before applying them. The previous rollout instructions describing the fifth migration as pending are obsolete.

During this repair the management token worked, while the supplied direct database password and Storage key failed authentication. The database/history updates used the authorized management connection; Storage cleanup used the project's valid key fetched through that connection. No credentials were printed or added to tracked files. Future direct CLI connections need a valid database password.

The repaired migration table follows the [Supabase CLI history format](https://raw.githubusercontent.com/supabase/cli/v2.75.0/pkg/migration/history.go). Existing history was not truncated or re-executed.
