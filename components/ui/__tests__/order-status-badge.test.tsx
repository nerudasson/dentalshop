import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import OrderStatusBadge from "../order-status-badge"
import type { OrderStatus } from "@/lib/types"

const ALL_STATUSES: { status: OrderStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "PENDING_PAYMENT", label: "Pending Payment" },
  { status: "PAID", label: "Paid" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "In Review" },
  { status: "REVISION_REQUESTED", label: "Revision Requested" },
  { status: "COMPLETE", label: "Complete" },
  { status: "DISPUTED", label: "Disputed" },
  { status: "RESOLVED", label: "Resolved" },
]

describe("OrderStatusBadge", () => {
  it.each(ALL_STATUSES)("renders '$label' for status $status", ({ status, label }) => {
    render(<OrderStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <OrderStatusBadge status="PAID" className="custom-class" />
    )
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain("custom-class")
  })

  it("renders as a badge with outline variant", () => {
    const { container } = render(<OrderStatusBadge status="IN_PROGRESS" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain("border")
  })
})
