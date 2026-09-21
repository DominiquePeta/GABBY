-- GABBY — Driver nominations
-- Run once in the Supabase SQL editor, AFTER schema.sql.
--
-- Lets a logged-in client or driver nominate a woman they know as a
-- prospective driver. Nominations are private (nominator + admin only) and
-- never auto-create a driver profile — an admin does manual outreach, and
-- only links the nomination to a real driver account once she signs up and
-- is separately verified through the normal driver approval flow.

-- ─────────────────────────────────────────────────────────────
-- profiles.nominations_converted — this schema keeps one unified `profiles`
-- table for clients/drivers/admins rather than a separate `clients` table,
-- so the badge counter lives here (only meaningful when role = 'client').
-- ─────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists nominations_converted integer not null default 0;

-- ─────────────────────────────────────────────────────────────
-- nominations
-- ─────────────────────────────────────────────────────────────
create table if not exists public.nominations (
  id uuid primary key default gen_random_uuid(),
  nominated_first_name text not null,
  nominated_surname text not null,
  is_woman_confirmed boolean not null,
  contact_phone text,
  contact_email text,
  nominated_by_id uuid references public.profiles(id),
  nominated_by_type text not null check (nominated_by_type in ('client', 'driver')),
  status text not null default 'pending' check (status in ('pending', 'invited', 'registered', 'declined')),
  linked_driver_id uuid references public.profiles(id),
  converted_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  invited_at timestamptz,
  registered_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  constraint nominations_contact_required check (contact_phone is not null or contact_email is not null),
  constraint nominations_woman_confirmed check (is_woman_confirmed = true)
);

alter table public.nominations enable row level security;

create policy "nominations: nominator reads own" on public.nominations
  for select using (auth.uid() = nominated_by_id);

create policy "nominations: admins read all" on public.nominations
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- A logged-in client or driver can only file a nomination as themselves,
-- and nominated_by_type has to match their real role — stops a client
-- from filing a nomination that looks like it came from a driver.
create policy "nominations: logged-in client/driver inserts own" on public.nominations
  for insert with check (
    auth.uid() = nominated_by_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = nominated_by_type
    )
  );

-- Only admins move a nomination through invited/registered/declined, link
-- it to a driver, or mark contact made.
create policy "nominations: admins update" on public.nominations
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- Founding Connector badge — awarded once, exactly, the first time BOTH:
--   (a) the nomination is marked 'registered' (admin linked it to a real
--       driver signup), and
--   (b) that driver has passed verification (driver_profiles.verified).
-- These two things can happen in either order, so there are two triggers
-- below feeding one atomic "try to award" function that guards against
-- double-counting with the converted_awarded flag.
-- ─────────────────────────────────────────────────────────────
create or replace function public.try_award_nomination(p_nomination_id uuid) returns void as $$
declare
  v_nominated_by_id uuid;
  v_nominated_by_type text;
begin
  update public.nominations
  set converted_awarded = true
  where id = p_nomination_id
    and status = 'registered'
    and not converted_awarded
    and linked_driver_id is not null
    and exists (
      select 1 from public.driver_profiles dp
      where dp.profile_id = nominations.linked_driver_id and dp.verified = true
    )
  returning nominated_by_id, nominated_by_type into v_nominated_by_id, v_nominated_by_type;

  if found and v_nominated_by_type = 'client' and v_nominated_by_id is not null then
    update public.profiles set nominations_converted = nominations_converted + 1 where id = v_nominated_by_id;
  end if;
end;
$$ language plpgsql security definer;

create or replace function public.on_nomination_change() returns trigger as $$
begin
  perform public.try_award_nomination(new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_nomination_award on public.nominations;
create trigger trg_nomination_award
  after insert or update of status, linked_driver_id on public.nominations
  for each row execute function public.on_nomination_change();

create or replace function public.on_driver_verified_check_nominations() returns trigger as $$
declare
  v_id uuid;
begin
  if new.verified = true and (old.verified is distinct from true) then
    for v_id in
      select id from public.nominations
      where linked_driver_id = new.profile_id and status = 'registered' and not converted_awarded
    loop
      perform public.try_award_nomination(v_id);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_driver_verified_award_nominations on public.driver_profiles;
create trigger trg_driver_verified_award_nominations
  after update of verified on public.driver_profiles
  for each row execute function public.on_driver_verified_check_nominations();

-- Admins can already read every profile (see "profiles: admins read all" in
-- schema.sql), so the admin screen's driver picker for linking a nomination
-- just queries public.profiles where role = 'driver' directly — no extra
-- policy needed here.
