# Implementation log

## Stage commits

1. **Foundation** — requirements baseline, public CMS inspection, engine dependency.
2. **Complete journey** — seven illustrated regions, character animation, keyboard/touch movement, jumping, free flight, bilingual reading interface and classic entry.
3. **Content management** — compatible Supabase migration, Admin bilingual/profile/journal/media/publishing workflows, content integration.
4. **Verification and delivery** — browser/device checks, meaningful behavior tests, repairs, build and deployment instructions.

Each stage is committed once per affected repository after its checks. This log records actual completion; plans are not completion evidence.

## Foundation findings

- Public and Admin local configuration targets the same Supabase project (checked without disclosing credentials).
- Anonymous public reads returned 3 projects, 1 experience, 4 awards and 0 skill categories on 2026-09-15.
- Observed field shapes are recorded in `cms-schema-observed.json`; sample JS types do not establish SQL column types or RLS rules.
- Existing public records currently have sparse descriptions. No employment achievements or personal journal entries will be invented.
- No independent API service is evidenced. Both applications directly use Supabase.
- Phaser 3.90.0 installed for world rendering/physics; classic app remains separate.
- Product implementation is now authorized. Earlier documents describe the preceding planning-only turn.

## Open implementation dependencies

- Production migration explicitly deferred by the user on 2026-09-15. Authenticated dashboard was inspected read-only; no migration was run online.
- No personal photos, diary entries, music selections or resume file supplied yet. Implement editing/display with honest empty states and publish only actual supplied content.
- Actual image model version is not selectable via the built-in tool. Generated assets use built-in image generation; do not claim a specific version.

## Stage 2 — complete journey implementation

- Seven generated, production WebP region illustrations and a 12-frame transparent character atlas saved under `public/journey/` (about 4 MB total).
- Built-in generation prompts and reference source recorded in `asset-generation.json`; no claim of a selectable model version.
- Independent lazy `/journey` entry; classic `/` preserves its existing application and adds an exploration link.
- Keyboard and virtual joystick, single jump, free broom flight/landing, seven-region navigation, modal reading and EN/中文 UI implemented.
- Public records read from Supabase; sparse descriptions are preserved rather than invented. Skill display can derive technologies from actual published projects.
- Browser verified: rendered cottage, meadow and library, flight mode activation, travel map, and real project records in the library. Initial input handling issue fixed by consolidating browser key events into the shared input bridge.
- `npm run build` passed; `node --test tests/journey.test.mjs` passed 8 cases. Full device and publishing checks remain Stage 4.

## Stage 3 — content management prepared; online migration deferred

- Compatible migration prepared against actual production SQL columns and policies; existing 8 public records are preserved. No legacy public views exist.
- Administrator predicate preserves the existing account identity. Existing unconditional public SELECT policies become published-only; draft and media metadata are administrator-only.
- Private drafts, bilingual payloads, optimistic version checks, atomic publication and ordering, and private/public media buckets implemented in SQL.
- Migration executed in an isolated local PostgreSQL 16 fixture. Database tests passed for draft isolation, translation publishing, concurrent-edit rejection, allowlisted fields, ordering and administrator/non-admin/anonymous access.
- Admin now has profile, journal, scenes, media, bilingual editing, preview, draft save and publish interfaces; build and 3 validation tests passed.
- Public preview uses origin/source/token-checked in-memory messages; no auth credentials are shared. Missing optional CMS tables remain compatible with the current live database.
- **User requested pausing database work. No online migration, live Admin publication or production deployment is claimed.** These remain intentionally deferred; source is ready for a later coordinated rollout.

## Stage 4 — original artwork, transitions and motion

- Original seven region images and original witch atlas preserved byte-for-byte. The experimental separated-building artwork was rejected by the user and is not included in the application.
- Camera bounds stop each image at its own edges. A short fade moves to the next outdoor location; both travel directions work. Library is an indoor branch reached from a town hotspot, with a return to its entry position. Flying cannot activate the entrance until landing.
- Automatic outdoor transitions carry movement intent and momentum through the fade. Map travel and indoor entry reset to a safe grounded state.
- Added progressive acceleration, ground braking, air control, two-axis flight coasting, gradual landing and velocity-aware camera following. Removed the instant takeoff position jump. Character presentation is independent from its collision body, and the existing walking frames follow traveled distance.
- Joystick caches its bounds and updates its knob without React renders; touch actions begin on contact. Hotspot positions follow the camera on each render frame while other HUD state is sampled less frequently.
- Browser checks before the user's request to reduce browser control: original cottage and library artwork, library entry/exit, exact town return coordinate, entry disabled during flight and restored after landing, a responsive 844×390 frame, and joystick movement. These are desktop browser checks, not real iPhone/iPad/Android tests.
- Unit tests: 16 pass, including 30/60/120 Hz inertia equivalence, acceleration/coasting, reversal, route boundaries and grounded entry. Both application builds passed. No claim of a measured production frame-rate guarantee.
- User selected light parallax after initially deferring it: full backgrounds remain unchanged; small procedural cloud/mist/foreground-leaf layers and particles move at different speeds. Indoor cloud/foliage layers are disabled. Light parallax is enabled by default; the user requested removal of the reduced-motion settings switch. No additional background image download is required.
- Database work remains deferred. No production migration/deployment was executed. Further browser control was minimized as requested.

## Stage 5 — user-requested art refresh and character animation

- User explicitly superseded the earlier original-art preservation request: regenerate all seven backgrounds, retaining scene themes and composition ideas, reducing foreground ground, and showing complete rooftops/ceilings. New sibling `*-v2.webp` files are active; previous assets remain available for comparison.
- Referenced official Wandering Witch character and landscape visuals. New Elaina-like character preserves the requested silver hair, violet eyes, pink hat ribbon, long dark robe and yellow neck ribbon. Prompts and official URLs are in `asset-refresh-20260915.json`.
- Generated character sheets repeatedly contained painted checkerboards. User explicitly approved local processing; rembg's anime segmentation model removed backgrounds and Pillow normalized/packed transparent frames. Two lossless 2048×1024 WebP atlases contain eight walking drawings and eight standing/broom drawings. These remain AI-generated poses rather than a hand-animated production cycle.
- Standing and walking soles share a 512×512 cell anchor at (256,470), with a normalized body height. Idle uses a restrained blink/breath; broom uses four drawings with slight floating motion. Jump reuses a walking pose; no separate run or turning atlas is claimed.
- Physics collider is a fixed invisible rectangle. Character/camera/overlay positions synchronize after Arcade's physics coordinate write; animation time is independent and freezes during reading. Fractional camera projection avoids using the previous render's rounded world rectangle.
- User reported scenery rolling backwards during braking. The shrinking velocity-based camera look-ahead caused the camera to recenter backwards. Follow is now monotonic in the character's actual travel direction and holds at rest; deliberate reversed velocity allows reverse follow. Character inertia is preserved.
- Ground plane moved from y637 to y728 in the 800px world to align with slimmer foreground paths; bottom vignette shortened accordingly. Existing library branch, transitions, touch controls and light parallax continue.
- Validation: production build passed; 20 unit tests passed, including animation timing/anchors and left/right camera coasting at 30/60/120 Hz. Bounded desktop browser check showed new cottage roof/sky, transparent standing character and successful flight activation. No physical mobile-device test or measured frame-rate guarantee is claimed.
- Database and deployment remain deferred.

## Stage 6 — clearer characters and stationary broom hover

- User clarified that blur is mainly in the character. Generated sharper character linework using the existing identity reference; backgrounds remain unchanged in this stage. Built-in prompts, native output sizes and final asset paths are recorded in `character-animation-20260915.json`.
- Replaced the walk atlas with eight new drawings, added a four-drawing idle atlas (open/blink drawings used for restrained idle), and added a dedicated higher-detail single hover image. Standing/walk anchors are normalized at (384,710) in 768px cells; hover uses a 1024px cell and separately calibrated body scale. These remain AI-generated poses with some imperfect leg phasing, not a hand-animated cycle. Larger packed sheet dimensions do not imply added native detail.
- Preserved generated alpha on idle/hover. Removed the painted walk checkerboard with the already-authorized local anime segmentation workflow and packed lossless WebP. Inspected all frames over an opaque green backdrop for matte artifacts and clipping.
- Broom idle and landing use the still hover image without animation bobbing; actual horizontal or vertical travel uses the existing flight drawings. Separate enter/exit speed thresholds prevent repeated switching while slowing down. Physics position and inertia remain continuous.
- Canvas now has real backing pixels at up to 2× device density, bounded to roughly 8 MP. Phaser Scale.NONE plus inverse zoom keeps CSS dimensions stable; hotspot and overlay projection uses the effective CSS zoom. ResizeObserver and window resize refresh the render density.
- Validation: 24 unit tests and production build pass. Limited browser check confirmed a 2126×1974 backing canvas displayed at 1063×987 CSS pixels, clear standing artwork and the new hovering image after flight activation. No physical mobile-device test or measured frame-rate guarantee is claimed. Build retains the existing large Phaser bundle warning. ESLint could not run because the repository has no ESLint 9 configuration file.
- Database and production deployment remain deferred.
