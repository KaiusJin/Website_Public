# Live portfolio database

The existing Supabase project **Personal Website** is the database source of truth for Website_Public and Website_Admin. Both apps connect to it directly with their configured Supabase URL and public client key. The recorded migration files are retained in `supabase/migrations/`; the old disposable PostgreSQL fixture is retired.

## Current content model — 2026-09-29

- Content tables: `projects`, `work_experiences`, `club_experiences`, `volunteer_experiences`, `awards`, `skills`, `site_profile`, `personal_entries`, and `journey_scene_content`.
- Awards store title, organization, year, and an optional credential URL. The unused `description`, `bullets`, and `link_text` columns were removed on 2026-09-29.
- Experience links use the organization title. `link_text` was removed from `work_experiences`, `club_experiences`, and `volunteer_experiences` on 2026-09-29; their `link` URLs remain. Project link labels are separate and remain supported.
- Classic project slogans use `projects.bullets[0].text`; remaining bullets render as highlights. Admin labels this ordering rule. The former UW Degree Explorer and WeCanFindIntern hardcoded slogans have been prepended to their saved bullets, preserving existing highlights. Fixed interactive previews remain independent of this content.
- Media metadata is in `media_assets`; uploaded public files are in the `journey-media` Storage bucket.
- `site_profile` has one row. Classic hero, profile, and contact copy lives in its ordinary columns; Journey English and Chinese copy lives in `journey_en` and `journey_zh`. Email, social links, and location are shared. The unused `resume_url` column was removed on 2026-09-29. The unused `contact_slogans` column and its array constraint were also removed on 2026-09-29; Admin still filters this field from cached legacy forms.
- The former draft, visibility, translation, publishing, and legacy `experiences` objects are absent. Experience and skill icons are assigned automatically by the live database.
- Unused top-level Classic fields `site_profile.heading`, `hero_tags`, and `focus_areas` were removed on 2026-09-29. Journey's `journey_en`/`journey_zh` fields—including `heading`, `focus`, and `location_detail`—are retained unchanged.
- Row-level security is enabled on the public content tables. Public clients can read content; the existing administrator policy controls writes.

All files correspond to migration versions already recorded **in the remote database**. They document how the live schema reached its current state. The chain starts from an earlier CMS baseline that is not included here, so it is not a standalone fresh-install script. Do not replay these migrations against production.

## Checks and future changes

`npm test` checks current website behavior, including Classic and Journey rendering of profile/contact values. `npm run lint` and `npm run build` check the application source. [tests/cms-final-state.sql](../tests/cms-final-state.sql) is a **read-only** contract for the live database: run it in the Supabase SQL editor and confirm every `passed` value is `true`. It checks the current tables, profile fields and row shape, RLS/policies, icon triggers, and retired tables. It does not prove a browser session or Admin write flow works. The former `test:db` command and legacy fixture were removed because they replayed old transitions rather than checking the live final state.

Before a future database change, inspect the live schema, policies, data, and recorded migration versions in Supabase. Add a new migration file for the change, apply it through an authorized database workflow, then verify the final state with a read-only query. Do not rerun historical migrations against production.
