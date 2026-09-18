# GABBY Women Taxi Directory

_Started 2026-09-16 15:56 UTC_

---

## User

Design a mobile-first app called GABBY — a directory connecting Valencia-based female licensed taxi drivers with female clients.

SCREENS NEEDED:

Onboarding:
- Landing/splash with "I'm a client" / "I'm a driver" entry points

Driver flow:
- Signup form (name, phone, taxi licence number, licence photo upload, profile photo upload, bio, areas served, car make/model, car colour, car registration)
- "Awaiting verification" screen
- Driver dashboard: list of incoming requests (client name, client rating), accept/decline buttons, "available now" toggle
- Accepted request view with "Mark as completed" button
- Post-completion rating screen (rate client 1-5 stars + optional comment)

Client flow:
- Signup (name, phone)
- Browse/search screen: grid of verified drivers (photo, name, bio, areas served, average rating), filter by area
- Driver profile view
- "Request booking" confirmation
- Request status screen (pending/accepted/declined)
- Accepted request detail: driver phone number, car make/model, colour, registration, driver rating
- Post-completion rating screen (rate driver 1-5 stars + optional comment)

Admin (simple, low priority):
- Pending drivers list with licence photo/number, approve/reject buttons

DESIGN DIRECTION:
- Clean, mobile-first, trustworthy and safety-focused feel (this is a women's safety product)
- Clear visual distinction between client and driver interfaces

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on your answers — mainly the visual direction, language, and how bookings work. Once those land I'll build.

## User

Answered — language: Bilingual toggle; fidelity: All screens, clickable prototype; distinction: Driver side more utilitarian/high-contrast, client side softer; trust_signals: Verified licence badge, Average rating + count, Share trip with a contact, Photo + car match confirmation; booking_model: Both: pick a driver or 'any available'; areas: 1. Ciutat Vella (Old Town)La XereaEl Carmen (El Carme)El Pilar (Velluters)El MercatLa SeuSant Francesc2. L'Eixample (Ensanche)Ruzafa (Russafa)El Pla del RemeiGran Via3. ExtramursEl BotànicLa RoquetaL…; variations: No variations — one strong direction; cop…

## Assistant



## Assistant

_[tool: ask_user]_

Just the look and feel — colour, mood, type, shape. Then I'll build the full clickable prototype.

## User

Answered — mood: Soft modern — rounded geometry, warm neutrals, approachable; type: All grotesk; shape: Softly rounded

## Assistant

_[tool: copy_starter_component]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

GABBY is built as one clickable prototype — 15 screens, all three flows, ES/EN toggle (top-right or on the splash), and a screen index under the phone to jump anywhere.

Key decisions: client side is warm off-white with a plum accent; driver side flips to a dark high-contrast panel with amber signal colour, so you always know which app you're in. Prototype shortcuts (dashed borders) let you fake the other party's accept/decline/approval. Trust signals live where they matter: verified-licence badge on cards and profile, a "before you get in" plate/model/colour/face checklist on the accepted ride, and share-trip on the booking confirm.

Driver photos and licence scans are striped placeholders — send me real images and I'll drop them in.

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Status-bar inset moved into each screen's own top padding, so full-bleed coloured bands now reach the top of the display; ride and admin switched to the dark status bar.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Root cause: one array was driving both wrapper visibility and status-bar colour. Separated them — `dark` routes wrappers (five driver screens), `darkStatusBar` only sets the glyph colour and now includes `ride` and `admin`.

