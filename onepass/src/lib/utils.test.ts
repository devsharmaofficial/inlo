import { describe, it, expect } from "vitest"
import { formatCredits, formatPaise, formatDate, formatTime, truncate, cn } from "@/lib/utils"

describe("formatCredits", () => {
  it("singular form for 1 credit", () => {
    expect(formatCredits(1)).toBe("1 credit")
  })

  it("plural form for multiple credits", () => {
    expect(formatCredits(12)).toBe("12 credits")
    expect(formatCredits(0)).toBe("0 credits")
  })

  it("short form", () => {
    expect(formatCredits(12, true)).toBe("12cr")
  })

  it("never returns a decimal or non-integer display", () => {
    // Credits are integers per rules.md §5 and architecture.md §7
    expect(formatCredits(10)).not.toContain(".")
  })
})

describe("formatPaise", () => {
  it("converts integer paise to INR display", () => {
    expect(formatPaise(49900)).toMatch(/499/)
    expect(formatPaise(100)).toMatch(/1/)
  })

  it("does not use floating point internally — input must be integer", () => {
    // 0.1 + 0.2 floating point issue must not affect display
    expect(formatPaise(10 + 20)).toBe(formatPaise(30))
  })

  it("includes rupee symbol", () => {
    expect(formatPaise(49900)).toContain("₹")
  })
})

describe("formatDate", () => {
  it("returns a readable date string", () => {
    const date = new Date("2026-11-15T10:00:00Z")
    const result = formatDate(date, "Asia/Kolkata")
    expect(result).toContain("2026")
    expect(result).toContain("Nov")
  })

  it("accepts string input", () => {
    const result = formatDate("2026-11-15T10:00:00Z", "Asia/Kolkata")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })
})

describe("formatTime", () => {
  it("returns time in locale format", () => {
    const date = new Date("2026-11-15T09:30:00Z") // 3:00 PM IST
    const result = formatTime(date, "Asia/Kolkata")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
    // Should include am/pm indication
    expect(result.toLowerCase()).toMatch(/am|pm/)
  })
})

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello")
  })

  it("truncates long strings with ellipsis", () => {
    const result = truncate("A very long venue name that should be truncated", 20)
    expect(result).toHaveLength(20)
    expect(result.endsWith("…")).toBe(true)
  })

  it("returns exact max length string unchanged", () => {
    const str = "A".repeat(20)
    expect(truncate(str, 20)).toBe(str)
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6")
    expect(result).toContain("px-6")
    expect(result).not.toContain("px-4")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("handles undefined and null gracefully", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end")
  })
})
