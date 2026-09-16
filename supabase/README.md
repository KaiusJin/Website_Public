# Live portfolio database

The existing Supabase project **Personal Website** is the database source of truth for Website_Public and Website_Admin. Both apps connect to it directly with their configured Supabase URL and public client key. The seven historical migration files are retained in `supabase/migrations/`; the old disposable PostgreSQL fixture is retired.

## Current content model — 2026-09-16

- Content tables: `projects`, `work_experiences`, `club_experiences`, `volunteer_experiences`, `awards`, `skills`, `site_profile`, `personal_entries`, and `journey_scene_content`.
- Media metadata is in `media_assets`; uploaded public files are in the `journey-media` Storage bucket.
- `site_profile` has one row. Classic hero, profile, and contact copy lives in its ordinary columns; Journey English and Chinese copy lives in `journey_en` and `journey_zh`. Email, social links, location, and résumé URL are shared. The résumé URL is currently empty because no résumé has been uploaded.
- The former draft, visibility, translation, publishing, and legacy `experiences` objects are absent. Experience and skill icons are assigned automatically by the live database.
- Row-level security is enabled on the public content tables. Public clients can read content; the existing administrator policy controls writes.

All seven files correspond to migration versions already recorded **in the remote database**. They document how the live schema reached its current state. The chain starts from an earlier CMS baseline that is not included here, so it is not a standalone fresh-install script. Do not replay these migrations against production.

## Checks and future changes

`npm test` checks current website behavior, including Classic and Journey rendering of profile/contact values. `npm run lint` and `npm run build` check the application source. [tests/cms-final-state.sql](../tests/cms-final-state.sql) is a **read-only** contract for the live database: run it in the Supabase SQL editor and confirm every `passed` value is `true`. It checks the current tables, profile fields and row shape, RLS/policies, icon triggers, and retired tables. It does not prove a browser session or Admin write flow works. The former `test:db` command and legacy fixture were removed because they replayed old transitions rather than checking the live final state.

Before a future database change, inspect the live schema, policies, data, and recorded migration versions in Supabase. Add a new migration file for the change, apply it through an authorized database workflow, then verify the final state with a read-only query. Do not rerun historical migrations against production.
