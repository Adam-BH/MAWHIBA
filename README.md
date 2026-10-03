# MAWHIBA

Athletes become paid coaches. Clients top up a points wallet, book a session (insured by Star) and leave a review. Admins verify coaches, credit wallets and process withdrawals. This MVP was built for the Star Assurance hackathon (Tunisia). The UI is in French. 1 point = 1 TND.

One Next.js 15 app, one Supabase project. The client, coach and admin experiences share the app shell. Navigation is filtered by role, and every role-restricted page **and** server action is guarded on the server.

## Run it

### Option 1: Local Supabase (Docker)

Requires Docker and Node 20+.

```bash
npm install
npm run setup:local   # supabase start → db reset (migrations) → write .env.local → seed
npm run dev           # http://localhost:3000
```

Supabase Studio: http://127.0.0.1:54323. Stop the containers with `npm run db:stop`.

### Option 2: Cloud / external Supabase

1. Create a Supabase project. In **Auth → Providers → Email**, turn off **Confirm email** for the demo.
2. `cp .env.example .env.local` and fill in the URL, anon key and service role key.
3. Then run:
   ```bash
   npx supabase link --project-ref <ref>
   npm run db:push    # applies supabase/migrations
   npm run seed       # idempotent, safe to re-run
   npm run dev
   ```

## Demo accounts

Password for all: `Mawhiba2026!`

| Role   | Email               | Notes                                                       |
| ------ | ------------------- | ----------------------------------------------------------- |
| Admin  | `admin@mawhiba.tn`  |                                                             |
| Coach  | `coach@mawhiba.tn`  | Amira Ben Salah, swimmer, verified, "Coaching inclusif" badge, 45 pts |
| Client | `client@mawhiba.tn` | 150 points                                                  |

The seed also creates:

- 15 more verified coaches and 3 unverified coaches with pending proofs (`*@coach.mawhiba.tn`)
- 5 more clients (`*.client@mawhiba.tn`)
- 14 days of slots for every verified coach
- 20 past completed bookings with reviews and matching ledger entries
- the inclusive-coaching module

## Scripts

| Script                                       | What it does                                               |
| -------------------------------------------- | ---------------------------------------------------------- |
| `dev` / `build` / `start`                    | Next.js                                                    |
| `lint` / `typecheck` / `test`                | ESLint, `tsc --noEmit`, Vitest                             |
| `db:start` / `db:stop` / `db:reset`          | Local Supabase (Docker)                                    |
| `db:push`                                    | Push migrations to the linked cloud project                |
| `db:types`                                   | Regenerate `src/lib/supabase/database.types.ts`            |
| `env:local`                                  | Write `.env.local` from `supabase status`                  |
| `seed`                                       | Seed through the service role (works for local and cloud)  |
| `setup:local`                                | Everything above for local mode                            |

## Business rules

- **Money is integers only.** A booking costs `price + 2` (the Star insurance fee). On completion: `coach = floor(price × 0.85)`, `platform = price − coach`, `Star = 2`. Example: 45 → client pays 47, coach gets 38, platform 7, Star 2.
- **Wallet = append-only ledger** (`wallet_tx`). Balance = `sum(amount)`. No balance column exists. The system accounts are `PLATFORM` and `STAR_INSURANCE`.
- **Escrow.** Booking immediately debits `price + fee` (`booking_hold`). A decline or cancellation refunds it in full. Payouts happen only when the booking is completed.
- **State machine:** `pending → confirmed → completed`, `pending → declined`, `pending|confirmed → cancelled` (client, before start). Clients complete after the start time. Admins can force-complete.
- **Withdrawals:** the request must be covered by `balance − pending withdrawals`. Admin approval writes the debit.
- **Visibility:** only `verified` coaches show up in search and on public pages.
- **Certification:** 5 lessons + 5 questions. A score ≥ 4 earns the "Coaching inclusif" badge. Scoring happens in SQL (`submit_quiz`), and the answer key (`certifications.answer_key`) has no API privileges.

All money logic lives in SQL RPCs (`supabase/migrations/*_functions.sql`). They run as security definer, check the role inside and lock rows. `src/lib/money.ts` mirrors the math for display. `tests/money.test.ts` checks the TS and SQL versions against the same cases (the SQL half runs when `.env.local` points to a running database).

## Structure

```
src/app/(public)     landing, /coaches, /coaches/[id]   (uses the app shell when logged in)
src/app/(auth)       /login, /signup
src/app/(app)        authenticated shell; role segments guard access in their layout.tsx
src/features/*       one folder per domain: queries.ts, actions.ts, components/
src/components       ui/ (shadcn), layout/ (shell, nav), shared/ (badges, stat-card, …)
src/lib              config, money, booking-rules, auth (getCurrentUser/requireRole), nav, supabase clients, zod schemas
supabase/migrations  schema → functions/RPCs/triggers → RLS/grants/storage
scripts/             seed.ts, write-local-env.ts
tests/               vitest
```

- **Security:** RLS is enabled on every table. API roles get explicit table and column grants only. `wallet_tx`, `bookings` and `withdrawals` are read-only to clients, so every write goes through an RPC. `profiles.role` and `coach_profiles.verified` cannot be updated by users.
- **Storage:** `avatars` is public read with owner-only writes. `proofs` is private (owner + admin), and admins view proofs through signed URLs.
- **Design tokens** live in `src/app/globals.css`. Components use only semantic classes (`bg-primary`, `text-success`, …). `/dev/ui` (development only) shows every component and token.

## Choices made

- Bookings use a **partial unique index** (one *live* booking per slot) instead of `slot_id unique`, so a declined or cancelled slot can be booked again.
- `profiles.email` is copied from `auth.users` by the signup trigger so admins can search users.
- The quiz stores its answers in a separate `answer_key` column hidden by column privileges (rather than a view).
- Reviewer first names come from a `public_profiles` view (name/avatar/city only).
- "Weekly" slot creation publishes the slot plus the same time on the next 2 weeks.
- Time zone is `Africa/Tunis` for slot input and display.
- Flouci payment is a mock dialog: it always succeeds and credits through `topup_wallet`.
