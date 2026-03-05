import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types/order"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "md"
  className?: string
}

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string
  bgClass: string
  textClass: string
  dotClass: string
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  // Shared
  pending: {
    label: "Pending",
    bgClass: "bg-warm-400/20",
    textClass: "text-warm-800",
    dotClass: "bg-warm-400",
  },
  in_progress: {
    label: "In Progress",
    bgClass: "bg-teal-100",
    textClass: "text-teal-700",
    dotClass: "bg-teal-500",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-teal-500",
    textClass: "text-white",
    dotClass: "bg-white",
  },
  cancelled: {
    label: "Cancelled",
    bgClass: "bg-warm-200",
    textClass: "text-warm-600",
    dotClass: "bg-warm-400",
  },
  // Prosthetics-specific
  in_review: {
    label: "In Review",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
    dotClass: "bg-amber-500",
  },
  revision_requested: {
    label: "Revision Requested",
    bgClass: "bg-red-50",
    textClass: "text-dental-error",
    dotClass: "bg-dental-error",
  },
  // Aligner-specific
  treatment_planning: {
    label: "Treatment Planning",
    bgClass: "bg-sage-100",
    textClass: "text-sage-700",
    dotClass: "bg-sage-600",
  },
  simulation_submitted: {
    label: "Simulation Submitted",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
    dotClass: "bg-amber-500",
  },
  modifications_requested: {
    label: "Modifications Requested",
    bgClass: "bg-red-50",
    textClass: "text-dental-error",
    dotClass: "bg-dental-error",
  },
  treatment_plan_approved: {
    label: "Plan Approved",
    bgClass: "bg-teal-200",
    textClass: "text-teal-800",
    dotClass: "bg-teal-600",
  },
  deliverables_uploaded: {
    label: "Files Uploaded",
    bgClass: "bg-sage-200",
    textClass: "text-sage-800",
    dotClass: "bg-sage-600",
  },
}

// ─── OrderStatusBadge ─────────────────────────────────────────────────────────

export default function OrderStatusBadge({
  status,
  size = "md",
  className,
}: OrderStatusBadgeProps) {
  const { label, bgClass, textClass, dotClass } = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        bgClass,
        textClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
      {label}
    </span>
  )
}
