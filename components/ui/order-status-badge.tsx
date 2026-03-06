import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"

export interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-warm-200 bg-warm-100 text-warm-600",
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "Paid",
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  REVIEW: {
    label: "In Review",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  COMPLETE: {
    label: "Complete",
    className: "border-sage-200 bg-sage-50 text-sage-700",
  },
  DISPUTED: {
    label: "Disputed",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  RESOLVED: {
    label: "Resolved",
    className: "border-warm-300 bg-warm-50 text-warm-700",
  },
}

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
