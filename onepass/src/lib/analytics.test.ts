import { describe, it, expect, vi } from "vitest"
import { trackEvent } from "./analytics"

describe("analytics", () => {
  it("tracks events safely without throwing", () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})

    expect(() => {
      trackEvent("catalogue_search", { query: "badminton", resultsCount: 2 })
    }).not.toThrow()

    consoleSpy.mockRestore()
  })
})
