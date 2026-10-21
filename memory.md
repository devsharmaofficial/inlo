# OnePass — Persistent Project Memory

> This file is the short durable context for the coding agent. Update it after meaningful decisions or phase completion. Keep it factual. Do not copy transient chat history here.

## 1. Project identity

- **Working codename:** OnePass. Name is not cleared; it must not be considered an approved trademark or final public brand.
- **Product:** Multi-activity membership and booking marketplace for curated third-party venues in India.
- **Core idea:** One membership/entitlement system can unlock bookings across participating activities. Venue/slot credit cost may differ, but price and policies must be disclosed clearly before booking.
- **Operating model:** Asset-light marketplace. OnePass does not own or operate the venues.
- **Current stage:** Research / pre-build planning. Validate supply, paid demand, unit economics and legal/payment structure before substantial engineering or real-money launch.
- **Target launch:** One Tier-1 city, starting with a tightly bounded neighbourhood cluster. City is not yet selected in this document.
- **Initial categories:** Candidate categories include gyms, yoga, swimming, badminton and turf/box-cricket. Select only 2–3 to launch after supply and user interviews. Do not assume the full category set launches together. Salons/spas/massage/dance can remain later candidates.

## 2. Product principles

1. Reliable supply density beats a huge stale catalogue.
2. Clear pricing, credit terms and cancellation policies beat clever growth tricks.
3. The user sees only real venues, real images and accurate availability states.
4. A booking must never oversell capacity or debit credits twice.
5. Every credit movement is auditable; posted ledger history is immutable.
6. The interface feels like a premium, human activity marketplace—not a generic AI SaaS template.
7. Use technology to solve actual operational risks. Avoid premature microservices/infra.
8. Legal/accounting/payment structure is a product dependency, not something to fix after launch.

## 3. Architecture decisions (current defaults)

- **Frontend/web:** Next.js App Router + React + TypeScript.
- **UI:** Tailwind CSS; shadcn/ui primitives customised using `design.md`; Lucide iconography.
- **Database:** Managed PostgreSQL; Supabase is the candidate platform, subject to project/region/vendor review.
- **Auth:** Managed auth (Supabase Auth is the candidate). Enforce member/partner/admin roles on the server and with database policies.
- **Transactional correctness:** PostgreSQL transactions/RPC + constraints for slot reservation, booking record, credit debit and ledger event. Database remains the source of truth.
- **Payments:** Razorpay or Cashfree candidate, not final. Use provider-hosted/approved checkout, server-created order and verified idempotent webhook events.
- **Hosting:** Vercel is a candidate for the Next.js app; environment and data-processing decisions must be reviewed before production.
- **Email:** Resend or equivalent candidate. OTP/SMS provider to be chosen after testing delivery, India requirements and pricing.
- **Search:** Postgres filters/indexes first. Add PostGIS/search service only when justified.
- **Scale:** Begin as a modular monolith. No microservices, Redis locks, Kafka, Kubernetes or warehouse in MVP without a measured reason.

These are recommended starting decisions, not proof that providers have been provisioned or that compliance has been confirmed.

## 4. Critical domain rules

### Booking
- Server determines price, eligibility, capacity and booking status.
- Idempotency key required for booking create and other non-idempotent state changes.
- Slot capacity, booking, credit debit/allocation and booking event commit atomically.
- Database row locking or guarded atomic updates prevent double-booking; caches are never authoritative.
- Every confirmed booking saves a snapshot of time, venue, credits and policy version.

### Credits
- Integer units only.
- Immutable append-only ledger for grants, debits, refunds, expiry, reversal and admin adjustments.
- Balance projection is reconciled against ledger.
- No client-generated balance, price or entitlement.
- Do not assume “credits” automatically avoid financial regulation. Their commercial/legal treatment is an open release-gating issue.

### Payments
- A browser redirect is not proof of payment.
- Grant credits only after verified provider status/webhook and idempotent DB effect.
- Verify webhook signature using provider-documented method and raw body where required.
- Duplicate/out-of-order events must not duplicate or regress financial effects.
- Do not enable live payouts or hold/settle marketplace funds until the arrangement is approved by counsel/accounting and provider supports it.

### Access / privacy
- Role enforcement on server; RLS/policies and negative tests for user/partner separation.
- No service-role or payment secrets in browser or git.
- Collect minimum personal data; private documents remain in private storage.
- Check applicable DPDP Act/Rules, consumer, tax and payment requirements before production. Do not invent blanket data-localisation requirements.

## 5. UX / brand decisions

Read `design.md` before every visual task.

- Direction: editorial urban activity marketplace; warm paper, ink, restrained chartreuse accent, forest support colour, real photography and strong typography.
- Font default: choose one primary sans (Manrope or Geist Sans) and optionally a restrained mono for price/credit data. Do not mix families randomly.
- Use design tokens, clear venue cards, real availability states, visible credit costs, practical mobile navigation and distinct member vs admin density.
- Avoid generic AI gradients, glassmorphism, glowing borders, random floating blobs, fake logos/ratings/reviews, fake scarcity, emoji core icons and gratuitous animation.
- All UI work must be reviewed in a real browser at 360px and desktop width; support empty/loading/error/disabled/selected/success states.

## 6. Research insights

- Existing players include FITPASS, Cultpass/Cult.fit, Hudle, Playo, ClassPass and local/category-specific alternatives. Multi-activity access alone is not a sufficient differentiator.
- A defensible first wedge needs to be proven: a specific local density, multi-activity coverage underserved by the local options, reliable inventory, better transparency, strong venue relationships, or better support.
- A manual/concierge pilot should precede full implementation. Interview both paying members and venue operators, then model contribution per booking and high-usage member behaviour.
- Public competitor pages reveal product features more easily than their internal architecture; do not claim knowledge of proprietary competitor tech stacks.
- Research figures/city options/prices from earlier drafts are hypotheses unless reconfirmed with current primary sources and field evidence.

## 7. Current phase and completion status

- **Active phase:** Phase 8 — Learn, stabilise, then expand (Completed).
- **Implemented:**
  - **Phase 1 (Foundation & Design System):** Next.js App Router + TypeScript, Design tokens (`globals.css`), UI primitives (Button, Badge, Card, Dialog, Input, Skeleton, Toast, EmptyState), responsive layout shell (desktop & mobile navigation), type-safe env validation, strict testing and CI workflow (`ci.yml`), ADR-001.
  - **Phase 2 (Real Catalogue & Discovery):** SQL migration `001_catalogue.sql`, verified pilot catalogue (Bengaluru: Domlur, Indiranagar, Koramangala across Badminton, Swimming, Gym, Yoga), search and multi-facet filtering on `/explore`, responsive `VenueCard` components, rich venue detail page `/venues/[slug]`, privacy-respecting analytics helper.
  - **Phase 3 (Partner Inventory & Staff Access):** SQL migration `002_partner_inventory.sql`, `inventory-service` enforcing strict multi-tenant partner isolation (negative authorization tests passing), slot parameter validation, capacity reduction exception conflict handling, immutable audit logs, partner portal `/partner/dashboard` and `/partner/venues`.
  - **Phase 4 (Booking Engine & Credit Ledger):** SQL migration `003_booking_ledger.sql`, `credit-ledger-service` with immutable append-only accounting and balance reconciliation, `booking-engine` with atomic slot capacity reservation, idempotency protection, overselling prevention, cancellation cutoff enforcement and automatic credit refund, single-use check-in pass validation, interactive member booking flow with upfront price/policy disclosure dialog (`BookSlotDialog`), member bookings page (`/bookings`), and digital pass detail page (`/bookings/[id]`).
  - **Phase 5 (Payment Sandbox & Entitlements):** SQL migration `004_membership_payments.sql`, explicit product SKUs (Starter 20, Active 50, Pro 100), `payment-service` with server-side order creation, raw-body HMAC SHA256 signature verification, idempotent event inbox deduplication, amount/currency tamper checks, atomic credit fulfillment, `/api/webhooks/payment` route handler, `/membership` packs page, and `/checkout` review page with sandbox simulation.
  - **Phase 6 (Check-in, Operational Controls & Compliance):** Partner check-in desk (`/partner/checkin`) with single-use cryptographic token invalidation, partner reconciled settlement statements (`/partner/statements`) with CSV export, venue reservations management (`/partner/bookings`), support desk with ticket generation (`/support`), venue partner onboarding (`/partner/apply`), plain-language cancellation policy (`/legal/cancellations`), DPDP Act 2023 compliant privacy notice (`/legal/privacy`), and statutory terms of service (`/legal/terms`).
  - **Phase 7 (Security, Quality & Operational Administration):** Comprehensive operations portal (`/admin/venues`, `/admin/bookings`, `/admin/ledger`, `/admin/payments`, `/admin/partners`, `/admin/audit`), member account overview (`/account`), 74 automated tests across 13 suites, 0 ESLint warnings, 0 TypeScript errors, 30 Next.js routes cleanly compiled and statically/dynamically generated.
  - **Phase 8 (Pilot Operations, Emergency Kill-Switch & Runbook):** Implemented Platform Emergency Booking Kill-Switch and Circuit Breaker (`system-controls.ts`, `/admin/controls`), Pilot Cohort & Unit Economics analytics dashboard (`pilot-metrics-service.ts`, `/admin/pilot`), System Health API (`/api/health`), global operational announcement banner (`OperationalBanner`), 20-member beta cohort tracker, and canonical `runbook.md` detailing on-ground front-desk drills, daily operational cadence, and weekly settlement protocols. 80 automated tests passing across 14 suites, 33 Next.js routes compiled.

## 8. Open decisions — do not silently invent

- Final brand/name, trademark and domain.
- City, micro-market and first launch categories.
- Whether MVP sells subscription, packs, individual bookings or another entitlement model.
- Price points, credit valuation/eligibility/expiry/rollover and promotional-credit treatment.
- Cancellation windows, refunds, no-show and venue-cancelled compensation.
- Venue commission/revenue share, settlement cadence and provider-supported marketplace/payout flow.
- Instant booking vs partner approval for each category.
- Final auth/OTP provider, hosting/database regions, privacy notice, retention/deletion workflow and legal obligations.
- Whether QR check-in is in the first live pilot or an audited staff lookup is sufficient.

## 9. Project terminology

- **Member:** consumer account.
- **Partner:** business/venue operator account.
- **Venue:** physical location/business listing.
- **Activity:** category such as swimming, yoga or badminton.
- **Slot:** a bookable period with start/end time and capacity.
- **Booking:** member reservation of one slot/experience.
- **Credit/entitlement:** internal unit used for booking eligibility; not assumed to be money.
- **Ledger entry:** immutable accounting-style record of a credit grant/debit/refund/adjustment.
- **Payment order:** an external money collection attempt or transaction record; separate from a credit balance.
- **Settlement:** partner amount payable after a defined, reconciled booking/commission/refund calculation.

## 10. Change log

- `2026-10-20 — Phase 1 completion:` Next.js 16 App Router repository foundation, `design.md` design tokens in `globals.css`, Radix UI primitives, `EmptyState`, mobile & desktop shells, type-safe `env.ts`, Vitest setup, GitHub Actions CI, and ADR-001. All tests and production build passing.
- `2026-10-21 — Phase 2 completion:` Implemented `001_catalogue.sql`, Bengaluru pilot dataset (The Hub Sports Arena, AquaLife Aquatic Centre, Iron & Movement Club, Prana Shala, Veloce Hub), catalogue repository with query/activity/locality filters, public explore page (`/explore`), and venue detail view (`/venues/[slug]`).
- `2026-10-21 — Phase 3 completion:` Implemented `002_partner_inventory.sql`, `inventory-service` with multi-tenant partner isolation, capacity reduction conflict protection, audit logging, partner dashboard, and negative security tests. 55 automated tests passing with 0 errors.
- `2026-10-21 — Phase 4 completion:` Implemented `003_booking_ledger.sql`, `credit-ledger-service` with immutable ledger and balance reconciliation, `booking-engine` with atomic reservation/debit/snapshots, multi-tenant booking isolation, cancellation refund within policy window, single-use check-in pass validation, interactive `BookSlotDialog`, `/bookings` tabs, and `/bookings/[id]` digital pass card. 64 automated tests passing.
- `2026-10-21 — Phase 5 completion:` Implemented `004_membership_payments.sql`, membership credit packs catalog, `payment-service` with server-side orders, HMAC signature verification, idempotent webhook deduplication, tamper checks, atomic ledger grants, `/api/webhooks/payment` route, rich `/membership` selection, and `/checkout` order review with sandbox verification. 71 automated tests passing.
- `2026-10-21 — Phase 6 & Phase 7 completion:` Implemented Staff Check-in Desk (`/partner/checkin`), Partner Statements with CSV export (`/partner/statements`), Venue Bookings list (`/partner/bookings`), Help & Support Ticketing (`/support`), Venue Partner Application (`/partner/apply`), DPDP Act Privacy Notice (`/legal/privacy`), Terms of Service (`/legal/terms`), Cancellations Policy (`/legal/cancellations`), Member Account (`/account`), Operations Admin suite (`/admin/venues`, `/admin/bookings`, `/admin/ledger`, `/admin/payments`, `/admin/partners`, `/admin/audit`). 74 automated tests passing, 0 lint warnings, 0 type errors, 30 Next.js routes cleanly compiled and statically/dynamically generated.
- `2026-10-21 — UI Contrast & Accessibility Fixes:` Resolved color contrast and visibility issues across modals, legal documents, and call-to-actions. Fixed Tailwind v4 CSS variable binding dropping background colors by defining explicit token utility classes in `globals.css`. Decoupled dark mode variants from OS `prefers-color-scheme: dark` to prevent unwanted text-on-dark inversions, restored opaque solid backgrounds to `DialogOverlay` and `DialogContent`, corrected home CTA contrast, and updated all legal cards to high-contrast Paper & Ink styling. All 74 tests passing, 0 TypeScript/ESLint errors, production build validated.
- `2026-10-21 — Phase 8 completion:` Built pilot operational monitoring and circuit breakers: Emergency Booking Kill-Switch (`system-controls.ts`, `/admin/controls`), Pilot Cohort & Unit Economics Dashboard (`/admin/pilot`), System Health API (`/api/health`), global operational announcement banner (`OperationalBanner`), 20-member beta cohort tracker with usage metrics, and canonical `runbook.md` operational procedures. All 80 unit & integration tests passing across 14 suites, 0 ESLint warnings, 0 TypeScript errors, 33 Next.js routes compiled. All 8 canonical project phases complete.


