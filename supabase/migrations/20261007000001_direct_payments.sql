-- Points wallet → direct payment per session (Konnect; mocked until the real gateway is wired).
-- A checkout creates a `payments` row that holds the slot for 15 minutes. The booking only exists once
-- the gateway confirms the payment (`confirm_payment`, service role only = the webhook).
-- Declines and cancellations mark the payment refunded. Coach earnings are derived from completed bookings.

-- ---------- Remove the wallet ----------
drop function public.topup_wallet(text);
drop function public.request_withdrawal(int);
drop function public.wallet_balance(uuid);
drop function public.admin_credit(uuid, int, text);
drop function public.admin_process_withdrawal(uuid, boolean);
drop function public.book_slot(uuid, text, uuid);
drop function public.accept_proposal(uuid);
drop function public._balance(uuid);
drop table public.wallet_tx;
drop table public.withdrawals;
drop type public.tx_type;
drop type public.withdrawal_status;
-- `_lock_wallet` stays: it only locks the profile row, and create_request / consume_ai_bio_quota use it.

-- ---------- Payments ----------
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  slot_id uuid not null references public.slots (id) on delete cascade,
  offer_id uuid references public.offers (id) on delete set null,
  proposal_id uuid references public.proposals (id) on delete cascade,
  booking_id uuid unique references public.bookings (id),
  note text,
  price int not null check (price > 0),
  insurance_fee int not null check (insurance_fee >= 0),
  amount int not null generated always as (price + insurance_fee) stored,
  status public.payment_status not null default 'pending',
  provider text not null default 'konnect',
  provider_ref text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  paid_at timestamptz,
  refunded_at timestamptz
);
create index payments_client_idx on public.payments (client_id, created_at desc);
create index payments_slot_pending_idx on public.payments (slot_id) where status = 'pending';

alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
create policy payments_select on public.payments for select using (client_id = auth.uid() or public.is_admin());

-- Someone else is paying for this slot right now (expiry computed on read, no cron).
create function public._slot_held(p_slot uuid, p_client uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from payments where slot_id = p_slot and status = 'pending'
                 and expires_at > now() and client_id <> p_client)
$$;

create function public.start_checkout(slot_id uuid, note text default null, offer_id uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_slot slots;
  v_price int;
  v_id uuid;
begin
  select * into v_slot from slots s where s.id = start_checkout.slot_id for update;
  if not found then raise exception 'SLOT_NOT_FOUND'; end if;
  if v_slot.is_booked or v_slot.starts_at <= now() or public._slot_held(v_slot.id, v_uid) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;
  if not exists (select 1 from coach_profiles where user_id = v_slot.coach_id and verified) then
    raise exception 'COACH_NOT_VERIFIED';
  end if;

  if start_checkout.offer_id is not null then
    select o.price into v_price from offers o
     where o.id = start_checkout.offer_id and o.coach_id = v_slot.coach_id and o.is_active;
    if v_price is null then raise exception 'OFFER_UNAVAILABLE'; end if;
  elsif exists (select 1 from offers o where o.coach_id = v_slot.coach_id and o.is_active) then
    raise exception 'OFFER_REQUIRED';
  else
    select price_per_session into v_price from coach_profiles where user_id = v_slot.coach_id;
  end if;

  -- A client restarting checkout replaces their own previous attempt.
  update payments p set status = 'failed' where p.slot_id = v_slot.id and p.client_id = v_uid and p.status = 'pending';
  insert into payments (client_id, slot_id, offer_id, note, price, insurance_fee)
  values (v_uid, v_slot.id, start_checkout.offer_id, nullif(trim(start_checkout.note), ''), v_price, public.insurance_fee())
  returning id into v_id;
  return v_id;
end $$;

create function public.start_proposal_checkout(proposal_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_p proposals;
  v_r requests;
  v_slot slots;
  v_id uuid;
begin
  select * into v_p from proposals p where p.id = start_proposal_checkout.proposal_id;
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into v_r from requests r where r.id = v_p.request_id;
  if v_r.client_id <> v_uid then raise exception 'NOT_FOUND'; end if;
  if v_p.status <> 'pending' or v_r.status <> 'open' or v_r.expires_at <= now() then
    raise exception 'INVALID_TRANSITION';
  end if;
  if not exists (select 1 from coach_profiles where user_id = v_p.coach_id and verified) then
    raise exception 'COACH_NOT_VERIFIED';
  end if;

  select * into v_slot from slots s where s.id = v_p.slot_id for update;
  if v_slot.is_booked or v_slot.starts_at <= now() or public._slot_held(v_slot.id, v_uid) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  update payments p set status = 'failed' where p.slot_id = v_slot.id and p.client_id = v_uid and p.status = 'pending';
  insert into payments (client_id, slot_id, proposal_id, note, price, insurance_fee)
  values (v_uid, v_slot.id, v_p.id, v_r.title, v_p.price, public.insurance_fee())
  returning id into v_id;
  return v_id;
end $$;

-- Gateway callback. Success creates the booking; if the slot or request was lost meanwhile the
-- payment is refunded instead. Idempotent: a repeated success returns the same booking.
create function public.confirm_payment(payment_id uuid, success boolean, provider_ref text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pay payments;
  v_p proposals;
  v_r requests;
  v_slot slots;
  v_id uuid;
begin
  select * into v_pay from payments p where p.id = confirm_payment.payment_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_pay.status = 'paid' and success then return v_pay.booking_id; end if;
  if v_pay.status <> 'pending' then raise exception 'INVALID_TRANSITION'; end if;

  if not success then
    update payments set status = 'failed', provider_ref = confirm_payment.provider_ref where id = v_pay.id;
    return null;
  end if;

  select * into v_slot from slots s where s.id = v_pay.slot_id for update;
  if v_pay.proposal_id is not null then
    select * into v_p from proposals p where p.id = v_pay.proposal_id for update;
    select * into v_r from requests r where r.id = v_p.request_id for update;
  end if;
  if v_slot.is_booked or v_slot.starts_at <= now()
     or (v_pay.proposal_id is not null and (v_p.status <> 'pending' or v_r.status <> 'open')) then
    update payments set status = 'refunded', provider_ref = confirm_payment.provider_ref,
                        paid_at = now(), refunded_at = now() where id = v_pay.id;
    return null;
  end if;

  insert into bookings (slot_id, coach_id, client_id, price, insurance_fee, status, note, offer_id, request_id, proposal_id)
  values (v_slot.id, v_slot.coach_id, v_pay.client_id, v_pay.price, v_pay.insurance_fee,
          case when v_pay.proposal_id is null then 'pending' else 'confirmed' end::booking_status,
          v_pay.note, v_pay.offer_id, v_r.id, v_p.id)
  returning id into v_id;
  update slots set is_booked = true where id = v_slot.id;
  update payments set status = 'paid', booking_id = v_id, provider_ref = confirm_payment.provider_ref, paid_at = now()
   where id = v_pay.id;

  if v_pay.proposal_id is not null then
    update proposals set status = 'accepted' where id = v_p.id;
    update proposals p set status = 'rejected' where p.request_id = v_r.id and p.id <> v_p.id and p.status = 'pending';
    update requests set status = 'fulfilled' where id = v_r.id;
  end if;
  return v_id;
end $$;

-- ---------- Bookings: refunds and completion without a ledger ----------
create or replace function public._refund_booking(p_booking bookings, p_status booking_status) returns void
language plpgsql security definer set search_path = public as $$
begin
  update bookings set status = p_status, updated_at = now() where id = p_booking.id;
  update slots set is_booked = false where id = p_booking.slot_id;
  update payments set status = 'refunded', refunded_at = now() where booking_id = p_booking.id and status = 'paid';
end $$;

create or replace function public.complete_booking(booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client', 'admin']::user_role[]);
  v_admin boolean := public.is_admin();
  v_b bookings;
  v_starts timestamptz;
begin
  select * into v_b from bookings b where b.id = complete_booking.booking_id for update;
  if not found or (not v_admin and v_b.client_id <> v_uid) then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_b.status <> 'confirmed' then raise exception 'INVALID_TRANSITION'; end if;
  select starts_at into v_starts from slots where id = v_b.slot_id;
  -- Admins may force-complete; clients only once the session has started.
  if not v_admin and v_starts > now() then raise exception 'SESSION_NOT_STARTED'; end if;
  update bookings set status = 'completed', updated_at = now() where id = v_b.id;
end $$;

-- ---------- Earnings & metrics (derived, never stored) ----------
create function public.my_earnings() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
begin
  return (
    select jsonb_build_object(
      'total', coalesce(sum(public.coach_share(b.price)), 0),
      'month', coalesce(sum(public.coach_share(b.price)) filter (
                 where s.starts_at >= date_trunc('month', now() at time zone 'Africa/Tunis') at time zone 'Africa/Tunis'), 0),
      'sessions', count(*))
    from bookings b join slots s on s.id = b.slot_id
    where b.coach_id = v_uid and b.status = 'completed'
  );
end $$;

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
    'collected', (select coalesce(sum(amount), 0) from payments where status = 'paid'),
    'refunded', (select coalesce(sum(amount), 0) from payments where status = 'refunded'),
    'commission', (select coalesce(sum(price - public.coach_share(price)), 0) from bookings where status = 'completed'),
    'insurance', (select coalesce(sum(insurance_fee), 0) from bookings where status = 'completed'),
    'coach_due', (select coalesce(sum(public.coach_share(price)), 0) from bookings where status = 'completed'),
    'active_offers', (select count(*) from offers o join coach_profiles c on c.user_id = o.coach_id where o.is_active and c.verified),
    'open_requests', (select count(*) from requests where status = 'open' and expires_at > now()),
    'proposals_total', (select count(*) from proposals),
    'request_conversion_pct', case when v_total = 0 then 0
      else round(100.0 * (select count(*) from requests where status = 'fulfilled') / v_total)::int end
  );
end $$;

-- ---------- Execute privileges ----------
revoke execute on function
  public._slot_held(uuid, uuid), public.start_checkout(uuid, text, uuid), public.start_proposal_checkout(uuid),
  public.confirm_payment(uuid, boolean, text), public.my_earnings()
  from public, anon, authenticated;
grant execute on function
  public.start_checkout(uuid, text, uuid), public.start_proposal_checkout(uuid), public.my_earnings()
  to authenticated;
grant execute on function public.confirm_payment(uuid, boolean, text) to service_role;
