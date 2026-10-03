-- Business logic. Money lives here and only here.
-- RPC errors are raised as stable codes (e.g. INSUFFICIENT_FUNDS) that the app translates.

-- ---------- Constants & pure money math ----------
create function public.insurance_fee() returns int
language sql immutable as $$ select 2 $$;

create function public.coach_share(p_price int) returns int
language sql immutable as $$ select (p_price * 85) / 100 $$; -- floor(price × 0.85), integer only

create function public.split_payout(p_price int)
returns table (coach int, platform int, star int, total int)
language sql immutable as $$
  select public.coach_share(p_price),
         p_price - public.coach_share(p_price),
         public.insurance_fee(),
         p_price + public.insurance_fee()
$$;

-- ---------- Auth helpers ----------
create function public.auth_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'admin', false)
$$;

create function public.assert_role(p_roles public.user_role[]) returns uuid
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or public.auth_role() is null or not (public.auth_role() = any (p_roles)) then
    raise exception 'FORBIDDEN';
  end if;
  return auth.uid();
end $$;

-- ---------- Balance ----------
create function public._balance(p_uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::int from wallet_tx where owner_id = p_uid
$$;

create function public.wallet_balance(uid uuid) returns int
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or (uid <> auth.uid() and not public.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;
  return public._balance(uid);
end $$;

-- Serialises every balance-changing operation of one user.
create function public._lock_wallet(p_uid uuid) returns void
language sql security definer set search_path = public as $$
  select 1 from profiles where id = p_uid for update
$$;

-- ---------- Wallet ----------
create function public.topup_wallet(pack_id text) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_pay int;
  v_points int;
begin
  select pay, points into v_pay, v_points from (values
    ('p50', 50, 50), ('p100', 100, 110), ('p200', 200, 230)
  ) as packs (id, pay, points) where id = pack_id;
  if v_points is null then raise exception 'INVALID_PACK'; end if;

  insert into wallet_tx (owner_id, amount, type, meta)
  values (v_uid, v_points, 'topup', jsonb_build_object('pack', pack_id, 'paid', v_pay, 'provider', 'flouci_mock'));
  return public._balance(v_uid);
end $$;

create function public.request_withdrawal(amount int) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
  v_pending int;
  v_id uuid;
begin
  if amount is null or amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  perform public._lock_wallet(v_uid);
  select coalesce(sum(w.amount), 0) into v_pending from withdrawals w
    where w.coach_id = v_uid and w.status = 'pending';
  if public._balance(v_uid) - v_pending < amount then raise exception 'INSUFFICIENT_FUNDS'; end if;

  insert into withdrawals (coach_id, amount) values (v_uid, request_withdrawal.amount) returning id into v_id;
  return v_id;
end $$;

-- ---------- Bookings ----------
create function public.book_slot(slot_id uuid, note text default null) returns uuid
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

  select price_per_session into v_price from coach_profiles where user_id = v_slot.coach_id and verified;
  if v_price is null then raise exception 'COACH_NOT_VERIFIED'; end if;

  perform public._lock_wallet(v_uid);
  if public._balance(v_uid) < v_price + v_fee then raise exception 'INSUFFICIENT_FUNDS'; end if;

  insert into bookings (slot_id, coach_id, client_id, price, insurance_fee, note)
  values (v_slot.id, v_slot.coach_id, v_uid, v_price, v_fee, nullif(trim(book_slot.note), ''))
  returning id into v_id;
  update slots set is_booked = true where id = v_slot.id;
  insert into wallet_tx (owner_id, amount, type, booking_id)
  values (v_uid, -(v_price + v_fee), 'booking_hold', v_id);
  return v_id;
end $$;

-- Refund the escrowed amount and free the slot. Caller holds the booking row lock.
create function public._refund_booking(p_booking bookings, p_status booking_status) returns void
language plpgsql security definer set search_path = public as $$
begin
  update bookings set status = p_status, updated_at = now() where id = p_booking.id;
  update slots set is_booked = false where id = p_booking.slot_id;
  insert into wallet_tx (owner_id, amount, type, booking_id)
  values (p_booking.client_id, p_booking.price + p_booking.insurance_fee, 'booking_refund', p_booking.id);
end $$;

create function public.respond_booking(booking_id uuid, accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
  v_b bookings;
  v_starts timestamptz;
begin
  select * into v_b from bookings b where b.id = respond_booking.booking_id for update;
  if not found or v_b.coach_id <> v_uid then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_b.status <> 'pending' then raise exception 'INVALID_TRANSITION'; end if;

  if accept then
    select starts_at into v_starts from slots where id = v_b.slot_id;
    if v_starts <= now() then raise exception 'SESSION_STARTED'; end if;
    update bookings set status = 'confirmed', updated_at = now() where id = v_b.id;
  else
    perform public._refund_booking(v_b, 'declined');
  end if;
end $$;

create function public.cancel_booking(booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client']::user_role[]);
  v_b bookings;
  v_starts timestamptz;
begin
  select * into v_b from bookings b where b.id = cancel_booking.booking_id for update;
  if not found or v_b.client_id <> v_uid then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_b.status not in ('pending', 'confirmed') then raise exception 'INVALID_TRANSITION'; end if;
  select starts_at into v_starts from slots where id = v_b.slot_id;
  if v_starts <= now() then raise exception 'SESSION_STARTED'; end if;

  perform public._refund_booking(v_b, 'cancelled');
end $$;

create function public.complete_booking(booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client', 'admin']::user_role[]);
  v_admin boolean := public.is_admin();
  v_b bookings;
  v_starts timestamptz;
  v_split record;
begin
  select * into v_b from bookings b where b.id = complete_booking.booking_id for update;
  if not found or (not v_admin and v_b.client_id <> v_uid) then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_b.status <> 'confirmed' then raise exception 'INVALID_TRANSITION'; end if;
  select starts_at into v_starts from slots where id = v_b.slot_id;
  -- Admins may force-complete; clients only once the session has started.
  if not v_admin and v_starts > now() then raise exception 'SESSION_NOT_STARTED'; end if;

  select * into v_split from public.split_payout(v_b.price);
  update bookings set status = 'completed', updated_at = now() where id = v_b.id;
  insert into wallet_tx (owner_id, system_account, amount, type, booking_id) values
    (v_b.coach_id, null, v_split.coach, 'coach_payout', v_b.id),
    (null, 'PLATFORM', v_split.platform, 'commission', v_b.id),
    (null, 'STAR_INSURANCE', v_b.insurance_fee, 'insurance', v_b.id);
end $$;

-- ---------- Certifications ----------
create function public.submit_quiz(slug text, answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['coach']::user_role[]);
  v_cert certifications;
  v_score int := 0;
  v_passed boolean;
  i int;
begin
  select * into v_cert from certifications c where c.slug = submit_quiz.slug;
  if not found then raise exception 'NOT_FOUND'; end if;
  if jsonb_typeof(answers) <> 'array' then raise exception 'INVALID_ANSWERS'; end if;

  for i in 1 .. coalesce(array_length(v_cert.answer_key, 1), 0) loop
    if (answers ->> (i - 1)) = v_cert.answer_key[i]::text then v_score := v_score + 1; end if;
  end loop;
  v_passed := v_score >= v_cert.pass_score;

  insert into coach_certifications (coach_id, certification_id, score, passed)
  values (v_uid, v_cert.id, v_score, v_passed)
  on conflict (coach_id, certification_id) do update
    set score = greatest(coach_certifications.score, excluded.score),
        passed = coach_certifications.passed or excluded.passed,
        completed_at = now();

  return jsonb_build_object('score', v_score, 'total', array_length(v_cert.answer_key, 1), 'passed', v_passed);
end $$;

-- ---------- Admin ----------
create function public.admin_set_coach_verified(coach_id uuid, verified boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_role(array['admin']::user_role[]);
  -- Rejecting clears the proof so the coach can upload a new one.
  update coach_profiles c
     set verified = admin_set_coach_verified.verified,
         proof_path = case when admin_set_coach_verified.verified then c.proof_path else null end
   where c.user_id = admin_set_coach_verified.coach_id;
  if not found then raise exception 'NOT_FOUND'; end if;
end $$;

create function public.admin_credit(user_id uuid, amount int, reason text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := public.assert_role(array['admin']::user_role[]);
begin
  if amount is null or amount <= 0 or amount > 10000 then raise exception 'INVALID_AMOUNT'; end if;
  if not exists (select 1 from profiles where id = admin_credit.user_id and role in ('client', 'coach')) then
    raise exception 'NOT_FOUND';
  end if;
  insert into wallet_tx (owner_id, amount, type, meta)
  values (admin_credit.user_id, admin_credit.amount, 'admin_credit', jsonb_build_object('reason', reason, 'by', v_admin));
end $$;

create function public.admin_process_withdrawal(id uuid, approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_w withdrawals;
begin
  perform public.assert_role(array['admin']::user_role[]);
  select * into v_w from withdrawals w where w.id = admin_process_withdrawal.id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_w.status <> 'pending' then raise exception 'INVALID_TRANSITION'; end if;

  if approve then
    perform public._lock_wallet(v_w.coach_id);
    if public._balance(v_w.coach_id) < v_w.amount then raise exception 'INSUFFICIENT_FUNDS'; end if;
    insert into wallet_tx (owner_id, amount, type, meta)
    values (v_w.coach_id, -v_w.amount, 'withdrawal', jsonb_build_object('withdrawal_id', v_w.id));
  end if;
  update withdrawals set status = case when approve then 'paid' else 'rejected' end::withdrawal_status,
                         processed_at = now()
   where withdrawals.id = v_w.id;
end $$;

create function public.admin_metrics() returns jsonb
language plpgsql stable security definer set search_path = public as $$
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
    'pending_withdrawals_amount', (select coalesce(sum(amount), 0) from withdrawals where status = 'pending')
  );
end $$;

-- ---------- Triggers ----------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := case when new.raw_user_meta_data ->> 'role' = 'coach' then 'coach' else 'client' end;
begin
  insert into profiles (id, role, full_name, email)
  values (new.id, v_role, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  if v_role = 'coach' then
    insert into coach_profiles (user_id) values (new.id);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.refresh_coach_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update coach_profiles set
    rating_avg = coalesce((select round(avg(rating), 2) from reviews where coach_id = new.coach_id), 0),
    rating_count = (select count(*) from reviews where coach_id = new.coach_id)
  where user_id = new.coach_id;
  return new;
end $$;

create trigger on_review_created after insert on public.reviews
  for each row execute function public.refresh_coach_rating();

-- ---------- Execute privileges ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.insurance_fee(), public.coach_share(int), public.split_payout(int),
  public.auth_role(), public.is_admin()
  to anon, authenticated;
grant execute on function
  public.wallet_balance(uuid), public.topup_wallet(text), public.request_withdrawal(int),
  public.book_slot(uuid, text), public.respond_booking(uuid, boolean), public.cancel_booking(uuid),
  public.complete_booking(uuid), public.submit_quiz(text, jsonb),
  public.admin_set_coach_verified(uuid, boolean), public.admin_credit(uuid, int, text),
  public.admin_process_withdrawal(uuid, boolean), public.admin_metrics()
  to authenticated;
