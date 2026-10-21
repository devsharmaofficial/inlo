# OnePass (Web Platform)

> **Working codename:** OnePass (subject to legal clearance and trademark registration).  
> **Target Market:** India (one Tier-1 city, dense neighbourhood cluster first).  
> **Status:** Phase 1 (Repository Foundation & Design System) complete.

OnePass is an asset-light, multi-activity membership and booking marketplace. A member purchases a membership or credit pack and books verified sessions across participating third-party venues (gyms, swimming pools, yoga studios, badminton courts, turf cricket) with clear upfront credit pricing, reliable capacity checks, and auditable ledger accounting.

---

## Architecture & Foundational Invariants

Follows the canonical architecture defined in `../architecture.md` and `../rules.md`:

1. **Server-Authoritative:** Server determines availability, capacity, pricing, eligibility, and state transitions. Client inputs are never trusted for financial or capacity calculations.
2. **Atomic Inventory & Ledger:** Bookings commit capacity reservation, booking record creation, and immutable credit ledger debit atomically in a single transactional boundary.
3. **Restrained Editorial Aesthetic:** Follows `../design.md` strictly (warm paper `#F7F7F2`, ink `#191B18`, electric chartreuse accent `#C8F169`, deep forest `#244638`, Manrope + Geist Mono). No generic AI gradients, glassmorphism, or placeholder mockups presented as real venues.
4. **No Fabricated Data:** We do not manufacture fake partner venues, fake user reviews, or artificial scarcity counters.

---

## Tech Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + Design Tokens defined centrally in `src/app/globals.css`
- **Primitives:** Radix UI primitives (`@radix-ui/react-*`), Lucide Icons
- **Testing:** Vitest + Testing Library (`@testing-library/react`, `@testing-library/jest-dom`)
- **Database / Auth:** PostgreSQL / Supabase candidate (isolated by domain abstractions)
- **Payments:** Razorpay / Cashfree candidate (strictly gated behind legal review in Phase 5)

---

## Directory Structure

```text
onepass/
├── docs/
│   └── adr/                 # Architecture Decision Records (e.g. ADR-001)
├── src/
│   ├── app/                 # Next.js App Router routes & layouts
│   │   ├── (auth)/          # Authentication shells
│   │   ├── account/         # Member account & settings
│   │   ├── admin/           # Admin portal route shells
│   │   ├── bookings/        # Member bookings list & detail [id]
│   │   ├── checkout/        # Checkout flow (gated)
│   │   ├── explore/         # Activity exploration & venue discovery
│   │   ├── membership/      # Membership plans & pricing
│   │   ├── partner/         # Partner portal & dashboard
│   │   ├── venues/          # Public venue details [slug]
│   │   ├── globals.css      # Design tokens & typography definitions
│   │   ├── layout.tsx       # Root layout (Manrope/Geist fonts, shell, nav)
│   │   ├── page.tsx         # Editorial marketing homepage
│   │   ├── error.tsx        # Resilient error boundary
│   │   └── not-found.tsx    # Branded 404 handler
│   ├── components/
│   │   ├── layout/          # SiteHeader, MobileBottomNav, SiteFooter, Logo
│   │   └── ui/              # Button, Badge, Card, Dialog, Input, Toast, EmptyState, Skeleton
│   ├── lib/
│   │   ├── constants.ts     # Routes, activities, business limits, labels
│   │   ├── env.ts           # Type-safe environment validation & feature flags
│   │   └── utils.ts         # Formatting (INR, IST date-time, credits) & class merging
│   └── test/
│       └── setup.ts         # Vitest & jest-dom configuration
├── vitest.config.mts        # Test runner configuration
└── tsconfig.json            # Strict TypeScript configuration
```

---

## Development Setup

### 1. Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### 2. Installation
```bash
cd onepass
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Review `.env.example` for details on database, payment, auth, and feature flags. All feature flags default to `false` for safety.

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Quality Commands

Every release gate and PR must pass these four checks cleanly with 0 errors and 0 warnings:

| Command | Purpose |
|---|---|
| `npm run type-check` | Verifies strict TypeScript types (`tsc --noEmit`) |
| `npm run lint` | ESLint verification of code standards and imports |
| `npm test` | Runs Vitest unit & integration test suite |
| `npm run build` | Verifies Next.js production compilation and static page generation |

---

## Build Phases

Refer to `../phases.md` for full release gates:
- **Phase 0:** Business Validation & Unit Economics (in progress)
- **Phase 1:** Repository Foundation & Design System (complete)
- **Phase 2:** Real Catalogue & Discovery (upcoming)
- **Phase 3:** Partner Inventory & Staff Access
- **Phase 4:** Booking Engine & Atomic Credit Ledger
- **Phase 5:** Payment Provider Sandbox & Entitlements
- **Phase 6:** Check-in, Operational Controls & Pilot Readiness
- **Phase 7:** Security, Privacy Compliance & Controlled Launch
