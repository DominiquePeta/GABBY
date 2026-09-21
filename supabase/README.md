# GABBY — Supabase setup

1. Create a free project at https://supabase.com.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Put them in `app/.env` (copy `app/.env.example`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```
4. In **SQL Editor**, paste and run `schema.sql` from this folder, then `nominations.sql` (adds the driver nomination feature — safe to run any time after `schema.sql`, including on a project that's already live).
5. In **Authentication → Providers**, email/password is enabled by default — that's all the MVP needs. (Phone/SMS OTP needs a paid provider like Twilio wired into Supabase Auth; that's a later upgrade, not required to run this.)
6. Sign up once in the app as yourself, then in **Authentication → Users** copy your user id and run:
   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-id>';
   ```
   That's how you reach the admin screen — there's no separate admin signup flow, on purpose (fewer accounts with that power).

## What's real vs. simulated

- Auth, profiles, driver verification, ride requests, and ratings are real rows in Postgres — nothing is mocked.
- Licence and profile photos upload to Supabase Storage.
- Driver approval is a human (you, in the admin screen) looking at the licence photo/number and tapping approve/reject — there's no automated registry check.
- "Any available driver" picks a random online, verified, area-matching driver and books them directly — it does not broadcast to multiple drivers at once. Broadcast-and-first-to-accept is a reasonable v2.
- Driver nominations (client or driver recommends a woman as a future driver) are private rows only you can see in the admin screen — nothing public, no auto-created driver profile, no automatic SMS/email. The "Founding Connector" badge is awarded automatically the moment you've linked a nomination to a signed-up driver *and* that driver passes verification, in whichever order those two things happen.
