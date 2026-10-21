# ADR-001: Technology Stack Selection

**Date:** 2026-10-20  
**Status:** Proposed (subject to vendor/region review as noted)  
**Decision owner:** Founder / CTO  
**Reversibility:** Medium — migration cost increases as the codebase grows  

## Context

OnePass is a multi-activity membership marketplace targeting India, starting with one Tier-1 city.
The technical architecture must support:
- Server-authoritative booking and credit transactions (correctness > throughput)
- Relational constraints for inventory, bookings and credit ledger
- Managed auth and payments (avoid custom infrastructure)
- A small engineering team at MVP stage
- Regulated market considerations (India DPDP, RBI, GST)

## Decision

Follow the recommendations in `architecture.md §1`:

| Layer | Decision | Notes |
|---|---|---|
| Web framework | Next.js App Router + TypeScript | Server rendering, shared code, route handlers for privileged logic |
| Styling | Tailwind CSS v4 + shadcn/ui primitives | Token-based, customised per `design.md` |
| Database | Managed PostgreSQL — Supabase candidate | ACID, RLS, constraints; not yet provisioned |
| Auth | Managed auth — Supabase Auth candidate | OTP India delivery must be tested before live |
| Payments | Razorpay or Cashfree | Not final; requires legal/finance gate before Phase 5 |
| Hosting | Vercel candidate | Environment/data-region decisions pending vendor review |
| Email | Resend candidate | |
| Tests | Vitest + Testing Library + Playwright | |

## Consequences

**Positive**
- Modular monolith avoids premature distribution complexity
- PostgreSQL transactions can enforce the booking/credit atomic invariants from day one
- Managed auth and payments avoid re-implementing security-critical infrastructure
- Vercel/Supabase reduce ops overhead for a small team

**Negative / risks**
- Supabase and Vercel are vendor-specific; migration costs grow over time
- Data region and DPDP compliance for managed vendors must be confirmed with counsel
- India OTP delivery reliability and cost must be tested before live launch
- Payment provider flows must match the approved commercial/legal structure

## Alternatives considered

- Custom PostgreSQL on EC2: more control, higher ops cost for MVP
- Planetscale/MySQL: lower relational integrity guarantees for ledger
- Remix: similar capability to Next.js; Next.js has broader ecosystem
- Self-hosted auth: rejected — security maintenance cost too high for MVP

## Related open decisions

- ADR-002: Payment provider (blocked on legal gate)
- ADR-004: Auth provider and OTP India testing
- ADR-005: Hosting region and data processing compliance
