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

Sign-up is a 3-step flow: registration form (with confirm-password and email
format checks) → a 6-digit code emailed via Supabase Auth's built-in email
OTP (not a custom system) → account only becomes active once that code is
confirmed, then the existing client/driver flow takes over. See
`supabase/README.md` for the one-time dashboard setup this needs (email
confirmation + the code template).

The app is bilingual (English/Spanish): every screen, form label, and error
message has both, the toggle is reachable before login and from each role's
profile screen, and the choice is saved on-device and re-used next launch.
First launch defaults to the device's language when it's English, Spanish
otherwise (Valencia is the primary market). Confirmation emails are a single
bilingual template (Supabase's built-in mailer is one static template per
project, not per-user) — a fully dynamic version needs a custom Auth Hook
with a provider like Resend, not built here.

## Known gaps (by design, for this MVP)

- **No SMS/OTP.** Login is email + password; email address is verified via
  a 6-digit code (Supabase Auth). Phone number is stored as contact info
  only — real phone verification needs a paid SMS provider.
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
