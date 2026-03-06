"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Inbox,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import type { OrderStatus } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

type QueueTab = "all" | "new" | "in_progress" | "in_review" | "completed"

interface QueueOrder {
  id: string
  orderType: "prosthetics" | "aligner"
  category: string
  clientName: string
  status: OrderStatus
  // Aligner-specific
  archSelection?: "Upper Only" | "Lower Only" | "Both Arches"
  complexityTier?: "Simple" | "Moderate" | "Complex"
  // Deadline
  deadlineDate: string    // ISO for comparison
  deadlineDisplay: string // e.g. "Due Mar 15"
  // Dates
  dateReceived: string
  dateReceivedIso: string
  // Price
  price: string
  priceNum: number
  isNew: boolean // arrived in last 24h
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-06")

function getDeadlineState(isoDate: string): "on_track" | "soon" | "overdue" {
  const deadline = new Date(isoDate)
  const diffDays = (deadline.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return "overdue"
  if (diffDays < 2) return "soon"
  return "on_track"
}

function matchesTab(order: QueueOrder, tab: QueueTab): boolean {
  if (tab === "all") return true
  if (tab === "new") return order.status === "PAID"
  if (tab === "in_progress")
    return order.status === "IN_PROGRESS" || order.status === "REVISION_REQUESTED"
  if (tab === "in_review") return order.status === "REVIEW"
  if (tab === "completed") return order.status === "COMPLETE"
  return true
}

// ─── Dummy data (13 orders) ───────────────────────────────────────────────────

const ALL_ORDERS: QueueOrder[] = [
  {
    id: "ORD-2026-00158",
    orderType: "prosthetics",
    category: "Crowns",
    clientName: "Smith Dental Practice",
    status: "PAID",
    deadlineDate: "2026-03-04", // overdue
    deadlineDisplay: "Due Mar 4",
    dateReceived: "Mar 5, 2026",
    dateReceivedIso: "2026-03-05",
    price: "€262.50",
    priceNum: 262.5,
    isNew: true,
  },
  {
    id: "ORD-2026-00157",
    orderType: "aligner",
    category: "Aligner Design",
    clientName: "Bright Smiles Orthodontics",
    status: "PAID",
    archSelection: "Both Arches",
    complexityTier: "Moderate",
    deadlineDate: "2026-03-07", // 1 day — soon
    deadlineDisplay: "Due Mar 7",
    dateReceived: "Mar 4, 2026",
    dateReceivedIso: "2026-03-04",
    price: "€567.00",
    priceNum: 567.0,
    isNew: true,
  },
  {
    id: "ORD-2026-00155",
    orderType: "prosthetics",
    category: "Bridges",
    clientName: "Valley Dental Lab",
    status: "IN_PROGRESS",
    deadlineDate: "2026-03-10",
    deadlineDisplay: "Due Mar 10",
    dateReceived: "Mar 2, 2026",
    dateReceivedIso: "2026-03-02",
    price: "€441.00",
    priceNum: 441.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00154",
    orderType: "aligner",
    category: "Aligner Design",
    clientName: "Bright Smiles Orthodontics",
    status: "IN_PROGRESS",
    archSelection: "Upper Only",
    complexityTier: "Simple",
    deadlineDate: "2026-03-12",
    deadlineDisplay: "Due Mar 12",
    dateReceived: "Feb 28, 2026",
    dateReceivedIso: "2026-02-28",
    price: "€315.00",
    priceNum: 315.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00152",
    orderType: "prosthetics",
    category: "Implant Abutments",
    clientName: "Dr. Elena Fischer",
    status: "IN_PROGRESS",
    deadlineDate: "2026-03-08", // soon
    deadlineDisplay: "Due Mar 8",
    dateReceived: "Feb 26, 2026",
    dateReceivedIso: "2026-02-26",
    price: "€378.00",
    priceNum: 378.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00150",
    orderType: "aligner",
    category: "Aligner Design",
    clientName: "City Orthodontics Clinic",
    status: "REVIEW",
    archSelection: "Both Arches",
    complexityTier: "Complex",
    deadlineDate: "2026-03-15",
    deadlineDisplay: "Due Mar 15",
    dateReceived: "Feb 20, 2026",
    dateReceivedIso: "2026-02-20",
    price: "€714.00",
    priceNum: 714.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00149",
    orderType: "prosthetics",
    category: "Crowns",
    clientName: "Smith Dental Practice",
    status: "REVIEW",
    deadlineDate: "2026-03-14",
    deadlineDisplay: "Due Mar 14",
    dateReceived: "Feb 22, 2026",
    dateReceivedIso: "2026-02-22",
    price: "€312.50",
    priceNum: 312.5,
    isNew: false,
  },
  {
    id: "ORD-2026-00147",
    orderType: "prosthetics",
    category: "Partial Frameworks",
    clientName: "Valley Dental Lab",
    status: "REVISION_REQUESTED",
    deadlineDate: "2026-03-09",
    deadlineDisplay: "Due Mar 9",
    dateReceived: "Feb 18, 2026",
    dateReceivedIso: "2026-02-18",
    price: "€504.00",
    priceNum: 504.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00145",
    orderType: "aligner",
    category: "Aligner Design",
    clientName: "Apex Dental Group",
    status: "REVISION_REQUESTED",
    archSelection: "Lower Only",
    complexityTier: "Moderate",
    deadlineDate: "2026-03-11",
    deadlineDisplay: "Due Mar 11",
    dateReceived: "Feb 15, 2026",
    dateReceivedIso: "2026-02-15",
    price: "€483.00",
    priceNum: 483.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00143",
    orderType: "prosthetics",
    category: "Veneers",
    clientName: "Dr. Elena Fischer",
    status: "COMPLETE",
    deadlineDate: "2026-03-01",
    deadlineDisplay: "Due Mar 1",
    dateReceived: "Feb 10, 2026",
    dateReceivedIso: "2026-02-10",
    price: "€289.80",
    priceNum: 289.8,
    isNew: false,
  },
  {
    id: "ORD-2026-00142",
    orderType: "aligner",
    category: "Aligner Design",
    clientName: "City Orthodontics Clinic",
    status: "COMPLETE",
    archSelection: "Both Arches",
    complexityTier: "Simple",
    deadlineDate: "2026-02-28",
    deadlineDisplay: "Due Feb 28",
    dateReceived: "Feb 8, 2026",
    dateReceivedIso: "2026-02-08",
    price: "€630.00",
    priceNum: 630.0,
    isNew: false,
  },
  {
    id: "ORD-2026-00140",
    orderType: "prosthetics",
    category: "Inlays / Onlays",
    clientName: "Smith Dental Practice",
    status: "COMPLETE",
    deadlineDate: "2026-02-25",
    deadlineDisplay: "Due Feb 25",
    dateReceived: "Feb 5, 2026",
    dateReceivedIso: "2026-02-05",
    price: "€226.80",
    priceNum: 226.8,
    isNew: false,
  },
  {
    id: "ORD-2026-00138",
    orderType: "prosthetics",
    category: "Bridges",
    clientName: "Apex Dental Group",
    status: "COMPLETE",
    deadlineDate: "2026-02-20",
    deadlineDisplay: "Due Feb 20",
    dateReceived: "Feb 1, 2026",
    dateReceivedIso: "2026-02-01",
    price: "€378.00",
    priceNum: 378.0,
    isNew: false,
  },
]

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS: { key: QueueTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "completed", label: "Completed" },
]

// ─── Status labels (provider perspective) ────────────────────────────────────

const PROVIDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending Payment",
  PAID: "New",
  IN_PROGRESS: "In Progress",
  REVIEW: "Awaiting Review",
  REVISION_REQUESTED: "Revision",
  COMPLETE: "Completed",
  DISPUTED: "Disputed",
  RESOLVED: "Resolved",
}

const FILTER_STATUSES: OrderStatus[] = [
  "PAID",
  "IN_PROGRESS",
  "REVIEW",
  "REVISION_REQUESTED",
  "COMPLETE",
  "DISPUTED",
]

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStats() {
  const newCount = ALL_ORDERS.filter((o) => o.status === "PAID").length
  const inProgressCount = ALL_ORDERS.filter(
    (o) => o.status === "IN_PROGRESS" || o.status === "REVISION_REQUESTED"
  ).length
  const awaitingReview = ALL_ORDERS.filter((o) => o.status === "REVIEW").length
  const completedMonth = ALL_ORDERS.filter(
    (o) => o.status === "COMPLETE" && o.dateReceivedIso >= "2026-03-01"
  ).length

  const stats = [
    {
      label: "New Orders",
      value: newCount,
      accentText: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      accentText: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Awaiting Review",
      value: awaitingReview,
      accentText: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Completed This Month",
      value: completedMonth,
      accentText: "text-[hsl(var(--primary))]",
      bg: "bg-[hsl(104,22%,94%)]",
      border: "border-[hsl(var(--primary))]/30",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border ${s.border} ${s.bg} px-4 py-3 flex items-center justify-between gap-2`}
        >
          <span className="text-xs font-medium text-muted-foreground leading-tight max-w-[80px]">
            {s.label}
          </span>
          <span className={`text-2xl font-bold tabular-nums shrink-0 ${s.accentText}`}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Deadline display ─────────────────────────────────────────────────────────

function DeadlineBadge({ display, iso }: { display: string; iso: string }) {
  const state = getDeadlineState(iso)
  if (state === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 whitespace-nowrap">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {display} — Overdue
      </span>
    )
  }
  if (state === "soon") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        {display}
      </span>
    )
  }
  return (
    <span className="text-xs font-medium text-green-700 whitespace-nowrap">{display}</span>
  )
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionButton({ order, compact = false }: { order: QueueOrder; compact?: boolean }) {
  const router = useRouter()
  const href =
    order.orderType === "aligner"
      ? `/provider/workspace/${order.id}/aligner`
      : `/provider/workspace/${order.id}`
  const isStart = order.status === "PAID"

  return (
    <Button
      size="sm"
      variant={isStart ? "default" : "outline"}
      className={`whitespace-nowrap ${
        isStart
          ? "bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)]"
          : ""
      } ${compact ? "h-7 px-2.5 text-xs" : ""}`}
      onClick={(e) => {
        e.stopPropagation()
        router.push(href)
      }}
    >
      {isStart ? "Start" : "View"}
    </Button>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  statusFilter: OrderStatus[]
  onStatusChange: (s: OrderStatus[]) => void
  categoryFilter: string[]
  onCategoryChange: (c: string[]) => void
  orderTypeFilter: "" | "prosthetics" | "aligner"
  onOrderTypeChange: (t: "" | "prosthetics" | "aligner") => void
  onClose: () => void
  onReset: () => void
}

function FilterPanel({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  orderTypeFilter,
  onOrderTypeChange,
  onClose,
  onReset,
}: FilterPanelProps) {
  const categories = [...new Set(ALL_ORDERS.map((o) => o.category))]

  function toggleStatus(s: OrderStatus) {
    onStatusChange(
      statusFilter.includes(s) ? statusFilter.filter((x) => x !== s) : [...statusFilter, s]
    )
  }

  function toggleCategory(c: string) {
    onCategoryChange(
      categoryFilter.includes(c) ? categoryFilter.filter((x) => x !== c) : [...categoryFilter, c]
    )
  }

  const pillBase = "rounded-full border px-3 py-1 text-xs font-medium transition-colors"
  const pillActive =
    "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
  const pillInactive =
    "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Reset all
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Order Type
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "", label: "All" },
              { value: "prosthetics", label: "Prosthetics" },
              { value: "aligner", label: "Aligner" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onOrderTypeChange(value)}
              className={`${pillBase} ${orderTypeFilter === value ? pillActive : pillInactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`${pillBase} ${statusFilter.includes(s) ? pillActive : pillInactive}`}
            >
              {PROVIDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={`${pillBase} ${categoryFilter.includes(c) ? pillActive : pillInactive}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--primary))]">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: QueueOrder }) {
  const router = useRouter()
  const deadlineState = getDeadlineState(order.deadlineDate)
  const isOverdue = deadlineState === "overdue" && order.status !== "COMPLETE"

  return (
    <div
      onClick={() => {
        const href =
          order.orderType === "aligner"
            ? `/provider/workspace/${order.id}/aligner`
            : `/provider/workspace/${order.id}`
        router.push(href)
      }}
      className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-colors hover:bg-muted/40 ${
        order.isNew
          ? "border-blue-300 bg-blue-50/40"
          : isOverdue
          ? "border-red-200 bg-red-50/20"
          : "border-border bg-card"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-medium text-foreground">{order.id}</span>
            {order.isNew && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                New
              </span>
            )}
            {order.orderType === "aligner" ? (
              <span className="rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                Aligner
              </span>
            ) : (
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                Prosthetics
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground">{order.clientName}</p>
          <p className="text-xs text-muted-foreground">{order.category}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Aligner details */}
      {order.orderType === "aligner" && order.archSelection && (
        <div className="flex gap-2 flex-wrap">
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
            {order.archSelection}
          </span>
          {order.complexityTier && (
            <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
              {order.complexityTier}
            </span>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
        <div className="space-y-0.5">
          {order.status !== "COMPLETE" ? (
            <DeadlineBadge display={order.deadlineDisplay} iso={order.deadlineDate} />
          ) : (
            <span className="text-xs text-[hsl(var(--primary))] flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
          <p className="text-xs text-muted-foreground">Received {order.dateReceived}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{order.price}</span>
          <ActionButton order={order} compact />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyQueue({ tab }: { tab: QueueTab }) {
  const messages: Record<QueueTab, string> = {
    all: "No orders in your queue.",
    new: "No new orders waiting to be started.",
    in_progress: "No orders currently in progress.",
    in_review: "No orders awaiting client review.",
    completed: "No completed orders found.",
  }
  return (
    <div className="py-20 text-center text-muted-foreground">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{messages[tab]}</p>
      <p className="mt-1 text-sm">Try adjusting your filters or check back later.</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderQueuePage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<QueueTab>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [orderTypeFilter, setOrderTypeFilter] = useState<"" | "prosthetics" | "aligner">("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<"deadline" | "dateReceived" | "price">("deadline")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    let rows = [...ALL_ORDERS]

    rows = rows.filter((o) => matchesTab(o, activeTab))

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (o) =>
          o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q)
      )
    }
    if (statusFilter.length > 0) {
      rows = rows.filter((o) => statusFilter.includes(o.status))
    }
    if (categoryFilter.length > 0) {
      rows = rows.filter((o) => categoryFilter.includes(o.category))
    }
    if (orderTypeFilter) {
      rows = rows.filter((o) => o.orderType === orderTypeFilter)
    }

    rows.sort((a, b) => {
      let cmp = 0
      if (sortField === "deadline") {
        cmp = a.deadlineDate < b.deadlineDate ? -1 : a.deadlineDate > b.deadlineDate ? 1 : 0
      } else if (sortField === "dateReceived") {
        cmp = a.dateReceivedIso < b.dateReceivedIso ? -1 : 1
      } else if (sortField === "price") {
        cmp = a.priceNum - b.priceNum
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return rows
  }, [activeTab, search, statusFilter, categoryFilter, orderTypeFilter, sortField, sortDir])

  const activeFilterCount =
    statusFilter.length + categoryFilter.length + (orderTypeFilter ? 1 : 0)

  function handleSort(field: typeof sortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function resetFilters() {
    setStatusFilter([])
    setCategoryFilter([])
    setOrderTypeFilter("")
  }

  function handleRowClick(order: QueueOrder) {
    const href =
      order.orderType === "aligner"
        ? `/provider/workspace/${order.id}/aligner`
        : `/provider/workspace/${order.id}`
    router.push(href)
  }

  const tabCounts: Record<QueueTab, number> = {
    all: ALL_ORDERS.length,
    new: ALL_ORDERS.filter((o) => matchesTab(o, "new")).length,
    in_progress: ALL_ORDERS.filter((o) => matchesTab(o, "in_progress")).length,
    in_review: ALL_ORDERS.filter((o) => matchesTab(o, "in_review")).length,
    completed: ALL_ORDERS.filter((o) => matchesTab(o, "completed")).length,
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (field !== sortField) return <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-30" />
    return (
      <ChevronDown
        className={`ml-1 h-3.5 w-3.5 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Order Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your incoming and active design orders.
        </p>
      </div>

      {/* Quick stats */}
      <QuickStats />

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums min-w-[18px] text-center ${
                activeTab === tab.key
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ref or client…"
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort pills */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-0.5">Sort:</span>
          {(
            [
              { value: "deadline", label: "Deadline" },
              { value: "dateReceived", label: "Date Received" },
              { value: "price", label: "Price" },
            ] as const
          ).map((s) => (
            <button
              key={s.value}
              onClick={() => handleSort(s.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sortField === s.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
                  : "border-border text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              }`}
            >
              {s.label}
              {sortField === s.value && (
                <ChevronDown
                  className={`ml-1 h-3 w-3 transition-transform ${
                    sortDir === "asc" ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={
            activeFilterCount > 0
              ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
              : ""
          }
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {orderTypeFilter && (
            <FilterChip
              label={orderTypeFilter === "prosthetics" ? "Prosthetics" : "Aligner"}
              onRemove={() => setOrderTypeFilter("")}
            />
          )}
          {statusFilter.map((s) => (
            <FilterChip
              key={s}
              label={PROVIDER_STATUS_LABELS[s]}
              onRemove={() => setStatusFilter(statusFilter.filter((x) => x !== s))}
            />
          ))}
          {categoryFilter.map((c) => (
            <FilterChip
              key={c}
              label={c}
              onRemove={() => setCategoryFilter(categoryFilter.filter((x) => x !== c))}
            />
          ))}
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          orderTypeFilter={orderTypeFilter}
          onOrderTypeChange={setOrderTypeFilter}
          onClose={() => setShowFilters(false)}
          onReset={() => {
            resetFilters()
            setShowFilters(false)
          }}
        />
      )}

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <EmptyQueue tab={activeTab} />
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {/* Desktop: data table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyQueue tab={activeTab} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Order Ref
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Details
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("deadline")}
                  >
                    <span className="inline-flex items-center">
                      Deadline <SortIcon field="deadline" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("dateReceived")}
                  >
                    <span className="inline-flex items-center">
                      Received <SortIcon field="dateReceived" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("price")}
                  >
                    <span className="inline-flex items-center justify-end">
                      Price <SortIcon field="price" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const deadlineState = getDeadlineState(order.deadlineDate)
                  const isOverdue = deadlineState === "overdue" && order.status !== "COMPLETE"

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${
                        order.isNew
                          ? "bg-blue-50/50"
                          : isOverdue
                          ? "bg-red-50/20"
                          : i % 2 === 0
                          ? "bg-card"
                          : "bg-muted/20"
                      }`}
                    >
                      {/* Order Ref */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-medium text-foreground">
                            {order.id}
                          </span>
                          {order.isNew && (
                            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        {order.orderType === "aligner" ? (
                          <span className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                            Aligner
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
                            Prosthetics
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {order.category}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.clientName}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      {/* Aligner details */}
                      <td className="px-4 py-3">
                        {order.orderType === "aligner" && order.archSelection ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700 whitespace-nowrap">
                              {order.archSelection}
                            </span>
                            {order.complexityTier && (
                              <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
                                {order.complexityTier}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3">
                        {order.status !== "COMPLETE" ? (
                          <DeadlineBadge
                            display={order.deadlineDisplay}
                            iso={order.deadlineDate}
                          />
                        ) : (
                          <span className="text-xs text-[hsl(var(--primary))] flex items-center gap-1 font-medium whitespace-nowrap">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Done
                          </span>
                        )}
                      </td>

                      {/* Date Received */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.dateReceived}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap">
                        {order.price}
                      </td>

                      {/* Action */}
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionButton order={order} compact />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
