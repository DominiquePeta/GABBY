-- GABBY — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Requires: Supabase Auth already enabled (email + password is enough for the MVP).

-- ─────────────────────────────────────────────────────────────
-- profiles — one row per authenticated user (client, driver, or admin)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client','driver','admin')),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Clients and drivers both need to see each other's name/phone once a ride is
-- accepted. That's handled by a security-definer function (get_ride_contact
-- below) rather than loosening this table's RLS.

-- ─────────────────────────────────────────────────────────────
-- driver_profiles — public-safe driver info (shown to clients once verified)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.driver_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  bio text not null default '',
  areas text[] not null default '{}',
  car_make_model text not null default '',
  car_colour text not null default '',
  car_plate text not null default '',
  profile_photo_path text,
  available boolean not null default false,
  verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.driver_profiles enable row level security;

create policy "driver_profiles: public read verified" on public.driver_profiles
  for select using (verified = true);

create policy "driver_profiles: owner read own" on public.driver_profiles
  for select using (auth.uid() = profile_id);

create policy "driver_profiles: admins read all" on public.driver_profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "driver_profiles: owner insert own" on public.driver_profiles
  for insert with check (auth.uid() = profile_id);

create policy "driver_profiles: owner update own" on public.driver_profiles
  for update using (auth.uid() = profile_id);

create policy "driver_profiles: admins update verification" on public.driver_profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- driver_verification — private licence data, admin + owner only
-- ─────────────────────────────────────────────────────────────
create table if not exists public.driver_verification (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  licence_number text not null,
  licence_photo_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

alter table public.driver_verification enable row level security;

create policy "driver_verification: owner read own" on public.driver_verification
  for select using (auth.uid() = profile_id);

create policy "driver_verification: admins read all" on public.driver_verification
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "driver_verification: owner insert own" on public.driver_verification
  for insert with check (auth.uid() = profile_id);

create policy "driver_verification: admins update" on public.driver_verification
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- ride_requests
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  driver_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','accepted','declined','completed','cancelled')),
  pickup text not null,
  dropoff text not null,
  share_trip boolean not null default false,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

alter table public.ride_requests enable row level security;

create policy "ride_requests: client reads own" on public.ride_requests
  for select using (auth.uid() = client_id);

create policy "ride_requests: driver reads own" on public.ride_requests
  for select using (auth.uid() = driver_id);

create policy "ride_requests: client inserts own" on public.ride_requests
  for insert with check (auth.uid() = client_id);

create policy "ride_requests: client updates own (cancel)" on public.ride_requests
  for update using (auth.uid() = client_id);

create policy "ride_requests: driver updates own (accept/decline/complete)" on public.ride_requests
  for update using (auth.uid() = driver_id);

-- ─────────────────────────────────────────────────────────────
-- ratings — either party rates the other after a completed ride
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_request_id uuid not null references public.ride_requests(id),
  rater_id uuid not null references public.profiles(id),
  ratee_id uuid not null references public.profiles(id),
  stars integer not null check (stars between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (ride_request_id, rater_id)
);

alter table public.ratings enable row level security;

create policy "ratings: participants read" on public.ratings
  for select using (auth.uid() = rater_id or auth.uid() = ratee_id);

create policy "ratings: rater inserts own" on public.ratings
  for insert with check (
    auth.uid() = rater_id
    and exists (
      select 1 from public.ride_requests r
      where r.id = ride_request_id
        and r.status = 'completed'
        and (r.client_id = auth.uid() or r.driver_id = auth.uid())
    )
  );

-- Keep driver_profiles.rating_avg / rating_count in sync when a driver is rated.
create or replace function public.recalc_driver_rating() returns trigger as $$
begin
  if new.ratee_id in (select profile_id from public.driver_profiles) then
    update public.driver_profiles dp
    set rating_count = sub.cnt,
        rating_avg = sub.avg_stars,
        updated_at = now()
    from (
      select ratee_id, count(*) as cnt, avg(stars)::numeric(3,2) as avg_stars
      from public.ratings
      where ratee_id = new.ratee_id
      group by ratee_id
    ) sub
    where dp.profile_id = sub.ratee_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_rating_insert on public.ratings;
create trigger on_rating_insert
  after insert on public.ratings
  for each row execute function public.recalc_driver_rating();

-- ─────────────────────────────────────────────────────────────
-- list_incoming_requests — lets a driver see the client's name and rating
-- average on a pending request, without granting general read access to
-- the profiles/ratings tables of strangers.
-- ─────────────────────────────────────────────────────────────
create or replace function public.list_incoming_requests(p_driver_id uuid)
returns table (
  id uuid,
  pickup text,
  dropoff text,
  created_at timestamptz,
  client_id uuid,
  client_name text,
  client_rating_avg numeric,
  client_rating_count bigint
) as $$
  select r.id, r.pickup, r.dropoff, r.created_at, r.client_id, p.name,
    coalesce(round(avg(rt.stars), 2), 0) as client_rating_avg,
    count(rt.id) as client_rating_count
  from public.ride_requests r
  join public.profiles p on p.id = r.client_id
  left join public.ratings rt on rt.ratee_id = r.client_id
  where r.driver_id = p_driver_id
    and r.status = 'pending'
    and auth.uid() = p_driver_id
  group by r.id, p.name
  order by r.created_at desc;
$$ language sql security definer;

-- ─────────────────────────────────────────────────────────────
-- get_driver_reviews — public testimonials on a verified driver's profile.
-- Reviewer identity is reduced to "First L." so the review is public social
-- proof without exposing the reviewing client's full name/phone.
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_driver_reviews(p_driver_id uuid)
returns table (stars integer, comment text, created_at timestamptz, reviewer_display text)
as $$
  select rt.stars, rt.comment, rt.created_at,
    trim(split_part(p.name, ' ', 1) || ' ' || left(split_part(p.name, ' ', 2), 1) || '.') as reviewer_display
  from public.ratings rt
  join public.profiles p on p.id = rt.rater_id
  join public.driver_profiles dp on dp.profile_id = rt.ratee_id and dp.verified = true
  where rt.ratee_id = p_driver_id
  order by rt.created_at desc
  limit 10;
$$ language sql security definer stable;

-- ─────────────────────────────────────────────────────────────
-- get_ride_contact — reveals name/phone of the other party, but only once
-- a request has been accepted (or completed). Called from the app instead
-- of selecting profiles directly.
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_ride_contact(request_id uuid)
returns table (name text, phone text) as $$
  select p.name, p.phone
  from public.ride_requests r
  join public.profiles p
    on p.id = case when auth.uid() = r.client_id then r.driver_id else r.client_id end
  where r.id = request_id
    and r.status in ('accepted','completed')
    and (auth.uid() = r.client_id or auth.uid() = r.driver_id);
$$ language sql security definer;

-- ─────────────────────────────────────────────────────────────
-- Storage buckets
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('licence-photos', 'licence-photos', false)
on conflict (id) do nothing;

create policy "profile-photos: public read" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "profile-photos: owner upload" on storage.objects
  for insert with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "licence-photos: owner read" on storage.objects
  for select using (
    bucket_id = 'licence-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

create policy "licence-photos: owner upload" on storage.objects
  for insert with check (bucket_id = 'licence-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────────────────
-- Making yourself an admin (do this manually, once, after you sign up):
--
--   update public.profiles set role = 'admin' where id = '<your auth user id>';
--
-- Find your user id in Authentication → Users in the Supabase dashboard.
-- ─────────────────────────────────────────────────────────────
