# Punjab Honda — Product Requirements Document (PRD)

## Original Problem Statement
Redesign https://www.punjabhonda.com using https://www.innovativehonda.com as a layout reference.
Use Punjab Honda's actual content (Honda Motorcycle & Scooter India authorized dealership in Ahmedabad). Combine functions/features from both reference sites. Must support: product enquiry, information change (form submissions), test rides, service bookings, insurance, EMI calculator.

## User Choices
- 1a — Use Punjab Honda's actual content (real Honda 2-wheeler models)
- All Innovative Honda layout features expected
- MongoDB-based admin panel for enquiry management
- Modern Honda-branded look (Honda Red + Swiss-Brutalist typography)
- Stack: React + FastAPI + MongoDB

## Architecture
- **Frontend:** React 19 + React Router v7 + Tailwind + Shadcn/Radix UI
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB single collection `enquiries` (UUID-keyed); bikes/branches are static seeds
- **Auth:** Token-gated admin dashboard (X-Admin-Token header)
- **Theme:** Honda Red #E30613, Outfit (display) + Manrope (body), sharp edges, generous spacing

## User Personas
1. **Buyer** — Wants to compare Honda 2-wheelers, get on-road price, book test ride
2. **Existing customer** — Books service, renews insurance/AMC, raises accident claim
3. **Browser** — Calculates EMI, finds nearest showroom
4. **Dealership Admin** — Reviews enquiries, updates status, follows up by phone

## Core Requirements (Static)
- Display Honda's full Indian 2-wheeler lineup (motorcycles, scooters, EV, Big Wing super bikes)
- Capture lead info via 7 enquiry types
- Provide self-service tools: EMI calculator, service booking, insurance enquiry
- Admin dashboard with KPI widgets, filters, status updates
- Mobile-responsive, accessible (data-testid coverage)

## What's Been Implemented (2026-01)
- ✅ **Backend** (`/app/backend/server.py`): 21 Honda bikes seed (CB200X, Hornet 2.0, Livo, CD110, Shine 125/100, Unicorn, SP160/125, Dio, Dio 125, Activa 125 / H-Smart, Activa-e, QC1, CBR 650R, CB650R/CB1000R, Fireblade, Africa Twin, Gold Wing) across 4 categories. 4 Ahmedabad branches. Endpoints: GET /api/bikes(?category), /api/bikes/{slug}, /api/branches; POST /api/enquiries; admin: POST /api/admin/verify, GET /api/admin/enquiries, GET /api/admin/stats, PATCH /api/admin/enquiries/{id}.
- ✅ **Frontend Pages**: Home (hero slider + quick actions + category strip + bike grid + services + testimonials + showrooms), BikesListing, BikeDetail, ServicesPage, ServiceBookingPage, InsurancePage, EmiCalculator, ContactPage, AdminPage.
- ✅ **Components**: Header (sticky, utility bar, mobile menu), Footer, HeroSlider (3-slide auto-rotating), QuickActions (5 cards), BikeGrid (with category tabs), ServicesSection, Testimonials, ShowroomSection, EnquiryModal (reusable across 7 types).
- ✅ **Theme**: Honda Red palette, Outfit + Manrope fonts via Google Fonts CDN, sharp edges, hover micro-animations, honda-stripe accent.
- ✅ **Testing**: 33/33 backend pytest pass, 17/17 frontend Playwright flows pass (after code-review fixes).

## Code Quality Improvements (2026-01, post-review)
- ✅ Admin token now uses **sessionStorage** instead of localStorage (smaller XSS attack window; clears on tab close).
- ✅ Hardcoded test secret removed from `tests/test_punjab_honda.py`; loaded from env / backend `.env`.
- ✅ Extracted `useAdminAuth` hook (`/hooks/useAdminAuth.js`) — fixes `useEffect` stale-closure risk in AdminPage.
- ✅ Extracted `useEnquiryForm` hook (`/hooks/useEnquiryForm.js`) with custom email validation; form is `noValidate` so React validates first.
- ✅ AdminPage refactored into `LoginForm`, `StatsRow`, `EnquiriesTable`, `Dashboard` subcomponents — cyclomatic complexity reduced ~70%.
- ✅ EnquiryModal split into `SuccessScreen`, `ScheduleFields`, `BranchField`, `InsuranceFields`, `EnquiryFormBody` — main component now <50 lines.
- ✅ Admin status updates are now **optimistic** (instant UI update, revert only on failure).
- ✅ Replaced array-index `key` with stable identifiers (slide.tag, branch.name, testimonial.name, service.title, etc.) across HeroSlider, ShowroomSection, Testimonials, ServicesPage, ServicesSection.
- ✅ `useMemo` added for table row rendering in admin dashboard.

## Iteration 5 Updates (2026-01)
- ✅ **Bike catalog refresh** — replaced 21 → **23 real Honda models** (per innovativehonda.com + honda2wheelersindia.com):
  - Motorcycles (13): Shine 100, Shine 100 DX, Livo, Shine, SP 125, Unicorn, CB125 Hornet, SP160, Hornet 2.0, CB300F Flex-Fuel, NX200, CB350, CB350C
  - Big Wing (4): NX500, CB750 Hornet, XL750 Transalp, CB1000 Hornet SP
  - Scooters (4): Dio, Activa 6G, Activa 125, Dio 125
  - EV (2): Activa e:, QC1 (per official Honda EV page)
- ✅ Each bike has **color_options** (list of color names) and **specifications** (key-value dict with engine, displacement, power, torque, transmission, brakes, kerb weight, seat height, etc.)
- ✅ **Bike Detail page** redesigned: added Color Options section (clickable swatches with color guess hex) + Full Specifications zebra table
- ✅ **EnquiryModal**: test ride / quote / product enquiry forms now show **"Select Honda Model" dropdown** (grouped by category) when no vehicle is pre-filled
- ✅ **Insurance page** gap fixed (banner h-340→300, py-14→10) — banner now flows directly into the red benefits strip
- ✅ **Home page**: removed "Buy New Two Wheeler / Honda — World's Largest 2W Maker" category strip per user request
- ✅ **WhatsApp click-to-chat widget** added (floating FAB bottom-right, expandable card, "Start Chat" link → wa.me with sales_phone from site settings)
- ✅ **Admin Bikes form**: added textarea editors for `color_options` (one per line) and `specifications` (Key: Value per line)
- ✅ Tests: 61/61 backend pass (3 new admin-CRUD tests for color/specs), 100% frontend flows pass
- ✅ **Cloudinary integration** (signed uploads via backend, real account `dmtuyrkwy` verified end-to-end)
- ✅ All static seed data (bikes, branches, hero slides, testimonials, services, site settings) **migrated to MongoDB** via idempotent `_seed_collection()` on app startup
- ✅ Generic CRUD endpoints under `/api/admin/{resource}` (GET/POST/PATCH/DELETE) for: bikes, hero-slides, branches, testimonials, services
- ✅ Site settings doc: brand name, phones, email, social links, insurance banner image/title/subtitle
- ✅ **Admin panel now has 7 tabs**: Enquiries (existing) + **Bikes / Hero Slides / Branches / Testimonials / Services / Site Settings** — full content management
- ✅ Reusable `CrudManager` component (table + drawer modal + image uploader)
- ✅ `ImageUploader` component (signed Cloudinary upload + URL paste fallback + preview)
- ✅ Insurance page **full-bleed header banner** wired to settings (admin-editable image, title, subtitle)
- ✅ Mini-KPI cards in Enquiries panel for Service Bookings / Insurance / AMC / On-Road Quotes (user request: "i can see amc request, service request etc")
- ✅ Enquiries table now includes a **Message** column
- ✅ Public homepage components (HeroSlider, Testimonials, ServicesSection) now load from API — fully editable from admin
- ✅ Tests: 57/57 backend pytest pass (33 original + 24 new CMS tests). Frontend: 100% on all CMS flows.

## Test Credentials
- Admin Token: `punjab-honda-admin-2026` (login at `/admin`)

## Tech Notes
- Bike data is in-memory in `server.py` BIKES list — easy to swap to DB later.
- Enquiry MongoDB doc shape: `{id (uuid), type, name, phone, email?, city?, vehicle_*?, branch?, preferred_date?, preferred_time?, registration_number?, policy_number?, message?, status: new|contacted|closed, created_at: ISO}`.
- Single global EnquiryModal in App.js, opened via `onOpenEnquiry({type, title, vehicle?})` callback prop.

## Backlog / Roadmap

### P0 (next iteration)
- Bike images: replace generic Unsplash placeholders with actual HMSI catalog imagery (currently same image often used).
- Twilio/SendGrid: send admin SMS/email when new enquiry arrives.
- Booking confirmation email to customer.

### P1
- WhatsApp click-to-chat integration (Innovative Honda has Joinchat).
- Photo gallery + video showcase (event coverage).
- Test ride scheduling with real calendar slots and conflict detection.
- Razorpay/Stripe ₹1000 booking payment (Punjab Honda's "Pay For Booking ₹1000" flow).

### P2
- Multi-branch admin scoping (Ashram Road manager only sees their leads).
- CSV export of enquiries.
- Reviews/Testimonials moderation panel.
- Hindi/Gujarati i18n switcher.

## Smart Enhancement (for next session)
> 💡 **Conversion booster idea**: Enable a sticky "Sticky CTA" on mobile/desktop that pulses when the user scrolls past the hero — "Get ₹1000 Off — Book Now". Combined with Razorpay ₹1000 booking deposit (already in original Punjab Honda flow), this could 3–5× test-ride-to-purchase conversion. Want me to wire that in?
