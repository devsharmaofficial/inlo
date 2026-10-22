# Inlo — Product Requirements Document

> **Project status:** Discovery → pre-build validation  
> **Brand status:** Inlo is the current working brand used by the repository and inlo.tech; legal/trademark clearance is not established by this code audit. “OnePass” was an earlier internal label. Clear company name, trademark, domain, app-store and social handles before public launch.  
> **Primary market:** India; launch in one carefully selected Tier-1 city and a tightly bounded set of neighbourhoods.  
> **Document owner:** Product / CTO  
> **Last updated:** 2026-10-20

## 1. Executive product brief

Inlo is a multi-activity membership and booking marketplace. Instead of purchasing a separate commitment for every venue, a member uses one membership to discover and book participating activities—initially selected fitness and sport experiences such as gyms, yoga, swimming, badminton and turf/box-cricket sessions. Each bookable experience has a clearly disclosed credit cost or included entitlement. Members see the exact cost, time, venue rules and cancellation policy before confirming.

Partner venues gain incremental demand and a simple way to publish inventory, validate bookings and understand usage. Inlo earns through a commercially sustainable membership / booking model and a transparent partner agreement. The product is an asset-light marketplace: it does not operate or own the venues.

The product is **not** “every activity in every city on day one.” Supply quality, local density, booking reliability and unit economics matter more than a large category list. Launch with one micro-market and a small set of categories that can be operationally supported.

## 2. Product thesis and positioning

### Member problem
- People want to try different activities but face separate memberships, inconvenient discovery, uncertain availability and fragmented booking experiences.
- A recurring membership can feel risky when the user cannot predict which locations and sessions they will actually use.
- Users need transparent value: what one credit means, how many credits a visit costs, whether peak slots cost more, when credits expire, and what happens if they cancel.

### Venue problem
- Off-peak inventory may go unused while paid acquisition and direct booking tools are fragmented.
- Venues want incremental customers without giving away peak-time capacity or losing control over schedules and redemption.
- Small venues need a low-friction way to onboard and reconcile bookings.

### Inlo hypothesis
A curated, dense local network + dependable booking + transparent credits + a polished, easy-to-use experience can be more valuable than a broad but unreliable catalogue.

### Competitive reality
FITPASS, Cultpass/Cult.fit, Hudle, Playo, ClassPass and other local or category-specific services overlap parts of this concept. The product must not position “one membership for multiple activities” as unique by itself. Validate a defensible wedge—such as a specific city micro-market, reliable booking inventory, broader sport/wellness mix, partner economics, excellent service recovery, or a more transparent credit experience—before scaling.

## 3. Goals and non-goals

### MVP goals
1. Prove that a narrowly defined group of members will pay for access to curated venues.
2. Prove that participating venues will list real, bookable capacity on commercially acceptable terms.
3. Support end-to-end discovery → availability → credit quote → booking → check-in → completion/cancellation.
4. Maintain an auditable record of every credit movement and every payment event.
5. Prevent double-booking and double-debit under concurrent requests.
6. Give operations/admin enough visibility to resolve issues without engineering intervention.
7. Deliver a distinctive, premium, responsive interface that works well on mobile browsers.

### Non-goals for the first live pilot
- Launching in multiple cities simultaneously.
- Building a social network, feed, messaging platform, loyalty marketplace or AI recommendation engine.
- Native iOS and Android applications before the web product proves retention and repeat usage.
- Microservices, Kubernetes, Kafka, a dedicated data warehouse, Redis locks or a custom search cluster.
- Unreviewed automated partner payouts or a user-to-user transferable / cash-redeemable stored-value wallet.
- Medical claims, health-data collection, biometric tracking or wearable integrations.
- Allowing the browser to decide prices, credits, payment status, cancellation eligibility or booking capacity.

## 4. Users and access roles

### 4.1 Member
Wants to discover activities near a preferred area, compare venues and time slots, understand membership value, book confidently, view upcoming/past bookings, and obtain support when a venue cannot honour a booking.

### 4.2 Venue partner / staff
Wants to create or update venue details, manage bookable slots/capacity, view valid bookings, scan or enter a booking code, and understand completed visits and settlement statements. Partner staff must only access their own partner organisation and assigned venues.

### 4.3 Operations / support admin
Wants to approve venues and listings, manage activity taxonomy, review bookings and exceptions, support members, handle disputes and reconcile payment/payout records. Admin actions affecting credits, money, booking status or partner access must be authenticated, role-gated and audited.

### 4.4 Platform administrator
Controls access, system settings and sensitive configuration. Use least privilege; avoid shared admin accounts.

## 5. Core member journey

1. **Landing / value explanation:** explain what members can do and how credits work without vague claims.
2. **Set area:** ask for locality or allow city/neighbourhood search. Do not force precise GPS permission just to browse.
3. **Explore:** filter by activity, location, date, time, distance and credit range. Show useful real availability, not fake counters.
4. **Venue detail:** show real images, facilities, activity duration, address, included items, credit price range, rules, cancellation deadline, partner/venue policies and accessible directions.
5. **Select slot:** fetch authoritative availability from the server. Show the quoted cost and its expiry if a temporary quote/hold is used.
6. **Confirm booking:** verify active membership/credit eligibility and capacity in a single authoritative server-side transaction. Do not trust client-provided price, balance or slot status.
7. **Confirmation:** show booking reference, date/time, venue, access instructions, cancellation deadline and QR/pass if implemented.
8. **Check-in:** venue staff or admin validates a short-lived, unguessable or cryptographically signed token. Never accept a booking ID alone as proof of check-in.
9. **Complete / cancel / no-show:** apply the documented policy and create the corresponding credit-ledger entries. Keep an event trail.
10. **Return:** show upcoming booking, remaining eligible credits / plan status and relevant recommendations only when grounded in user location or activity history.

## 6. Partner journey

1. Partner submits business and contact details; operations verifies legitimacy and agrees on commercial terms.
2. Operations records due-diligence/KYC status in an appropriately secured area. Do not collect Aadhaar or sensitive identity documents unless the chosen verification process, lawful basis and retention plan are reviewed.
3. Partner profile, venues and activity categories are created or approved.
4. Partner or authorized staff sets operating hours, capacity, bookable inventory and blackout periods. MVP may allow operations to manage inventory on the partner’s behalf.
5. Partner sees upcoming valid bookings and validates check-ins.
6. Finance/operations reconciles completed bookings against the signed commercial agreement, refund status and payment provider records before settlement.

## 7. MVP scope: must-have requirements

### P0 — required for any real-member pilot

**Identity and roles**
- Secure sign-in and sign-out; account recovery appropriate to chosen auth provider.
- Server-enforced member, partner-staff and admin roles.
- A member can only read/change their own profile and their own bookings; partner users can only manage explicitly assigned organisations/venues.

**Catalogue and discovery**
- Activity categories and curated venue listings.
- Venue list and detail pages with image, address/locality, operating notes, facilities, price/credit cost, booking rules and listing status.
- Search and filters that actually alter results. If availability is not yet integrated for a filter, do not present it as functional.
- “Sold out,” “not bookable,” closed and unavailable states.

**Inventory and booking**
- Slots are represented explicitly with start/end time, capacity, booking cutoff and status.
- Server-authoritative availability reads and atomic reservation.
- A booking stores immutable snapshots of the slot, venue display name, start/end time, credit cost and relevant policy version at confirmation time.
- Idempotent create-booking requests.
- Booking list, detail, cancellation eligibility and status.
- Check-in token/QR and staff check-in screen if QR is in the live pilot. If QR is deferred, use a secure staff-only booking lookup and manual check-in; do not display a decorative, non-functional QR.

**Credit / entitlement ledger**
- Credits/entitlements are integer quantities (no floats).
- Every grant, debit, refund, expiry, adjustment and reversal is represented by an immutable ledger entry with actor, reason, reference and idempotency key.
- Balance is derived from ledger data or updated transactionally alongside ledger entries. Never update a displayed balance without a corresponding auditable entry.
- Credit amount, expiry, restrictions, rollover and cancellation treatment are visible before payment/booking.
- Admin adjustments require a reason and audit event. No direct editing of historical ledger rows.

**Payments**
- Payment provider checkout/order creation occurs server-side.
- Payment success is recognised only after server-side provider verification and/or a verified provider webhook—not from a client redirect alone.
- Verified webhook handling is signature-checked, idempotent and tolerant of duplicate/out-of-order events.
- Failed/cancelled payment cannot issue credits. A payment cannot issue credits twice.
- Payment receipt/reference and support path are visible.

**Operations**
- Admin can approve/suspend venues, manage basic activity data and inspect a booking timeline.
- Admin can identify payment events not yet reconciled with a member entitlement.
- Admin can see partner attribution, booking completion status and settlement-relevant totals.
- Sensitive actions generate audit records.

**Design/accessibility**
- Responsive mobile-first UI, useful empty/loading/error states, keyboard focus, labels, readable contrast and reduced-motion support.
- No fake ratings, fake availability, fabricated testimonials, invented venue imagery presented as actual photography, or misleading scarcity.

### P1 — after successful manual pilot / based on evidence
- Partner self-serve onboarding and richer inventory tools.
- Membership renewal automation and subscription management, after payments/legal model is finalised.
- Waitlists, reminders, calendar links and user-facing support tickets.
- Locality map view and saved venues.
- More sophisticated credit pricing with controlled admin rules.
- Automated payout integration only after payment-provider / legal / accounting structure is confirmed.
- Mobile push notifications and native app.

### Later, only if metrics justify it
- Personalised discovery, churn/risk scoring, dynamic pricing optimisation, partner APIs, city expansion, advanced BI and integrations with venue POS systems.

## 8. Business model and entry/exit metering — decision framework

The proposed entry/exit pass scan is a hypothesis, not a settled pricing rule. It must be validated with members, venue operators, finance and counsel before any live-money launch. The core UX requirement is **predictable price before commitment**: scanning may measure usage, but must never create an uncapped or surprising debit.

### Models to compare in the pilot

1. **Fixed price per bookable experience** — best when the product has a defined slot/session (e.g. badminton court for 60 minutes, yoga class, swimming session with a venue-defined visit window). Easiest to explain, reconcile and support.
2. **Time-metered usage** — potentially suitable for open-ended gym visits where duration materially affects venue economics. Requires reliable start/end events, explicit rates, rounding rules, caps and a missed-checkout policy.
3. **Hybrid (recommended MVP hypothesis)** — use fixed, pre-quoted pricing for reservations/classes/courts; use metered duration only for categories where the partner’s commercial model and operations justify it. Before check-in, show the estimated debit and a hard maximum for the visit. Member must explicitly accept the rule. Pilot manually first.

Do not assume the hybrid model is final. Run a small concierge pilot and compare conversion, disputes, margin, partner acceptance and operational burden against fixed pricing.

### Metering rules that must be decided before implementation

- **Rate card:** server-owned versioned rate per venue/activity/time band, plus any taxes/fees that must be disclosed. No browser-calculated rate.
- **Quote:** before starting a metered visit, show the rate, billing increment/rounding, minimum charge, estimated duration cost and a hard maximum debit. If the maximum cannot be estimated safely, do not enable metering for that venue.
- **Start event:** authenticated member pass and venue identity; server timestamp is authoritative. A venue’s static QR identifies the venue, but does not alone prove a member is physically present. Use a short-lived signed session token or staff-side scan/confirmation to bind the member, venue and intended action.
- **End event:** record server timestamp and calculate final usage from the accepted rate-card version. Never trust device clock or client-supplied duration.
- **No checkout scan:** after a disclosed maximum duration, stop accruing at the pre-agreed cap and flag the visit for operational review. Never keep charging indefinitely. A later adjustment must be separately authorised, explained and ledgered; no silent back-charge.
- **Duplicate / replay:** idempotent scan event IDs; one active visit per eligible booking/member/venue policy; reject replayed or out-of-order events and create an audit event.
- **Lost network / scanner:** show a clear pending state. Any offline capture must be signed, time-bounded and reconciled with a documented conflict rule; do not trust device time. For MVP, prefer online validation plus a staff manual fallback rather than unverified local-storage queues.
- **Early exit / cancellation:** distinguish booked reservation cancellation, early departure, venue-initiated cancellation and a member leaving without checkout. The policy and credit outcome must be shown before booking/check-in.
- **Disputes:** retain event IDs, actor/device/staff identity, timestamps, rate-card version, quote, cap, calculated duration and ledger references. Restrict access and retention.
- **Partner settlement:** settlement uses validated completed usage and the signed partner agreement, not the UI’s displayed balance. Reconcile member debit, platform fee, partner amount, taxes, refunds and adjustments separately.

### Credit accounting principles

Credits are an internal product unit; their name does not establish legal treatment. Store integer units and a versioned pricing rule. The ledger is append-only; corrections are compensating entries, never historical edits. Persist the quoted rate-card version and maximum debit with the visit/booking. A debit cannot exceed the authorised cap without an explicit, separately approved adjustment flow.

Before accepting real payments, decide and document:
- Whether the customer buys membership entitlement, prepaid units, individual bookings, or a combination.
- Credit-to-price communication, taxes, payment-provider fees, refunds, cancellation, expiry, rollover, promotional restrictions and chargeback treatment.
- Contracting supplier for each activity, venue revenue share, no-show/cancellation compensation and settlement frequency.
- Who collects money and who is responsible for fulfilment, refunds and consumer complaints.

**Legal/finance gate:** obtain Indian legal/accounting advice on payment and marketplace structure, RBI/payment-provider implications, consumer disclosures, GST/invoicing, subscriptions/auto-renewal, settlement and privacy. Do not assume ordinary checkout or payout APIs permit pooled funds or split settlements.

### Prototyping defaults (not customer terms)

- All credit arithmetic uses integers; all time intervals use server timestamps in UTC and venue-local display time.
- Rate cards are versioned and effective-dated; old visits retain their accepted version.
- Fixed-price experiences must display the final debit before confirmation.
- Metered experiences must display rate + estimate + hard cap before check-in.
- No transfer or cash redemption unless counsel approves a different model.
- Expiry, rollover and promotional restrictions remain unset until policy approval; do not invent them in code.

## 9. Business rules and acceptance criteria

### Booking integrity
- A successful booking consumes exactly the quoted eligible credits and exactly one unit (or the defined capacity amount) of availability.
- For capacity `N`, concurrent requests cannot confirm more than `N` units.
- If the slot is unavailable or the user lacks eligible credits, no booking or debit is committed.
- Retrying an identical idempotency key returns the original outcome and never creates a duplicate booking/debit.
- Cancellation and refund of credits are committed atomically with the booking-state transition and ledger entry.
- A completed booking cannot be cancelled through the normal member flow.
- Status transitions are validated server-side; arbitrary status writes are forbidden.

### Payment integrity
- An unpaid, failed or unverified payment grants zero paid credits.
- Duplicate webhook delivery produces one financial effect.
- Mismatched amount, currency, order reference or user/order association is rejected and flagged.
- Payment-provider event records and ledger entries can be reconciled to a single external payment reference.

### Venue integrity
- Suspended/unapproved venues cannot receive new member bookings.
- Capacity cannot fall below already-confirmed occupancy without a deliberate exception workflow.
- Every change to a booked slot must preserve the confirmed booking snapshot and trigger an operations process for affected members.

### Acceptance examples
1. Two users race for the last slot: only one can confirm; the other sees an unavailable error and no credit debit.
2. User double-clicks “Confirm”: one booking and one debit only.
3. Provider sends the same captured-payment webhook twice: one entitlement grant only.
4. Cancellation allowed by policy: booking changes state and a ledger refund appears atomically; cancellation denied by policy: state and balance remain unchanged.
5. A partner user queries another partner’s booking URL: no private data is returned.
6. An admin changes a credit cost: new quotes use the new value; already-confirmed bookings retain their price snapshot.
7. Duplicate entry or exit scan requests create one event and one ledger effect only.
8. Missing exit scan never exceeds the disclosed hard cap; it creates a review flag rather than an uncapped debit.
9. Device clock manipulation does not change billable duration.
10. Network timeout after booking commit: retry with the same idempotency key returns the committed booking rather than charging again.

## 10. Success metrics and pilot gates

Track these as internal decision metrics; the proposed thresholds are founder-set hypotheses, not industry benchmarks.

**Supply metrics**
- Verified venues signed and actively bookable.
- Live bookable slots per venue per week.
- Percentage of partner inventory kept accurate.
- Partner response time and venue cancellation rate.

**Demand metrics**
- Qualified waitlist → paid conversion.
- First booking rate after purchase.
- Weekly active bookers and bookings per paying member.
- 30-day repeat usage / renewal intent.
- Search-to-detail, detail-to-quote and quote-to-book conversion.

**Economics**
- Net contribution per completed booking after partner share, PSP fee, credits/refunds, customer support and discounts.
- Member-level utilisation and liability under the proposed credit model.
- Acquisition cost vs observed contribution/retention; do not infer lifetime value from a handful of days.
- Venue incremental revenue and off-peak utilisation.

**Reliability / trust**
- Booking failure, duplicate booking and double-debit count (target: zero for confirmed incidents).
- Payment reconciliation exception rate.
- Cancellation/no-show rate, refund handling time and support resolution time.
- Partner-disputed check-ins and customer complaints.

### Pre-build validation gate
Do not start full product engineering until the founder has:
- Interviewed target users and venues in the same intended micro-market.
- Tested a specific proposed price/credit pack with real willingness-to-pay evidence, not only survey likes.
- Secured written pilot intent from an initial group of venues and agreed what inventory they will make available.
- Manually brokered sample bookings or run a concierge pilot to discover real operating edge cases.
- Built a basic per-booking contribution model and stress-tested high-usage members.
- Received legal/accounting review of the proposed collection, credits, refunds and partner settlement structure before real-money launch.

Initial working gates to tune after interviews: 10 committed partner venues, 30–50 qualified prospective members, and evidence of paid intent from a smaller first cohort. These are research gates, not a guarantee of product-market fit.

## 11. Launch strategy

- Choose **one city, one compact service area, and 2–3 well-supported launch categories** based on venue density and local demand.
- Start with curated supply and manually verified inventory rather than a large, stale catalogue.
- Prefer repeatable, bookable experiences where venue capacity and redemption can be verified.
- Avoid adding salons/spas or other service categories until partner operations, pricing and time-slot inventory are designed for those workflows.
- Use concierge support while early supply quality is being established.

## 12. Open decisions to resolve before paid launch

1. Launch city and first neighbourhood cluster.
2. First 2–3 activity categories and exact eligible products per category.
3. Pricing and entitlements: subscription vs packs vs pay-per-booking; renewals and expiry.
4. Commercial partner contract, cancellation/no-show allocation and payout formula.
5. Payment provider and legally reviewed collection/settlement flow.
6. Booking cut-off, instant confirmation vs partner approval and handling venue cancellations.
7. Credit valuation, unused-credit liability and refund policy.
8. Name, trademarks, domain and brand visual identity.
9. Customer service channel, hours and incident policy.
10. Terms, privacy notice, refund/cancellation disclosure, GST/accounting treatment and record retention.

Do not let Antigravity resolve these business/legal questions by silently choosing defaults. Keep them as explicit configuration and block production release when required decisions remain open.
