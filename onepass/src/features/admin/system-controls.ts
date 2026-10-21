/**
 * System Controls & Emergency Kill-Switch Service
 *
 * Operational safety mechanism as required by phases.md (Phase 7 launch gate & Phase 8):
 * - "Engineering sign-off requires... a way to pause new bookings."
 * - Allows platform administrators to temporarily halt all slot reservations
 *   (e.g., monsoon downpours, venue power outages, or emergency incident reviews)
 *   while keeping member check-in, cancellations, and refunds active.
 */

export interface SystemControlsState {
  isBookingsPaused: boolean
  pauseReason: string | null
  pausedAt: string | null
  pausedBy: string | null
  maintenanceNotice: string | null
  updatedAt: string
}

export interface PilotCohortMember {
  id: string
  name: string
  phone: string
  locality: string
  joinedAt: string
  creditsAllocated: number
  creditsUsed: number
  bookingsCount: number
  checkinsCount: number
  status: "active" | "invited" | "churned"
}

// Initial state: system active, pilot running smoothly
let systemControls: SystemControlsState = {
  isBookingsPaused: false,
  pauseReason: null,
  pausedAt: null,
  pausedBy: null,
  maintenanceNotice: null,
  updatedAt: new Date().toISOString(),
}

// Canonical 20-member beta cohort for Bengaluru Tier-1 pilot
const PILOT_COHORT_SEED: PilotCohortMember[] = [
  {
    id: "usr-pilot-001",
    name: "Arjun Verma",
    phone: "+91 98450 11201",
    locality: "Indiranagar",
    joinedAt: "2026-10-15T09:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 36,
    bookingsCount: 4,
    checkinsCount: 4,
    status: "active",
  },
  {
    id: "usr-pilot-002",
    name: "Pooja Hegde",
    phone: "+91 98450 11202",
    locality: "Indiranagar",
    joinedAt: "2026-10-15T10:30:00Z",
    creditsAllocated: 50,
    creditsUsed: 18,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-003",
    name: "Vikram Kamath",
    phone: "+91 98450 11203",
    locality: "Domlur",
    joinedAt: "2026-10-15T11:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 42,
    bookingsCount: 5,
    checkinsCount: 5,
    status: "active",
  },
  {
    id: "usr-pilot-004",
    name: "Ananya Rao",
    phone: "+91 98450 11204",
    locality: "Domlur",
    joinedAt: "2026-10-16T08:15:00Z",
    creditsAllocated: 50,
    creditsUsed: 27,
    bookingsCount: 3,
    checkinsCount: 3,
    status: "active",
  },
  {
    id: "usr-pilot-005",
    name: "Rohan Deshmukh",
    phone: "+91 98450 11205",
    locality: "Koramangala 4th Block",
    joinedAt: "2026-10-16T14:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 28,
    bookingsCount: 3,
    checkinsCount: 3,
    status: "active",
  },
  {
    id: "usr-pilot-006",
    name: "Sneha Nair",
    phone: "+91 98450 11206",
    locality: "Koramangala 1st Block",
    joinedAt: "2026-10-16T16:20:00Z",
    creditsAllocated: 50,
    creditsUsed: 36,
    bookingsCount: 4,
    checkinsCount: 4,
    status: "active",
  },
  {
    id: "usr-pilot-007",
    name: "Karthik Sundaram",
    phone: "+91 98450 11207",
    locality: "Indiranagar",
    joinedAt: "2026-10-17T09:45:00Z",
    creditsAllocated: 50,
    creditsUsed: 14,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-008",
    name: "Divya Krishnan",
    phone: "+91 98450 11208",
    locality: "Domlur",
    joinedAt: "2026-10-17T11:10:00Z",
    creditsAllocated: 50,
    creditsUsed: 18,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-009",
    name: "Aditya Menon",
    phone: "+91 98450 11209",
    locality: "Koramangala 6th Block",
    joinedAt: "2026-10-17T17:30:00Z",
    creditsAllocated: 50,
    creditsUsed: 21,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-010",
    name: "Ritu Nambiar",
    phone: "+91 98450 11210",
    locality: "Indiranagar",
    joinedAt: "2026-10-18T08:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 12,
    bookingsCount: 2,
    checkinsCount: 1, // 1 upcoming
    status: "active",
  },
  {
    id: "usr-pilot-011",
    name: "Siddharth Gupta",
    phone: "+91 98450 11211",
    locality: "Indiranagar",
    joinedAt: "2026-10-18T10:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 18,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-012",
    name: "Meera Subramanian",
    phone: "+91 98450 11212",
    locality: "Domlur",
    joinedAt: "2026-10-18T13:45:00Z",
    creditsAllocated: 50,
    creditsUsed: 9,
    bookingsCount: 1,
    checkinsCount: 1,
    status: "active",
  },
  {
    id: "usr-pilot-013",
    name: "Varun Kulkarni",
    phone: "+91 98450 11213",
    locality: "Koramangala 4th Block",
    joinedAt: "2026-10-19T07:30:00Z",
    creditsAllocated: 50,
    creditsUsed: 18,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-014",
    name: "Tanvi Saxena",
    phone: "+91 98450 11214",
    locality: "Indiranagar",
    joinedAt: "2026-10-19T11:20:00Z",
    creditsAllocated: 50,
    creditsUsed: 27,
    bookingsCount: 3,
    checkinsCount: 3,
    status: "active",
  },
  {
    id: "usr-pilot-015",
    name: "Harish Pillai",
    phone: "+91 98450 11215",
    locality: "Domlur",
    joinedAt: "2026-10-19T15:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 9,
    bookingsCount: 1,
    checkinsCount: 1,
    status: "active",
  },
  {
    id: "usr-pilot-016",
    name: "Shruti Joshi",
    phone: "+91 98450 11216",
    locality: "Indiranagar",
    joinedAt: "2026-10-20T09:10:00Z",
    creditsAllocated: 50,
    creditsUsed: 14,
    bookingsCount: 2,
    checkinsCount: 1, // 1 upcoming
    status: "active",
  },
  {
    id: "usr-pilot-017",
    name: "Naveen Reddy",
    phone: "+91 98450 11217",
    locality: "Koramangala 3rd Block",
    joinedAt: "2026-10-20T12:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 9,
    bookingsCount: 1,
    checkinsCount: 1,
    status: "active",
  },
  {
    id: "usr-pilot-018",
    name: "Tara Mathew",
    phone: "+91 98450 11218",
    locality: "Indiranagar",
    joinedAt: "2026-10-20T16:30:00Z",
    creditsAllocated: 50,
    creditsUsed: 18,
    bookingsCount: 2,
    checkinsCount: 2,
    status: "active",
  },
  {
    id: "usr-pilot-019",
    name: "Farhan Ali",
    phone: "+91 98450 11219",
    locality: "Domlur",
    joinedAt: "2026-10-21T07:00:00Z",
    creditsAllocated: 50,
    creditsUsed: 0,
    bookingsCount: 0,
    checkinsCount: 0,
    status: "invited",
  },
  {
    id: "usr-pilot-020",
    name: "Lavanya Seth",
    phone: "+91 98450 11220",
    locality: "Koramangala 5th Block",
    joinedAt: "2026-10-21T07:30:00Z",
    creditsAllocated: 50,
    creditsUsed: 0,
    bookingsCount: 0,
    checkinsCount: 0,
    status: "invited",
  },
]

/**
 * Returns current system controls state.
 */
export function getSystemControls(): SystemControlsState {
  return { ...systemControls }
}

/**
 * Toggles emergency booking kill-switch.
 * When paused, members cannot reserve new slots, but existing check-ins and cancellations remain functional.
 */
export function setBookingsPaused(
  paused: boolean,
  reason?: string,
  adminId = "adm-lead-blr"
): SystemControlsState {
  systemControls = {
    ...systemControls,
    isBookingsPaused: paused,
    pauseReason: paused ? reason || "New bookings paused by operations team." : null,
    pausedAt: paused ? new Date().toISOString() : null,
    pausedBy: paused ? adminId : null,
    updatedAt: new Date().toISOString(),
  }
  return { ...systemControls }
}

/**
 * Sets optional public maintenance notice banner.
 */
export function setMaintenanceNotice(notice: string | null): SystemControlsState {
  systemControls = {
    ...systemControls,
    maintenanceNotice: notice,
    updatedAt: new Date().toISOString(),
  }
  return { ...systemControls }
}

/**
 * Returns the tracked 20-member pilot cohort with usage statistics.
 */
export function getPilotCohort(): PilotCohortMember[] {
  return [...PILOT_COHORT_SEED]
}

/**
 * Reset helper for unit testing.
 */
export function _resetSystemControlsForTest(): void {
  systemControls = {
    isBookingsPaused: false,
    pauseReason: null,
    pausedAt: null,
    pausedBy: null,
    maintenanceNotice: null,
    updatedAt: new Date().toISOString(),
  }
}
