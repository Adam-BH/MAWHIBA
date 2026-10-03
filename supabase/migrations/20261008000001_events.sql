-- Monthly community event: admins publish it, clients and coaches register for free (capacity-limited).
-- `registered` is a counter kept by the RPCs under a row lock, so public pages show spots left
-- without exposing who registered.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null check (char_length(location) between 2 and 200),
  capacity int not null check (capacity between 1 and 10000),
  registered int not null default 0 check (registered between 0 and capacity),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index events_starts_idx on public.events (starts_at);

create table public.event_registrations (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
revoke all on public.events, public.event_registrations from anon, authenticated;

grant select on public.events to anon, authenticated;
create policy events_select on public.events for select using (true);

grant select on public.event_registrations to authenticated;
create policy event_registrations_select on public.event_registrations for select
  using (user_id = auth.uid() or public.is_admin());

create function public.register_event(event_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client', 'coach']::user_role[]);
  v_e events;
begin
  select * into v_e from events e where e.id = register_event.event_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_e.starts_at <= now() then raise exception 'EVENT_PAST'; end if;
  if exists (select 1 from event_registrations r where r.event_id = v_e.id and r.user_id = v_uid) then return; end if;
  if v_e.registered >= v_e.capacity then raise exception 'EVENT_FULL'; end if;
  insert into event_registrations (event_id, user_id) values (v_e.id, v_uid);
  update events set registered = registered + 1 where id = v_e.id;
end $$;

create function public.unregister_event(event_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public.assert_role(array['client', 'coach']::user_role[]);
  v_e events;
begin
  select * into v_e from events e where e.id = unregister_event.event_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_e.starts_at <= now() then raise exception 'EVENT_PAST'; end if;
  delete from event_registrations r where r.event_id = v_e.id and r.user_id = v_uid;
  if found then update events set registered = registered - 1 where id = v_e.id; end if;
end $$;

create function public.admin_create_event(
  title text, description text, starts_at timestamptz, ends_at timestamptz, location text, capacity int
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  perform public.assert_role(array['admin']::user_role[]);
  if admin_create_event.starts_at <= now() then raise exception 'EVENT_PAST'; end if;
  insert into events (title, description, starts_at, ends_at, location, capacity)
  values (trim(admin_create_event.title), trim(coalesce(admin_create_event.description, '')), admin_create_event.starts_at,
          admin_create_event.ends_at, trim(admin_create_event.location), admin_create_event.capacity)
  returning id into v_id;
  return v_id;
end $$;

revoke execute on function
  public.register_event(uuid), public.unregister_event(uuid),
  public.admin_create_event(text, text, timestamptz, timestamptz, text, int)
  from public, anon, authenticated;
grant execute on function
  public.register_event(uuid), public.unregister_event(uuid),
  public.admin_create_event(text, text, timestamptz, timestamptz, text, int)
  to authenticated;
