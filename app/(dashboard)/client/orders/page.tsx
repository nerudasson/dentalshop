"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import type { OrderStatus } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string
  category: string
  orderType: "prosthetics" | "aligner"
  provider: string
  status: OrderStatus
  dateCreated: string
  dateCreatedIso: string
  total: string
  totalNum: number
}

// ─── Dummy data (15+ orders) ──────────────────────────────────────────────────

const ALL_ORDERS: Order[] = [
  {
    id: "ORD-2024-00142",
    category: "Crowns",
    orderType: "prosthetics",
    provider: "ClearCAD Studio",
    status: "REVIEW",
    dateCreated: "Mar 1, 2026",
    dateCreatedIso: "2026-03-01",
    total: "€312.50",
    totalNum: 312.5,
  },
  {
    id: "ORD-2024-00141",
    category: "Bridges",
    orderType: "prosthetics",
    provider: "ProDesign Lab",
    status: "IN_PROGRESS",
    dateCreated: "Feb 28, 2026",
    dateCreatedIso: "2026-02-28",
    total: "€441.00",
    totalNum: 441.0,
  },
  {
    id: "ORD-2024-00140",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "ClearSmile Studio",
    status: "REVIEW",
    dateCreated: "Feb 25, 2026",
    dateCreatedIso: "2026-02-25",
    total: "€714.00",
    totalNum: 714.0,
  },
  {
    id: "ORD-2024-00139",
    category: "Veneers",
    orderType: "prosthetics",
    provider: "DentalCAD Pro",
    status: "COMPLETE",
    dateCreated: "Feb 20, 2026",
    dateCreatedIso: "2026-02-20",
    total: "€289.80",
    totalNum: 289.8,
  },
  {
    id: "ORD-2024-00138",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "AlignTech Design",
    status: "IN_PROGRESS",
    dateCreated: "Feb 18, 2026",
    dateCreatedIso: "2026-02-18",
    total: "€567.00",
    totalNum: 567.0,
  },
  {
    id: "ORD-2024-00137",
    category: "Implant Abutments",
    orderType: "prosthetics",
    provider: "PrecisionCAD Lab",
    status: "COMPLETE",
    dateCreated: "Feb 15, 2026",
    dateCreatedIso: "2026-02-15",
    total: "€378.00",
    totalNum: 378.0,
  },
  {
    id: "ORD-2024-00136",
    category: "Inlays / Onlays",
    orderType: "prosthetics",
    provider: "MeshForge Studio",
    status: "REVIEW",
    dateCreated: "Feb 22, 2026",
    dateCreatedIso: "2026-02-22",
    total: "€226.80",
    totalNum: 226.8,
  },
  {
    id: "ORD-2024-00135",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "ClearSmile Studio",
    status: "COMPLETE",
    dateCreated: "Feb 10, 2026",
    dateCreatedIso: "2026-02-10",
    total: "€630.00",
    totalNum: 630.0,
  },
  {
    id: "ORD-2024-00134",
    category: "Partial Frameworks",
    orderType: "prosthetics",
    provider: "ClearCAD Studio",
    status: "REVISION_REQUESTED",
    dateCreated: "Feb 8, 2026",
    dateCreatedIso: "2026-02-08",
    total: "€504.00",
    totalNum: 504.0,
  },
  {
    id: "ORD-2024-00133",
    category: "Crowns",
    orderType: "prosthetics",
    provider: "ProDesign Lab",
    status: "COMPLETE",
    dateCreated: "Feb 3, 2026",
    dateCreatedIso: "2026-02-03",
    total: "€262.50",
    totalNum: 262.5,
  },
  {
    id: "ORD-2024-00132",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "AlignTech Design",
    status: "REVISION_REQUESTED",
    dateCreated: "Jan 29, 2026",
    dateCreatedIso: "2026-01-29",
    total: "€483.00",
    totalNum: 483.0,
  },
  {
    id: "ORD-2024-00131",
    category: "Bridges",
    orderType: "prosthetics",
    provider: "DentalCAD Pro",
    status: "PAID",
    dateCreated: "Jan 25, 2026",
    dateCreatedIso: "2026-01-25",
    total: "€420.00",
    totalNum: 420.0,
  },
  {
    id: "ORD-2024-00130",
    category: "Veneers",
    orderType: "prosthetics",
    provider: "MeshForge Studio",
    status: "COMPLETE",
    dateCreated: "Jan 20, 2026",
    dateCreatedIso: "2026-01-20",
    total: "€336.00",
    totalNum: 336.0,
  },
  {
    id: "ORD-2024-00129",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "ClearSmile Studio",
    status: "PAID",
    dateCreated: "Jan 15, 2026",
    dateCreatedIso: "2026-01-15",
    total: "€525.00",
    totalNum: 525.0,
  },
  {
    id: "ORD-2024-00128",
    category: "Crowns",
    orderType: "prosthetics",
    provider: "PrecisionCAD Lab",
    status: "COMPLETE",
    dateCreated: "Jan 10, 2026",
    dateCreatedIso: "2026-01-10",
    total: "€297.50",
    totalNum: 297.5,
  },
  {
    id: "ORD-2024-00127",
    category: "Implant Abutments",
    orderType: "prosthetics",
    provider: "ClearCAD Studio",
    status: "DISPUTED",
    dateCreated: "Jan 5, 2026",
    dateCreatedIso: "2026-01-05",
    total: "€357.00",
    totalNum: 357.0,
  },
]

const ALL_STATUSES: OrderStatus[] = [
  "DRAFT",
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "REVIEW",
  "REVISION_REQUESTED",
  "COMPLETE",
  "DISPUTED",
  "RESOLVED",
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  REVIEW: "In Review",
  REVISION_REQUESTED: "Revision Requested",
  COMPLETE: "Complete",
  DISPUTED: "Disputed",
  RESOLVED: "Resolved",
}

const CATEGORIES = [
  "Crowns",
  "Bridges",
  "Inlays / Onlays",
  "Implant Abutments",
  "Partial Frameworks",
  "Veneers",
  "Aligner Design",
]

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
  function toggleStatus(s: OrderStatus) {
    onStatusChange(
      statusFilter.includes(s)
        ? statusFilter.filter((x) => x !== s)
        : [...statusFilter, s]
    )
  }

  function toggleCategory(c: string) {
    onCategoryChange(
      categoryFilter.includes(c)
        ? categoryFilter.filter((x) => x !== c)
        : [...categoryFilter, c]
    )
  }

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

      {/* Order Type */}
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
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                orderTypeFilter === value
                  ? "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
                  : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter.includes(s)
                  ? "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
                  : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter.includes(c)
                  ? "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
                  : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Active filter chips ──────────────────────────────────────────────────────

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--primary))]">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientOrdersPage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [orderTypeFilter, setOrderTypeFilter] = useState<"" | "prosthetics" | "aligner">("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<"dateCreated" | "total" | "status">("dateCreated")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  // ── Derived filtered + sorted list ──
  const filtered = useMemo(() => {
    let rows = [...ALL_ORDERS]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.provider.toLowerCase().includes(q)
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
      if (sortField === "dateCreated") {
        cmp = a.dateCreatedIso < b.dateCreatedIso ? -1 : 1
      } else if (sortField === "total") {
        cmp = a.totalNum - b.totalNum
      } else if (sortField === "status") {
        cmp = a.status.localeCompare(b.status)
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return rows
  }, [search, statusFilter, categoryFilter, orderTypeFilter, sortField, sortDir])

  const activeFilterCount =
    statusFilter.length + categoryFilter.length + (orderTypeFilter ? 1 : 0)

  function handleSort(field: typeof sortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  function resetFilters() {
    setStatusFilter([])
    setCategoryFilter([])
    setOrderTypeFilter("")
  }

  function handleRowClick(order: Order) {
    const href =
      order.orderType === "aligner"
        ? `/client/orders/${order.id}/aligner`
        : `/client/orders/${order.id}`
    router.push(href)
  }

  // Sort indicator
  function SortIcon({ field }: { field: typeof sortField }) {
    if (field !== sortField) return <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-30" />
    return (
      <ChevronDown
        className={`ml-1 h-3.5 w-3.5 transition-transform ${
          sortDir === "asc" ? "rotate-180" : ""
        }`}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your prosthetics and aligner design orders.
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)]"
        >
          <Link href="/client/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Order
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ref or provider…"
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

        {/* Filter toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={activeFilterCount > 0 ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : ""}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <span className="text-sm text-muted-foreground ml-auto">
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
              label={STATUS_LABELS[s]}
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

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <ShoppingBagEmpty />
            <p className="mt-4 text-sm font-medium text-foreground">No orders found</p>
            <p className="mt-1 text-sm">
              {ALL_ORDERS.length === 0
                ? "Create your first order to get started."
                : "Try adjusting your search or filters."}
            </p>
            {ALL_ORDERS.length === 0 && (
              <Button asChild className="mt-4 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)]">
                <Link href="/client/orders/new">Create New Order</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Order Ref
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Order Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Provider
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("status")}
                  >
                    <span className="inline-flex items-center">
                      Status <SortIcon field="status" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("dateCreated")}
                  >
                    <span className="inline-flex items-center">
                      Date Created <SortIcon field="dateCreated" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort("total")}
                  >
                    <span className="inline-flex items-center justify-end">
                      Total <SortIcon field="total" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const href =
                    order.orderType === "aligner"
                      ? `/client/orders/${order.id}/aligner`
                      : `/client/orders/${order.id}`
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${
                        i % 2 === 0 ? "bg-card" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground font-medium whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {order.category}
                      </td>
                      <td className="px-4 py-3">
                        {order.orderType === "aligner" ? (
                          <span className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                            Aligner
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Prosthetics
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.provider}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.dateCreated}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap">
                        {order.total}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs whitespace-nowrap"
                        >
                          <Link href={href}>View Order</Link>
                        </Button>
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

// ─── Empty state illustration ─────────────────────────────────────────────────

function ShoppingBagEmpty() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border">
      <svg
        className="h-8 w-8 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
        />
      </svg>
    </div>
  )
}
