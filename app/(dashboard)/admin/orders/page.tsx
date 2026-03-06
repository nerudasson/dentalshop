"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import { cn } from "@/lib/utils"
import { ADMIN_ORDERS, type AdminOrder } from "./_data"
import type { OrderStatus } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-06")

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function isThisMonth(date: Date): boolean {
  return (
    date.getFullYear() === TODAY.getFullYear() &&
    date.getMonth() === TODAY.getMonth()
  )
}

const ACTIVE_STATUSES: OrderStatus[] = [
  "PAID",
  "IN_PROGRESS",
  "REVISION_REQUESTED",
  "REVIEW",
  "DISPUTED",
]

const ALL_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "REVISION_REQUESTED",
  "REVIEW",
  "COMPLETE",
  "DISPUTED",
  "RESOLVED",
]

function getOrderTypeBadge(type: AdminOrder["orderType"]) {
  if (type === "aligner") {
    return (
      <Badge
        variant="outline"
        className="border-[hsl(169_66%_34%)] text-[hsl(169_66%_34%)] text-xs font-normal"
      >
        Aligner
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)] text-xs font-normal"
    >
      Prosthetics
    </Badge>
  )
}

// ─── Derived filter options ────────────────────────────────────────────────────

const ALL_PROVIDERS = Array.from(new Set(ADMIN_ORDERS.map((o) => o.provider))).sort()
const ALL_CLIENTS = Array.from(new Set(ADMIN_ORDERS.map((o) => o.client))).sort()
const ALL_CATEGORIES = Array.from(new Set(ADMIN_ORDERS.map((o) => o.category))).sort()
const PRESENT_STATUSES = Array.from(new Set(ADMIN_ORDERS.map((o) => o.status))) as OrderStatus[]

// ─── Stats ────────────────────────────────────────────────────────────────────

const totalOrders = ADMIN_ORDERS.length
const activeOrders = ADMIN_ORDERS.filter((o) =>
  ACTIVE_STATUSES.includes(o.status)
).length
const inReview = ADMIN_ORDERS.filter((o) => o.status === "REVIEW").length
const thisMonth = ADMIN_ORDERS.filter((o) => isThisMonth(o.dateCreated)).length
const disputed = ADMIN_ORDERS.filter((o) => o.status === "DISPUTED").length

// ─── Filter state type ────────────────────────────────────────────────────────

interface FilterState {
  status: string
  orderType: string
  category: string
  provider: string
  client: string
  dateFrom: string
  dateTo: string
}

const BLANK_FILTERS: FilterState = {
  status: "all",
  orderType: "all",
  category: "all",
  provider: "all",
  client: "all",
  dateFrom: "",
  dateTo: "",
}

function hasActiveFilters(f: FilterState): boolean {
  return (
    f.status !== "all" ||
    f.orderType !== "all" ||
    f.category !== "all" ||
    f.provider !== "all" ||
    f.client !== "all" ||
    f.dateFrom !== "" ||
    f.dateTo !== ""
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  accent?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent ?? "bg-muted"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>(BLANK_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  function setFilter<K extends keyof FilterState>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters(BLANK_FILTERS)
  }

  // ── Filtered + searched orders ──
  const displayed = useMemo(() => {
    const q = search.toLowerCase().trim()

    return ADMIN_ORDERS.filter((order) => {
      // Search
      if (q) {
        const hit =
          order.id.toLowerCase().includes(q) ||
          order.client.toLowerCase().includes(q) ||
          order.provider.toLowerCase().includes(q)
        if (!hit) return false
      }

      // Filters
      if (filters.status !== "all" && order.status !== filters.status)
        return false
      if (
        filters.orderType !== "all" &&
        order.orderType !== filters.orderType
      )
        return false
      if (
        filters.category !== "all" &&
        order.category !== filters.category
      )
        return false
      if (
        filters.provider !== "all" &&
        order.provider !== filters.provider
      )
        return false
      if (filters.client !== "all" && order.client !== filters.client)
        return false

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom)
        if (order.dateCreated < from) return false
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59)
        if (order.dateCreated > to) return false
      }

      return true
    })
  }, [search, filters])

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Order Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all platform orders across clients and providers.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="Total Orders"
          value={totalOrders}
        />
        <StatCard
          icon={
            <Clock className="h-4 w-4 text-[hsl(35_100%_47%)]" />
          }
          label="Active"
          value={activeOrders}
          accent="bg-[hsl(35_100%_47%/0.1)]"
        />
        <StatCard
          icon={
            <CheckCircle2 className="h-4 w-4 text-[hsl(104_35%_36%)]" />
          }
          label="In Review"
          value={inReview}
          accent="bg-[hsl(104_35%_36%/0.1)]"
        />
        <StatCard
          icon={
            <Package className="h-4 w-4 text-[hsl(169_66%_34%)]" />
          }
          label="This Month"
          value={thisMonth}
          accent="bg-[hsl(169_66%_34%/0.1)]"
        />
        <StatCard
          icon={
            <AlertTriangle className="h-4 w-4 text-destructive" />
          }
          label="Disputed"
          value={disputed}
          accent="bg-destructive/10"
        />
      </div>

      {/* ── Search + filter bar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ref, client, or provider…"
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant={filtersOpen || hasActiveFilters(filters) ? "default" : "outline"}
          onClick={() => setFiltersOpen((v) => !v)}
          className="shrink-0"
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters
          {hasActiveFilters(filters) && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
              {
                [
                  filters.status !== "all",
                  filters.orderType !== "all",
                  filters.category !== "all",
                  filters.provider !== "all",
                  filters.client !== "all",
                  filters.dateFrom !== "",
                  filters.dateTo !== "",
                ].filter(Boolean).length
              }
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters(filters) && (
          <button
            onClick={clearFilters}
            className="text-sm text-[hsl(104_35%_36%)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Expanded filter panel ── */}
      {filtersOpen && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Status */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Status
              </p>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilter("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {PRESENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Type */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Order Type
              </p>
              <Select
                value={filters.orderType}
                onValueChange={(v) => setFilter("orderType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="prosthetics">Prosthetics</SelectItem>
                  <SelectItem value="aligner">Aligner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Category
              </p>
              <Select
                value={filters.category}
                onValueChange={(v) => setFilter("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Provider
              </p>
              <Select
                value={filters.provider}
                onValueChange={(v) => setFilter("provider", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  {ALL_PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Client
              </p>
              <Select
                value={filters.client}
                onValueChange={(v) => setFilter("client", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {ALL_CLIENTS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                From date
              </p>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
              />
            </div>

            {/* Date to */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                To date
              </p>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter("dateTo", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      <p className="mb-2 text-xs text-muted-foreground">
        Showing {displayed.length} of {ADMIN_ORDERS.length} orders
      </p>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Order Ref
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Client
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                  Platform Fee
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground leading-tight">
                      {order.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.clientEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground leading-tight">
                      {order.provider}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.providerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.category}
                  </td>
                  <td className="px-4 py-3">
                    {getOrderTypeBadge(order.orderType)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(order.dateCreated)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                    €{order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {order.platformFee > 0
                      ? `€${order.platformFee.toFixed(2)}`
                      : <span className="text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/orders/${order.id}`)
                      }}
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No orders match your search or filters.{" "}
                    {hasActiveFilters(filters) && (
                      <button
                        onClick={clearFilters}
                        className="text-[hsl(104_35%_36%)] hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {displayed.length} result{displayed.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}
