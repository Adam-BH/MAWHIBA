-- Coach training location. The exact pin is private (owner + admin) in `coach_locations`;
-- the public only sees `coach_profiles.map_lat/map_lng`, rounded to 2 decimals (~1 km) by trigger.
-- Editing the location is not a verified claim: it never resets `verified`.

alter table public.coach_profiles
  add column base_label text check (char_length(base_label) <= 80),
  add column service_radius_km int not null default 10 check (service_radius_km between 1 and 100),
  add column map_lat double precision,
  add column map_lng double precision;

create table public.coach_locations (
  coach_id uuid primary key references public.coach_profiles (user_id) on delete cascade,
  lat double precision not null check (lat between 30 and 38), -- Tunisia bounding box
  lng double precision not null check (lng between 7 and 12)
);

create function public.sync_coach_map_point() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update coach_profiles set map_lat = null, map_lng = null where user_id = old.coach_id;
  else
    update coach_profiles set map_lat = round(new.lat::numeric, 2)::float8, map_lng = round(new.lng::numeric, 2)::float8
     where user_id = new.coach_id;
  end if;
  return null;
end $$;

create trigger coach_locations_sync after insert or update or delete on public.coach_locations
  for each row execute function public.sync_coach_map_point();

-- Great-circle distance (haversine, R = 6371 km). Mirror of src/lib/geo.ts `distanceKm`.
create function public.distance_km(lat1 float8, lng1 float8, lat2 float8, lng2 float8) returns float8
language sql immutable as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ))
$$;

-- ---------- RLS & privileges ----------
alter table public.coach_locations enable row level security;
revoke all on public.coach_locations from anon, authenticated;
-- update(coach_id): PostgREST upserts set the key too; the policy pins it to the caller.
grant select, insert (coach_id, lat, lng), update (coach_id, lat, lng), delete on public.coach_locations to authenticated;

create policy coach_locations_select on public.coach_locations for select
  using (coach_id = auth.uid() or public.is_admin());
create policy coach_locations_write on public.coach_locations for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.auth_role() = 'coach');

-- map_lat/map_lng are written by the trigger only.
grant update (base_label, service_radius_km) on public.coach_profiles to authenticated;

revoke execute on function public.sync_coach_map_point(), public.distance_km(float8, float8, float8, float8)
  from public, anon, authenticated;
grant execute on function public.distance_km(float8, float8, float8, float8) to anon, authenticated;
