-- Row level security, table/column privileges and storage.
-- API roles get only what is granted here; money tables are written exclusively by RPCs.

revoke all on all tables in schema public from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.wallet_tx enable row level security;
alter table public.withdrawals enable row level security;
alter table public.reviews enable row level security;
alter table public.certifications enable row level security;
alter table public.coach_certifications enable row level security;

-- ---------- profiles ----------
grant select on public.profiles to anon, authenticated;
grant update (full_name, phone, city, avatar_url) on public.profiles to authenticated;

create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or exists (select 1 from public.coach_profiles c where c.user_id = profiles.id and c.verified)
  or exists (
    select 1 from public.bookings b
    where (b.coach_id = auth.uid() and b.client_id = profiles.id)
       or (b.client_id = auth.uid() and b.coach_id = profiles.id)
  )
);
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Display-only identity (used for reviewer names). No email/phone.
create view public.public_profiles as
  select id, full_name, avatar_url, city from public.profiles;
revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ---------- coach_profiles ----------
grant select on public.coach_profiles to anon, authenticated;
grant update (sports, headline, bio, achievements, price_per_session, session_duration_min, proof_path)
  on public.coach_profiles to authenticated;

create policy coach_profiles_select on public.coach_profiles for select
  using (verified or user_id = auth.uid() or public.is_admin());
create policy coach_profiles_update_own on public.coach_profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- slots ----------
grant select on public.slots to anon, authenticated;
grant insert (coach_id, starts_at, ends_at, location), delete on public.slots to authenticated;

create policy slots_select on public.slots for select using (
  public.is_admin()
  or coach_id = auth.uid()
  or (not is_booked and starts_at > now()
      and exists (select 1 from public.coach_profiles c where c.user_id = slots.coach_id and c.verified))
  or exists (select 1 from public.bookings b where b.slot_id = slots.id and b.client_id = auth.uid())
);
create policy slots_insert_own on public.slots for insert
  with check (coach_id = auth.uid() and public.auth_role() = 'coach' and starts_at > now());
create policy slots_delete_own on public.slots for delete using (
  coach_id = auth.uid() and not is_booked
  and not exists (select 1 from public.bookings b where b.slot_id = slots.id)
);

-- ---------- bookings / wallet_tx / withdrawals: read only ----------
grant select on public.bookings, public.wallet_tx, public.withdrawals to authenticated;

create policy bookings_select on public.bookings for select
  using (client_id = auth.uid() or coach_id = auth.uid() or public.is_admin());
create policy wallet_tx_select on public.wallet_tx for select
  using (owner_id = auth.uid() or public.is_admin());
create policy withdrawals_select on public.withdrawals for select
  using (coach_id = auth.uid() or public.is_admin());

-- ---------- reviews ----------
grant select on public.reviews to anon, authenticated;
grant insert (booking_id, coach_id, client_id, rating, comment) on public.reviews to authenticated;

create policy reviews_select on public.reviews for select using (true);
create policy reviews_insert_own on public.reviews for insert with check (
  client_id = auth.uid()
  and exists (
    select 1 from public.bookings b
    where b.id = reviews.booking_id and b.client_id = auth.uid()
      and b.coach_id = reviews.coach_id and b.status = 'completed'
  )
);

-- ---------- certifications (answer_key never exposed) ----------
grant select (id, slug, title, description, lessons, quiz, pass_score) on public.certifications to anon, authenticated;
grant select on public.coach_certifications to anon, authenticated;

create policy certifications_select on public.certifications for select using (true);
create policy coach_certifications_select on public.coach_certifications for select using (true);

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp']),
  ('proofs', 'proofs', false, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy avatars_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy proofs_owner_or_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy proofs_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy proofs_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
