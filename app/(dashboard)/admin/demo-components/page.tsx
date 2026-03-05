import StarRating from "@/components/ui/star-rating"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import InteractiveStarDemo from "./interactive-star-demo"
import type { OrderStatus } from "@/lib/types/order"

// ─── All statuses for the badge demo ─────────────────────────────────────────

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "in_progress",
  "in_review",
  "revision_requested",
  "completed",
  "cancelled",
  "treatment_planning",
  "simulation_submitted",
  "modifications_requested",
  "treatment_plan_approved",
  "deliverables_uploaded",
]

// ─── Demo section wrapper ─────────────────────────────────────────────────────

function DemoSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      <div className="rounded-lg border border-border bg-card p-6">{children}</div>
    </section>
  )
}

function DemoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border/50 py-3 last:border-0 last:pb-0 first:pt-0">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoComponentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Component Demo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          StarRating and OrderStatusBadge — used across reviews, order lists, and workspaces.
        </p>
      </div>

      {/* ── StarRating ──────────────────────────────────────────────────── */}
      <DemoSection title="StarRating">
        <div className="divide-y divide-border/50">
          {/* Sizes */}
          <DemoRow label="Sizes (value=4)">
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center gap-1">
                <StarRating value={4} readonly size="sm" />
                <span className="text-[10px] text-muted-foreground">sm</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <StarRating value={4} readonly size="md" />
                <span className="text-[10px] text-muted-foreground">md</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <StarRating value={4} readonly size="lg" />
                <span className="text-[10px] text-muted-foreground">lg</span>
              </div>
            </div>
          </DemoRow>

          {/* Decimal values */}
          <DemoRow label="Decimal display">
            <div className="flex flex-wrap items-center gap-4">
              {([1, 1.5, 2.5, 3, 3.5, 4.5, 5] as const).map((v) => (
                <StarRating key={v} value={v} readonly showValue />
              ))}
            </div>
          </DemoRow>

          {/* showValue */}
          <DemoRow label="showValue">
            <div className="flex flex-wrap items-center gap-6">
              <StarRating value={4.2} readonly showValue size="sm" />
              <StarRating value={3.8} readonly showValue size="md" />
              <StarRating value={4.9} readonly showValue size="lg" />
            </div>
          </DemoRow>

          {/* Interactive */}
          <DemoRow label="Interactive">
            <InteractiveStarDemo />
          </DemoRow>
        </div>
      </DemoSection>

      {/* ── OrderStatusBadge ────────────────────────────────────────────── */}
      <DemoSection title="OrderStatusBadge">
        <div className="divide-y divide-border/50">
          {/* md size — all statuses */}
          <DemoRow label="md (all statuses)">
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <OrderStatusBadge key={status} status={status} size="md" />
              ))}
            </div>
          </DemoRow>

          {/* sm size */}
          <DemoRow label="sm (all statuses)">
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <OrderStatusBadge key={status} status={status} size="sm" />
              ))}
            </div>
          </DemoRow>

          {/* Grouped by track */}
          <DemoRow label="Shared statuses">
            <div className="flex flex-wrap gap-2">
              {(["pending", "in_progress", "completed", "cancelled"] as OrderStatus[]).map(
                (s) => <OrderStatusBadge key={s} status={s} />
              )}
            </div>
          </DemoRow>

          <DemoRow label="Prosthetics track">
            <div className="flex flex-wrap gap-2">
              {(["in_review", "revision_requested"] as OrderStatus[]).map(
                (s) => <OrderStatusBadge key={s} status={s} />
              )}
            </div>
          </DemoRow>

          <DemoRow label="Aligner track">
            <div className="flex flex-wrap gap-2">
              {([
                "treatment_planning",
                "simulation_submitted",
                "modifications_requested",
                "treatment_plan_approved",
                "deliverables_uploaded",
              ] as OrderStatus[]).map(
                (s) => <OrderStatusBadge key={s} status={s} />
              )}
            </div>
          </DemoRow>
        </div>
      </DemoSection>
    </div>
  )
}
