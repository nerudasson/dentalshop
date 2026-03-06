"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import StarRating from "@/components/ui/star-rating"

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderType = "prosthetics" | "aligner"
type TabFilter = "all" | "pending" | "responded"
type SortKey = "date" | "rating"
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1"

interface Review {
  id: string
  orderRef: string
  clientName: string
  orderType: OrderType
  rating: number
  reviewDate: string     // display string
  reviewDateIso: string  // for sorting
  reviewText: string
  responded: boolean
  responseText?: string
  responseDate?: string
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_REVIEWS: Review[] = [
  {
    id: "rv_1",
    orderRef: "ORD-2026-00138",
    clientName: "Smith Dental Practice",
    orderType: "prosthetics",
    rating: 5,
    reviewDate: "Mar 4, 2026",
    reviewDateIso: "2026-03-04",
    reviewText:
      "Exceptional quality on this crown design. The margin accuracy was perfect and the occlusal morphology was exactly what we needed. Turnaround was faster than expected. Will definitely order again.",
    responded: true,
    responseText:
      "Thank you so much! It was a pleasure working on this case. We put extra care into the occlusal anatomy based on your notes. Looking forward to the next one!",
    responseDate: "Mar 5, 2026",
  },
  {
    id: "rv_2",
    orderRef: "ORD-2026-00131",
    clientName: "Bright Smiles Orthodontics",
    orderType: "aligner",
    rating: 5,
    reviewDate: "Feb 28, 2026",
    reviewDateIso: "2026-02-28",
    reviewText:
      "The treatment plan simulation was incredibly detailed. Staging was well thought out and IPR placement was clinically appropriate. The movement table made chair-side delivery much easier.",
    responded: true,
    responseText:
      "Really glad the staging worked well clinically! We took extra time on the IPR schedule for this case given the crowding pattern. Appreciate the detailed feedback.",
    responseDate: "Mar 1, 2026",
  },
  {
    id: "rv_3",
    orderRef: "ORD-2026-00124",
    clientName: "Valley Dental Lab",
    orderType: "prosthetics",
    rating: 4,
    reviewDate: "Feb 21, 2026",
    reviewDateIso: "2026-02-21",
    reviewText:
      "Good work overall. Bridge design was solid and fit well in the model. One contact point needed slight adjustment on the distal, but nothing major. Good communication throughout.",
    responded: true,
    responseText:
      "Thanks for the feedback on the contact point — noted for future cases. Glad the overall fit was good. Happy to do a free revision if needed.",
    responseDate: "Feb 22, 2026",
  },
  {
    id: "rv_4",
    orderRef: "ORD-2026-00117",
    clientName: "Nordic Dental Group",
    orderType: "aligner",
    rating: 4,
    reviewDate: "Feb 14, 2026",
    reviewDateIso: "2026-02-14",
    reviewText:
      "Solid aligner design. Attachment placement was well considered and the arch expansion was handled conservatively as requested. Would appreciate a slightly faster turnaround next time.",
    responded: false,
  },
  {
    id: "rv_5",
    orderRef: "ORD-2026-00109",
    clientName: "Riverside Dental",
    orderType: "prosthetics",
    rating: 4,
    reviewDate: "Feb 7, 2026",
    reviewDateIso: "2026-02-07",
    reviewText:
      "Nice inlay design, good proximal contacts. The buccal cusp morphology could be a bit more pronounced but it works perfectly fine. Fast delivery and easy communication.",
    responded: false,
  },
  {
    id: "rv_6",
    orderRef: "ORD-2026-00098",
    clientName: "Central City Dental",
    orderType: "prosthetics",
    rating: 3,
    reviewDate: "Jan 29, 2026",
    reviewDateIso: "2026-01-29",
    reviewText:
      "Design was functional but I expected more detail in the anatomy given the complexity selected. Had to request a revision for the occlusal surface. Communication was good but initial output didn't meet expectations.",
    responded: false,
  },
  {
    id: "rv_7",
    orderRef: "ORD-2026-00087",
    clientName: "Bright Smiles Orthodontics",
    orderType: "aligner",
    rating: 2,
    reviewDate: "Jan 18, 2026",
    reviewDateIso: "2026-01-18",
    reviewText:
      "The treatment plan required significant modifications. Staging was too aggressive and the torque corrections weren't accounted for properly. Took two revision rounds to get it right. Not up to the standard I expected.",
    responded: true,
    responseText:
      "We sincerely apologise for the experience on this case. We've reviewed the staging logic and torque correction workflow internally. This revision has been used as a learning case for our team.",
    responseDate: "Jan 20, 2026",
  },
  {
    id: "rv_8",
    orderRef: "ORD-2026-00076",
    clientName: "Smith Dental Practice",
    orderType: "prosthetics",
    rating: 5,
    reviewDate: "Jan 9, 2026",
    reviewDateIso: "2026-01-09",
    reviewText:
      "Incredible implant abutment design. The emergence profile was anatomically perfect and matched the adjacent tooth form beautifully. This is the level of quality we expect from every provider.",
    responded: false,
  },
]

// ─── Derived stats ────────────────────────────────────────────────────────────

function computeStats(reviews: Review[]) {
  if (reviews.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] }
  const total = reviews.length
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total
  const distribution = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  )
  return { avg, total, distribution }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrderTypeBadge({ type }: { type: OrderType }) {
  if (type === "aligner") {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
        Aligner
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
      Prosthetics
    </span>
  )
}

function ResponseStatusBadge({ responded }: { responded: boolean }) {
  if (responded) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#4a7c59]/30 bg-[#f3f7f3] px-2 py-0.5 text-xs font-medium text-[#4a7c59]">
        <CheckCircle2 className="h-3 w-3" />
        Responded
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  )
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number
  count: number
  total: number
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
        {star} star{star !== 1 ? "s" : ""}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-xs text-muted-foreground">{pct}%</span>
      <span className="w-4 shrink-0 text-xs text-muted-foreground">({count})</span>
    </div>
  )
}

function ReviewRow({
  review,
  onSubmitResponse,
}: {
  review: Review
  onSubmitResponse: (id: string, text: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    if (!responseText.trim()) return
    setSubmitting(true)
    // Simulate async
    setTimeout(() => {
      onSubmitResponse(review.id, responseText.trim())
      setSubmitting(false)
    }, 600)
  }

  return (
    <>
      {/* Main row */}
      <tr
        className="cursor-pointer border-b border-border bg-card transition-colors hover:bg-muted/30"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Order ref */}
        <td className="px-4 py-3">
          <span className="font-mono text-xs font-medium text-foreground">
            {review.orderRef}
          </span>
        </td>
        {/* Client */}
        <td className="px-4 py-3 text-sm text-foreground">{review.clientName}</td>
        {/* Order type */}
        <td className="px-4 py-3">
          <OrderTypeBadge type={review.orderType} />
        </td>
        {/* Rating */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <StarRating rating={review.rating} />
            <span className="text-xs text-muted-foreground">{review.rating}.0</span>
          </div>
        </td>
        {/* Date */}
        <td className="px-4 py-3 text-sm text-muted-foreground">{review.reviewDate}</td>
        {/* Status */}
        <td className="px-4 py-3">
          <ResponseStatusBadge responded={review.responded} />
        </td>
        {/* Expand toggle */}
        <td className="px-4 py-3 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </td>
      </tr>

      {/* Expanded panel */}
      {expanded && (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={7} className="px-6 py-5">
            <div className="space-y-4">
              {/* Review text */}
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Star className="h-3 w-3" />
                  Client Review
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-foreground">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </div>

              <Separator />

              {/* Response area */}
              {review.responded ? (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    Your Response
                    <span className="font-normal normal-case">· {review.responseDate}</span>
                  </p>
                  <div className="max-w-2xl rounded-lg border border-[#4a7c59]/20 bg-[#f3f7f3] px-4 py-3 text-sm leading-relaxed text-[#2d5038]">
                    {review.responseText}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    Write a Response
                  </p>
                  <textarea
                    placeholder="Write your response to this review…"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    className="w-full max-w-2xl resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={!responseText.trim() || submitting}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSubmit()
                      }}
                      className="bg-[#4a7c59] text-white hover:bg-[#3d6849] disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit Response"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Responses are visible to all clients viewing your profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(DUMMY_REVIEWS)
  const [tab, setTab] = useState<TabFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "prosthetics" | "aligner">("all")

  // ── Submit response handler ──
  function handleSubmitResponse(id: string, text: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              responded: true,
              responseText: text,
              responseDate: "Mar 6, 2026",
            }
          : r
      )
    )
  }

  // ── Filtered + sorted list ──
  const displayed = useMemo(() => {
    let result = reviews.slice()

    // Tab filter
    if (tab === "pending") result = result.filter((r) => !r.responded)
    if (tab === "responded") result = result.filter((r) => r.responded)

    // Rating filter
    if (ratingFilter !== "all") {
      const stars = parseInt(ratingFilter)
      result = result.filter((r) => r.rating === stars)
    }

    // Type filter
    if (typeFilter !== "all") result = result.filter((r) => r.orderType === typeFilter)

    // Sort
    if (sortKey === "date") {
      result.sort(
        (a, b) =>
          new Date(b.reviewDateIso).getTime() - new Date(a.reviewDateIso).getTime()
      )
    } else {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [reviews, tab, ratingFilter, typeFilter, sortKey])

  // ── Stats (over ALL reviews, not filtered) ──
  const { avg, total, distribution } = useMemo(() => computeStats(reviews), [reviews])

  // ── Tab counts ──
  const pendingCount = reviews.filter((r) => !r.responded).length
  const respondedCount = reviews.filter((r) => r.responded).length

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    { key: "pending", label: "Pending Response", count: pendingCount },
    { key: "responded", label: "Responded", count: respondedCount },
  ]

  const hasActiveFilters =
    ratingFilter !== "all" || typeFilter !== "all" || tab !== "all"

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Client reviews and ratings for your studio&apos;s completed work.
        </p>
      </div>

      {/* ── Aggregate rating card ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card px-6 py-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          {/* Left — big rating */}
          <div className="flex shrink-0 flex-col items-center sm:items-start">
            <span className="text-5xl font-bold text-foreground">
              {avg.toFixed(1)}
            </span>
            <StarRating
              rating={avg}
              className="mt-1.5"
              starClassName="h-5 w-5"
            />
            <p className="mt-1.5 text-sm text-muted-foreground">
              Based on {total} review{total !== 1 ? "s" : ""}
            </p>
          </div>

          <Separator orientation="vertical" className="hidden h-24 sm:block" />
          <Separator className="sm:hidden" />

          {/* Right — distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <RatingBar
                key={star}
                star={star}
                count={distribution[i]}
                total={total}
              />
            ))}
          </div>

          {/* Right — quick stats */}
          <div className="hidden shrink-0 flex-col gap-3 lg:flex">
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Pending response</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Response rate</p>
              <p className="mt-1 text-2xl font-bold text-[#4a7c59]">
                {total > 0 ? Math.round((respondedCount / total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab row ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-xs",
                tab === key ? "bg-muted text-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filter + sort row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />

        {/* Sort */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          {(["date", "rating"] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortKey(key)}
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                sortKey === key
                  ? "border-[#4a7c59] bg-[#f3f7f3] text-[#4a7c59]"
                  : "border-border bg-background text-foreground hover:border-[#4a7c59]/50",
              ].join(" ")}
            >
              {key === "date" ? "Date" : "Rating"}
            </button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Rating filter */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Stars:</span>
          {(["all", "5", "4", "3", "2", "1"] as RatingFilter[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRatingFilter(r)}
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                ratingFilter === r
                  ? "border-[#4a7c59] bg-[#f3f7f3] text-[#4a7c59]"
                  : "border-border bg-background text-foreground hover:border-[#4a7c59]/50",
              ].join(" ")}
            >
              {r === "all" ? "All" : `${r}★`}
            </button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Order type filter */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Type:</span>
          {(
            [
              { key: "all", label: "All" },
              { key: "prosthetics", label: "Prosthetics" },
              { key: "aligner", label: "Aligner" },
            ] as { key: "all" | "prosthetics" | "aligner"; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTypeFilter(key)}
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                typeFilter === key
                  ? "border-[#4a7c59] bg-[#f3f7f3] text-[#4a7c59]"
                  : "border-border bg-background text-foreground hover:border-[#4a7c59]/50",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setTab("all")
              setRatingFilter("all")
              setTypeFilter("all")
            }}
            className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {reviews.length === 0
              ? "No reviews yet."
              : "No reviews match the current filters."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reviews.length === 0
              ? "Reviews will appear here after clients rate your work."
              : "Try adjusting the sort or filter options above."}
          </p>
          {reviews.length > 0 && hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setTab("all")
                setRatingFilter("all")
                setTypeFilter("all")
              }}
              className="mt-3 text-xs font-medium text-[#4a7c59] underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    "Order Ref",
                    "Client",
                    "Type",
                    "Rating",
                    "Review Date",
                    "Response",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onSubmitResponse={handleSubmitResponse}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border sm:hidden">
            {displayed.map((review) => (
              <MobileReviewCard
                key={review.id}
                review={review}
                onSubmitResponse={handleSubmitResponse}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      {displayed.length > 0 && (
        <p className="text-right text-xs text-muted-foreground">
          Showing {displayed.length} of {reviews.length} review
          {reviews.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

// ─── Mobile card variant ──────────────────────────────────────────────────────

function MobileReviewCard({
  review,
  onSubmitResponse,
}: {
  review: Review
  onSubmitResponse: (id: string, text: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    if (!responseText.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      onSubmitResponse(review.id, responseText.trim())
      setSubmitting(false)
    }, 600)
  }

  return (
    <div className="bg-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-foreground">
              {review.orderRef}
            </span>
            <OrderTypeBadge type={review.orderType} />
          </div>
          <p className="text-sm text-foreground">{review.clientName}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="text-xs text-muted-foreground">{review.reviewDate}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ResponseStatusBadge responded={review.responded} />
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Review
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              &ldquo;{review.reviewText}&rdquo;
            </p>
          </div>
          <Separator />
          {review.responded ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Response · {review.responseDate}
              </p>
              <div className="rounded-lg border border-[#4a7c59]/20 bg-[#f3f7f3] px-3 py-2.5 text-sm leading-relaxed text-[#2d5038]">
                {review.responseText}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Write a Response
              </p>
              <textarea
                placeholder="Write your response…"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="sm"
                disabled={!responseText.trim() || submitting}
                onClick={handleSubmit}
                className="mt-2 bg-[#4a7c59] text-white hover:bg-[#3d6849] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Response"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
