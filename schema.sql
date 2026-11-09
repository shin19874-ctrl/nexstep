-- NEXSTEP database. Run ONCE in Supabase > SQL Editor > New query > Run.
create extension if not exists pgcrypto;

-- ===== PROFILES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(left(new.raw_user_meta_data->>'full_name', 100), ''), new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
create policy "profiles: read own or admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- Users may change ONLY full_name. The role column can never be edited from the website.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ===== WEBINARS (also workshops and courses, see "kind") =====
create table public.webinars (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'webinar' check (kind in ('webinar','workshop','course')),
  title text not null check (char_length(title) between 3 and 200),
  description text not null check (char_length(description) between 10 and 5000),
  speaker_name text not null check (char_length(speaker_name) between 2 and 120),
  speaker_details text not null default '' check (char_length(speaker_details) <= 2000),
  category text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  time_zone text not null default 'Asia/Kolkata',
  registration_deadline timestamptz,
  meeting_format text not null default 'online' check (meeting_format in ('online','in_person','hybrid')),
  is_paid boolean not null default false,
  price numeric(10,2) not null default 0 check (price >= 0),
  registration_link text check (registration_link is null or registration_link ~ '^https://'),
  recording_url text check (recording_url is null or recording_url ~ '^https://'),
  poster_path text,
  seats integer check (seats is null or seats > 0),
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at),
  check (is_paid or price = 0)
);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger webinars_touch before update on public.webinars
  for each row execute function public.touch_updated_at();

alter table public.webinars enable row level security;
create policy "webinars: public reads published" on public.webinars for select
  using (status in ('published','cancelled') or public.is_admin());
create policy "webinars: admin insert" on public.webinars for insert with check (public.is_admin());
create policy "webinars: admin update" on public.webinars for update
  using (public.is_admin()) with check (public.is_admin());
create policy "webinars: admin delete" on public.webinars for delete using (public.is_admin());

-- ===== APPLICATIONS =====
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  status text not null default 'registered' check (status in ('registered','cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, webinar_id)   -- one application per user per webinar
);

-- Server-side rules: published, not ended, deadline not passed, seats available.
create function public.check_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare w public.webinars; taken integer;
begin
  select * into w from public.webinars where id = new.webinar_id for update;
  if w.id is null or w.status <> 'published' then
    raise exception 'This webinar is not open for applications.';
  end if;
  if w.end_at <= now() or (w.registration_deadline is not null and w.registration_deadline <= now()) then
    raise exception 'Applications are closed for this webinar.';
  end if;
  if w.seats is not null then
    select count(*) into taken from public.applications where webinar_id = w.id and status = 'registered';
    if taken >= w.seats then raise exception 'This webinar is full.'; end if;
  end if;
  new.status := 'registered';
  return new;
end $$;
create trigger applications_check before insert on public.applications
  for each row execute function public.check_application();

alter table public.applications enable row level security;
create policy "applications: read own or admin" on public.applications for select
  using (user_id = auth.uid() or public.is_admin());
create policy "applications: insert own" on public.applications for insert
  with check (user_id = auth.uid());
create policy "applications: delete own or admin" on public.applications for delete
  using (user_id = auth.uid() or public.is_admin());
revoke update on public.applications from anon, authenticated;

-- Public seat counter (shows seats left without exposing who applied).
create function public.seats_left(wid uuid) returns integer
language sql security definer stable set search_path = public as $$
  select case when w.seats is null then null
    else greatest(w.seats - (select count(*) from public.applications a
         where a.webinar_id = w.id and a.status = 'registered'), 0)::integer end
  from public.webinars w where w.id = wid and w.status in ('published','cancelled');
$$;
grant execute on function public.seats_left(uuid) to anon, authenticated;

-- ===== STORAGE (poster images) =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "posters: public read" on storage.objects for select using (bucket_id = 'posters');
create policy "posters: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'posters' and public.is_admin());
create policy "posters: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'posters' and public.is_admin());
create policy "posters: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'posters' and public.is_admin());

-- ===== MAKE YOURSELF THE FIRST ADMIN =====
-- 1) Sign up on your website with your email and verify it.
-- 2) Then run this ONE line in the SQL Editor (put your email in):
--    update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
