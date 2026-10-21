# OnePass — Pilot Launch & Operational Runbook

> **Document Type:** Canonical Operational Runbook  
> **Market:** Bengaluru Pilot Cluster 1 (Indiranagar · Domlur · Koramangala)  
> **Target Cohort:** 20 Verified Beta Members & 5 Initial Partner Venues  
> **Last Updated:** 21 October 2026  

---

## 1. Pre-Flight Verification & Release Gates

Before opening bookings to the 20-member beta cohort, the operations lead must verify:

| Gate | Check Item | Verification Command / URL | Responsible | Status |
| :--- | :--- | :--- | :--- | :--- |
| **G1** | TypeScript & Lint | `npm run type-check && npm run lint` | Tech Lead | PASS (0 errors) |
| **G2** | Unit & Integration Tests | `npm test` (all 80+ tests green) | Tech Lead | PASS (80/80 passed) |
| **G3** | Next.js Production Build | `npm run build` (32 routes optimized) | Tech Lead | PASS |
| **G4** | Health API Readiness | `GET /api/health` | Ops Lead | PASS (`status: healthy`) |
| **G5** | Pilot Seed Venues | `/admin/venues` (The Hub, AquaLife, Iron & Movement, Prana Shala, Veloce) | Ops Lead | PASS (5 approved) |
| **G6** | Emergency Kill-Switch | `/admin/controls` (toggle verified in test) | Ops Lead | PASS |
| **G7** | Ledger Zero-Drift | `reconcileCreditBalance()` (Drift = ₹0.00) | Finance Lead | PASS |
| **G8** | Legal Compliance | `/legal/terms`, `/legal/privacy`, `/legal/cancellations` active | Legal Lead | PASS |

---

## 2. 20-Member Beta Cohort Onboarding SOP

### 2.1 Cohort Selection Criteria
- **Residency:** Living or working within 3 km of Indiranagar / Domlur / Koramangala.
- **Activity Interests:** Minimum 2 distinct activities (e.g., Badminton + Swimming, or Gym + Yoga).
- **Commitment:** Agrees to book at least 2 sessions per week during the 14-day pilot and share feedback.

### 2.2 Onboarding Workflow
1. **Welcome Message (WhatsApp / Email):**
   - Send unique login link to member’s registered mobile number.
   - Explain OnePass Paper & Ink concept: *"One membership, zero lock-in, seamless court access."*
2. **Initial Credit Allocation:**
   - Grant 50 OnePass credits (Active Pack equivalent, retail ₹4,999) via Admin Ledger.
   - Idempotency key format: `pilot-grant-usr-pilot-XXX-w1`.
3. **First Booking Concierge Support:**
   - Encourage member to browse `/explore` and book a slot.
   - Inform member of the **2-hour cancellation rule** (100% credit refund if cancelled > 2h before session).

---

## 3. Venue Partner Front-Desk Drill & SOP

### 3.1 Partner Venues
1. **The Hub Sports Arena** (Domlur) — Badminton (4 courts)
2. **AquaLife Aquatic Centre** (Indiranagar) — Swimming (2 lanes)
3. **Iron & Movement Club** (Koramangala 4th Block) — Gym & Functional
4. **Prana Shala** (Indiranagar) — Yoga & Meditation
5. **Veloce Badminton Hub** (Domlur) — Badminton (3 courts)

### 3.2 Front-Desk Check-in Protocol
- **Staff URL:** [`https://onepass.club/partner/checkin`](https://onepass.club/partner/checkin)
- **Equipment:** Venue smartphone or reception tablet.
- **Verification Steps:**
  1. Ask arriving member for their 6-character check-in code or digital pass screen from [`/bookings/[id]`](https://onepass.club/bookings).
  2. Enter code into Partner Check-in Desk.
  3. Verify green confirmation banner: *"Pass Confirmed · Entry Approved"*.
  4. Admit member to court / facility.
  5. The pass token is cryptographically invalidated immediately; it cannot be reused.

### 3.3 Check-in Exception Handling
- **Pass Denied / Expired:** If red banner appears (*"Admission Denied"*), verify booking time on member's phone. If slot is for tomorrow or wrong venue, direct member gently.
- **Offline / Connectivity Glitch:** Staff calls OnePass Concierge (+91 80 4920 1100). Operations lead performs manual lookup on `/admin/bookings` and logs manual entry with reason.

---

## 4. Daily Operational Cadence

### 4.1 Morning Inspection (09:00 IST)
- [ ] Check `/api/health` and verify system status is `healthy`.
- [ ] Review `/admin/bookings` for today’s upcoming sessions across all 5 venues.
- [ ] Check Bengaluru weather forecast (monsoon rain warnings for outdoor/semi-covered venues).
- [ ] Ping WhatsApp operations group to confirm all front desks have tablet powered on.

### 4.2 Evening Reconciliation (21:00 IST)
- [ ] Review check-in completion rate on `/admin/pilot`.
- [ ] Investigate any no-shows: confirm member did not attend and verify credits were cleanly forfeited.
- [ ] Verify zero webhook exceptions and zero ledger drift (`ledgerDriftRupees === 0`).
- [ ] Answer pending support tickets on `/support` (SLA: < 60 minutes).

---

## 5. Emergency Circuit Breakers & Incident Runbook

### 5.1 Triggering the Emergency Booking Kill-Switch
If a venue experiences flooding, court damage, power failure, or severe monsoon disruption:
1. Navigate to [`/admin/controls`](https://onepass.club/admin/controls).
2. Enter descriptive reason (e.g., *"Indiranagar heavy flooding; outdoor courts held for member safety"*).
3. Click **"Pause New Bookings"**.
4. **Impact:**
   - New slot bookings are immediately blocked with `BookingsPausedError`.
   - The amber operational banner appears across all member pages.
   - **Crucially:** Existing cancellations, refunds, and partner check-ins remain 100% active.
5. Once situation normalizes, click **"Resume All Bookings"**.

### 5.2 Venue-Initiated Cancellation Protocol
If a partner must close for maintenance:
1. Operations lead triggers slot cancellation in `/admin/venues`.
2. Atomic system execution automatically refunds 100% credits to affected members.
3. WhatsApp notification dispatched with complimentary 5 credit apology voucher.

---

## 6. Weekly Financial Settlement SOP

- **Cycle:** Weekly settlement every Monday for sessions completed Monday–Sunday of the prior week.
- **Disbursement Rate:** Flat ₹70.00 per redeemed credit (no hidden deductions).
- **Procedure:**
  1. Navigate to [`/partner/statements`](https://onepass.club/partner/statements).
  2. Verify total redeemed credits match physical check-in count.
  3. Export reconciled statement CSV.
  4. Cross-check against `/admin/ledger`.
  5. Initiate NEFT/IMPS payout via bank beneficiary portal.
  6. Update statement status to `DISBURSED` with bank UTR number.

---

## 7. Pilot Success Milestones & Expansion Gates

Review every Sunday with the founding team on [`/admin/pilot`](https://onepass.club/admin/pilot):

| Metric | Phase 8 Target | Scale Gate (to Cluster 2) |
| :--- | :--- | :--- |
| **Search-to-Book Conversion** | > 12.0% | ≥ 15.0% |
| **Repeat Booking Rate** | > 60.0% | ≥ 70.0% |
| **Slot Availability Accuracy** | > 98.0% | ≥ 99.0% |
| **Venue Cancellations** | < 1.0% | < 0.5% |
| **Support Complaint Rate** | < 2.0% | < 1.0% |
| **Net Contribution Margin** | > 20.0% | ≥ 25.0% |

*Do not expand beyond Indiranagar · Domlur · Koramangala until all 6 Scale Gates are satisfied for 3 consecutive weeks.*
