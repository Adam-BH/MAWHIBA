-- Client onboarding answers, used for matching. Private: owner + admin, never coaches.
-- The point is already rounded to 2 decimals (~1 km) by the app; clients never store a precise location.

create table public.client_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  sports text[] not null default '{}' check (cardinality(sports) <= 3),
  audience public.request_audience,
  child_age int check (child_age between 1 and 17),
  level public.skill_level,
  goals text[] not null default '{}' check (cardinality(goals) <= 4),
  languages text[] not null default '{}',
  availability text[] not null default '{}',
  budget_max int check (budget_max between 5 and 1000),
  inclusive_needs boolean not null default false,
  city text,
  lat double precision check (lat between 30 and 38 and lat = round(lat::numeric, 2)),
  lng double precision check (lng between 7 and 12 and lng = round(lng::numeric, 2)),
  onboarded_at timestamptz, -- set on finish or skip
  updated_at timestamptz not null default now(),
  check ((lat is null) = (lng is null)),
  check (child_age is null or audience = 'enfant')
);

create trigger client_preferences_touch before update on public.client_preferences
  for each row execute function public.touch_updated_at();

alter table public.client_preferences enable row level security;
revoke all on public.client_preferences from anon, authenticated;
grant select,
      insert (user_id, sports, audience, child_age, level, goals, languages, availability, budget_max, inclusive_needs, city, lat, lng, onboarded_at),
      update (user_id, sports, audience, child_age, level, goals, languages, availability, budget_max, inclusive_needs, city, lat, lng, onboarded_at)
  on public.client_preferences to authenticated;

create policy client_preferences_select on public.client_preferences for select
  using (user_id = auth.uid() or public.is_admin());
create policy client_preferences_insert_own on public.client_preferences for insert
  with check (user_id = auth.uid() and public.auth_role() = 'client');
-- update(user_id) is for upserts; the policy pins it to the caller.
create policy client_preferences_update_own on public.client_preferences for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
