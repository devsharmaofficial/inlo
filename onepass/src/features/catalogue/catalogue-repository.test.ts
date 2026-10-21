import { describe, it, expect } from "vitest"
import {
  getApprovedVenues,
  getVenueBySlug,
  getActivities,
  getLocalities,
} from "./catalogue-repository"

describe("catalogue-repository", () => {
  it("returns all approved venues when no filter is provided", async () => {
    const venues = await getApprovedVenues()
    expect(venues.length).toBeGreaterThan(0)
    // Verify all have slugs and names
    for (const v of venues) {
      expect(v.slug).toBeTruthy()
      expect(v.name).toBeTruthy()
      expect(v.minCredits).toBeGreaterThan(0)
    }
  })

  it("filters venues by activity correctly", async () => {
    const swimmingVenues = await getApprovedVenues({ activity: "swimming" })
    expect(swimmingVenues.length).toBe(1)
    expect(swimmingVenues[0].name).toContain("AquaLife")
  })

  it("filters venues by locality correctly", async () => {
    const koramangalaVenues = await getApprovedVenues({ locality: "Koramangala" })
    expect(koramangalaVenues.length).toBe(2)
    for (const v of koramangalaVenues) {
      expect(v.locality).toBe("Koramangala")
    }
  })

  it("performs multi-term query search correctly", async () => {
    const searchResults = await getApprovedVenues({ query: "badminton" })
    expect(searchResults.length).toBeGreaterThanOrEqual(2)
  })

  it("returns empty array when query does not match any venue", async () => {
    const searchResults = await getApprovedVenues({ query: "nonexistent-query-xyz" })
    expect(searchResults).toEqual([])
  })

  it("retrieves venue detail by slug", async () => {
    const venue = await getVenueBySlug("the-hub-sports-arena")
    expect(venue).not.toBeNull()
    expect(venue?.name).toBe("The Hub Sports Arena")
    expect(venue?.offerings.length).toBeGreaterThan(0)
    expect(venue?.rules.length).toBeGreaterThan(0)
  })

  it("returns null for non-existent venue slug", async () => {
    const venue = await getVenueBySlug("unknown-venue-slug")
    expect(venue).toBeNull()
  })

  it("returns active activities and unique localities", async () => {
    const activities = await getActivities()
    expect(activities.length).toBe(4)

    const localities = await getLocalities()
    expect(localities).toContain("Indiranagar")
    expect(localities).toContain("Koramangala")
    expect(localities).toContain("Domlur")
  })
})
