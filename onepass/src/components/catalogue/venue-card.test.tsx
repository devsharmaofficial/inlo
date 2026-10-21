import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { VenueCard } from "./venue-card"
import type { VenueCardData } from "@/types/catalogue"

const sampleVenue: VenueCardData = {
  id: "test-venue-1",
  slug: "test-sports-arena",
  name: "Test Sports Arena",
  locality: "Indiranagar",
  city: "Bengaluru",
  shortDescription: "Quality indoor badminton courts.",
  minCredits: 14,
  maxCredits: 18,
  featured: true,
  amenities: ["Wooden courts", "Showers"],
  activities: [
    { name: "Badminton", slug: "badminton", creditCost: 14 },
    { name: "Swimming", slug: "swimming", creditCost: 18 },
  ],
}

describe("VenueCard", () => {
  it("renders venue name, locality, and credit price accurately", () => {
    render(<VenueCard venue={sampleVenue} />)

    expect(screen.getByText("Test Sports Arena")).toBeInTheDocument()
    expect(screen.getByText("Indiranagar, Bengaluru")).toBeInTheDocument()
    expect(screen.getByText("14")).toBeInTheDocument()
    expect(screen.getByText("–18 credits")).toBeInTheDocument()
  })

  it("links to the correct venue detail slug URL", () => {
    render(<VenueCard venue={sampleVenue} />)

    const link = screen.getByRole("link", { name: "Test Sports Arena" })
    expect(link).toHaveAttribute("href", "/venues/test-sports-arena")
  })

  it("displays featured badge when venue is featured", () => {
    render(<VenueCard venue={sampleVenue} />)
    expect(screen.getByText("Featured")).toBeInTheDocument()
  })

  it("displays activity tags for offered sports", () => {
    render(<VenueCard venue={sampleVenue} />)
    expect(screen.getByText("Badminton")).toBeInTheDocument()
    expect(screen.getByText("Swimming")).toBeInTheDocument()
  })
})
