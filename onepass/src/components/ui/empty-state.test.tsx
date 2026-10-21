import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { EmptyState } from "./empty-state"
import { Search } from "lucide-react"

describe("EmptyState", () => {
  it("renders title and description properly", () => {
    render(
      <EmptyState
        title="No badminton slots found"
        description="Try expanding your radius or checking another day."
        icon={Search}
        action={<button>Reset filters</button>}
      />
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByText("No badminton slots found")).toBeInTheDocument()
    expect(
      screen.getByText("Try expanding your radius or checking another day.")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reset filters" })).toBeInTheDocument()
  })

  it("renders with polite aria-live attribute for accessibility", () => {
    render(<EmptyState title="No upcoming bookings" />)
    const element = screen.getByRole("status")
    expect(element).toHaveAttribute("aria-live", "polite")
  })
})
