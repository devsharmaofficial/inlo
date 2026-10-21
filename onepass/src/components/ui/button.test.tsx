import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { Button } from "./button"

describe("Button", () => {
  it("renders with default props and handles click", async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Book session</Button>)

    const button = screen.getByRole("button", { name: "Book session" })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("disables interaction and sets aria-busy when loading", async () => {
    const handleClick = vi.fn()
    render(
      <Button loading onClick={handleClick}>
        Confirming...
      </Button>
    )

    const button = screen.getByRole("button", { name: "Confirming..." })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveAttribute("data-loading", "true")

    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it("renders with polymorphic Slot when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/explore">Explore now</a>
      </Button>
    )

    const link = screen.getByRole("link", { name: "Explore now" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/explore")
  })
})
