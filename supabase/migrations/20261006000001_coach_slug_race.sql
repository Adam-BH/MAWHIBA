-- Two coaches with the same name signing up concurrently both got the same slug from unique_coach_slug
-- (check-then-insert), and the second signup failed on coach_profiles_slug_key. Fall back to a hashed suffix.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := case when new.raw_user_meta_data ->> 'role' = 'coach' then 'coach' else 'client' end;
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
begin
  insert into profiles (id, role, full_name, email) values (new.id, v_role, v_name, new.email);
  if v_role = 'coach' then
    begin
      insert into coach_profiles (user_id, slug) values (new.id, public.unique_coach_slug(v_name, new.id));
    exception when unique_violation then
      insert into coach_profiles (user_id, slug)
      values (new.id, left(public.slugify(v_name), 60) || '-' || left(md5(new.id::text), 6));
    end;
  end if;
  return new;
end $$;
