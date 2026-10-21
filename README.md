# OnePass (India Pilot)

> **Multi-Activity Membership & Booking Marketplace**  
> Curated fitness, sports, recreation, and wellness venues across Bengaluru (Indiranagar · Domlur · Koramangala).

[![CI](https://github.com/devsharmaofficial/onepass/actions/workflows/ci.yml/badge.svg)](https://github.com/devsharmaofficial/onepass/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-80%20passing-brightgreen?logo=vitest)](https://vitest.dev/)

---

## 1. Overview

OnePass is an asset-light, multi-activity marketplace for Tier-1 Indian cities. Members purchase prepaid credit packs and redeem credits across participating high-quality gyms, swimming pools, badminton courts, and yoga shalas without long-term single-venue lock-ins.

### Core Principles
1. **Density over sprawl:** One dense micro-market (Bengaluru East: Indiranagar, Domlur, Koramangala) before citywide expansion.
2. **Transparent entitlements:** Real court slots, upfront cancellation cutoffs (2-hour free refund), no dark patterns.
3. **Double-entry accounting:** Append-only credit ledger with zero balance drift.
4. **Single-use pass tokens:** Cryptographically randomized, immediate invalidation at partner desks.
5. **Operational circuit breaker:** Immediate emergency booking kill-switch in admin controls.

---

## 2. Architecture & Tech Stack

- **Frontend & Routing:** Next.js 16 (App Router) + React + TypeScript + Turbopack
- **Design System:** Paper & Ink (`#F7F7F2` canvas, `#191B18` ink text, `#244638` forest green, `#C8F169` chartreuse accent)
- **Database Migrations:** PostgreSQL schemas (`001_catalogue.sql` to `004_membership_payments.sql`)
- **Payments & Webhooks:** Server-side orders, HMAC-SHA256 signature verification, idempotent event inbox
- **Automated Verification:** 80 unit & integration tests in Vitest across 14 test suites
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 3. Directory Structure

```text
Pass_project/
├── .github/workflows/ci.yml     # Automated CI verification pipeline
├── architecture.md              # Technical specifications & data models
├── design.md                    # Paper & Ink design system tokens
├── memory.md                    # Project state, phase logs & invariants
├── phases.md                    # Canonical 8-phase execution roadmap
├── prd.md                       # Product requirements & business context
├── rules.md                     # Engineering & security guidelines
├── runbook.md                   # Operational launch SOP & partner briefing
├── onepass/                     # Next.js 16 application
│   ├── src/
│   │   ├── app/                 # App Router (33 routes)
│   │   │   ├── (public)         # Explore, Venue detail, Membership, Checkout
│   │   │   ├── admin/           # Pilot KPIs, Bookings, Venues, Ledger, Controls
│   │   │   ├── partner/         # Check-in desk, Statements, Reservations
│   │   │   ├── legal/           # Terms, Privacy (DPDP 2023), Cancellations
│   │   │   └── api/             # Webhooks, Health, Checkout simulation
│   │   ├── components/          # UI primitives, cards, dialogs, layouts
│   │   ├── features/            # Booking engine, ledger, inventory, payments
│   │   ├── types/               # TypeScript domain interfaces
│   │   └── lib/                 # Utils, constants, env validation
│   ├── package.json
│   └── next.config.ts
```

---

## 4. Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup & Run
```bash
# Navigate to application
cd onepass

# Install dependencies
npm install

# Run local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification
```bash
# Type check
npm run type-check

# ESLint
npm run lint

# Test suite (80 tests)
npm test

# Production build
npm run build
```

---

## 5. Phase 8 Operational Controls

- **Pilot Dashboard:** [`/admin/pilot`](http://localhost:3000/admin/pilot) — real cohort metrics, search-to-book conversion, category utilization, and net contribution.
- **Emergency Circuit Breaker:** [`/admin/controls`](http://localhost:3000/admin/controls) — one-click platform booking pause during weather emergencies.
- **Staff Check-In Desk:** [`/partner/checkin`](http://localhost:3000/partner/checkin) — instant single-use QR pass invalidation.
- **Health Diagnostic Endpoint:** [`/api/health`](http://localhost:3000/api/health) — uptime and ledger invariant audit.
- **Operational SOP:** See [`runbook.md`](./runbook.md) for launch runbook.

---

## 6. License
Private & Confidential — OnePass Technologies Private Limited.
