"use client"

import Link from "next/link"
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Star,
  Plus,
  ArrowRight,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import StarRating from "@/components/ui/star-rating"
import { useQuery } from "@tanstack/react-query"
import { useRole } from "@/components/providers/role-provider"
import { getClientOrders } from "@/lib/actions/orders"
import type { OrderStatus } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentOrder {
  id: string
  category: string
  orderType: "prosthetics" | "aligner"
  provider: string
  status: OrderStatus
  date: string
}

interface PendingReviewOrder {
  id: string
  category: string
  orderType: "prosthetics" | "aligner"
  provider: string
  submittedAt: string
  price: string
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: React.ReactNode
  iconClass: string
}

function StatCard({ icon, label, value, sub, iconClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
      <div className={`mt-0.5 rounded-lg p-2.5 ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: OrderStatus[] = ['PAID', 'IN_PROGRESS', 'REVIEW', 'REVISION_REQUESTED']

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  const { orgName, orgId } = useRole()

  const { data: result, isLoading } = useQuery({
    queryKey: ['client-orders', orgId],
    queryFn:  () => getClientOrders(orgId),
  })

  const orders = result?.data ?? []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const RECENT_ORDERS = orders.slice(0, 5).map((o) => ({
    id:        o.reference,
    orderId:   o.id,
    category:  formatCategory(o.category),
    orderType: o.categoryType,
    provider:  o.providerName,
    status:    o.status,
    date:      formatDate(o.createdAt),
  }))

  const PENDING_REVIEW_ORDERS = orders
    .filter((o) => o.status === 'REVIEW')
    .slice(0, 3)
    .map((o) => ({
      id:          o.reference,
      orderId:     o.id,
      category:    formatCategory(o.category),
      orderType:   o.categoryType,
      provider:    o.providerName,
      submittedAt: formatDate(o.updatedAt),
      price:       `€${o.totalAmount.toFixed(2)}`,
    }))

  const STATS = {
    activeOrders:       orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    pendingReview:      orders.filter((o) => o.status === 'REVIEW').length,
    completedThisMonth: orders.filter(
      (o) => o.status === 'COMPLETE' && new Date(o.createdAt) >= startOfMonth,
    ).length,
    averageRating: 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {orgName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your orders and recent activity.
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Active Orders"
          value={STATS.activeOrders}
          iconClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Review"
          value={STATS.pendingReview}
          iconClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed This Month"
          value={STATS.completedThisMonth}
          iconClass="bg-[hsl(104,22%,94%)] text-[hsl(104,35%,36%)]"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Avg. Rating Given"
          value={STATS.averageRating.toFixed(1)}
          iconClass="bg-amber-50 text-amber-500"
          sub={
            <StarRating
              rating={STATS.averageRating}
              starClassName="h-3.5 w-3.5"
            />
          }
        />
      </div>

      {/* Pending Reviews */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Awaiting Your Review
            </h2>
            <p className="text-sm text-muted-foreground">
              Designs submitted for your approval
            </p>
          </div>
          <Link
            href="/client/orders?status=REVIEW"
            className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PENDING_REVIEW_ORDERS.map((order) => {
            const href =
              order.orderType === "aligner"
                ? `/client/orders/${order.orderId}/aligner`
                : `/client/orders/${order.orderId}`
            return (
              <div
                key={order.id}
                className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {order.id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.category}
                      {order.orderType === "aligner" && (
                        <span className="ml-1.5 inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-1.5 py-0 text-[10px] font-medium text-teal-700">
                          Aligner
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    In Review
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="text-foreground font-medium">Provider: </span>
                    {order.provider}
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Submitted: </span>
                    {order.submittedAt}
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Total: </span>
                    {order.price}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)]"
                >
                  <Link href={href}>Review Design</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent Orders table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">Your last 5 orders</p>
          </div>
          <Link
            href="/client/orders"
            className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
          >
            View all orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order, i) => {
                  const href =
                    order.orderType === "aligner"
                      ? `/client/orders/${order.orderId}/aligner`
                      : `/client/orders/${order.orderId}`
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-border last:border-0 ${
                        i % 2 === 0 ? "bg-card" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground font-medium whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <span className="flex items-center gap-2">
                          {order.category}
                          {order.orderType === "aligner" && (
                            <span className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                              Aligner
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.provider}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                        >
                          <Link href={href}>
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
