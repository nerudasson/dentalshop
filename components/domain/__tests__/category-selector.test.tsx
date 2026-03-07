import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CategorySelector from "../category-selector"

describe("CategorySelector", () => {
  it("renders all 7 categories", () => {
    render(<CategorySelector value={null} onChange={() => {}} />)
    expect(screen.getByText("Crowns")).toBeInTheDocument()
    expect(screen.getByText("Bridges")).toBeInTheDocument()
    expect(screen.getByText("Inlays / Onlays")).toBeInTheDocument()
    expect(screen.getByText("Implant Abutments")).toBeInTheDocument()
    expect(screen.getByText("Partial Frameworks")).toBeInTheDocument()
    expect(screen.getByText("Veneers")).toBeInTheDocument()
    expect(screen.getByText("Aligner Design")).toBeInTheDocument()
  })

  it("shows 'Separate wizard' badge on Aligner Design", () => {
    render(<CategorySelector value={null} onChange={() => {}} />)
    expect(screen.getByText("Separate wizard")).toBeInTheDocument()
  })

  it("calls onChange when a category is clicked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CategorySelector value={null} onChange={onChange} />)

    await user.click(screen.getByText("Crowns"))
    expect(onChange).toHaveBeenCalledWith("Crowns")
  })

  it("highlights the selected category", () => {
    const { container } = render(
      <CategorySelector value="Bridges" onChange={() => {}} />
    )
    const buttons = container.querySelectorAll("button")
    const bridgeBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Bridges")
    )
    expect(bridgeBtn?.className).toContain("border-sage-500")
  })

  it("does not highlight unselected categories", () => {
    const { container } = render(
      <CategorySelector value="Crowns" onChange={() => {}} />
    )
    const buttons = container.querySelectorAll("button")
    const bridgeBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Bridges")
    )
    expect(bridgeBtn?.className).not.toContain("border-sage-500")
  })
})
