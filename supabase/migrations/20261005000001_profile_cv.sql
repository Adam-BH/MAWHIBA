-- Coach profile builder + CV: richer coach profile, structured palmarès/experience/education/certifications.

create extension if not exists unaccent with schema extensions;

create type public.achievement_level as enum ('local', 'regional', 'national', 'international', 'olympique');
create type public.athlete_status as enum ('actif', 'retraite', 'amateur');

-- ---------- Slugs (mirror of src/lib/slug.ts) ----------
create function public.slugify(p_text text) returns text
language sql stable set search_path = public, extensions as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(unaccent(coalesce(p_text, ''))), '[^a-z0-9]+', '-', 'g')), ''), 'coach')
$$;

create function public.unique_coach_slug(p_name text, p_coach uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_base text := left(public.slugify(p_name), 60);
  v_slug text := v_base;
  v_n int := 1;
begin
  while exists (select 1 from coach_profiles where slug = v_slug and user_id <> p_coach) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;
  return v_slug;
end $$;

-- ---------- coach_profiles ----------
alter table public.coach_profiles
  add column slug text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 70),
  add column tagline text check (char_length(tagline) <= 80),
  add column athlete_status public.athlete_status,
  add column primary_sport text,
  add column highest_level public.achievement_level,
  add column years_practice int check (years_practice between 0 and 80),
  add column years_coaching int check (years_coaching between 0 and 80),
  add column languages text[] not null default '{}',
  add column specialties text[] not null default '{}',
  add column zones text[] not null default '{}',
  add column cover_path text,
  add column video_url text check (video_url ~ '^https://'),
  add column socials jsonb not null default '{}',
  add column cv_public boolean not null default true,
  add column cv_template text not null default 'moderne' check (cv_template in ('moderne', 'classique')),
  add column builder_step int not null default 1 check (builder_step between 1 and 7),
  add column published_at timestamptz;

update public.coach_profiles c
   set slug = public.unique_coach_slug(p.full_name, c.user_id), primary_sport = c.sports[1]
  from public.profiles p where p.id = c.user_id and c.slug is null;

-- New coaches get a slug at signup.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := case when new.raw_user_meta_data ->> 'role' = 'coach' then 'coach' else 'client' end;
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
begin
  insert into profiles (id, role, full_name, email) values (new.id, v_role, v_name, new.email);
  if v_role = 'coach' then
    insert into coach_profiles (user_id, slug) values (new.id, public.unique_coach_slug(v_name, new.id));
  end if;
  return new;
end $$;

-- ---------- Structured CV tables ----------
create table public.athletic_achievements (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  year int not null check (year between 1950 and 2100),
  title text not null check (char_length(title) between 2 and 120),
  competition text not null default '' check (char_length(competition) <= 120),
  level public.achievement_level not null,
  result text not null default '' check (char_length(result) <= 80),
  sport text not null,
  proof_path text,
  verified boolean not null default false,
  sort int not null default 0
);
create index athletic_achievements_coach_idx on public.athletic_achievements (coach_id, sort);

create table public.coaching_experiences (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  role text not null check (char_length(role) between 2 and 80),
  organization text not null check (char_length(organization) between 2 and 120),
  start_date date not null,
  end_date date check (end_date is null or end_date >= start_date),
  description text not null default '' check (char_length(description) <= 500),
  sort int not null default 0
);
create index coaching_experiences_coach_idx on public.coaching_experiences (coach_id, sort);

create table public.external_certifications (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  issuer text not null check (char_length(issuer) between 2 and 120),
  year int not null check (year between 1950 and 2100),
  file_path text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index external_certifications_coach_idx on public.external_certifications (coach_id);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  degree text not null check (char_length(degree) between 2 and 120),
  school text not null check (char_length(school) between 2 and 120),
  year int not null check (year between 1950 and 2100)
);
create index education_coach_idx on public.education (coach_id);

-- Editing a verified item (or its proof) by the coach drops the "Vérifié" mark.
create function public.reset_verified_on_edit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and to_jsonb(new) - 'verified' - 'sort' is distinct from to_jsonb(old) - 'verified' - 'sort' then
    new.verified := false;
  end if;
  return new;
end $$;

create trigger athletic_achievements_reset before update on public.athletic_achievements
  for each row execute function public.reset_verified_on_edit();
create trigger external_certifications_reset before update on public.external_certifications
  for each row execute function public.reset_verified_on_edit();

-- ---------- Public visibility ----------
create function public.coach_cv_visible(p_coach uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_coach = auth.uid() or public.is_admin()
      or exists (select 1 from coach_profiles where user_id = p_coach and verified and cv_public)
$$;

-- ---------- Admin RPCs ----------
create function public.admin_verify_achievement(id uuid, verified boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_role(array['admin']::user_role[]);
  -- Rejecting clears the proof so the coach can upload a new one.
  update athletic_achievements a
     set verified = admin_verify_achievement.verified,
         proof_path = case when admin_verify_achievement.verified then a.proof_path else null end
   where a.id = admin_verify_achievement.id;
  if not found then raise exception 'NOT_FOUND'; end if;
end $$;

create function public.admin_verify_certification(id uuid, verified boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_role(array['admin']::user_role[]);
  update external_certifications c
     set verified = admin_verify_certification.verified,
         file_path = case when admin_verify_certification.verified then c.file_path else null end
   where c.id = admin_verify_certification.id;
  if not found then raise exception 'NOT_FOUND'; end if;
end $$;

-- ---------- AI bio rate limit (5 / coach / day) ----------
create table public.ai_bio_requests (
  id bigint generated always as identity primary key,
  coach_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index ai_bio_requests_coach_idx on public.ai_bio_requests (coach_id, created_at);

create function public.consume_ai_bio_quota() returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
begin
  perform public._lock_wallet(v_uid); -- serialises concurrent requests of the same coach
  if (select count(*) from ai_bio_requests where coach_id = v_uid and created_at > now() - interval '1 day') >= 5 then
    return false;
  end if;
  insert into ai_bio_requests (coach_id) values (v_uid);
  return true;
end $$;

-- ---------- CV stats (verified platform data) ----------
create view public.coach_cv_stats as
  select c.user_id as coach_id,
         (select count(*) from bookings b where b.coach_id = c.user_id and b.status = 'completed')::int as completed_sessions,
         (select count(distinct b.client_id) from bookings b where b.coach_id = c.user_id and b.status = 'completed')::int as distinct_clients,
         c.rating_avg,
         c.rating_count,
         coalesce((select jsonb_agg(jsonb_build_object('slug', ce.slug, 'title', ce.title, 'completed_at', cc.completed_at) order by cc.completed_at)
                     from coach_certifications cc join certifications ce on ce.id = cc.certification_id
                    where cc.coach_id = c.user_id and cc.passed), '[]'::jsonb) as badges,
         p.created_at as member_since
    from coach_profiles c join profiles p on p.id = c.user_id
   where c.verified or c.user_id = auth.uid() or public.is_admin();

-- ---------- RLS & privileges ----------
alter table public.athletic_achievements enable row level security;
alter table public.coaching_experiences enable row level security;
alter table public.external_certifications enable row level security;
alter table public.education enable row level security;
alter table public.ai_bio_requests enable row level security;

revoke all on public.athletic_achievements, public.coaching_experiences, public.external_certifications,
  public.education, public.ai_bio_requests, public.coach_cv_stats from anon, authenticated;

grant update (slug, tagline, athlete_status, primary_sport, highest_level, years_practice, years_coaching,
              languages, specialties, zones, cover_path, video_url, socials, cv_public, cv_template, builder_step, published_at)
  on public.coach_profiles to authenticated;

grant select on public.athletic_achievements, public.coaching_experiences, public.external_certifications, public.education
  to anon, authenticated;
grant insert (coach_id, year, title, competition, level, result, sport, proof_path, sort),
      update (year, title, competition, level, result, sport, proof_path, sort), delete
  on public.athletic_achievements to authenticated;
grant insert (coach_id, role, organization, start_date, end_date, description, sort),
      update (role, organization, start_date, end_date, description, sort), delete
  on public.coaching_experiences to authenticated;
grant insert (coach_id, title, issuer, year, file_path), update (title, issuer, year, file_path), delete
  on public.external_certifications to authenticated;
grant insert (coach_id, degree, school, year), update (degree, school, year), delete on public.education to authenticated;
grant select on public.coach_cv_stats to anon, authenticated;

create policy athletic_achievements_select on public.athletic_achievements for select using (public.coach_cv_visible(coach_id));
create policy athletic_achievements_write on public.athletic_achievements for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.auth_role() = 'coach');
create policy coaching_experiences_select on public.coaching_experiences for select using (public.coach_cv_visible(coach_id));
create policy coaching_experiences_write on public.coaching_experiences for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.auth_role() = 'coach');
create policy external_certifications_select on public.external_certifications for select using (public.coach_cv_visible(coach_id));
create policy external_certifications_write on public.external_certifications for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.auth_role() = 'coach');
create policy education_select on public.education for select using (public.coach_cv_visible(coach_id));
create policy education_write on public.education for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.auth_role() = 'coach');

-- ---------- Storage: public covers ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('covers', 'covers', true, 4194304, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy covers_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Execute privileges ----------
revoke execute on function
  public.slugify(text), public.unique_coach_slug(text, uuid), public.reset_verified_on_edit(),
  public.coach_cv_visible(uuid), public.admin_verify_achievement(uuid, boolean),
  public.admin_verify_certification(uuid, boolean), public.consume_ai_bio_quota()
  from public, anon, authenticated;
grant execute on function public.coach_cv_visible(uuid) to anon, authenticated;
grant execute on function
  public.admin_verify_achievement(uuid, boolean), public.admin_verify_certification(uuid, boolean),
  public.consume_ai_bio_quota()
  to authenticated;
