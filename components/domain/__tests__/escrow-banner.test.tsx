import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import EscrowBanner from "../escrow-banner"

describe("EscrowBanner", () => {
  describe("payment variant", () => {
    it("shows protection heading", () => {
      render(<EscrowBanner variant="payment" />)
      expect(screen.getByText("Your payment is protected")).toBeInTheDocument()
    })

    it("shows 3 how-it-works steps", () => {
      render(<EscrowBanner variant="payment" />)
      expect(screen.getByText("Pay securely at checkout")).toBeInTheDocument()
      expect(screen.getByText("Funds held until you approve the design")).toBeInTheDocument()
      expect(screen.getByText("Release payment on approval")).toBeInTheDocument()
    })
  })

  describe("in_escrow variant", () => {
    it("shows escrow heading", () => {
      render(<EscrowBanner variant="in_escrow" escrowDaysRemaining={5} />)
      expect(screen.getByText("Payment held securely")).toBeInTheDocument()
    })

    it("shows days remaining", () => {
      render(<EscrowBanner variant="in_escrow" escrowDaysRemaining={3} />)
      expect(screen.getByText("Auto-release in 3 days")).toBeInTheDocument()
    })

    it("shows singular 'day' for 1 day remaining", () => {
      render(<EscrowBanner variant="in_escrow" escrowDaysRemaining={1} />)
      expect(screen.getByText("Auto-release in 1 day")).toBeInTheDocument()
    })

    it("renders a progress bar", () => {
      render(<EscrowBanner variant="in_escrow" escrowDaysRemaining={5} />)
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })

  describe("released variant", () => {
    it("shows released heading", () => {
      render(<EscrowBanner variant="released" />)
      expect(screen.getByText("Payment released to provider")).toBeInTheDocument()
    })
  })
})
