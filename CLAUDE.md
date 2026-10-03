# MAWHIBA: rules for working in this repo

Next.js 15 (App Router) + Supabase in a single app, with three roles (client / coach / admin). See README.md for how to run it and for the business rules.

## Code rules
- TypeScript strict. No `any`, no dead or commented-out code. Keep files small (< ~200 lines). Use named exports, except for Next.js page/layout/loading/error files.
- File names are kebab-case and components are PascalCase. Actions are `verbNounAction`, queries are `getX`/`listX`.
- Routes stay thin. `page.tsx` calls `features/*/queries.ts` and renders `features/*/components`. Mutations live in `features/*/actions.ts`.
- Every server action validates input with zod (`src/lib/validations`), calls `requireRole([...])` first and returns `ActionResult` (`{ ok: true, data } | { ok: false, error }`). The UI runs actions through `useAction()`, which shows a toast.
- Every role-restricted page calls `requireRole`. Role segments also guard in their `layout.tsx`, so the redirect is a real 307 that happens before any loading boundary.
- Use Server Components by default. Add `"use client"` only on interactive leaves.
- **Money logic only in SQL RPCs.** The app never computes or writes balances. `src/lib/money.ts` is for display and tests only and must match `split_payout` in SQL.
- **npm only** (`packageManager` is pinned). Never add a pnpm/yarn lockfile.
- **Styling via tokens only:** use the semantic CSS variables in `src/app/globals.css` (Tailwind v4 `@theme inline`). No hard-coded colors (`bg-blue-600`, hex values) in components. Brand = purple/lime/ink/surface; lime goes on purple (or as a fill with ink text), never as text on light backgrounds.
- All UI strings go in `messages/fr.json` (typed, so missing keys fail `tsc`).
- Use the generated DB types (`npm run db:types` after changing migrations).

## Database rules
- RLS is on everywhere, with explicit table/column grants for `anon`/`authenticated`. Never select `certifications.answer_key` from the app.
- New RPCs: `security definer`, `set search_path = public`, a role check via `assert_role`, `for update` locks, and errors raised as codes listed in `src/lib/action-result.ts` and `messages/fr.json → errors`. Grant execute explicitly.
- `admin` can never come from signup (the trigger only accepts client/coach).
- Never edit an applied migration; add a new one.
- When an RLS policy references another table, `anon` needs SELECT on that table too (RLS still returns no rows). Otherwise public pages fail with `permission denied`.
- Offers: max 6 active and inclusive-only-with-badge are enforced by trigger. `price_per_session` is derived from offers by trigger, so don't write it when the coach has active offers.
- Requests/proposals: all status changes go through RPCs (`create_request`, `close_request`, `create_proposal`, `withdraw_proposal`, `accept_proposal`). Coaches read requests only through the `request_board` view: never expose `client_id`, last names, e-mail or phone to coaches.
- Free text in requests/proposals is checked with `has_contact_info` (SQL, source of truth) and `hasContactInfo` (TS, same patterns). Keep both in sync; `tests/requests.test.ts` checks parity.
- Colour exception: `src/features/cv/pdf/theme.ts` is the ONLY file allowed hard-coded colours (react-pdf and next/og can't read CSS variables). It mirrors the tokens in `globals.css`, so update both together.
- Public coach URLs use `coach_profiles.slug` (`src/lib/slug.ts` mirrors SQL `slugify`). The middleware 308-redirects `/coaches/<uuid>` to the slug.
- CV items (`athletic_achievements`, `coaching_experiences`, `education`, `external_certifications`) are publicly readable only if the coach is verified and `cv_public`. `verified` is admin-only (RPCs), and a coach's edit resets it (trigger).
- The AI bio (`src/features/profile/ai-bio.ts`) is off unless `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_FEATURE_AI_BIO=true` are both set. It's rate-limited to 5 per coach per day in SQL. Everything must work without it.
- Expiry is computed on read (`expires_at < now()`, see `effectiveRequestStatus`). There's no cron.

## Checks before committing
`npm run lint && npm run typecheck && npm run test && npm run build`. Use Conventional Commits.
