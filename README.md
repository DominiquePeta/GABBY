# GABBY — Female taxi driver directory (Valencia)

Real Expo (React Native + TypeScript) app + Supabase backend, built from the
Claude Design handoff in `chats/` and `project/GABBY.dc.html`.

## Structure

- `app/` — the Expo app. See `app/README.md` (below) for how to run it.
- `supabase/` — database schema + setup instructions (`supabase/README.md`).
- `project/`, `chats/` — the original Claude Design handoff bundle (prototype
  HTML + the design conversation), kept for reference.

## Get it running

1. Set up Supabase: follow `supabase/README.md` (create project, run
   `supabase/schema.sql`, get your project URL + anon key).
2. `cd app && cp .env.example .env` and fill in the two Supabase values.
3. `npm install` (already run once, but run again if you pull fresh).
4. `npx expo start` — scan the QR code with **Expo Go** on your phone to run
   it for real, or press `w` for a quick web preview.

## What's built

All 15 screens from the design: splash, client sign-up/browse/profile/confirm/
status/ride/rate/thanks, driver sign-up/onboarding/awaiting/dashboard/ride/rate,
and admin review — wired to real Supabase auth, Postgres tables, Storage
(licence + profile photos), and Realtime (a client sees the moment a driver
accepts/declines; a driver sees new requests live).

## Known gaps (by design, for this MVP)

- **No SMS/OTP.** Login is email + password; phone number is stored as
  contact info only. Real phone verification needs a paid SMS provider.
- **Driver verification is manual.** The admin screen shows the licence
  photo + number for a human to approve/reject — there's no automated
  registry check.
- **"Any available driver" doesn't broadcast.** It picks one online,
  verified, area-matching driver at random and books them directly, rather
  than offering the ride to several drivers at once.
- **Not submitted to app stores.** Runs great in Expo Go for development;
  shipping to the App Store / Play Store needs paid developer accounts
  (~£79-99/yr Apple, ~£25 one-off Google) — a separate step when you're
  ready for that.
