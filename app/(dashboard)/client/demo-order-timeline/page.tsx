import OrderTimeline, {
  getProstheticsTimeline,
  getAlignerTimeline,
} from "@/components/domain/order-timeline"
import type { TimelineEvent, OrderStatus } from "@/lib/types"

// ─── Dummy timestamps ─────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date("2026-03-06T10:00:00Z")
  d.setDate(d.getDate() - n)
  return d
}

/** Attach fake timestamps to the completed steps of a timeline. */
function withTimestamps(events: TimelineEvent[], tsPerStep: (Date | undefined)[]): TimelineEvent[] {
  return events.map((e, i) => ({ ...e, timestamp: tsPerStep[i] }))
}

// ─── Prosthetics scenarios ────────────────────────────────────────────────────

const P_PAID = withTimestamps(
  getProstheticsTimeline("PAID"),
  [daysAgo(2), undefined, undefined, undefined, undefined, undefined]
)

const P_IN_PROGRESS = withTimestamps(
  getProstheticsTimeline("IN_PROGRESS"),
  [daysAgo(5), daysAgo(3), undefined, undefined, undefined, undefined]
)

const P_REVIEW = withTimestamps(
  getProstheticsTimeline("REVIEW"),
  [daysAgo(8), daysAgo(6), daysAgo(2), undefined, undefined, undefined]
)

const P_COMPLETE = withTimestamps(
  getProstheticsTimeline("COMPLETE"),
  [daysAgo(12), daysAgo(10), daysAgo(6), daysAgo(4), daysAgo(2), daysAgo(1)]
)

// ─── Aligner scenarios ────────────────────────────────────────────────────────

const A_PAID = withTimestamps(
  getAlignerTimeline("PAID"),
  [daysAgo(1), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
)

const A_IN_PROGRESS = withTimestamps(
  getAlignerTimeline("IN_PROGRESS"),
  [daysAgo(9), daysAgo(7), undefined, undefined, undefined, undefined, undefined, undefined, undefined]
)

const A_REVIEW = withTimestamps(
  getAlignerTimeline("REVIEW"),
  [daysAgo(18), daysAgo(16), daysAgo(14), daysAgo(10), daysAgo(4), undefined, undefined, undefined, undefined]
)

const A_COMPLETE = withTimestamps(
  getAlignerTimeline("COMPLETE"),
  [
    daysAgo(28), daysAgo(26), daysAgo(24), daysAgo(20),
    daysAgo(14), daysAgo(10), daysAgo(8), daysAgo(3), daysAgo(1),
  ]
)

// ─── Demo section ─────────────────────────────────────────────────────────────

function DemoSection({
  label,
  status,
  events,
}: {
  label: string
  status: OrderStatus
  events: TimelineEvent[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          status: <code className="rounded bg-secondary px-1 py-0.5">{status}</code>
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <OrderTimeline events={events} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoOrderTimelinePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Order Timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/order-timeline
          </code>
          {" "}— includes{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            getProstheticsTimeline
          </code>{" "}and{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            getAlignerTimeline
          </code>{" "}factory functions.
        </p>
      </div>

      {/* ── Prosthetics track ── */}
      <section className="mb-12">
        <h2 className="mb-5 text-base font-semibold text-warm-800">
          Prosthetics track
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DemoSection label="Just paid" status="PAID" events={P_PAID} />
          <DemoSection label="Provider working" status="IN_PROGRESS" events={P_IN_PROGRESS} />
          <DemoSection label="Awaiting review" status="REVIEW" events={P_REVIEW} />
          <DemoSection label="Order complete" status="COMPLETE" events={P_COMPLETE} />
        </div>
      </section>

      {/* ── Aligner track ── */}
      <section>
        <h2 className="mb-5 text-base font-semibold text-warm-800">
          Aligner track
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DemoSection label="Just paid" status="PAID" events={A_PAID} />
          <DemoSection label="Lab reviewing" status="IN_PROGRESS" events={A_IN_PROGRESS} />
          <DemoSection label="Plan in review" status="REVIEW" events={A_REVIEW} />
          <DemoSection label="Order complete" status="COMPLETE" events={A_COMPLETE} />
        </div>
      </section>
    </div>
  )
}
