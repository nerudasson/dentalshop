import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import PriceSummary from "../price-summary"

describe("PriceSummary", () => {
  const baseProps = {
    lineItems: [
      { label: "Crown Design", amount: 89 },
      { label: "Additional teeth (×2)", amount: 30 },
    ],
    subtotal: 119,
    total: 131.85,
  }

  it("renders all line items", () => {
    render(<PriceSummary {...baseProps} />)
    expect(screen.getByText("Crown Design")).toBeInTheDocument()
    expect(screen.getByText("Additional teeth (×2)")).toBeInTheDocument()
  })

  it("formats amounts with 2 decimal places and € by default", () => {
    render(<PriceSummary {...baseProps} />)
    expect(screen.getByText("€89.00")).toBeInTheDocument()
    expect(screen.getByText("€30.00")).toBeInTheDocument()
    expect(screen.getByText("€119.00")).toBeInTheDocument()
    expect(screen.getByText("€131.85")).toBeInTheDocument()
  })

  it("uses custom currency symbol", () => {
    render(<PriceSummary {...baseProps} currency="$" />)
    expect(screen.getByText("$89.00")).toBeInTheDocument()
  })

  it("renders service fee with percentage", () => {
    render(
      <PriceSummary
        {...baseProps}
        serviceFee={{ label: "Service Fee", percentage: 5, amount: 5.95 }}
      />
    )
    expect(screen.getByText("Service Fee")).toBeInTheDocument()
    expect(screen.getByText("(5%)")).toBeInTheDocument()
    expect(screen.getByText("€5.95")).toBeInTheDocument()
  })

  it("renders VAT with percentage", () => {
    render(
      <PriceSummary
        {...baseProps}
        vat={{ label: "VAT", percentage: 19, amount: 23.71 }}
      />
    )
    expect(screen.getByText("VAT")).toBeInTheDocument()
    expect(screen.getByText("(19%)")).toBeInTheDocument()
    expect(screen.getByText("€23.71")).toBeInTheDocument()
  })

  it("renders sub-items with indentation class", () => {
    const { container } = render(
      <PriceSummary
        lineItems={[
          { label: "Base Price", amount: 89 },
          { label: "per-tooth add-on", amount: 15, isSubItem: true },
        ]}
        subtotal={104}
        total={104}
      />
    )
    const subItem = container.querySelector(".pl-4")
    expect(subItem).toBeInTheDocument()
  })

  it("shows Subtotal and Total labels", () => {
    render(<PriceSummary {...baseProps} />)
    expect(screen.getByText("Subtotal")).toBeInTheDocument()
    expect(screen.getByText("Total")).toBeInTheDocument()
  })
})
