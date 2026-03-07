import { describe, it, expect } from "vitest"
import { getProstheticsTimeline, getAlignerTimeline } from "../order-timeline"
import type { OrderStatus } from "@/lib/types"

describe("getProstheticsTimeline", () => {
  it("returns 6 steps", () => {
    const timeline = getProstheticsTimeline("DRAFT")
    expect(timeline).toHaveLength(6)
  })

  it("marks only first step as active for DRAFT", () => {
    const timeline = getProstheticsTimeline("DRAFT")
    expect(timeline[0].isActive).toBe(true)
    expect(timeline[0].isCompleted).toBe(false)
    expect(timeline.filter((s) => s.isActive)).toHaveLength(1)
  })

  it("marks first steps as completed for IN_PROGRESS", () => {
    const timeline = getProstheticsTimeline("IN_PROGRESS")
    // Order Placed should be completed
    expect(timeline[0].isCompleted).toBe(true)
    // Some step should be active
    const active = timeline.find((s) => s.isActive)
    expect(active).toBeDefined()
  })

  it("marks all steps completed for COMPLETE", () => {
    const timeline = getProstheticsTimeline("COMPLETE")
    const completed = timeline.filter((s) => s.isCompleted)
    expect(completed.length).toBeGreaterThanOrEqual(5)
  })

  it("handles REVISION_REQUESTED status", () => {
    const timeline = getProstheticsTimeline("REVISION_REQUESTED")
    expect(timeline.some((s) => s.isActive || s.isCompleted)).toBe(true)
  })
})

describe("getAlignerTimeline", () => {
  it("returns 9 steps", () => {
    const timeline = getAlignerTimeline("DRAFT")
    expect(timeline).toHaveLength(9)
  })

  it("marks only first step as active for DRAFT", () => {
    const timeline = getAlignerTimeline("DRAFT")
    expect(timeline[0].isActive).toBe(true)
    expect(timeline.filter((s) => s.isActive)).toHaveLength(1)
  })

  it("handles all valid statuses without error", () => {
    const statuses: OrderStatus[] = [
      "DRAFT", "PENDING_PAYMENT", "PAID", "IN_PROGRESS",
      "REVIEW", "REVISION_REQUESTED", "COMPLETE", "DISPUTED", "RESOLVED",
    ]
    for (const status of statuses) {
      expect(() => getAlignerTimeline(status)).not.toThrow()
      expect(() => getProstheticsTimeline(status)).not.toThrow()
    }
  })
})
