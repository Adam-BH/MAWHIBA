# Plan: coach map, client onboarding, profile matching, sessions calendar

Implementation plan for Claude Code. Read `CLAUDE.md` first: every rule there still applies (thin routes, zod + `requireRole` + `ActionResult` in actions, tokens-only styling, strings in `messages/fr.json`, never edit an applied migration, files under ~200 lines).

Ship it as **5 PRs, in order**. Each PR ends with `npm run lint && npm run typecheck && npm run test && npm run build`, `npm run db:types` after migrations, `npm run db:bundle` to regenerate `supabase/deploy.sql`, and a Conventional Commit.

| PR | Feature | Depends on |
|----|---------|-----------|
| 1 | Location foundation + coach location step | none |
| 2 | Coach map (`/coaches?view=map`) + mini map | 1 |
| 3 | Client onboarding (preferences) | 1 |
| 4 | Profile matching (similarity) | 1, 3 |
| 5 | Sessions calendar | none (can run in parallel with 2 to 4) |

## Decisions (defaults, change before starting if needed)

- **Map:** `leaflet` 1.9 + `react-leaflet` 5 (peer: React 19), OpenStreetMap tiles, no API key. Tile URL comes from `NEXT_PUBLIC_MAP_TILE_URL` (default OSM) so a paid provider can be swapped in for production. No PostGIS: distances use a small SQL haversine function, plenty for a few hundred coaches.
- **Location privacy:** a coach's exact pin is private (owner + admin). The public only sees coordinates rounded to 2 decimals (~1 km). Clients never store a precise location: "near me" uses the browser position for the current request only, and preferences keep a city plus an optional point rounded to 2 decimals.
- **Matching:** v1 is an explainable **feature similarity score computed in SQL** (sports, audience, goals vs specialties, distance, budget, languages, inclusive need, quality). It works without AI, can be tested, and returns reason codes the UI turns into chips ("Natation", "À 3 km", "Dans votre budget"). Text embeddings (pgvector) are an optional v2 behind a feature flag, like the AI bio. Weights live only in SQL.
- **Calendar:** built in-house with `date-fns` + `@date-fns/tz` (already installed) on `TIME_ZONE`. No FullCalendar: too heavy and it fights the token styling.
- **Onboarding:** short (4 steps, about 30 s), skippable, editable later. No hard gate: a skipped onboarding shows a nudge card.

---

## PR 1: Location foundation

### Migration `supabase/migrations/20261009000001_locations.sql`
- `coach_profiles` add:
  - `base_lat double precision check (base_lat between 30 and 38)`, `base_lng double precision check (base_lng between 7 and 12)` (Tunisia bounding box), both null or both set (`check ((base_lat is null) = (base_lng is null))`).
  - `base_label text check (char_length(base_label) <= 80)` (e.g. "Piscine olympique de Radès").
  - `service_radius_km int not null default 10 check (service_radius_km between 1 and 100)`.
  - `map_lat`, `map_lng` as `generated always as (round(base_lat::numeric, 2)::float8) stored` (public, approximate).
- Column grants: revoke `base_lat, base_lng` from `anon, authenticated`; grant `map_lat, map_lng, base_label, service_radius_km` for select. The coach edits their own pin through an action (update grant on `base_lat, base_lng, base_label, service_radius_km` for the owner via the existing RLS update policy). Check that `select *` in `getMyCoachProfile` still works for the owner; if column grants break it, add a `my_coach_location()` security definer RPC instead.
- `create function public.distance_km(lat1 float8, lng1 float8, lat2 float8, lng2 float8) returns float8 language sql immutable` (haversine, R = 6371). Grant execute to `anon, authenticated`.
- Add `reset_verified_on_edit` coverage? **No:** the location is not a verified claim, so editing it must not reset `verified`.

### Code
- `src/lib/config.ts`: `CITY_COORDS: Record<City, [number, number]>` (Tunis 36.8065,10.1815 · Ariana 36.8665,10.1647 · Ben Arous 36.7531,10.2189 · La Marsa 36.8782,10.3247 · Sousse 35.8256,10.6360 · Sfax 34.7406,10.7603 · Monastir 35.7643,10.8113 · Nabeul 36.4561,10.7376 · Bizerte 37.2744,9.8739), `MAP_DEFAULT_CENTER`, `MAP_DEFAULT_ZOOM`.
- `src/lib/geo.ts`: `distanceKm()` (mirror of SQL `distance_km`), `roundCoord()`, `formatDistance()`, `isInTunisia()`. Display and tests only, same idea as `money.ts`.
- `src/lib/validations/location.ts`: zod schema (lat/lng in bounds, label ≤ 80, radius 1 to 100).
- `src/features/map/components/`:
  - `leaflet-map.tsx` (`"use client"`, the only file importing `react-leaflet` + `leaflet/dist/leaflet.css`), wrapped by `map.tsx`, which uses `next/dynamic({ ssr: false })` and a skeleton.
  - `location-picker.tsx`: map + draggable pin, click to place, "Utiliser ma position" (geolocation), city quick-jump select, radius slider drawn as a circle.
  - `coach-marker.tsx`: `L.divIcon` with initials, styled with token classes (`bg-primary text-primary-foreground`), no hex values.
- `src/app/globals.css`: small `.leaflet-*` overrides (popup radius, attribution font, zoom buttons) using the semantic variables.
- Coach wizard: new section **"Lieu d'entraînement"** in `step-coaching.tsx` (keep the step count at 7; if the file goes over 200 lines, extract `coaching-location-field.tsx`). Saves via `updateCoachLocationAction` in `features/profile/actions.ts`. Profile strength gets `location: !!base_lat` (update `src/lib/profile-strength.ts` + `tests/profile.test.ts`).
- `src/features/profile/components/verification-status.tsx` or step-publish: a reminder if no pin is set ("Ajoutez votre lieu pour apparaître sur la carte").
- Seed (`scripts/seed-profiles.ts`): deterministic pins near each coach's city (seeded jitter of ±0.02°), Amira at Radès / La Marsa.

### Tests
- `tests/geo.test.ts`: distances between known cities (Tunis to Sfax ≈ 230 to 240 km), rounding, bounds; plus SQL parity against `distance_km` when `.env.local` points to a DB (same pattern as `money.test.ts`).
- `tests/scenarios/access.test.ts`: `anon` and another coach selecting `base_lat` get an error or null; `map_lat` is readable for verified coaches.

**Done when:** a coach can drop a pin in the wizard, the public profile shows "La Marsa · ~1 km precision" without leaking exact coordinates, and the parity test passes.

---

## PR 2: Coach map + mini map

### Data
- `features/coaches/queries.ts`: add `map_lat, map_lng, base_label, service_radius_km` to `CARD_FIELDS`. Distance for "near me" is computed in TS with `geo.ts` (≤ 60 cards; display only).
- `CoachFilters` gains `near?: { lat: number; lng: number }` parsed from `?near=36.88,10.32` (2 decimals max, validated with zod, ignored if outside Tunisia) and `view?: "list" | "map"`.

### UI
- `/coaches`: a **Liste | Carte** segmented toggle in the filters bar (URL `?view=map`). The existing filters apply to both views.
- `features/map/components/coach-map-view.tsx`: desktop split (cards list 2/5, map 3/5, sticky). Hovering a card highlights its marker and the reverse. Marker popup = compact card (name, sport, price, rating, "Voir le profil"). Mobile: full-width map with a bottom horizontal card carousel.
- "Autour de moi" button: geolocation, then `router.replace('?near=…')`, then cards sorted by distance with a "à 3,2 km" badge. Permission denied shows a toast plus a fallback to the city select.
- Coaches without a pin: listed under the map ("Sans localisation précise"), never as a fake marker.
- **Mini map** `coach-mini-map.tsx` (static-ish: ~280 px tall, no scroll zoom, click opens `/coaches?view=map`):
  - client dashboard, next to "Coachs recommandés", centred on the client's preference city;
  - landing page section "Des coachs près de chez vous";
  - public coach profile: a small map with the approximate area circle (radius = `service_radius_km`).
- i18n: `coaches.map.*`, `profile.location.*` in `messages/fr.json`.

**Done when:** `/coaches?view=map&sport=Natation` shows only swimming coaches as markers, "near me" sorts by distance, Lighthouse shows no layout shift from the map (skeleton has a fixed height), and `npm run build` has no SSR `window` errors.

---

## PR 3: Client onboarding (preferences)

### Migration `20261009000002_client_preferences.sql`
```
client_preferences (
  user_id uuid pk references profiles(id) on delete cascade,
  sports text[] not null default '{}'          check (cardinality(sports) <= 3),
  audience request_audience,                    -- enfant | adulte
  child_age int check (child_age between 1 and 17),
  level skill_level,
  goals text[] not null default '{}'           check (cardinality(goals) <= 4),
  languages text[] not null default '{}',
  availability text[] not null default '{}',    -- matin | midi | soir | weekend
  budget_max int check (budget_max between 5 and 1000),
  inclusive_needs boolean not null default false,
  city text,
  lat float8, lng float8,                       -- already rounded to 2 decimals by the action
  onboarded_at timestamptz,                     -- set on finish OR skip
  updated_at timestamptz not null default now()
)
```
- RLS: owner select/insert/update; admin select. **No coach access** (privacy, same spirit as `request_board`). Trigger `touch_updated_at`.
- Also copy `city` into `profiles.city` on save (keeps existing city logic working).

### Code
- `src/lib/config.ts`: `GOALS = ["Apprendre", "Progresser", "Compétition", "Forme & santé", "Perte de poids", "Confiance en soi"]`, `AVAILABILITY = ["matin", "midi", "soir", "weekend"]`. Map goals to coach `SPECIALTIES` in SQL (PR 4), not in TS.
- `src/lib/validations/preferences.ts`: zod, one schema per step plus the full schema (enum checks against `SPORTS`, `GOALS`…; `child_age` required iff `audience = enfant`, same rule as requests).
- `src/features/preferences/`: `actions.ts` (`savePreferencesAction`, `skipOnboardingAction`), `queries.ts` (`getMyPreferences`), `components/onboarding-wizard.tsx` + one file per step:
  1. **Sport(s)**: chip grid of `SPORTS` (max 3).
  2. **Pour qui ?** moi / mon enfant (+ age), level (débutant / intermédiaire / avancé), "besoins particuliers" toggle (inclusive).
  3. **Où ?** city select + "Utiliser ma position" + mini map preview (reuses PR 1 picker in read-only mode).
  4. **Budget & moments**: budget slider (20 to 150 DT, shows "+2 DT assurance Star incluse"), availability chips, goals chips.
  - Progress bar, "Passer" on every step, "Retour". State kept in the client between steps; one save at the end (plus `skip` sets `onboarded_at` with empty prefs).
- Route `src/app/(app)/onboarding/page.tsx` (`requireRole(["client"])`), full-screen layout without the sidebar (new `(app)/onboarding/layout.tsx` or a `bare` prop on the shell).
- Flow:
  - `signUpAction`: clients go to `/onboarding?next=…` instead of `/dashboard`.
  - Client dashboard: if `onboarded_at` is null, show a nudge card "Dites-nous ce que vous cherchez (30 s)". No hard redirect.
  - Edit later: "Mes préférences" entry in the user menu (`src/lib/nav.ts`, place `menu`) opens `/onboarding?edit=1`, prefilled.
- Seed: preferences for `client@mawhiba.tn` (Natation, enfant 8 ans, débutant, inclusive, La Marsa, budget 50) so the demo shows Amira first in PR 4.

### Tests
- `tests/preferences.test.ts`: schema rules (child age, max sports, unknown goal rejected).
- Scenario: a coach selecting `client_preferences` gets 0 rows; a client can't read another client's preferences.

**Done when:** a new client signs up, completes or skips onboarding in under 30 s, lands on the dashboard, and can edit preferences later.

---

## PR 4: Profile matching (similarity search)

### Migration `20261009000003_matching.sql`
- Helpers (immutable SQL): `jaccard(text[], text[]) returns float8`, `goal_specialties(goals text[]) returns text[]` (e.g. Compétition → Compétition; Perte de poids → Perte de poids, Préparation physique; Apprendre → Débutants; and audience enfant → Enfants).
- `match_coaches(p_limit int default 12, p_sport text default null) returns table(coach_id uuid, score int, distance_km float8, reasons text[])`
  - `security definer`, `set search_path = public`, `assert_role(array['client'])`, reads the caller's `client_preferences` (falls back to `profiles.city` if none).
  - Only `verified` coaches. If prefs have sports, a coach must share at least one sport (hard filter) unless `p_sport` overrides.
  - Score out of 100 (weights only here):
    | Signal | Points | Reason code |
    |---|---|---|
    | shares a preferred sport | 30 | `sport` |
    | goals/audience vs specialties (Jaccard) | 0 to 15 | `goals`, `kids` |
    | distance: `15 * exp(-d / 8)` using pin vs client point or city centroid; full if client city in `zones` | 0 to 15 | `nearby` |
    | price ≤ budget_max (linear decay to 0 at +50 %) | 0 to 12 | `in_budget` |
    | inclusive need and coach has the inclusive badge | 10 (and hard filter if `inclusive_needs`) | `inclusive` |
    | language overlap | 0 to 5 | `language` |
    | level fit (Compétition goal vs `highest_level` ≥ national) | 0 to 5 | `level` |
    | quality: Bayesian rating `(r*n + 4*3)/(n+3)` scaled + completed sessions | 0 to 8 | `top_rated` |
  - Returns only the top 3 reasons by contribution.
- `similar_coaches(p_coach uuid, p_limit int default 4)`: same features, coach vs coach (sports, specialties, price closeness, distance), excludes self, verified only. Granted to `anon, authenticated` (it only uses public fields).
- `match_requests_for_coach(p_limit int default 20)`: for the coach board, scores open `request_board` rows against the calling coach (sport, zones/distance to request city centroid, budget vs price, special needs vs inclusive badge). Never returns client identity (selects from the view only).
- Grants: execute explicitly; any new error codes go in `src/lib/action-result.ts` + `messages/fr.json → errors`.

### Code
- `src/features/matching/queries.ts`: `listMatchedCoaches()` (RPC, then fetch cards with `CARD_FIELDS` in one `in()` query, keep RPC order), `listSimilarCoaches(coachId)`, `listMatchedRequests()`.
- `src/features/matching/components/match-reasons.tsx`: reason chips (`reasons` codes → `messages/fr.json → matching.reasons.*`), plus a score shown as "Très bon match" / "Bon match" (no raw number).
- Wire-up:
  - Client dashboard "Coachs recommandés" now uses `listMatchedCoaches()` with reason chips (fallback: current rating order).
  - `/coaches`: new sort option **"Pour vous"** (default for signed-in clients with preferences).
  - Public coach profile: "Coachs similaires" row (`similar_coaches`).
  - Coach "Demandes clients" board: sort "Meilleures correspondances" + a "Correspond à votre profil" badge.
  - Request creation: after `create_request`, show "Coachs qui correspondent" (top 3) as a hint.
- v2 (optional, separate PR, feature-flagged like `ai-flag.ts`): `pgvector` embeddings of coach bio/headline and request description, blended in as +0 to 10 points. Everything must keep working without it.

### Tests
- `tests/scenarios/matching.test.ts`: a client with Natation + enfant + inclusive in La Marsa gets an inclusive swimming coach ranked first; unverified coaches never appear; a coach calling `match_coaches` is refused; `similar_coaches` excludes self; `match_requests_for_coach` returns no `client_id`.
- Unit: reason code to label mapping covers every code returned by SQL (keep a `MATCH_REASONS` const in `src/lib/config.ts` and assert parity in a DB test, like `has_contact_info`).

**Done when:** logging in as `client@mawhiba.tn` shows Amira first with chips "Natation · Coaching inclusif · À 2 km", and the coach board puts the matching request on top.

---

## PR 5: Sessions calendar

### Data
- `features/bookings/queries.ts`: `listBookingsInRange(viewer, userId, from, to)` filtering on `slot.starts_at` (embedded filter `slots.starts_at` with `!inner`), no 200 limit for the visible range.
- `features/slots/queries.ts`: `listSlotsInRange(coachId, from, to)` for free slots (coach only).

### Pure helpers `src/lib/calendar.ts` (fully unit-tested)
- `rangeFor(view, date)` (week starts Monday, month grid = 6 weeks), `toTz()` via `@date-fns/tz`, `minutesToTop()`, `layoutDay(events)` (overlap columns: greedy column assignment, each event gets `col`/`cols`), `parseCalendarParams()` (zod: `view` = week | month | agenda, `date` = yyyy-MM-dd).

### UI `src/features/calendar/components/`
- `calendar-toolbar.tsx`: ‹ Aujourd'hui › + title ("5 au 11 oct. 2026") + Semaine / Mois / Agenda toggle; all state in the URL (`/sessions?view=week&date=2026-10-05`) so it's shareable and server-rendered.
- `week-grid.tsx`: 7 columns, 07:00 to 22:00, 30-min lines, sticky hour gutter, "now" line (primary), today column tinted (`bg-accent`). Events absolutely positioned from `layoutDay`.
- `month-grid.tsx`: 6×7 cells, up to 3 event pills per day + "+2".
- `agenda-list.tsx`: grouped by day (default under `md`, the week grid is hidden on mobile).
- `event-block.tsx`: styles from status, token classes only:
  - confirmed: `bg-primary text-primary-foreground`
  - pending: dashed `border-primary` on `bg-card` + "En attente" dot
  - completed: `bg-muted text-muted-foreground`; cancelled/declined hidden behind a "Afficher annulées" toggle
  - coach free slot: ghost block (`border-dashed border-border`, label "Libre")
  - shows time, other party's first name, location; insured shield icon.
- `event-sheet.tsx`: click opens a `Sheet` (shadcn) with the existing `BookingCard` content + `BookingActions` (accept/decline/cancel/review reuse the existing actions; no new mutations).
- Coach extra: clicking an empty week cell opens the existing `SlotForm` prefilled with that start time (reuse `createSlotAction`).
- `/sessions` page: new default tab **Calendrier** (week on desktop), keep **Liste** (the current `BookingList` tabs) and coach **Créneaux**. Page stays thin: parse params, call queries, render.
- Small touches: keyboard nav (←/→ for prev/next, `t` for today), `aria-label` on events, `prefers-reduced-motion` respected.
- Optional stretch: "Ajouter à mon agenda" `.ics` download per booking (`/api/bookings/[id]/ics`, owner only).

### Tests
- `tests/calendar.test.ts`: week range starts Monday in `Africa/Tunis`, month grid has 42 days, overlap layout (3 overlapping events give 3 columns; back-to-back events don't overlap), param parsing defaults.
- Scenario: `listBookingsInRange` for a client returns only their bookings (RLS).

**Done when:** `/sessions` shows the demo client's sessions on the week of 5 Oct, pending ones are visibly different, clicking one opens the sheet with working cancel, and mobile shows the agenda.

---

## Cross-cutting checklist (every PR)
- New strings only in `messages/fr.json` (typed; `tsc` fails on missing keys).
- No hard-coded colours (Leaflet overrides use CSS variables; markers use token classes). Lime never as text on light backgrounds.
- New RPCs: `security definer`, `set search_path = public`, `assert_role`, explicit `grant execute`, error codes listed in `action-result.ts`.
- `anon` SELECT grants on any table referenced by a new RLS policy that public pages hit.
- Update `README.md` "Things to try" (map, onboarding, "Pour vous", calendar) and add to `CLAUDE.md`:
  - "Exact coach coordinates (`base_lat/base_lng`) are private; public code uses `map_lat/map_lng`."
  - "Matching weights live only in SQL (`match_coaches`); TS only maps reason codes."
  - "`src/lib/geo.ts` mirrors SQL `distance_km` (parity test)."
- Re-seed works on a fresh DB: `npm run db:reset && npm run seed`.

## Kick-off prompt for Claude Code (one per PR)
> Read `CLAUDE.md` and `docs/plans/2026-10-map-onboarding-matching-calendar.md`. Implement **PR N** only, following its migration, file list, tests and "Done when". Ask before deviating from a decision listed at the top. Finish with lint, typecheck, test, build, `db:types` and `db:bundle`, then commit with a Conventional Commit message.
