import { cn } from "@/lib/utils"
import type { TimelineEvent, OrderStatus } from "@/lib/types"

// ─── Timestamp formatter ──────────────────────────────────────────────────────

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDot({
  isCompleted,
  isActive,
}: {
  isCompleted: boolean
  isActive: boolean
}) {
  if (isActive) {
    return (
      // Outer ring + inner pulsing fill
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute h-5 w-5 animate-ping rounded-full bg-sage-400 opacity-40" />
        <span className="relative h-3 w-3 rounded-full bg-sage-500" />
      </span>
    )
  }

  if (isCompleted) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-500">
        {/* Checkmark */}
        <svg
          viewBox="0 0 10 10"
          className="h-2.5 w-2.5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1.5,5 4,7.5 8.5,2.5" />
        </svg>
      </span>
    )
  }

  // Future step
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-warm-300 bg-white" />
  )
}

// ─── Connector line ───────────────────────────────────────────────────────────

function Connector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div className="mx-auto mt-1 w-0.5 flex-1">
      <div
        className={cn(
          "h-full w-full min-h-[1.5rem]",
          isCompleted ? "bg-sage-500" : "bg-warm-200"
        )}
      />
    </div>
  )
}

// ─── Single timeline row ──────────────────────────────────────────────────────

function TimelineRow({
  event,
  isLast,
}: {
  event: TimelineEvent
  isLast: boolean
}) {
  return (
    <div className="flex gap-3">
      {/* Left column: dot + connector */}
      <div className="flex flex-col items-center">
        <StepDot isCompleted={event.isCompleted} isActive={event.isActive} />
        {!isLast && <Connector isCompleted={event.isCompleted} />}
      </div>

      {/* Right column: content */}
      <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span
            className={cn(
              "text-sm",
              event.isActive && "font-semibold text-warm-800",
              event.isCompleted && "font-medium text-warm-700",
              !event.isActive && !event.isCompleted && "text-warm-500"
            )}
          >
            {event.label}
          </span>

          {event.timestamp && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
          )}
        </div>

        {event.description && (
          <p
            className={cn(
              "mt-0.5 text-xs leading-relaxed",
              event.isActive ? "text-warm-600" : "text-muted-foreground"
            )}
          >
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface OrderTimelineProps {
  events: TimelineEvent[]
  variant?: "prosthetics" | "aligner"
  className?: string
}

export default function OrderTimeline({
  events,
  className,
}: OrderTimelineProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {events.map((event, i) => (
        <TimelineRow key={event.status} event={event} isLast={i === events.length - 1} />
      ))}
    </div>
  )
}

// ─── Prosthetics timeline factory ─────────────────────────────────────────────

/**
 * Maps an OrderStatus to the active step index in the prosthetics timeline.
 * Steps 0..activeIndex-1 are completed, step activeIndex is active.
 * When activeIndex === steps.length all steps are marked complete (order done).
 */
const PROSTHETICS_ACTIVE_INDEX: Record<OrderStatus, number> = {
  DRAFT: 0,
  PENDING_PAYMENT: 0,
  PAID: 1,
  IN_PROGRESS: 2,
  REVIEW: 3,
  REVISION_REQUESTED: 3,
  COMPLETE: 6,      // beyond last index → all completed
  DISPUTED: 3,
  RESOLVED: 6,
}

interface ProstheticsStep {
  status: string
  label: string
  description: string
}

const PROSTHETICS_STEPS: ProstheticsStep[] = [
  {
    status: "order_placed",
    label: "Order Placed",
    description: "Order confirmed and payment received.",
  },
  {
    status: "in_progress",
    label: "In Progress",
    description: "Design provider is working on your case.",
  },
  {
    status: "design_submitted",
    label: "Design Submitted",
    description: "Provider has uploaded the completed design files.",
  },
  {
    status: "in_review",
    label: "In Review",
    description: "Awaiting your approval of the submitted design.",
  },
  {
    status: "approved",
    label: "Approved",
    description: "Design approved and payment released to provider.",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Order complete. Files are ready to download.",
  },
]

export function getProstheticsTimeline(currentStatus: OrderStatus): TimelineEvent[] {
  const activeIdx = PROSTHETICS_ACTIVE_INDEX[currentStatus]
  return PROSTHETICS_STEPS.map((step, i) => ({
    status: step.status,
    label: step.label,
    description: step.description,
    isCompleted: i < activeIdx,
    isActive: i === activeIdx,
  }))
}

// ─── Aligner timeline factory ─────────────────────────────────────────────────

const ALIGNER_ACTIVE_INDEX: Record<OrderStatus, number> = {
  DRAFT: 0,
  PENDING_PAYMENT: 0,
  PAID: 1,
  IN_PROGRESS: 2,
  REVIEW: 5,
  REVISION_REQUESTED: 5,
  COMPLETE: 9,      // beyond last index → all completed
  DISPUTED: 5,
  RESOLVED: 9,
}

interface AlignerStep {
  status: string
  label: string
  description: string
}

const ALIGNER_STEPS: AlignerStep[] = [
  {
    status: "order_placed",
    label: "Order Placed",
    description: "Order confirmed and payment received.",
  },
  {
    status: "files_uploaded",
    label: "Files Uploaded",
    description: "Scans and records have been uploaded by the practice.",
  },
  {
    status: "lab_review",
    label: "Lab Review",
    description: "Provider is reviewing the submitted records for completeness.",
  },
  {
    status: "treatment_planning",
    label: "Treatment Planning",
    description: "Provider is creating the digital treatment plan.",
  },
  {
    status: "simulation_submitted",
    label: "Simulation Submitted",
    description: "3D tooth movement simulation uploaded for your review.",
  },
  {
    status: "treatment_plan_review",
    label: "Treatment Plan Review",
    description: "Awaiting your approval of the treatment simulation.",
  },
  {
    status: "plan_approved",
    label: "Plan Approved",
    description: "Treatment plan approved. Proceeding to aligner design.",
  },
  {
    status: "deliverables_uploaded",
    label: "Deliverables Uploaded",
    description: "STL files for all stages have been uploaded and are ready.",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Order complete. All deliverables are ready to download.",
  },
]

export function getAlignerTimeline(currentStatus: OrderStatus): TimelineEvent[] {
  const activeIdx = ALIGNER_ACTIVE_INDEX[currentStatus]
  return ALIGNER_STEPS.map((step, i) => ({
    status: step.status,
    label: step.label,
    description: step.description,
    isCompleted: i < activeIdx,
    isActive: i === activeIdx,
  }))
}
