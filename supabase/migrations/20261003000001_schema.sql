-- MAWHIBA schema: enums, tables, indexes.

create type public.user_role as enum ('client', 'coach', 'admin');
create type public.booking_status as enum ('pending', 'confirmed', 'declined', 'cancelled', 'completed');
create type public.tx_type as enum (
  'topup', 'booking_hold', 'booking_refund', 'coach_payout',
  'commission', 'insurance', 'withdrawal', 'admin_credit'
);
create type public.withdrawal_status as enum ('pending', 'paid', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text not null default '',
  email text,
  phone text,
  city text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.coach_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  sports text[] not null default '{}',
  headline text,
  bio text,
  achievements text,
  price_per_session int not null default 40 check (price_per_session between 5 and 1000),
  session_duration_min int not null default 60 check (session_duration_min between 15 and 240),
  verified boolean not null default false,
  proof_path text,
  rating_avg numeric(3, 2) not null default 0,
  rating_count int not null default 0
);
create index coach_profiles_verified_idx on public.coach_profiles (verified);

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null,
  is_booked boolean not null default false,
  check (ends_at > starts_at)
);
create index slots_coach_starts_idx on public.slots (coach_id, starts_at);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete restrict,
  coach_id uuid not null references public.profiles (id),
  client_id uuid not null references public.profiles (id),
  price int not null check (price > 0),
  insurance_fee int not null check (insurance_fee >= 0),
  status public.booking_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- One live booking per slot; declined/cancelled bookings free the slot for re-booking.
create unique index bookings_slot_live_uidx on public.bookings (slot_id)
  where status in ('pending', 'confirmed', 'completed');
create index bookings_client_idx on public.bookings (client_id);
create index bookings_coach_idx on public.bookings (coach_id);

create table public.wallet_tx (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id),
  system_account text check (system_account in ('PLATFORM', 'STAR_INSURANCE')),
  amount int not null check (amount <> 0),
  type public.tx_type not null,
  booking_id uuid references public.bookings (id),
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  check ((owner_id is null) <> (system_account is null))
);
create index wallet_tx_owner_idx on public.wallet_tx (owner_id, created_at desc);

create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id),
  amount int not null check (amount > 0),
  status public.withdrawal_status not null default 'pending',
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id),
  coach_id uuid not null references public.profiles (id),
  client_id uuid not null references public.profiles (id),
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);
create index reviews_coach_idx on public.reviews (coach_id, created_at desc);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  lessons jsonb not null default '[]',
  -- quiz: [{ question, options[] }] — no answers here.
  quiz jsonb not null default '[]',
  -- correct option index per question; hidden from API roles by column privileges.
  answer_key int[] not null default '{}',
  pass_score int not null
);

create table public.coach_certifications (
  coach_id uuid not null references public.profiles (id) on delete cascade,
  certification_id uuid not null references public.certifications (id) on delete cascade,
  score int not null,
  passed boolean not null,
  completed_at timestamptz not null default now(),
  primary key (coach_id, certification_id)
);
