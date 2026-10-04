-- Explainable matching: feature similarity scores out of 100, computed here only (weights live in SQL).
-- Each RPC returns reason codes; the app maps them to labels (src/lib/config.ts MATCH_REASONS).
-- Distances use public points only (map_lat/map_lng, ~1 km, or the city centroid), never exact pins.

-- ---------- Helpers ----------
-- Mirror of src/lib/config.ts CITY_COORDS (parity test in tests/matching.test.ts).
create function public.city_point(p_city text, out lat float8, out lng float8)
language sql immutable as $$
  select v.lat, v.lng from (values
    ('Tunis', 36.8065, 10.1815), ('Ariana', 36.8665, 10.1647), ('Ben Arous', 36.7531, 10.2189),
    ('La Marsa', 36.8782, 10.3247), ('Sousse', 35.8256, 10.636), ('Sfax', 34.7406, 10.7603),
    ('Monastir', 35.7643, 10.8113), ('Nabeul', 36.4561, 10.7376), ('Bizerte', 37.2744, 9.8739)
  ) as v (city, lat, lng) where v.city = p_city
$$;

create function public.jaccard(a text[], b text[]) returns float8
language sql immutable as $$
  select case when coalesce(cardinality(a), 0) = 0 or coalesce(cardinality(b), 0) = 0 then 0
    else (select count(*) from (select unnest(a) intersect select unnest(b)) i)::float8
       / (select count(*) from (select unnest(a) union select unnest(b)) u) end
$$;

-- What a client is looking for, in coach specialty terms.
create function public.goal_specialties(p_goals text[], p_audience request_audience, p_child_age int, p_inclusive boolean)
returns text[] language sql immutable as $$
  select coalesce(array_agg(distinct s), '{}') from (
    select unnest(case g
      when 'Apprendre' then array['Débutants']
      when 'Progresser' then array['Préparation physique']
      when 'Compétition' then array['Compétition']
      when 'Forme & santé' then array['Préparation physique', 'Seniors']
      when 'Perte de poids' then array['Perte de poids', 'Préparation physique']
      when 'Confiance en soi' then array['Débutants']
    end) from unnest(coalesce(p_goals, '{}')) g
    union all select 'Enfants' where p_audience = 'enfant' and coalesce(p_child_age, 0) < 12
    union all select 'Adolescents' where p_audience = 'enfant' and p_child_age >= 12
    union all select 'Inclusif' where p_inclusive
  ) t (s) where s is not null
$$;

-- Bayesian rating (prior: 3 reviews at 4/5) scaled to 0-6, plus completed sessions up to 2.
create function public.quality_points(p_rating numeric, p_count int, p_sessions bigint) returns float8
language sql immutable as $$
  select 6 * least(1, greatest(0, ((p_rating * p_count + 12) / (p_count + 3) - 3) / 2))::float8
       + 2 * least(1, p_sessions / 20.0)
$$;

-- Reason codes, in display priority. Mirror of MATCH_REASONS (parity test).
create function public.match_reason_codes() returns text[]
language sql immutable as $$
  select array['sport', 'inclusive', 'nearby', 'kids', 'goals', 'in_budget', 'level', 'language', 'top_rated']
$$;

-- Top 3 reasons: best share of their weight first, ties broken by display priority.
create function public._top_reasons(p_codes text[], p_ratios float8[]) returns text[]
language sql immutable as $$
  select coalesce((array_agg(c order by r desc, array_position(public.match_reason_codes(), c)))[1:3], '{}')
    from unnest(p_codes, p_ratios) as x (c, r) where r > 0
$$;

-- Public facts about verified coaches, shared by the three RPCs.
create view public._coach_features with (security_barrier) as
  select cp.user_id, cp.sports, cp.primary_sport, cp.specialties, cp.languages, cp.zones, cp.price_per_session,
         cp.highest_level, cp.rating_avg, cp.rating_count, pr.city,
         coalesce(cp.map_lat, (public.city_point(pr.city)).lat) as lat,
         coalesce(cp.map_lng, (public.city_point(pr.city)).lng) as lng,
         public.has_inclusive_badge(cp.user_id) as inclusive,
         (select count(*) from bookings b where b.coach_id = cp.user_id and b.status = 'completed') as sessions
    from coach_profiles cp join profiles pr on pr.id = cp.user_id
   where cp.verified;
revoke all on public._coach_features from anon, authenticated;

-- ---------- Client → coaches ----------
create function public.match_coaches(p_limit int default 12, p_sport text default null)
returns table (coach_id uuid, score int, distance_km float8, reasons text[])
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_p client_preferences;
  v_city text;
  v_lat float8;
  v_lng float8;
  v_wanted text[];
begin
  select * into v_p from client_preferences where user_id = v_uid;
  v_city := coalesce(v_p.city, (select city from profiles where id = v_uid));
  v_lat := coalesce(v_p.lat, (public.city_point(v_city)).lat);
  v_lng := coalesce(v_p.lng, (public.city_point(v_city)).lng);
  v_wanted := public.goal_specialties(v_p.goals, v_p.audience, v_p.child_age, coalesce(v_p.inclusive_needs, false));

  return query
  with c as (
    select f.*, case when v_lat is null or f.lat is null then null else public.distance_km(v_lat, v_lng, f.lat, f.lng) end as dist
      from _coach_features f
     where case when p_sport is not null then p_sport = any (f.sports)
                when coalesce(cardinality(v_p.sports), 0) > 0 then f.sports && v_p.sports
                else true end
       and (not coalesce(v_p.inclusive_needs, false) or f.inclusive)
  ), s as (
    -- [points, max] per signal, in match_reason_codes() order.
    select c.user_id, c.dist, array[
      case when (p_sport is not null and p_sport = any (c.sports)) or c.sports && coalesce(v_p.sports, '{}') then 30 else 0 end,
      case when coalesce(v_p.inclusive_needs, false) and c.inclusive then 10 else 0 end,
      case when v_city = any (c.zones) then 15 when c.dist is null then 0 else 15 * exp(-c.dist / 8) end,
      case when v_p.audience = 'enfant' and c.specialties && array['Enfants', 'Adolescents'] then 15 * public.jaccard(v_wanted, c.specialties) else 0 end,
      case when v_p.audience = 'enfant' and c.specialties && array['Enfants', 'Adolescents'] then 0 else 15 * public.jaccard(v_wanted, c.specialties) end,
      case when v_p.budget_max is null then 0
           when c.price_per_session <= v_p.budget_max then 12
           else greatest(0, 12 * (1 - (c.price_per_session - v_p.budget_max) / (0.5 * v_p.budget_max))) end,
      case when 'Compétition' = any (coalesce(v_p.goals, '{}')) and c.highest_level in ('national', 'international', 'olympique') then 5 else 0 end,
      case when coalesce(cardinality(v_p.languages), 0) = 0 then 0
           else 5.0 * cardinality(array(select unnest(v_p.languages) intersect select unnest(c.languages))) / cardinality(v_p.languages) end,
      public.quality_points(c.rating_avg, c.rating_count, c.sessions)
    ]::float8[] as pts, array[30, 10, 15, 15, 15, 12, 5, 5, 8]::float8[] as maxes
      from c
  )
  select s.user_id, round((select sum(x) from unnest(s.pts) x))::int, s.dist,
         public._top_reasons(
           public.match_reason_codes(),
           -- A reason is only shown when it is clearly true: within ~10 km, fully in budget, rated ≥ 4.5.
           array(select case when (c = 'nearby' and p < 4) or (c = 'in_budget' and p < 12) or (c = 'top_rated' and p < 5) then 0 else p / m end
                   from unnest(public.match_reason_codes(), s.pts, s.maxes) as x (c, p, m)))
    from s
   order by 2 desc, s.dist nulls last
   limit least(greatest(p_limit, 1), 60);
end $$;

-- ---------- Coach → similar coaches (public fields only) ----------
create function public.similar_coaches(p_coach uuid, p_limit int default 4)
returns table (coach_id uuid, score int)
language sql stable security definer set search_path = public as $$
  select o.user_id, round(
           case when o.primary_sport = me.primary_sport then 40 else 40 * public.jaccard(o.sports, me.sports) end
         + 25 * public.jaccard(o.specialties, me.specialties)
         + 15 * (1 - abs(o.price_per_session - me.price_per_session)::float8 / greatest(o.price_per_session, me.price_per_session))
         + case when o.lat is null or me.lat is null then 0 else 20 * exp(-public.distance_km(o.lat, o.lng, me.lat, me.lng) / 15) end
         )::int as score
    from _coach_features me join _coach_features o on o.user_id <> me.user_id and o.sports && me.sports
   where me.user_id = p_coach
   order by score desc
   limit least(greatest(p_limit, 1), 12)
$$;

-- ---------- Coach → open requests (board rows only: never the client's identity) ----------
create function public.match_requests_for_coach(p_limit int default 20)
returns table (request_id uuid, score int, reasons text[])
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
  v_c _coach_features;
begin
  select * into v_c from _coach_features where user_id = v_uid;
  if not found then return; end if; -- unverified: same empty board as request_board

  return query
  with r as (
    select b.id, b.sport, b.city, b.budget_min, b.budget_max, b.special_needs,
           public.distance_km(v_c.lat, v_c.lng, (public.city_point(b.city)).lat, (public.city_point(b.city)).lng) as dist
      from request_board b where b.status = 'open'
  ), s as (
    -- [points, max] per signal: sport, inclusive, nearby, in_budget.
    select r.id, array[
      case when r.sport = any (v_c.sports) then 40 else 0 end,
      case when r.special_needs and v_c.inclusive then 15 else 0 end,
      case when r.city = any (v_c.zones) then 25 when r.dist is null then 0 else 25 * exp(-r.dist / 10) end,
      case when v_c.price_per_session <= r.budget_max then 20
           else greatest(0, 20 * (1 - (v_c.price_per_session - r.budget_max) / (0.5 * r.budget_max))) end
    ]::float8[] as pts
      from r
  )
  select s.id, round((select sum(x) from unnest(s.pts) x))::int,
         public._top_reasons(array['sport', 'inclusive', 'nearby', 'in_budget'],
           array[s.pts[1] / 40, s.pts[2] / 15, case when s.pts[3] < 8 then 0 else s.pts[3] / 25 end, case when s.pts[4] < 20 then 0 else 1 end])
    from s
   order by 2 desc
   limit least(greatest(p_limit, 1), 100);
end $$;

-- ---------- Execute privileges ----------
revoke execute on function
  public.city_point(text), public.jaccard(text[], text[]), public.goal_specialties(text[], request_audience, int, boolean),
  public.quality_points(numeric, int, bigint), public.match_reason_codes(), public._top_reasons(text[], float8[]),
  public.match_coaches(int, text), public.similar_coaches(uuid, int), public.match_requests_for_coach(int)
  from public, anon, authenticated;
grant execute on function public.city_point(text), public.match_reason_codes(), public.similar_coaches(uuid, int) to anon, authenticated;
grant execute on function public.match_coaches(int, text), public.match_requests_for_coach(int) to authenticated;
