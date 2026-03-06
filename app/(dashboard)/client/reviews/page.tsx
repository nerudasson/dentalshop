"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StarRating from "@/components/ui/star-rating"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string
  orderId: string
  orderType: "prosthetics" | "aligner"
  category: string
  provider: string
  rating: number
  date: string
  snippet: string
  fullText: string
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_REVIEWS: Review[] = [
  {
    id: "rev_001",
    orderId: "ORD-2024-00133",
    orderType: "prosthetics",
    category: "Crowns",
    provider: "ProDesign Lab",
    rating: 5,
    date: "Feb 5, 2026",
    snippet: "Exceptional work — the crown fit perfectly on the first try.",
    fullText:
      "Exceptional work — the crown fit perfectly on the first try. The margins were clean, the anatomy looked natural, and the emergence profile matched the adjacent teeth beautifully. Communication throughout the process was excellent. Delivered two days ahead of schedule. Will absolutely use ProDesign Lab for all future crown work.",
  },
  {
    id: "rev_002",
    orderId: "ORD-2024-00135",
    orderType: "aligner",
    category: "Aligner Design",
    provider: "ClearSmile Studio",
    rating: 4,
    date: "Feb 12, 2026",
    snippet: "Solid treatment plan with good staging and clear documentation.",
    fullText:
      "Solid treatment plan with good staging and clear documentation. The IPR protocol was well thought out and the attachment positions made sense clinically. One minor revision was needed to adjust the staging on the lower arch, but the team was responsive and turned it around quickly. Happy with the result overall.",
  },
  {
    id: "rev_003",
    orderId: "ORD-2024-00137",
    orderType: "prosthetics",
    category: "Implant Abutments",
    provider: "PrecisionCAD Lab",
    rating: 5,
    date: "Feb 17, 2026",
    snippet: "Outstanding precision on the abutment design. Incredibly detailed.",
    fullText:
      "Outstanding precision on the abutment design. Incredibly detailed work — the screw channel placement was exactly where we needed it and the emergence profile was ideal for the soft tissue architecture. PrecisionCAD Lab clearly understands implant aesthetics. This is our third order with them and the quality is consistently excellent.",
  },
  {
    id: "rev_004",
    orderId: "ORD-2024-00130",
    orderType: "prosthetics",
    category: "Veneers",
    provider: "MeshForge Studio",
    rating: 4,
    date: "Jan 22, 2026",
    snippet: "Very happy with the veneer designs. Natural-looking anatomy.",
    fullText:
      "Very happy with the veneer designs. The anatomy looked natural and proportional, and the incisal characterisation was subtle and realistic. Took one small revision for the gingival contours on tooth 13, but MeshForge handled it promptly. Delivery was on time. Would recommend for aesthetic cases.",
  },
  {
    id: "rev_005",
    orderId: "ORD-2024-00128",
    orderType: "prosthetics",
    category: "Crowns",
    provider: "PrecisionCAD Lab",
    rating: 5,
    date: "Jan 12, 2026",
    snippet: "Perfect execution. The molar crown was milled without a single adjustment.",
    fullText:
      "Perfect execution. The molar crown was milled without a single adjustment needed at the chair — seated perfectly, contacts were spot on, and the occlusion was ideal. The special instructions about the steep cusp angle were followed exactly. PrecisionCAD Lab is our go-to for posterior restorations.",
  },
  {
    id: "rev_006",
    orderId: "ORD-2024-00139",
    orderType: "prosthetics",
    category: "Veneers",
    provider: "DentalCAD Pro",
    rating: 3,
    date: "Feb 21, 2026",
    snippet: "Good overall quality but required one revision for thickness.",
    fullText:
      "Good overall quality but required one revision for the minimum thickness on the incisal edge — the first version was slightly underbuilt. The team responded promptly and the corrected files were good. Final result was acceptable. Communication could have been faster in the middle of the process, but the technical skills are there.",
  },
]

// ─── Expandable Row ───────────────────────────────────────────────────────────

interface ReviewRowProps {
  review: Review
}

function ReviewRow({ review }: ReviewRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 font-mono text-xs text-foreground font-medium whitespace-nowrap">
          {review.orderId}
        </td>
        <td className="px-4 py-3 text-foreground whitespace-nowrap">
          <span className="flex items-center gap-2">
            {review.category}
            {review.orderType === "aligner" && (
              <span className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                Aligner
              </span>
            )}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
          {review.provider}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} starClassName="h-3.5 w-3.5" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {review.rating}.0
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-sm">
          {review.date}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
          <span className="line-clamp-1">{review.snippet}</span>
        </td>
        <td className="px-4 py-3">
          <Badge variant="outline" className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-xs whitespace-nowrap">
            Published
          </Badge>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
          >
            {expanded ? (
              <>
                Collapse <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Expand <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </td>
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={8} className="px-4 py-4">
            <div className="flex gap-4 items-start">
              {/* Stars */}
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      strokeWidth={1.5}
                      className={cn(
                        "h-4 w-4 stroke-amber-400",
                        s <= review.rating ? "fill-amber-400" : "fill-transparent"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{review.rating}/5</span>
              </div>
              {/* Text */}
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">{review.fullText}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted {review.date} · {review.provider}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientReviewsPage() {
  const avgRating =
    DUMMY_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / DUMMY_REVIEWS.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your submitted reviews for completed design orders.
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                strokeWidth={1.5}
                className={cn(
                  "h-5 w-5 stroke-amber-400",
                  s <= Math.round(avgRating) ? "fill-amber-400" : "fill-transparent"
                )}
              />
            ))}
          </div>
          <div>
            <span className="text-lg font-semibold text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground"> average</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-foreground">
            {DUMMY_REVIEWS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            review{DUMMY_REVIEWS.length !== 1 ? "s" : ""} submitted
          </span>
        </div>
        <div className="ml-auto flex items-center">
          <span className="text-sm text-muted-foreground italic">
            Pending: 3 orders awaiting your review
          </span>
          <Link
            href="/client/orders?status=REVIEW"
            className="ml-3 text-sm text-[hsl(var(--primary))] hover:underline"
          >
            View orders
          </Link>
        </div>
      </div>

      {/* Table */}
      {DUMMY_REVIEWS.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">No reviews yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reviews appear here after you rate completed orders.
          </p>
        </div>
      ) : (
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
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground max-w-xs">
                    Review
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_REVIEWS.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave a new review CTA */}
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Have a completed order you haven&apos;t reviewed?
        </p>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-3 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(104,22%,94%)]"
        >
          <Link href="/client/orders?status=COMPLETE">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Leave a Review
          </Link>
        </Button>
      </div>
    </div>
  )
}
