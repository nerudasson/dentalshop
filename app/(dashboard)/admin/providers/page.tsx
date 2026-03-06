"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Ban,
  Users,
  Star,
  ExternalLink,
  AlertTriangle,
  Mail,
  MapPin,
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
import StarRating from "@/components/ui/star-rating"
import { cn } from "@/lib/utils"
import {
  ADMIN_PROVIDERS,
  type AdminProvider,
  type ProviderStatus,
  type ProviderCapability,
} from "./_data"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function getCompletionRate(provider: AdminProvider): string {
  if (provider.ordersCount === 0) return "—"
  return (
    Math.round((provider.completedOrdersCount / provider.ordersCount) * 100) + "%"
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  if (status === "active")
    return (
      <Badge
        variant="outline"
        className="border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)] bg-[hsl(104_35%_36%/0.06)]"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Active
      </Badge>
    )
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="border-[hsl(35_100%_47%)] text-[hsl(35_100%_47%)] bg-[hsl(35_100%_47%/0.06)]"
      >
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="border-destructive text-destructive bg-destructive/5"
    >
      <Ban className="mr-1 h-3 w-3" />
      Suspended
    </Badge>
  )
}

// ─── Capability badges ────────────────────────────────────────────────────────

function CapabilityBadges({ capability }: { capability: ProviderCapability }) {
  const sage = "border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)] bg-[hsl(104_35%_36%/0.06)]"
  const teal = "border-[hsl(169_66%_34%)] text-[hsl(169_66%_34%)] bg-[hsl(169_66%_34%/0.06)]"
  return (
    <div className="flex flex-wrap gap-1">
      {(capability === "prosthetics" || capability === "both") && (
        <Badge variant="outline" className={cn("text-xs font-normal", sage)}>
          Prosthetics
        </Badge>
      )}
      {(capability === "aligner" || capability === "both") && (
        <Badge variant="outline" className={cn("text-xs font-normal", teal)}>
          Aligner
        </Badge>
      )}
    </div>
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
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  )
}

// ─── Provider detail modal ────────────────────────────────────────────────────

function ProviderDetailPanel({
  provider,
  onClose,
  onApprove,
  onSuspend,
  onReactivate,
}: {
  provider: AdminProvider
  onClose: () => void
  onApprove: (id: string) => void
  onSuspend: (id: string, reason: string) => void
  onReactivate: (id: string) => void
}) {
  const [suspendMode, setSuspendMode] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Panel */}
      <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Provider Detail
            </h2>
            <p className="text-xs text-muted-foreground">{provider.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[hsl(104_35%_36%/0.12)] text-[hsl(104_35%_36%)] font-bold text-lg">
              {getInitials(provider.name)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-foreground leading-tight">
                {provider.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {provider.email}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ProviderStatusBadge status={provider.status} />
                <CapabilityBadges capability={provider.capabilities} />
              </div>
            </div>
          </div>

          {/* Bio */}
          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Studio Description
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{provider.bio}</p>
          </section>

          {/* Business info */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Business Info
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="font-medium text-foreground">{provider.contactName}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="font-medium text-foreground">{provider.country}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium text-foreground">{formatDate(provider.joinedDate)}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Software</p>
                <p className="font-medium text-foreground">{provider.software.join(", ")}</p>
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {(provider.capabilities === "prosthetics" || provider.capabilities === "both") && (
                <div className="flex items-center gap-2 rounded-lg border border-[hsl(104_35%_36%/0.3)] bg-[hsl(104_35%_36%/0.06)] px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(104_35%_36%)]" />
                  <span className="text-sm font-medium text-[hsl(104_35%_36%)]">
                    Prosthetics Design
                  </span>
                </div>
              )}
              {(provider.capabilities === "aligner" || provider.capabilities === "both") && (
                <div className="flex items-center gap-2 rounded-lg border border-[hsl(169_66%_34%/0.3)] bg-[hsl(169_66%_34%/0.06)] px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(169_66%_34%)]" />
                  <span className="text-sm font-medium text-[hsl(169_66%_34%)]">
                    Aligner Design
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Portfolio preview */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Portfolio Categories
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {provider.portfolioCategories.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </section>

          {/* Order statistics */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Order Statistics
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Total Orders", value: provider.ordersCount },
                {
                  label: "Completion",
                  value: getCompletionRate(provider),
                },
                {
                  label: "Avg. Rating",
                  value:
                    provider.averageRating > 0
                      ? provider.averageRating.toFixed(1)
                      : "—",
                },
                { label: "Reviews", value: provider.reviewCount || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-center"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {provider.averageRating > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={provider.averageRating} starClassName="h-4 w-4" />
                <span className="text-xs text-muted-foreground">
                  {provider.averageRating.toFixed(1)} / 5.0 from{" "}
                  {provider.reviewCount} reviews
                </span>
              </div>
            )}
          </section>

          {/* Products listing summary */}
          {provider.products.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Products ({provider.productsCount})
              </h4>
              <div className="space-y-1.5">
                {provider.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category} · {product.turnaroundDays}d turnaround
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      €{product.price}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suspension reason (if suspended) */}
          {provider.status === "suspended" && provider.suspensionReason && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Suspension Reason
              </h4>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground">
                {provider.suspensionReason}
              </div>
            </section>
          )}

          {/* Admin actions */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Admin Actions
            </h4>

            {provider.status === "pending" && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-[hsl(104_35%_36%)] hover:bg-[hsl(104_35%_30%)] text-white"
                  onClick={() => onApprove(provider.id)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Provider
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/40 hover:bg-destructive/5"
                  onClick={() => setSuspendMode(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
              </div>
            )}

            {provider.status === "active" && (
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/40 hover:bg-destructive/5"
                onClick={() => setSuspendMode(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend Provider
              </Button>
            )}

            {provider.status === "suspended" && (
              <Button
                className="w-full bg-[hsl(104_35%_36%)] hover:bg-[hsl(104_35%_30%)] text-white"
                onClick={() => onReactivate(provider.id)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reactivate Provider
              </Button>
            )}

            {/* Suspend / reject form */}
            {suspendMode && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {provider.status === "pending"
                    ? "Rejection reason"
                    : "Suspension reason"}
                </p>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Describe the reason…"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!suspendReason.trim()}
                    onClick={() => {
                      onSuspend(provider.id, suspendReason)
                      setSuspendMode(false)
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSuspendMode(false)
                      setSuspendReason("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Filter state ─────────────────────────────────────────────────────────────

interface FilterState {
  status: string
  capability: string
  minRating: string
}

const BLANK_FILTERS: FilterState = {
  status: "all",
  capability: "all",
  minRating: "0",
}

function hasActiveFilters(f: FilterState): boolean {
  return f.status !== "all" || f.capability !== "all" || f.minRating !== "0"
}

// ─── Derived stats ────────────────────────────────────────────────────────────

const total = ADMIN_PROVIDERS.length
const _active = ADMIN_PROVIDERS.filter((p) => p.status === "active").length
const _pending = ADMIN_PROVIDERS.filter((p) => p.status === "pending").length
const suspended = ADMIN_PROVIDERS.filter((p) => p.status === "suspended").length

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProvidersPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>(BLANK_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null)

  // Local status overrides (simulate approve/suspend/reactivate without a backend)
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ProviderStatus>
  >({})

  function setFilter<K extends keyof FilterState>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters(BLANK_FILTERS)
  }

  function handleApprove(id: string) {
    setStatusOverrides((prev) => ({ ...prev, [id]: "active" }))
  }

  function handleSuspend(id: string, _reason: string) {
    setStatusOverrides((prev) => ({ ...prev, [id]: "suspended" }))
  }

  function handleReactivate(id: string) {
    setStatusOverrides((prev) => ({ ...prev, [id]: "active" }))
  }

  /** Return provider with status override applied */
  function resolveProvider(p: AdminProvider): AdminProvider {
    const override = statusOverrides[p.id]
    return override ? { ...p, status: override } : p
  }

  const providers = useMemo(
    () => ADMIN_PROVIDERS.map(resolveProvider),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusOverrides]
  )

  const displayed = useMemo(() => {
    const q = search.toLowerCase().trim()
    return providers.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filters.status !== "all" && p.status !== filters.status) return false
      if (filters.capability !== "all") {
        if (filters.capability === "both" && p.capabilities !== "both") return false
        if (filters.capability === "prosthetics" && p.capabilities === "aligner")
          return false
        if (filters.capability === "aligner" && p.capabilities === "prosthetics")
          return false
      }
      if (filters.minRating !== "0") {
        const min = parseFloat(filters.minRating)
        if (p.averageRating < min) return false
      }
      return true
    })
  }, [providers, search, filters])

  const activeCount = providers.filter((p) => p.status === "active").length
  const pendingCount = providers.filter((p) => p.status === "pending").length

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Provider Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve applications, manage design studio accounts, and monitor performance.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          label="Total Providers"
          value={total}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-[hsl(104_35%_36%)]" />}
          label="Active"
          value={activeCount}
          accent="bg-[hsl(104_35%_36%/0.1)]"
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-[hsl(35_100%_47%)]" />}
          label="Pending Approval"
          value={pendingCount}
          accent="bg-[hsl(35_100%_47%/0.1)]"
        />
        <StatCard
          icon={<Ban className="h-4 w-4 text-destructive" />}
          label="Suspended"
          value={suspended}
          accent="bg-destructive/10"
        />
      </div>

      {/* ── Search + filter bar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location…"
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
                  filters.capability !== "all",
                  filters.minRating !== "0",
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Status</p>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilter("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Capabilities
              </p>
              <Select
                value={filters.capability}
                onValueChange={(v) => setFilter("capability", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All capabilities</SelectItem>
                  <SelectItem value="prosthetics">Prosthetics only</SelectItem>
                  <SelectItem value="aligner">Aligner only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Min. Rating
              </p>
              <Select
                value={filters.minRating}
                onValueChange={(v) => setFilter("minRating", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3.0+</SelectItem>
                  <SelectItem value="4">4.0+</SelectItem>
                  <SelectItem value="4.5">4.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      <p className="mb-2 text-xs text-muted-foreground">
        Showing {displayed.length} of {ADMIN_PROVIDERS.length} providers
      </p>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Capabilities
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                  Products
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                  Orders
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Rating
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Joined
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map((provider) => (
                <tr
                  key={provider.id}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setSelectedProvider(provider)}
                >
                  {/* Provider name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(104_35%_36%/0.1)] text-[hsl(104_35%_36%)] text-xs font-bold">
                        {getInitials(provider.name)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground leading-tight">
                          {provider.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {provider.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {provider.location}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <ProviderStatusBadge status={provider.status} />
                  </td>

                  {/* Capabilities */}
                  <td className="px-4 py-3">
                    <CapabilityBadges capability={provider.capabilities} />
                  </td>

                  {/* Products count */}
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {provider.productsCount}
                  </td>

                  {/* Orders count */}
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {provider.ordersCount}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    {provider.averageRating > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {provider.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({provider.reviewCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(provider.joinedDate)}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {provider.status === "pending" && (
                        <Button
                          size="sm"
                          className="bg-[hsl(104_35%_36%)] hover:bg-[hsl(104_35%_30%)] text-white h-7 px-2 text-xs"
                          onClick={() => handleApprove(provider.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                      {provider.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/40 hover:bg-destructive/5 h-7 px-2 text-xs"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          Suspend
                        </Button>
                      )}
                      {provider.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[hsl(104_35%_36%)] border-[hsl(104_35%_36%/0.4)] hover:bg-[hsl(104_35%_36%/0.05)] h-7 px-2 text-xs"
                          onClick={() => handleReactivate(provider.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Reactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Profile
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No providers match your search or filters.{" "}
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

      {/* ── Provider detail panel ── */}
      {selectedProvider && (
        <ProviderDetailPanel
          provider={resolveProvider(selectedProvider)}
          onClose={() => setSelectedProvider(null)}
          onApprove={(id) => {
            handleApprove(id)
            setSelectedProvider(null)
          }}
          onSuspend={(id, reason) => {
            handleSuspend(id, reason)
            setSelectedProvider(null)
          }}
          onReactivate={(id) => {
            handleReactivate(id)
            setSelectedProvider(null)
          }}
        />
      )}
    </div>
  )
}
