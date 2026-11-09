-- NEXSTEP upgrade. Run in Supabase > SQL Editor AFTER schema.sql (safe to run more than once).
-- It changes your EXISTING tables; it does not create duplicates and keeps existing rows.

-- 1) Roles become 'student' or 'admin' (default 'student'). Nobody can edit this from the website.
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'student' where role = 'user';
alter table public.profiles alter column role set default 'student';
alter table public.profiles add constraint profiles_role_check check (role in ('student','admin'));

-- New accounts (email or Google) get a profile automatically. Role is always the default 'student'.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id,
          left(coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), nullif(new.raw_user_meta_data->>'name', ''), ''), 100),
          new.email)
  on conflict (id) do nothing;
  return new;
end $$;

-- 2) Applications: new status values and the student's details.
alter table public.applications drop constraint if exists applications_status_check;
update public.applications set status = case status when 'cancelled' then 'rejected' else 'pending' end
  where status not in ('pending','approved','rejected');
alter table public.applications alter column status set default 'pending';
alter table public.applications add constraint applications_status_check check (status in ('pending','approved','rejected'));

alter table public.applications
  add column if not exists full_name text, add column if not exists email text,
  add column if not exists college text, add column if not exists phone text,
  add column if not exists confirmation_sent_at timestamptz;

alter table public.applications drop constraint if exists applications_details_check;
alter table public.applications add constraint applications_details_check check (
  (full_name is null or char_length(full_name) between 2 and 100) and
  (college is null or char_length(college) between 2 and 150) and
  (phone is null or phone ~ '^[0-9+() -]{7,20}$') and
  (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'));

-- Server-side rules for every new application. Students can only ever create a 'pending' one.
create or replace function public.check_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare w public.webinars; taken integer;
begin
  select * into w from public.webinars where id = new.webinar_id for update;
  if w.id is null or w.status <> 'published' then raise exception 'This session is not open for applications.'; end if;
  if w.end_at <= now() or (w.registration_deadline is not null and w.registration_deadline <= now()) then
    raise exception 'Applications are closed for this session.'; end if;
  if new.full_name is null or new.email is null or new.college is null or new.phone is null then
    raise exception 'Please fill in all application details.'; end if;
  if w.seats is not null then
    select count(*) into taken from public.applications where webinar_id = w.id and status = 'approved';
    if taken >= w.seats then raise exception 'This session is full.'; end if;
  end if;
  new.status := 'pending';
  new.confirmation_sent_at := null;
  return new;
end $$;

create or replace function public.seats_left(wid uuid) returns integer
language sql security definer stable set search_path = public as $$
  select case when w.seats is null then null
    else greatest(w.seats - (select count(*) from public.applications a
         where a.webinar_id = w.id and a.status = 'approved'), 0)::integer end
  from public.webinars w where w.id = wid and w.status in ('published','cancelled');
$$;

-- 3) Only admins may change an application's status (students cannot touch it).
drop policy if exists "applications: admin update" on public.applications;
create policy "applications: admin update" on public.applications for update
  using (public.is_admin()) with check (public.is_admin());
revoke update on public.applications from anon, authenticated;
grant update (status) on public.applications to authenticated;
