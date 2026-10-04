# MAWHIBA · موهبة

Athletes become paid coaches. Clients book and pay a session online (Konnect, insured by Star) and leave a review. Coaches take short training modules that earn profile badges. Admins verify coaches and follow payments. Built for the Star Assurance hackathon (Tunisia). The UI is in French. Prices are whole dinars (DT).

Stack: Next.js 15 (App Router) + Supabase (Postgres, Auth, Storage) in one app, with three roles: client, coach and admin.

---

## Quick start (local, ~5 minutes)

### 1. Prerequisites

| Tool   | Version | Check            |
| ------ | ------- | ---------------- |
| Node   | 20+     | `node -v`        |
| npm    | 10+     | `npm -v`         |
| Docker | running | `docker info`    |

> **Use npm, not pnpm or yarn.** The project is locked to npm (`package-lock.json` + `packageManager` field). pnpm refuses to install it.

### 2. Install and set up (first time only)

```bash
npm install
npm run setup:local
```

`setup:local` starts Supabase in Docker, applies the migrations, writes `.env.local` and seeds demo data. The first run downloads the Supabase images, which takes a few minutes.

### 3. Start the app

```bash
npm run dev
```

Open **http://localhost:3000** and log in with a demo account (password `Mawhiba2026!` for all):

| Role   | Email               | What you get                                        |
| ------ | ------------------- | --------------------------------------------------- |
| Client | `client@mawhiba.tn` | Upcoming paid sessions, one open request with 2 proposals |
| Coach  | `coach@mawhiba.tn`  | Amira Ben Salah, swimmer, verified, inclusive badge |
| Admin  | `admin@mawhiba.tn`  | Verification queue, bookings, payments              |

### Every day after that

```bash
npm run db:start   # Supabase containers (skip if already running)
npm run dev
```

Stop the database with `npm run db:stop`. Your data is kept between restarts.

| URL                        | What                    |
| -------------------------- | ----------------------- |
| http://localhost:3000      | The app                 |
| http://127.0.0.1:54323     | Supabase Studio (DB UI) |
| http://127.0.0.1:54324     | Mailpit (caught e-mails) |

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `ERR_PNPM_IGNORED_BUILDS` or "configured to use npm" | You ran pnpm. Delete `pnpm-lock.yaml`, `pnpm-workspace.yaml` and `node_modules`, then run `npm install`. |
| `Cannot connect to the Docker daemon` | Start Docker Desktop (or `sudo systemctl start docker`), then rerun the command. |
| Pages fail with `fetch failed` / login does nothing | Supabase isn't running: `npm run db:start`. If the keys changed, run `npm run env:local`. |
| `Port 3000 is in use` | `npm run dev -- -p 3001`. Login still works; only share links use `NEXT_PUBLIC_SITE_URL`. |
| `port is already allocated` (5432x) | Another Supabase project is running. Stop it with `npx supabase stop --project-id <name>`. |
| Want fresh demo data | `npm run db:reset && npm run seed` (**wipes the local DB**). |
| AI bio button missing | Expected. It's off unless `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_FEATURE_AI_BIO=true` are both in `.env.local`. Note: `npm run env:local` rewrites `.env.local`, so add them back afterwards. |
| First `npm run build` fails offline | `next/font` downloads Montserrat, DM Sans and Cairo from Google Fonts at build time. Build once with internet. |

---

## Deploy the demo (Vercel + Supabase, ~10 minutes)

1. **Supabase.** Create a project (free plan is fine). In **Auth → Providers → Email**, turn off **Confirm email**.
2. **Database.** Open the **SQL editor**, paste the whole of [`supabase/deploy.sql`](supabase/deploy.sql) and run it once.
3. **Demo data.** `cp .env.deploy.example .env.deploy`, fill in the project URL, anon key and service-role key (**Settings → API**), then:
   ```bash
   npm run seed:deploy
   ```
4. **Vercel.** Import the repo, keep the defaults (`vercel.json` installs with npm) and set these environment variables, then deploy:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service-role key |
   | `NEXT_PUBLIC_DEMO` | `true` (one-click Client / Coach / Admin logins on `/login`) |

5. **Auth URL.** In Supabase **Auth → URL Configuration**, set **Site URL** to your Vercel URL.

Good to know:
- Share links and previews use the Vercel production domain automatically; set `NEXT_PUBLIC_SITE_URL` only for a custom domain.
- Slots and the monthly event are relative to the seed date. Run `npm run seed:deploy` again the day before the pitch (idempotent).
- A free Supabase project pauses after a week without traffic: open its dashboard before the pitch.
- Payments use the mock Konnect page (marked "Mode test") while `KONNECT_API_KEY` is unset.
- CLI alternative to step 2: `npx supabase link --project-ref <ref> && npm run db:push`.
- After adding a migration, run `npm run db:bundle` to regenerate `supabase/deploy.sql`.

---

## Things to try

**Book a session (client).** `client@` → **Trouver un coach** → open a coach → pick an offer and a slot → **Payer** `price + 2` (Star insurance). You land on the mock Konnect page (`/pay/<id>`): pay, or simulate a failure. The slot is held for 15 minutes; the booking only exists once the payment succeeds.

**Answer a request (coach → client).**
1. `client@` → **Mes demandes** → "Publier une demande". A description containing a phone number or e-mail is rejected.
2. `coach@` → **Demandes clients** shows only the client's first name and city → send a proposal with one of your slots.
3. `client@` accepts it and pays 47 DT: a confirmed booking is created, the other proposals are rejected and the request is fulfilled.

**Full lifecycle.** Admin force-completes a booking in `/admin/bookings` → split 38 / 7 / 2 (coach / platform / Star) → the client leaves a review → the coach sees it in **Revenus** (`/payments`) and the admin in `/admin/payments`. A decline or cancellation marks the payment refunded.

**Coach profile & CV.** `coach@` → **Profil** is a 7-step wizard with a live athlete card and a strength meter.
- Public profile: `/coaches/amira-ben-salah`
- Web CV: `/cv/amira-ben-salah`
- PDF: `/api/cv/amira-ben-salah/pdf?template=moderne` (or `classique`)
- Share image: `/api/card/amira-ben-salah/og` (`?format=story` for 1080×1350)

**Formation.** `coach@` → **Formation**: 6 modules (inclusive coaching, first aid, coaching children, injury prevention, nutrition & hydration, starting out on MAWHIBA). Each is 5 lessons + a 5-question quiz; ≥ 4 earns a badge shown on the profile and CV. The "Coaching inclusif" badge also unlocks inclusive offers. The modules ship with the schema (`*_formations.sql`).

**Monthly event.** The home page shows the next "Matinée MAWHIBA" with spots left. Clients and coaches register in one click (free, capacity enforced in SQL under a row lock); visitors are sent to login and back. Admins publish events in `/admin/events`.

**Coach map.** **Trouver un coach** → **Carte** (`/coaches?view=map`): the filters apply to the markers, hovering a card highlights its pin, **Autour de moi** sorts by distance ("à 3,2 km"). The public only sees a point rounded to ~1 km; the exact pin (wizard step 6, "Lieu d'entraînement") stays private. Mini maps on the home page, the client dashboard and each coach profile.

**Client onboarding.** Sign up as a client → 4 quick steps (sport, for whom, where, budget & moments), skippable and editable later in the user menu (**Mes préférences**, `/onboarding?edit=1`). A skipped onboarding shows a nudge on the dashboard. Preferences are private (never visible to coaches) and only keep a ~1 km point.

**Close the demo.** `admin@` → **Vue d'ensemble** → **Star Tracks** (`/star-tracks`): insured sessions, Star premiums, verified and trained coaches, coach earnings and insured sessions by sport, on one projector-friendly page.

**Admin.** `/admin/coaches` verifies new coaches (proofs open via signed URLs) and reviews palmarès & certifications.

### What the seed creates

- 16 verified coaches (1-3 offers each, 14 days of slots), 3 unverified coaches with pending proofs (`*@coach.mawhiba.tn`)
- 6 clients (`*.client@mawhiba.tn`), 20 past completed bookings with reviews and payments; upcoming paid bookings and one refund for the demo accounts
- 6 open requests, including the demo client's "Coach de natation pour mon fils autiste (8 ans)" with proposals from Amira (45, in budget) and Karim (55, over budget)
- formation badges for some coaches

---

## Scripts

| Script                              | What it does                                              |
| ----------------------------------- | --------------------------------------------------------- |
| `dev` / `build` / `start`           | Next.js                                                   |
| `lint` / `typecheck` / `test`       | ESLint, `tsc --noEmit`, Vitest                            |
| `setup:local`                       | `db:start` → `db:reset` → `env:local` → `seed`            |
| `db:start` / `db:stop`              | Start/stop local Supabase (Docker)                        |
| `db:reset`                          | Wipe the local DB and reapply all migrations              |
| `db:push`                           | Push migrations to the linked cloud project               |
| `db:types`                          | Regenerate `src/lib/supabase/database.types.ts`           |
| `env:local`                         | Write `.env.local` from `supabase status` (overwrites it) |
| `seed`                              | Seed through the service role (local or cloud, idempotent) |
| `seed:deploy`                       | Same seed against the project in `.env.deploy`             |
| `db:bundle`                         | Regenerate `supabase/deploy.sql` from the migrations       |

Before committing: `npm run lint && npm run typecheck && npm run test && npm run build`. `tests/money.test.ts` also checks the SQL money functions when `.env.local` points to a running database.

`npm run test:scenarios` runs end-to-end scenarios (booking, refunds, requests/proposals, roles and privacy) against the local Supabase, signed in as real users. Each run creates throwaway accounts and deletes them afterwards; the demo data is untouched.

---

## How it works

### Business rules

- **Money is integers only.** A booking costs `price + 2` (the Star insurance fee). On completion: `coach = floor(price × 0.85)`, `platform = price − coach`, `Star = 2`. Example: 45 → client pays 47, coach gets 38, platform 7, Star 2.
- **Direct payment, one per session.** `start_checkout` (or `start_proposal_checkout`) creates a `payments` row that holds the slot for 15 minutes (expiry computed on read). The gateway confirms it through `confirm_payment`, which only the service role can call (the Konnect webhook; today the mock gateway). Success creates the booking; if the slot or request was lost meanwhile the payment is refunded instead. Repeated confirmations are idempotent.
- **Refunds.** A decline or cancellation marks the payment `refunded`. Coach earnings are derived from completed bookings (`my_earnings`), never stored; payouts to coaches happen outside the app.
- **Booking states:** `pending → confirmed → completed`, `pending → declined`, `pending|confirmed → cancelled` (client, before start). Clients complete after the start time; admins can force-complete.
- **Visibility:** only `verified` coaches appear in search and on public pages.
- **Offers:** max 6 active per coach. "Inclusive" offers require the badge (DB trigger). `coach_profiles.price_per_session` is kept in sync with the cheapest active offer ("à partir de"). Coaches with active offers are booked through an offer; coaches without offers keep direct booking. A booked offer can only be deactivated.
- **Requests:** max 3 open per client. They expire 14 days after creation, computed on read (no cron). Coaches see requests only through the `request_board` view (first name + city, no contact details). Phone numbers and e-mails are rejected in SQL (`has_contact_info`), mirrored in `src/lib/contact-info.ts`.
- **Proposals:** one active per coach per request, on one of the coach's future free slots, withdrawable while pending. Accepting means paying: once the payment is confirmed, one transaction creates a **confirmed** booking at the proposal price, books the slot, rejects the other proposals and fulfils the request.
- **Certification:** scoring happens in SQL (`submit_quiz`). The answer key (`certifications.answer_key`) has no API privileges.

All money logic lives in SQL RPCs (`supabase/migrations/*_functions.sql`, `*_direct_payments.sql`): security definer, role check inside, row locks. `src/lib/money.ts` only mirrors the math for display and tests.

### Security

- RLS on every table, with explicit table/column grants. `bookings` and `payments` are read-only to users, so every write goes through an RPC.
- `profiles.role` and `coach_profiles.verified` can't be changed by users, and `admin` can't come from signup.
- Storage: `avatars` is public read / owner write. `proofs` is private (owner + admin, signed URLs).

### Project layout

```
src/app/(public)     landing, /coaches, /coaches/[slug], /explore/offers  (uses the app shell when logged in)
src/app/(auth)       /login, /signup
src/app/(app)        authenticated pages; role segments guard access in their layout.tsx
src/app/cv, api/     web CV, PDF and share-image routes
src/features/*       one folder per domain: queries.ts, actions.ts, components/
src/components       ui/ (shadcn), layout/ (shell, nav, logo), shared/ (cards, badges…)
src/lib              config, money, auth (getCurrentUser/requireRole), nav, supabase clients, zod schemas
supabase/migrations  schema → functions/RPCs/triggers → RLS/grants/storage → features
scripts/             seed.ts (+ seed-data/), write-local-env.ts
tests/               vitest
messages/fr.json     every UI string (typed: a missing key fails tsc)
```

### Design system

- Brand tokens live in `src/app/globals.css`: purple `#4B3FE8`, lime `#C6F432`, ink `#120F2E`, surface `#F5F5F4`, with derived tints. Components use only semantic classes (`bg-primary`, `text-accent-foreground`…), never raw colours.
- Lime is for highlights and CTAs **on purple**; never put lime text on light backgrounds.
- Fonts: Montserrat 600 (headings, buttons), DM Sans 500 (body), Cairo (anything `lang="ar"`). Layouts use logical properties (`ms-`, `pe-`, `start-`), so they flip under `dir="rtl"`.
- `src/features/cv/pdf/theme.ts` is the only file with hex colours (react-pdf and next/og can't read CSS variables). Keep it in sync with `globals.css`.
- Logos live in `public/brand/` (horizontal and stacked, purple / lime / white / black). Brand fonts for the CV PDF are in `public/fonts/`.
- `/dev/ui` (development only) shows every component and token.

### Choices made

- Bookings use a partial unique index (one *live* booking per slot), so a declined or cancelled slot can be booked again.
- `profiles.email` is copied from `auth.users` by the signup trigger so admins can search users.
- Reviewer names come from a `public_profiles` view (name/avatar/city only).
- Proposal prices are pre-filled with the coach's cheapest matching offer, capped at the client's budget.
- Navigation items have a `place` in `src/lib/nav.ts`: `main` (sidebar and bottom bar, 5 per role at most), `menu` (user dropdown) or `hidden` (URL only: admin requests and events). Change the place to re-enable an item.
- "Weekly" slot creation publishes the slot plus the same time on the next 2 weeks.
- Time zone is `Africa/Tunis`. Konnect is mocked (`src/lib/payments/konnect.ts`) while `KONNECT_API_KEY` is unset; the real integration only needs `initPayment` and a webhook route calling `confirm_payment`.
