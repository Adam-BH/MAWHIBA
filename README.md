# MAWHIBA

Athletes become paid coaches. Clients top up a points wallet, book a session (insured by Star) and leave a review. Admins verify coaches, credit wallets and process withdrawals. This MVP was built for the Star Assurance hackathon (Tunisia). The UI is in French. 1 point = 1 TND.

It's a two-way marketplace. Clients browse **coach offers** (session types with their own prices) and book an offer + slot. They can also post a **request** ("Demande"); verified coaches answer it with **proposals**, and the client accepts one in a single step.

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

- 1–3 offers per verified coach. Amira has "Natation enfants" (45 min, 40 pts), "Natation adulte" (60 min, 50 pts) and "Séance inclusive autisme" (60 min, 50 pts).
- 6 open requests, including the demo client's "Coach de natation pour mon fils autiste (8 ans)" in La Marsa (30–50 pts). It already has 2 proposals: Amira at 45 (in budget) and Karim Bouazizi at 55 (hors budget).
- 1 fulfilled request linked to a past completed booking

- 15 more verified coaches and 3 unverified coaches with pending proofs (`*@coach.mawhiba.tn`)
- 5 more clients (`*.client@mawhiba.tn`)
- 14 days of slots for every verified coach
- 20 past completed bookings with reviews and matching ledger entries
- the inclusive-coaching module

## Demo flows

**Base flow.** Sign up a coach → profile + proof + slots → admin verifies → the coach passes the inclusive module → a client tops up the 100 pack (110) → books 45 + 2 = 47 → the coach accepts → admin force-completes → payout 38 / 7 / 2 → review → withdrawal.

**A: Offers.** `coach@` → **Mes offres** → "Nouvelle offre". It appears on `/coaches/[id]` and `/explore/offers`, and the "à partir de" price updates if it's the cheapest. A client picks the offer, then a slot → `/book/[slotId]?offer=…` shows "offer price + 2". The booking stores `offer_id`.

**B: Requests.**
1. A client opens **Mes demandes** → "Publier une demande" (Natation, La Marsa, enfant 8 ans, besoins particuliers, 30–50). A description with a phone number is rejected with a friendly message.
2. `coach@` → **Demandes clients**. The board shows only the client's first name + city. Amira sends a proposal at 45 with one of her slots.
3. `karim.bouazizi@coach.mawhiba.tn` proposes 60, which shows the "Hors budget" tag.
4. The client accepts Amira's proposal ("45 pts + 2 pts assurance Star = 47 pts"). The booking is created **confirmed**, the balance drops by 47, the other proposal is rejected, the request is fulfilled and the slot is booked.
5. Then the normal lifecycle: complete → 38 / 7 / 2 → review.

**Profile & CV.** `coach@` → **Profil** opens a 7-step wizard: live athlete-card preview, a strength meter (`src/lib/profile-strength.ts`), proofs per palmarès, and publish with confetti. Public profile: `/coaches/amira-ben-salah`. Web CV: `/cv/amira-ben-salah`. PDF: `/api/cv/<slug>/pdf?template=moderne|classique`. Share image: `/api/card/<slug>/og` (`?format=story` for 1080×1350). Admins review palmarès and certifications in `/admin/coaches` → "Palmarès & certifications". Optional AI bio: set `ANTHROPIC_API_KEY` + `NEXT_PUBLIC_FEATURE_AI_BIO=true`.

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
- **Offers:** max 6 active per coach. "Inclusive" offers require the badge (DB trigger). `coach_profiles.price_per_session` is kept in sync as the cheapest active offer ("à partir de"). A coach with active offers is booked through an offer (`book_slot(slot, note, offer)`); coaches without offers keep the legacy direct booking. An offer that has been booked can only be deactivated.
- **Requests:** max 3 open per client. Requests expire 14 days after creation, computed on read (`expires_at`, no cron). Coaches see requests only through the `request_board` view (verified coaches, safe columns, first name + city). Phone numbers and e-mails are rejected in SQL (`has_contact_info`), mirrored in `src/lib/contact-info.ts`.
- **Proposals:** one active per coach per request, on one of the coach's future free slots. A coach can withdraw a pending proposal. `accept_proposal` runs one transaction: it checks the slot + balance, creates a **confirmed** booking at the proposal price, holds `price + 2`, books the slot, rejects the other proposals and fulfils the request. Closing a request rejects its pending proposals.
- **Certification:** 5 lessons + 5 questions. A score ≥ 4 earns the "Coaching inclusif" badge. Scoring happens in SQL (`submit_quiz`), and the answer key (`certifications.answer_key`) has no API privileges.

All money logic lives in SQL RPCs (`supabase/migrations/*_functions.sql`). They run as security definer, check the role inside and lock rows. `src/lib/money.ts` mirrors the math for display. `tests/money.test.ts` checks the TS and SQL versions against the same cases (the SQL half runs when `.env.local` points to a running database).

## Structure

```
src/app/(public)     landing, /coaches, /coaches/[id], /explore/offers   (uses the app shell when logged in)
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
- Booking without `?offer=` still works for coaches who have no offers, so older flows keep working. For coaches with offers, the checkout first asks which offer to book.
- Proposal prices are pre-filled with the coach's cheapest matching offer (same sport, matching audience), capped at the client's budget max.
- On mobile, "Profil" and "Formation" live in the user menu so the bottom bar keeps 6 items or fewer.
- "Weekly" slot creation publishes the slot plus the same time on the next 2 weeks.
- Time zone is `Africa/Tunis` for slot input and display.
- Flouci payment is a mock dialog: it always succeeds and credits through `topup_wallet`.
