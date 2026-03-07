"use client"

import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Inbox,
  ListChecks,
  Package,
  RotateCcw,
  Star,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import StarRating from "@/components/ui/star-rating"
import { useRole } from "@/components/providers/role-provider"
import type { OrderStatus } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentOrder {
  id: string
  orderType: "prosthetics" | "aligner"
  client: string
  status: OrderStatus
  deadline: string
  isOverdue: boolean
}

interface PendingAction {
  id: string
  type: "revision" | "new_order" | "review"
  orderId?: string
  description: string
  actionLabel: string
  href: string
}

interface WeeklyEarning {
  week: string
  amount: number
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const IS_STRIPE_CONNECTED = false

const STATS = {
  newOrders: 2,
  inProgress: 3,
  awaitingReview: 2,
  completedThisMonth: 8,
  completedLastMonth: 6,
  avgRating: 4.8,
  reviewCount: 47,
}

const MONTHLY_EARNINGS = {
  amount: 3_842.5,
  pendingPayout: 640.0,
  currency: "€",
}

const WEEKLY_EARNINGS: WeeklyEarning[] = [
  { week: "Feb 3", amount: 720 },
  { week: "Feb 10", amount: 980 },
  { week: "Feb 17", amount: 640 },
  { week: "Feb 24", amount: 1502.5 },
]

const PROSTHETICS_BREAKDOWN = {
  activeOrders: 4,
  categories: [
    { label: "Crowns", count: 2 },
    { label: "Bridges", count: 1 },
    { label: "Veneers", count: 1 },
  ],
}

const ALIGNER_BREAKDOWN = {
  activeOrders: 1,
  complexity: [
    { label: "Simple", count: 0 },
    { label: "Moderate", count: 1 },
    { label: "Complex", count: 0 },
  ],
}

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: "ORD-2026-00215",
    orderType: "prosthetics",
    client: "Smith Dental Practice",
    status: "PAID",
    deadline: "Mar 10, 2026",
    isOverdue: false,
  },
  {
    id: "ORD-2026-00213",
    orderType: "aligner",
    client: "Bright Smiles Orthodontics",
    status: "IN_PROGRESS",
    deadline: "Mar 8, 2026",
    isOverdue: false,
  },
  {
    id: "ORD-2026-00209",
    orderType: "prosthetics",
    client: "Riverside Dental Lab",
    status: "REVISION_REQUESTED",
    deadline: "Mar 5, 2026",
    isOverdue: true,
  },
  {
    id: "ORD-2026-00204",
    orderType: "prosthetics",
    client: "Downtown Dental Group",
    status: "REVIEW",
    deadline: "Mar 12, 2026",
    isOverdue: false,
  },
  {
    id: "ORD-2026-00198",
    orderType: "prosthetics",
    client: "Smith Dental Practice",
    status: "COMPLETE",
    deadline: "Feb 28, 2026",
    isOverdue: false,
  },
]

const PENDING_ACTIONS: PendingAction[] = [
  {
    id: "pa-1",
    type: "revision",
    orderId: "ORD-2026-00209",
    description: "Client requested changes on ORD-2026-00209",
    actionLabel: "Review",
    href: "/provider/queue",
  },
  {
    id: "pa-2",
    type: "new_order",
    orderId: "ORD-2026-00215",
    description: "New order from Smith Dental Practice awaiting start",
    actionLabel: "Start",
    href: "/provider/queue",
  },
  {
    id: "pa-3",
    type: "review",
    description: "New 5-star review from Downtown Dental Group",
    actionLabel: "Respond",
    href: "/provider/reviews",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  sub?: React.ReactNode
  href?: string
  linkLabel?: string
}

function StatCard({ label, value, icon, iconBg, sub, href, linkLabel }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {sub && <div className="mt-1">{sub}</div>}
        </div>
        <div className={`rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
      </div>
      {href && linkLabel && (
        <div className="mt-4 border-t border-border pt-3">
          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            {linkLabel}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

function PendingActionIcon({ type }: { type: PendingAction["type"] }) {
  if (type === "revision") return <RotateCcw className="h-4 w-4 text-amber-600" />
  if (type === "new_order") return <Inbox className="h-4 w-4 text-blue-600" />
  return <Star className="h-4 w-4 text-yellow-500" />
}

function PendingActionBg(type: PendingAction["type"]) {
  if (type === "revision") return "bg-amber-50 border-amber-200"
  if (type === "new_order") return "bg-blue-50 border-blue-200"
  return "bg-yellow-50 border-yellow-200"
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderDashboardPage() {
  const { orgName } = useRole()

  const completedTrend = STATS.completedThisMonth - STATS.completedLastMonth
  const trendPositive = completedTrend >= 0

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6 pb-10">
      {/* ── Stripe Connect Banner ──────────────────────────────────────── */}
      {!IS_STRIPE_CONNECTED && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <CreditCard className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="flex-1 text-sm text-amber-800">
            <span className="font-semibold">Complete your payment setup</span> to
            receive payouts for completed orders.
          </p>
          <Link href="/provider/settings">
            <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
              Set up Stripe
            </Button>
          </Link>
        </div>
      )}

      {/* ── Welcome ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {orgName}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New Orders"
          value={STATS.newOrders}
          icon={
            <div className="relative">
              <Inbox className="h-5 w-5 text-blue-600" />
              {STATS.newOrders > 0 && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
              )}
            </div>
          }
          iconBg="bg-blue-50"
          sub={
            <span className="text-xs text-muted-foreground">
              Awaiting your start
            </span>
          }
          href="/provider/queue"
          linkLabel="View Queue"
        />
        <StatCard
          label="In Progress"
          value={STATS.inProgress}
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
          sub={
            <span className="text-xs text-muted-foreground">
              Active designs
            </span>
          }
          href="/provider/queue"
          linkLabel="View Queue"
        />
        <StatCard
          label="Awaiting Review"
          value={STATS.awaitingReview}
          icon={<Eye className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-50"
          sub={
            <span className="text-xs text-muted-foreground">
              Submitted to clients
            </span>
          }
          href="/provider/queue"
          linkLabel="View Queue"
        />
        <StatCard
          label="Completed This Month"
          value={STATS.completedThisMonth}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50"
          sub={
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                trendPositive ? "text-green-600" : "text-red-500"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              {trendPositive ? "+" : ""}
              {completedTrend} vs last month
            </span>
          }
        />
      </div>

      {/* ── Revenue + Order Type ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Card */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Earnings Overview
            </h2>
            <Link
              href="/provider/settings"
              className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
            >
              View Payout Details
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">This month</p>
              <p className="mt-0.5 text-3xl font-bold text-foreground">
                {MONTHLY_EARNINGS.currency}
                {MONTHLY_EARNINGS.amount.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                After platform commission
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending payout</p>
              <p className="mt-0.5 text-2xl font-semibold text-amber-600">
                {MONTHLY_EARNINGS.currency}
                {MONTHLY_EARNINGS.pendingPayout.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                In escrow, awaiting approval
              </p>
            </div>
          </div>

          {/* Sparkline bar chart */}
          <div className="mt-5 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={WEEKLY_EARNINGS}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barSize={28}
              >
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) => `€${v}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `€${Number(value).toLocaleString("en", { minimumFractionDigits: 0 })}`,
                    "Earnings",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Weekly earnings — last 4 weeks
          </p>
        </div>

        {/* Order Type Breakdown */}
        <div className="flex flex-col gap-4">
          {/* Prosthetics */}
          <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[hsl(104,22%,90%)] px-2 py-0.5 text-xs font-semibold text-[hsl(104,35%,36%)]">
                Prosthetics
              </span>
              <span className="text-sm font-medium text-foreground">
                {PROSTHETICS_BREAKDOWN.activeOrders} active
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {PROSTHETICS_BREAKDOWN.categories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{cat.label}</span>
                  <span className="font-medium text-foreground">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aligner */}
          <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                Aligner
              </span>
              <span className="text-sm font-medium text-foreground">
                {ALIGNER_BREAKDOWN.activeOrders} active
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {ALIGNER_BREAKDOWN.complexity.map((tier) => (
                <div
                  key={tier.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{tier.label}</span>
                  <span className="font-medium text-foreground">{tier.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating snippet */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Your average rating</p>
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={STATS.avgRating} />
              <span className="text-sm font-semibold text-foreground">
                {STATS.avgRating}
              </span>
              <span className="text-xs text-muted-foreground">
                ({STATS.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Recent Orders
          </h2>
          <Link
            href="/provider/queue"
            className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            View All Orders
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Order Ref</th>
                <th className="px-5 py-3 text-left font-medium">Type</th>
                <th className="px-5 py-3 text-left font-medium">Client</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Deadline</th>
                <th className="px-5 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`${
                    idx < RECENT_ORDERS.length - 1 ? "border-b border-border" : ""
                  } hover:bg-muted/30`}
                >
                  <td className="px-5 py-3 font-mono text-xs font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-5 py-3">
                    {order.orderType === "aligner" ? (
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                        Aligner
                      </span>
                    ) : (
                      <span className="rounded-md bg-[hsl(104,22%,90%)] px-2 py-0.5 text-xs font-medium text-[hsl(104,35%,36%)]">
                        Prosthetics
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-foreground">{order.client}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        order.isOverdue
                          ? "font-medium text-red-600"
                          : "text-muted-foreground"
                      }
                    >
                      {order.deadline}
                      {order.isOverdue && (
                        <span className="ml-1 text-xs font-normal">(overdue)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href="/provider/queue">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Open
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="divide-y divide-border sm:hidden">
          {RECENT_ORDERS.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-xs font-medium text-foreground">
                  {order.id}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {order.client}
                </p>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  {order.orderType === "aligner" && (
                    <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                      Aligner
                    </span>
                  )}
                </div>
              </div>
              <Link href="/provider/queue" className="ml-3 shrink-0">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Open
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pending Actions + Quick Actions ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pending Actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Pending Actions
          </h2>
          <div className="space-y-3">
            {PENDING_ACTIONS.map((action) => (
              <div
                key={action.id}
                className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${PendingActionBg(action.type)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <PendingActionIcon type={action.type} />
                  </div>
                  <p className="text-sm text-foreground">{action.description}</p>
                </div>
                <Link href={action.href} className="shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {action.actionLabel}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/provider/queue" className="block">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40">
                <div className="rounded-lg bg-blue-50 p-2">
                  <ListChecks className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Order Queue</p>
                  <p className="text-xs text-muted-foreground">
                    {STATS.newOrders + STATS.inProgress} orders need attention
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/provider/products" className="block">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Manage Products
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Update your service listings
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/provider/reviews" className="block">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40">
                <div className="rounded-lg bg-yellow-50 p-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    View Reviews
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STATS.avgRating} avg · {STATS.reviewCount} reviews
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
