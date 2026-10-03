-- Coach offers + client requests with coach proposals.

create type public.offer_audience as enum ('enfants', 'adultes', 'tous');
create type public.request_status as enum ('open', 'fulfilled', 'closed', 'expired');
create type public.proposal_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.request_audience as enum ('enfant', 'adulte');
create type public.skill_level as enum ('debutant', 'intermediaire', 'avance');

-- ---------- Tables ----------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  sport text not null,
  description text not null default '' check (char_length(description) <= 500),
  duration_min int not null check (duration_min between 15 and 240),
  price int not null check (price > 0 and price <= 1000),
  audience public.offer_audience not null default 'tous',
  is_inclusive boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_coach_idx on public.offers (coach_id) where is_active;

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  sport text not null,
  city text not null,
  title text not null check (char_length(title) between 5 and 100),
  description text not null check (char_length(description) between 10 and 1000),
  audience public.request_audience not null,
  child_age int check (child_age between 1 and 17),
  level public.skill_level not null,
  special_needs boolean not null default false,
  special_needs_note text check (char_length(special_needs_note) <= 200),
  schedule_note text not null default '' check (char_length(schedule_note) <= 200),
  budget_min int not null,
  budget_max int not null,
  status public.request_status not null default 'open',
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min > 0 and budget_min <= budget_max),
  check ((audience = 'enfant') = (child_age is not null))
);
create index requests_open_idx on public.requests (sport, city, created_at desc) where status = 'open';
create index requests_client_idx on public.requests (client_id);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  coach_id uuid not null references public.coach_profiles (user_id) on delete cascade,
  slot_id uuid not null references public.slots (id),
  price int not null check (price > 0 and price <= 1000),
  message text not null default '' check (char_length(message) <= 600),
  status public.proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index proposals_one_active_uidx on public.proposals (request_id, coach_id)
  where status in ('pending', 'accepted');
create index proposals_coach_idx on public.proposals (coach_id);

alter table public.bookings
  add column offer_id uuid references public.offers (id),
  add column request_id uuid references public.requests (id),
  add column proposal_id uuid references public.proposals (id);

-- ---------- Helpers ----------
create function public.is_verified_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from coach_profiles where user_id = auth.uid() and verified)
$$;

-- Mirror of src/lib/contact-info.ts: Tunisian/intl phone numbers and e-mails.
create function public.has_contact_info(p_text text) returns boolean
language sql immutable as $$
  select coalesce(p_text, '') ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}'
      or coalesce(p_text, '') ~ '(?:^|[^0-9])(?:\+?216[\s.-]?)?[0-9]{2}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}(?:$|[^0-9])'
      or coalesce(p_text, '') ~ '(?:^|[^0-9])[0-9]{2}(?:[\s.][0-9]{2}){3}(?:$|[^0-9])'
      or coalesce(p_text, '') ~ '[0-9]{8,}'
$$;

create function public.has_inclusive_badge(p_coach uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from coach_certifications cc join certifications c on c.id = cc.certification_id
    where cc.coach_id = p_coach and cc.passed and c.slug = 'coaching-inclusif-autisme'
  )
$$;

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger offers_touch before update on public.offers for each row execute function public.touch_updated_at();
create trigger requests_touch before update on public.requests for each row execute function public.touch_updated_at();
create trigger proposals_touch before update on public.proposals for each row execute function public.touch_updated_at();

-- ---------- Offer rules ----------
create function public.check_offer_rules() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_active and (
    select count(*) from offers where coach_id = new.coach_id and is_active and id <> new.id
  ) >= 6 then
    raise exception 'MAX_OFFERS';
  end if;
  if new.is_inclusive and not public.has_inclusive_badge(new.coach_id) then
    raise exception 'INCLUSIVE_BADGE_REQUIRED';
  end if;
  return new;
end $$;

create trigger offers_rules before insert or update on public.offers
  for each row execute function public.check_offer_rules();

-- "À partir de" price = cheapest active offer; unchanged when the coach has none.
create function public.sync_coach_price() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_coach uuid := coalesce(new.coach_id, old.coach_id);
begin
  update coach_profiles
     set price_per_session = coalesce(
       (select min(price) from offers where coach_id = v_coach and is_active), price_per_session)
   where user_id = v_coach;
  return null;
end $$;

create trigger offers_sync_price after insert or update or delete on public.offers
  for each row execute function public.sync_coach_price();

-- ---------- book_slot with offers ----------
drop function public.book_slot(uuid, text);

-- With an offer: price = offer price. Without: legacy price, only for coaches with no active offer.
create function public.book_slot(slot_id uuid, note text default null, offer_id uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_slot slots;
  v_price int;
  v_fee int := public.insurance_fee();
  v_id uuid;
begin
  select * into v_slot from slots s where s.id = book_slot.slot_id for update;
  if not found then raise exception 'SLOT_NOT_FOUND'; end if;
  if v_slot.is_booked or v_slot.starts_at <= now() then raise exception 'SLOT_UNAVAILABLE'; end if;
  if not exists (select 1 from coach_profiles where user_id = v_slot.coach_id and verified) then
    raise exception 'COACH_NOT_VERIFIED';
  end if;

  if book_slot.offer_id is not null then
    select o.price into v_price from offers o
     where o.id = book_slot.offer_id and o.coach_id = v_slot.coach_id and o.is_active;
    if v_price is null then raise exception 'OFFER_UNAVAILABLE'; end if;
  elsif exists (select 1 from offers o where o.coach_id = v_slot.coach_id and o.is_active) then
    raise exception 'OFFER_REQUIRED';
  else
    select price_per_session into v_price from coach_profiles where user_id = v_slot.coach_id;
  end if;

  perform public._lock_wallet(v_uid);
  if public._balance(v_uid) < v_price + v_fee then raise exception 'INSUFFICIENT_FUNDS'; end if;

  insert into bookings (slot_id, coach_id, client_id, price, insurance_fee, note, offer_id)
  values (v_slot.id, v_slot.coach_id, v_uid, v_price, v_fee, nullif(trim(book_slot.note), ''), book_slot.offer_id)
  returning id into v_id;
  update slots set is_booked = true where id = v_slot.id;
  insert into wallet_tx (owner_id, amount, type, booking_id)
  values (v_uid, -(v_price + v_fee), 'booking_hold', v_id);
  return v_id;
end $$;

-- ---------- Requests ----------
create function public.create_request(
  sport text, city text, title text, description text, audience request_audience, child_age int,
  level skill_level, special_needs boolean, special_needs_note text, schedule_note text,
  budget_min int, budget_max int
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_id uuid;
begin
  perform public._lock_wallet(v_uid); -- serialises the open-requests count
  if (select count(*) from requests r where r.client_id = v_uid and r.status = 'open' and r.expires_at > now()) >= 3 then
    raise exception 'MAX_OPEN_REQUESTS';
  end if;
  if public.has_contact_info(title) or public.has_contact_info(description)
     or public.has_contact_info(special_needs_note) or public.has_contact_info(schedule_note) then
    raise exception 'CONTACT_INFO';
  end if;

  insert into requests (client_id, sport, city, title, description, audience, child_age, level,
                        special_needs, special_needs_note, schedule_note, budget_min, budget_max)
  values (v_uid, create_request.sport, create_request.city, trim(create_request.title), trim(create_request.description),
          create_request.audience,
          case when create_request.audience = 'enfant' then create_request.child_age end,
          create_request.level, create_request.special_needs,
          case when create_request.special_needs then nullif(trim(create_request.special_needs_note), '') end,
          coalesce(trim(create_request.schedule_note), ''), create_request.budget_min, create_request.budget_max)
  returning id into v_id;
  return v_id;
end $$;

create function public.close_request(request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client', 'admin']::user_role[]);
  v_r requests;
begin
  select * into v_r from requests r where r.id = close_request.request_id for update;
  if not found or (v_r.client_id <> v_uid and not public.is_admin()) then raise exception 'NOT_FOUND'; end if;
  if v_r.status <> 'open' then raise exception 'INVALID_TRANSITION'; end if;
  update requests set status = 'closed' where id = v_r.id;
  update proposals p set status = 'rejected' where p.request_id = v_r.id and p.status = 'pending';
end $$;

-- ---------- Proposals ----------
create function public.create_proposal(request_id uuid, slot_id uuid, price int, message text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
  v_r requests;
  v_slot slots;
  v_id uuid;
begin
  if not public.is_verified_coach() then raise exception 'COACH_NOT_VERIFIED'; end if;
  if price is null or price <= 0 or price > 1000 then raise exception 'INVALID_AMOUNT'; end if;
  if public.has_contact_info(message) then raise exception 'CONTACT_INFO'; end if;

  select * into v_r from requests r where r.id = create_proposal.request_id for update;
  if not found or v_r.status <> 'open' or v_r.expires_at <= now() then raise exception 'REQUEST_CLOSED'; end if;
  if not exists (select 1 from coach_profiles where user_id = v_uid and v_r.sport = any (sports)) then
    raise exception 'SPORT_MISMATCH';
  end if;
  if exists (select 1 from proposals p where p.request_id = v_r.id and p.coach_id = v_uid and p.status in ('pending', 'accepted')) then
    raise exception 'ALREADY_PROPOSED';
  end if;

  select * into v_slot from slots s where s.id = create_proposal.slot_id;
  if not found or v_slot.coach_id <> v_uid or v_slot.is_booked or v_slot.starts_at <= now() then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into proposals (request_id, coach_id, slot_id, price, message)
  values (v_r.id, v_uid, v_slot.id, create_proposal.price, coalesce(trim(create_proposal.message), ''))
  returning id into v_id;
  return v_id;
end $$;

create function public.withdraw_proposal(proposal_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
begin
  update proposals p set status = 'withdrawn'
   where p.id = withdraw_proposal.proposal_id and p.coach_id = v_uid and p.status = 'pending';
  if not found then raise exception 'INVALID_TRANSITION'; end if;
end $$;

create function public.accept_proposal(proposal_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_p proposals;
  v_r requests;
  v_slot slots;
  v_fee int := public.insurance_fee();
  v_id uuid;
begin
  select * into v_p from proposals p where p.id = accept_proposal.proposal_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into v_r from requests r where r.id = v_p.request_id for update;
  if v_r.client_id <> v_uid then raise exception 'NOT_FOUND'; end if;
  if v_p.status <> 'pending' or v_r.status <> 'open' or v_r.expires_at <= now() then
    raise exception 'INVALID_TRANSITION';
  end if;
  if not exists (select 1 from coach_profiles where user_id = v_p.coach_id and verified) then
    raise exception 'COACH_NOT_VERIFIED';
  end if;

  select * into v_slot from slots s where s.id = v_p.slot_id for update;
  if v_slot.is_booked or v_slot.starts_at <= now() then raise exception 'SLOT_UNAVAILABLE'; end if;

  perform public._lock_wallet(v_uid);
  if public._balance(v_uid) < v_p.price + v_fee then raise exception 'INSUFFICIENT_FUNDS'; end if;

  insert into bookings (slot_id, coach_id, client_id, price, insurance_fee, status, note, request_id, proposal_id)
  values (v_slot.id, v_p.coach_id, v_uid, v_p.price, v_fee, 'confirmed', v_r.title, v_r.id, v_p.id)
  returning id into v_id;
  update slots set is_booked = true where id = v_slot.id;
  insert into wallet_tx (owner_id, amount, type, booking_id)
  values (v_uid, -(v_p.price + v_fee), 'booking_hold', v_id);

  update proposals set status = 'accepted' where id = v_p.id;
  update proposals p set status = 'rejected' where p.request_id = v_r.id and p.id <> v_p.id and p.status = 'pending';
  update requests set status = 'fulfilled' where id = v_r.id;
  return v_id;
end $$;

-- ---------- Metrics ----------
create or replace function public.admin_metrics() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_total int := (select count(*) from requests);
begin
  perform public.assert_role(array['admin']::user_role[]);
  return jsonb_build_object(
    'coaches_verified', (select count(*) from coach_profiles where verified),
    'coaches_pending', (select count(*) from coach_profiles where not verified and proof_path is not null),
    'coaches_total', (select count(*) from coach_profiles),
    'clients', (select count(*) from profiles where role = 'client'),
    'bookings_by_status', (select coalesce(jsonb_object_agg(status, n), '{}') from
                            (select status, count(*) n from bookings group by status) s),
    'gmv', (select coalesce(sum(price), 0) from bookings where status = 'completed'),
    'commission', (select coalesce(sum(amount), 0) from wallet_tx where system_account = 'PLATFORM'),
    'insurance', (select coalesce(sum(amount), 0) from wallet_tx where system_account = 'STAR_INSURANCE'),
    'pending_withdrawals_count', (select count(*) from withdrawals where status = 'pending'),
    'pending_withdrawals_amount', (select coalesce(sum(amount), 0) from withdrawals where status = 'pending'),
    'active_offers', (select count(*) from offers o join coach_profiles c on c.user_id = o.coach_id where o.is_active and c.verified),
    'open_requests', (select count(*) from requests where status = 'open' and expires_at > now()),
    'proposals_total', (select count(*) from proposals),
    'request_conversion_pct', case when v_total = 0 then 0
      else round(100.0 * (select count(*) from requests where status = 'fulfilled') / v_total)::int end
  );
end $$;

-- ---------- Request board (safe columns only) ----------
-- Owner-privileged view: verified coaches see open requests (and those they proposed to),
-- with the client's first name and city only.
create view public.request_board as
  select r.id, r.sport, r.city, r.title, r.description, r.audience, r.child_age, r.level,
         r.special_needs, r.special_needs_note, r.schedule_note, r.budget_min, r.budget_max,
         case when r.status = 'open' and r.expires_at <= now() then 'expired'::request_status else r.status end as status,
         r.expires_at, r.created_at,
         split_part(trim(p.full_name), ' ', 1) as client_first_name,
         (select count(*) from proposals pr where pr.request_id = r.id and pr.status in ('pending', 'accepted'))::int as proposals_count
    from requests r
    join profiles p on p.id = r.client_id
   where (public.is_verified_coach() or public.is_admin())
     and ((r.status = 'open' and r.expires_at > now())
          or exists (select 1 from proposals pr where pr.request_id = r.id and pr.coach_id = auth.uid()));

-- ---------- RLS & privileges ----------
alter table public.offers enable row level security;
alter table public.requests enable row level security;
alter table public.proposals enable row level security;

revoke all on public.offers, public.requests, public.proposals, public.request_board from anon, authenticated;

grant select on public.offers to anon, authenticated;
grant insert (coach_id, title, sport, description, duration_min, price, audience, is_inclusive, is_active),
      update (title, sport, description, duration_min, price, audience, is_inclusive, is_active),
      delete on public.offers to authenticated;
create policy offers_select on public.offers for select using (
  coach_id = auth.uid() or public.is_admin()
  or (is_active and exists (select 1 from public.coach_profiles c where c.user_id = offers.coach_id and c.verified))
);
create policy offers_insert_own on public.offers for insert
  with check (coach_id = auth.uid() and public.auth_role() = 'coach');
create policy offers_update_own on public.offers for update
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy offers_delete_own on public.offers for delete using (coach_id = auth.uid());

grant select on public.requests to authenticated;
create policy requests_select on public.requests for select using (client_id = auth.uid() or public.is_admin());

grant select on public.proposals to authenticated;
create policy proposals_select on public.proposals for select using (
  coach_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.requests r where r.id = proposals.request_id and r.client_id = auth.uid())
);

grant select on public.request_board to authenticated;

revoke execute on function
  public.is_verified_coach(), public.has_inclusive_badge(uuid), public.touch_updated_at(),
  public.check_offer_rules(), public.sync_coach_price(), public.book_slot(uuid, text, uuid),
  public.create_request(text, text, text, text, request_audience, int, skill_level, boolean, text, text, int, int),
  public.close_request(uuid), public.create_proposal(uuid, uuid, int, text),
  public.withdraw_proposal(uuid), public.accept_proposal(uuid), public.has_contact_info(text)
  from public, anon, authenticated;
grant execute on function public.has_contact_info(text) to anon, authenticated;
grant execute on function
  public.is_verified_coach(), public.book_slot(uuid, text, uuid),
  public.create_request(text, text, text, text, request_audience, int, skill_level, boolean, text, text, int, int),
  public.close_request(uuid), public.create_proposal(uuid, uuid, int, text),
  public.withdraw_proposal(uuid), public.accept_proposal(uuid)
  to authenticated;
