"use client"

import React from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  Building2,
  Clock,
  Star,
  AlertTriangle,
  ChevronRight,
  Settings,
  UserCheck,
  ShieldAlert,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import StarRating from "@/components/ui/star-rating"
import { cn } from "@/lib/utils"

// ─── Dummy data ────────────────────────────────────────────────────────────────

/** Bar chart: daily order counts for the last 30 days (2026-02-05 → 2026-03-06) */
const ORDERS_OVER_TIME = [
  { day: "05 Feb", orders: 2 },
  { day: "06 Feb", orders: 1 },
  { day: "07 Feb", orders: 3 },
  { day: "08 Feb", orders: 2 },
  { day: "09 Feb", orders: 0 },
  { day: "10 Feb", orders: 4 },
  { day: "11 Feb", orders: 2 },
  { day: "12 Feb", orders: 1 },
  { day: "13 Feb", orders: 3 },
  { day: "14 Feb", orders: 5 },
  { day: "15 Feb", orders: 2 },
  { day: "16 Feb", orders: 1 },
  { day: "17 Feb", orders: 0 },
  { day: "18 Feb", orders: 3 },
  { day: "19 Feb", orders: 2 },
  { day: "20 Feb", orders: 4 },
  { day: "21 Feb", orders: 1 },
  { day: "22 Feb", orders: 2 },
  { day: "23 Feb", orders: 3 },
  { day: "24 Feb", orders: 1 },
  { day: "25 Feb", orders: 5 },
  { day: "26 Feb", orders: 3 },
  { day: "27 Feb", orders: 2 },
  { day: "28 Feb", orders: 6 },
  { day: "01 Mar", orders: 4 },
  { day: "02 Mar", orders: 3 },
  { day: "03 Mar", orders: 2 },
  { day: "04 Mar", orders: 5 },
  { day: "05 Mar", orders: 3 },
  { day: "06 Mar", orders: 2 },
]

/** Recent orders (last 5 placed) */
const RECENT_ORDERS = [
  {
    id: "ORD-2026-00200",
    client: "Smith Dental Practice",
    provider: "ClearCAD Studio",
    type: "prosthetics" as const,
    status: "REVIEW" as const,
    total: 143.69,
    date: new Date("2026-02-28"),
  },
  {
    id: "ORD-2026-00199",
    client: "Bright Smiles Orthodontics",
    provider: "ClearSmile Studio",
    type: "aligner" as const,
    status: "IN_PROGRESS" as const,
    total: 630.0,
    date: new Date("2026-02-25"),
  },
  {
    id: "ORD-2026-00198",
    client: "Valley Dental Lab",
    provider: "NovaDental Warsaw",
    type: "prosthetics" as const,
    status: "COMPLETE" as const,
    total: 220.5,
    date: new Date("2026-02-20"),
  },
  {
    id: "ORD-2026-00197",
    client: "Sunrise Orthodontics",
    provider: "ClearSmile Studio",
    type: "aligner" as const,
    status: "REVIEW" as const,
    total: 367.5,
    date: new Date("2026-02-18"),
  },
  {
    id: "ORD-2026-00196",
    client: "Central Dental Group",
    provider: "DentaDesign Munich",
    type: "prosthetics" as const,
    status: "IN_PROGRESS" as const,
    total: 189.0,
    date: new Date("2026-02-15"),
  },
]

/** Recent provider registrations (last 3) */
const RECENT_PROVIDERS = [
  {
    id: "prov_008",
    name: "DentalArt Ljubljana",
    location: "Ljubljana, Slovenia",
    capabilities: "both" as const,
    joinedDate: new Date("2026-03-04"),
  },
  {
    id: "prov_006",
    name: "SmileForge Bucharest",
    location: "Bucharest, Romania",
    capabilities: "prosthetics" as const,
    joinedDate: new Date("2026-03-01"),
  },
  {
    id: "prov_007",
    name: "OrthoCAD Prague",
    location: "Prague, Czech Republic",
    capabilities: "aligner" as const,
    joinedDate: new Date("2026-02-18"),
  },
]

/** Recent reviews (last 3) */
const RECENT_REVIEWS = [
  {
    id: "rev_001",
    client: "Valley Dental Lab",
    provider: "NovaDental Warsaw",
    orderId: "ORD-2026-00198",
    rating: 5.0,
    comment: "Excellent bridge design, perfect margins on first attempt.",
    submittedAt: new Date("2026-02-22"),
  },
  {
    id: "rev_002",
    client: "Metro Orthodontics",
    provider: "ArcForm Berlin",
    orderId: "ORD-2026-00194",
    rating: 4.5,
    comment: "Great complex case handling, clear staging protocol.",
    submittedAt: new Date("2026-03-01"),
  },
  {
    id: "rev_003",
    client: "Harbor Dental Clinic",
    provider: "DentaDesign Munich",
    orderId: "ORD-2026-00192",
    rating: 4.0,
    comment: "Good abutment design, minor revision needed on emergence profile.",
    submittedAt: new Date("2026-02-08"),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("en-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  trend?: { direction: "up" | "down"; label: string }
  accent?: string
  iconAccent?: string
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  accent,
  iconAccent,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-5 py-4 shadow-sm",
        accent
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconAccent ?? "bg-muted"
          )}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.direction === "up"
                ? "bg-[hsl(104_35%_36%/0.1)] text-[hsl(104_35%_36%)]"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.label}
          </div>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action}
    </div>
  )
}

// ─── Custom tooltip for bar chart ─────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} order{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform overview — orders, revenue, providers, and recent activity.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
          label="Total Orders"
          value="22"
          trend={{ direction: "up", label: "+12% this month" }}
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5 text-[hsl(104_35%_36%)]" />}
          label="Platform Revenue"
          value="€548.72"
          trend={{ direction: "up", label: "+8% this month" }}
          iconAccent="bg-[hsl(104_35%_36%/0.1)]"
        />
        <MetricCard
          icon={<Building2 className="h-5 w-5 text-[hsl(169_66%_34%)]" />}
          label="Active Providers"
          value="6"
          trend={{ direction: "up", label: "+2 this month" }}
          iconAccent="bg-[hsl(169_66%_34%/0.1)]"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-[hsl(35_100%_47%)]" />}
          label="Active Clients"
          value="5"
          trend={{ direction: "up", label: "+1 this month" }}
          iconAccent="bg-[hsl(35_100%_47%/0.1)]"
        />
      </div>

      {/* ── Orders breakdown + chart ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order type breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader title="Orders by Type" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[hsl(104_35%_36%)]" />
                <span className="text-sm text-foreground">Prosthetics</span>
              </div>
              <div className="text-right">
                <span className="font-semibold tabular-nums text-foreground">
                  14 orders
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  €300.51 fees
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[hsl(104_35%_36%)]"
                style={{ width: "63.6%" }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[hsl(169_66%_34%)]" />
                <span className="text-sm text-foreground">Aligner</span>
              </div>
              <div className="text-right">
                <span className="font-semibold tabular-nums text-foreground">
                  8 orders
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  €248.21 fees
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[hsl(169_66%_34%)]"
                style={{ width: "36.4%" }}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total platform fees</span>
              <span className="font-semibold text-foreground">€548.72</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg. fee per order</span>
              <span className="font-semibold text-foreground">€24.94</span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <SectionHeader title="Orders — Last 30 Days" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ORDERS_OVER_TIME}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barSize={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar
                  dataKey="orders"
                  fill="hsl(104, 35%, 36%)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-0.5 text-xs text-[hsl(104_35%_36%)] hover:underline"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {order.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-normal",
                        order.type === "aligner"
                          ? "border-[hsl(169_66%_34%)] text-[hsl(169_66%_34%)]"
                          : "border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)]"
                      )}
                    >
                      {order.type === "aligner" ? "Aligner" : "Prosthetics"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {order.client}{" "}
                    <span className="text-muted-foreground/60">→</span>{" "}
                    {order.provider}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <p className="hidden shrink-0 text-xs text-muted-foreground sm:block whitespace-nowrap">
                  {formatDate(order.date)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent providers + reviews */}
        <div className="space-y-4">
          {/* Recent provider registrations */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  New Providers
                </h2>
                <Link
                  href="/admin/providers"
                  className="flex items-center gap-0.5 text-xs text-[hsl(104_35%_36%)] hover:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {RECENT_PROVIDERS.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(104_35%_36%/0.1)] text-[hsl(104_35%_36%)] text-xs font-bold">
                    {p.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.location}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-[hsl(35_100%_47%)] text-[hsl(35_100%_47%)] text-xs"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reviews */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Recent Reviews
              </h2>
            </div>
            <div className="divide-y divide-border">
              {RECENT_REVIEWS.map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <StarRating rating={r.rating} starClassName="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.submittedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground line-clamp-2 leading-relaxed">
                    {r.comment}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.client}{" "}
                    <span className="text-muted-foreground/60">→</span>{" "}
                    {r.provider}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/admin/providers?status=pending"
            className="group flex items-center justify-between rounded-xl border border-[hsl(35_100%_47%/0.4)] bg-[hsl(35_100%_47%/0.05)] px-5 py-4 transition-colors hover:bg-[hsl(35_100%_47%/0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(35_100%_47%/0.15)]">
                <UserCheck className="h-5 w-5 text-[hsl(35_100%_47%)]" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Pending Approvals
                </p>
                <p className="text-xs text-muted-foreground">
                  3 providers awaiting review
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(35_100%_47%)] text-xs font-bold text-white">
                3
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/admin/orders?status=DISPUTED"
            className="group flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 transition-colors hover:bg-destructive/8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Open Disputes</p>
                <p className="text-xs text-muted-foreground">
                  1 order needs attention
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                1
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/admin/fees"
            className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Fee Configuration</p>
                <p className="text-xs text-muted-foreground">
                  Client 5% · Provider 12.5%
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
