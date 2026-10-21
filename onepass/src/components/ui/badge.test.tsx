import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Badge } from "./badge"

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Active</Badge>)
    const badge = screen.getByText("Active")
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain("bg-[--color-surface-muted]")
  })

  it("applies semantic variant classes", () => {
    render(<Badge variant="success">Confirmed</Badge>)
    const badge = screen.getByText("Confirmed")
    expect(badge.className).toContain("text-[--color-success]")
  })
})
