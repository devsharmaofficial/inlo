# OnePass — Build Phases & Release Gates

> **Operating model:** Antigravity builds one coherent vertical slice at a time. Do not ask it to generate the whole marketplace in one giant prompt. A phase is complete only when the code works in the browser, critical tests pass, and the gate is reviewed.

## Phase 0 — Business validation before software

**Status:** Must happen before meaningful product engineering.  
**Objective:** Reduce the risk of building a polished product without local supply, willingness to pay or workable unit economics.

### Work
- Pick a candidate Tier-1 city and micro-market using venue density, target-member concentration, transport radius and local competitor coverage.
- Interview target users about actual current behaviour, spend, activity frequency, convenience pain and preferred access model.
- Interview venue owners/managers about idle inventory, peak/off-peak capacity, margins, acceptable partner revenue share, customer acquisition and redemption workflow.
- Choose 2–3 pilot categories based on repeat use and operational feasibility.
- Build a competitor comparison from current public product flows and direct user/partner observations. Do not assume feature gaps without evidence.
- Manually match a small number of users to participating venues; record supply failures, change requests, cancellations, no-shows and support burden.
- Test exact offer/pricing language and collect meaningful paid-intent evidence.
- Create a simple contribution model by activity, booking, member utilisation and cancellation/refund scenario.
- Have legal/accounting counsel review membership/credit wording, payments, refunds, venue contracting, marketplace settlement, taxes and privacy before accepting real money.
- Finalise a pilot operations runbook and support contact.

### Deliverables
- ICP/member segment and initial neighbourhood.
- 2–3 chosen categories and explicit out-of-scope categories.
- Verified candidate venue list with inventory/terms status.
- Proposed pricing/credit unit model and scenario spreadsheet.
- Competitive positioning backed by evidence.
- Terms/refund/payout/legal question list and counsel feedback.
- Go/no-go decision signed by founder.

### Gate 0
Proceed only when there is real evidence of member demand, partner willingness, an initial supply cluster, and a feasible legal/financial operating model. A suggested research target is 10 committed venues and 30–50 qualified prospective members; these numbers are internal hypotheses and should be adapted to the market. If gate fails, revise the business wedge rather than building more features.

## Phase 1 — Repository foundation and design system

**Objective:** Establish a stable, branded, testable web application.

### Build
- Inspect existing repository first. Preserve existing working code, package manager and conventions unless a migration is intentional and documented.
- Set up Next.js App Router + TypeScript, lint/type-check/build scripts, environment schema and README.
- Implement `design.md` tokens, responsive shell, typography, button/input primitives, semantic status component, card primitives, modal/sheet, toast and loading/empty/error states.
- Set up member/partner/admin route shells, but do not expose privileged capabilities before role checks exist.
- Configure test framework and CI.
- Create a consistent layout at mobile and desktop widths; add a basic error boundary/not-found page.

### Acceptance
- Application runs locally using documented commands.
- Lint, type-check, tests and production build pass.
- Design tokens are centralised; no scattered duplicate palette/radius systems.
- Browser visual review at 360px and desktop; no overflow or placeholder components in the visible main flow.

## Phase 2 — Real catalogue and discovery

**Objective:** Users can find real pilot venues and understand a venue before booking.

### Build
- Database migrations for activity taxonomy, venues, venue activities and venue images.
- Admin-only creation/approval flow or seed script for curated pilot supply.
- Public explore page, search/filter, venue detail page and locality display.
- Listing status, approved-only filtering, missing-image fallback and accurate open/closed/availability messaging.
- Basic analytics events for view/search/filter/detail; review privacy notice/consent.

### Acceptance
- Search and filters change real server queries.
- Only approved venues show on public pages.
- No fabricated venue data or fake ratings.
- All key pages have loading, empty, not-found and error states.
- Mobile page interactions remain usable at 360px.

## Phase 3 — Partner inventory and staff access

**Objective:** The platform can publish accurate, bookable inventory and constrain partner access.

### Build
- Partner organisations, partner-member permissions and venue assignments.
- Operating hours/slots, capacity, booking cut-off, blackout and status.
- A limited partner portal for own venues only; or operations-managed inventory if self-serve is not needed in concierge pilot.
- Audit events for inventory/policy changes.

### Acceptance
- Partner A cannot read or edit Partner B’s venues, slots, bookings or statements (negative tests).
- Slots validate end time after start time, sensible capacity, duplicate times and booking cutoff.
- Inventory changes after a booking trigger a documented exception process.
- Admin can inspect who changed a slot and when.

## Phase 4 — Booking engine and credit ledger

**Objective:** Correctness before payments. Use seed/test credits in a staging environment.

### Build
- Database schema for slots, bookings, booking events, credit lots, immutable ledger and balance projection.
- Reviewed PostgreSQL transaction/RPC for atomic booking, credit consumption and capacity reservation.
- Member booking list/detail and cancellation flow under a test policy.
- Idempotency key handling; documented error codes.
- Staff/admin check-in workflow (QR can be phased in once secure validation is implemented).
- Concurrency and ledger reconciliation tests.

### Acceptance
- Two simultaneous attempts for the final capacity unit cannot both confirm.
- Repeating a booking request with the same idempotency key does not duplicate booking/debit.
- Insufficient credit or stale/unavailable slot leaves no partial side effect.
- Cancel/refund state transition and credit ledger effect are atomic.
- Any credit balance projection equals the eligible ledger balance after reconciliation.
- No critical mutation is trusted to the client.

## Phase 5 — Payment-provider sandbox and entitlements

**Prerequisite:** Legal/finance review has approved a payment/credit model and provider arrangement for the intended flow. If not approved, remain in sandbox/manual concierge testing.

### Build
- Server-side order creation for explicit product SKUs.
- Approved provider-hosted checkout flow.
- Webhook endpoint using raw-body signature verification, event inbox, unique event IDs and idempotent application.
- Payment status page that can handle pending, failed and delayed webhook cases.
- Provider reconciliation screen/report.
- Refund/chargeback scenario handling for the selected product model.

### Acceptance
- Fake browser success redirect never creates credits.
- Invalid webhook signature is rejected.
- Duplicate webhook creates exactly one credit grant.
- Mismatched amount/currency/order/user is rejected or flagged, never silently applied.
- Payment/order/ledger reference can be traced in one admin flow.
- Sandbox test cases cover captured, failed, duplicate, delayed and refunded outcomes.

## Phase 6 — Check-in, operational controls and pilot readiness

**Objective:** Help real bookings complete correctly at the venue.

### Build
- Secure single-use check-in QR/token or staff lookup.
- Check-in status, completed/no-show and venue-cancelled handling.
- Member confirmation and transactional notification flows.
- Support/incident flow for venue rejects booking, member no-show, slot change and payment dispute.
- Partner statement/reconciliation preview and controlled settlement export.
- Terms/privacy/cancellation pages and customer support entry point.

### Acceptance
- Token cannot be reused after successful check-in; invalid/expired/foreign-venue tokens are rejected.
- Member, partner and admin views display consistent booking state.
- Every exception has an owner and a way to resolve it without editing historical ledger rows.
- Settlement amounts are reconciled and exportable; live automated payouts stay disabled until separately approved.

## Phase 7 — Security, quality and controlled launch

### Build / verify
- Full role and row-level security review; automated negative authorisation tests.
- Rate limits and abuse tests for OTP, booking, check-in and admin operations.
- Dependency and secret scan; no secrets in git history or client bundle.
- Responsive and accessibility review, including reduced motion and keyboard-only navigation.
- Performance test key listing/slot endpoints and concurrent final-slot booking.
- Error monitoring, backups, restore test, migration rollback strategy and incident runbook.
- Reconciliation process and support staffing.
- Separate staging/prod keys, environment separation and production smoke tests.

### Launch gate
Launch only when the founder/legal/ops owners sign off on business terms, data/privacy handling, payment collection and partner settlement. Engineering sign-off requires no known critical security or transactional correctness issue, successful payment and booking test flows, monitoring, an operational support path and a way to pause new bookings.

## Phase 8 — Learn, stabilise, then expand

For the first pilot, measure a real cohort and review weekly:
- Search-to-book conversion and repeat booking rate.
- Availability accuracy, venue cancellations, no-show and complaint rate.
- Gross booking amount, partner share, PSP fee, refunds/discounts and net contribution.
- Member utilisation/credit liability and partner incremental revenue.
- Engineering incidents, webhook reconciliation exceptions and support time.

Only prioritise features tied to observed failure or unmet demand. Add categories and geographic areas one at a time after proving operational repeatability in the first micro-market.

## Antigravity execution protocol for every phase

1. Read `prd.md`, `design.md`, `architecture.md`, `rules.md` and `memory.md` before editing.
2. Inspect the current repo and report relevant existing patterns before making structural changes.
3. Propose a short file-level plan and identify any blocking product/legal decision.
4. Implement only the current phase and preserve working paths outside scope.
5. Add/update tests with the feature; never defer all tests to the end.
6. Run lint, type-check, unit/integration tests and build; fix failures caused by this change.
7. Launch the app and inspect the UI in a real browser at mobile and desktop sizes for UI work.
8. Summarise files changed, behaviour implemented, commands/test results, known limitations and decisions needing founder input.
9. Update `memory.md` with durable decisions; never claim a manual check occurred unless it actually did.

Do not skip Phase 0 because vibe coding makes implementation fast. In this business, supply and unit economics are at least as risky as code.
