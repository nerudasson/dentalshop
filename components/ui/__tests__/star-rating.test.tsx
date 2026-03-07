import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StarRating from "../star-rating"

describe("StarRating", () => {
  it("renders correct aria-label", () => {
    render(<StarRating rating={4.3} />)
    expect(screen.getByLabelText("4.3 out of 5 stars")).toBeInTheDocument()
  })

  it("renders 5 stars by default", () => {
    const { container } = render(<StarRating rating={3} />)
    // 5 children (Star icons or SVGs)
    const stars = container.firstChild?.childNodes
    expect(stars?.length).toBe(5)
  })

  it("renders custom max stars", () => {
    const { container } = render(<StarRating rating={2} max={3} />)
    const stars = container.firstChild?.childNodes
    expect(stars?.length).toBe(3)
  })

  it("uses correct aria-label with custom max", () => {
    render(<StarRating rating={2} max={3} />)
    expect(screen.getByLabelText("2 out of 3 stars")).toBeInTheDocument()
  })
})
