"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, CheckCircle2, ArrowLeft, Calendar, Building2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

// ─── Dummy order context ──────────────────────────────────────────────────────

interface OrderContext {
  id: string
  category: string
  orderType: "prosthetics" | "aligner"
  provider: string
  completedAt: string
  status: OrderStatus
}

const DUMMY_ORDERS: Record<string, OrderContext> = {
  "ORD-2024-00139": {
    id: "ORD-2024-00139",
    category: "Veneers",
    orderType: "prosthetics",
    provider: "DentalCAD Pro",
    completedAt: "Feb 20, 2026",
    status: "COMPLETE",
  },
  "ORD-2024-00133": {
    id: "ORD-2024-00133",
    category: "Crowns",
    orderType: "prosthetics",
    provider: "ProDesign Lab",
    completedAt: "Feb 3, 2026",
    status: "COMPLETE",
  },
  "ORD-2024-00135": {
    id: "ORD-2024-00135",
    category: "Aligner Design",
    orderType: "aligner",
    provider: "ClearSmile Studio",
    completedAt: "Feb 10, 2026",
    status: "COMPLETE",
  },
  "ORD-2024-00137": {
    id: "ORD-2024-00137",
    category: "Implant Abutments",
    orderType: "prosthetics",
    provider: "PrecisionCAD Lab",
    completedAt: "Feb 15, 2026",
    status: "COMPLETE",
  },
  "ORD-2024-00130": {
    id: "ORD-2024-00130",
    category: "Veneers",
    orderType: "prosthetics",
    provider: "MeshForge Studio",
    completedAt: "Jan 20, 2026",
    status: "COMPLETE",
  },
  "ORD-2024-00128": {
    id: "ORD-2024-00128",
    category: "Crowns",
    orderType: "prosthetics",
    provider: "PrecisionCAD Lab",
    completedAt: "Jan 10, 2026",
    status: "COMPLETE",
  },
}

// Fallback for unknown order IDs
const FALLBACK_ORDER: OrderContext = {
  id: "ORD-2024-00142",
  category: "Crowns",
  orderType: "prosthetics",
  provider: "ClearCAD Studio",
  completedAt: "Mar 1, 2026",
  status: "COMPLETE",
}

// ─── Star Rating Labels ───────────────────────────────────────────────────────

const STAR_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
}

// ─── Interactive Star Rating ──────────────────────────────────────────────────

interface InteractiveStarRatingProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

function InteractiveStarRating({ value, onChange, disabled }: InteractiveStarRatingProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={cn(
              "rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !disabled && "hover:scale-110 active:scale-95",
              disabled && "cursor-default opacity-60"
            )}
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={cn(
                "h-9 w-9 stroke-amber-400 transition-colors",
                active >= star ? "fill-amber-400" : "fill-transparent"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <span className={cn("text-sm font-medium", active > 0 ? "text-amber-600" : "text-muted-foreground")}>
        {active > 0 ? STAR_LABELS[active] : "Select a rating"}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MIN_CHARS = 20
const MAX_CHARS = 1000

export default function ReviewSubmissionPage({
  params,
}: {
  params: { orderId: string }
}) {
  const order = DUMMY_ORDERS[params.orderId] ?? { ...FALLBACK_ORDER, id: params.orderId }

  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState(false)

  const ratingError = touched && rating === 0 ? "Please select a rating." : null
  const textError =
    touched && text.trim().length > 0 && text.trim().length < MIN_CHARS
      ? `Minimum ${MIN_CHARS} characters required.`
      : null
  const isValid = rating > 0 && text.trim().length >= MIN_CHARS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    setSubmitted(true)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(104,22%,94%)]">
          <CheckCircle2 className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Thank you for your review!</h1>
        <p className="text-sm text-muted-foreground">
          Your feedback helps other dental practices find great design providers.
        </p>
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              strokeWidth={1.5}
              className={cn(
                "h-6 w-6 stroke-amber-400",
                s <= rating ? "fill-amber-400" : "fill-transparent"
              )}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-amber-600">{STAR_LABELS[rating]}</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-left text-sm text-muted-foreground italic">
          &ldquo;{text}&rdquo;
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/client/reviews">View All Reviews</Link>
          </Button>
          <Button asChild className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)]">
            <Link href="/client/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back link */}
      <Link
        href="/client/reviews"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Reviews
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Leave a Review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your experience to help other practices choose the right provider.
        </p>
      </div>

      {/* Order context */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Order
        </h2>
        <p className="font-mono text-base font-semibold text-foreground">{order.id}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            {order.category}
            {order.orderType === "aligner" && (
              <span className="ml-1 inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-1.5 py-0 text-[10px] font-medium text-teal-700">
                Aligner
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {order.provider}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Completed {order.completedAt}
          </span>
        </div>
      </div>

      {/* Review form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star rating */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Overall Rating <span className="text-destructive">*</span>
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How would you rate this design provider?
            </p>
          </div>
          <InteractiveStarRating value={rating} onChange={setRating} />
          {ratingError && (
            <p className="text-xs text-destructive">{ratingError}</p>
          )}
        </div>

        {/* Review text */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <label htmlFor="review-text" className="text-sm font-medium text-foreground">
              Your Experience <span className="text-destructive">*</span>
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Share your experience with {order.provider}
            </p>
          </div>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            onBlur={() => setTouched(true)}
            rows={5}
            placeholder="Describe the quality of the design work, communication, turnaround time, and anything else that stood out…"
            className={cn(
              "flex w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "min-h-[120px]",
              textError ? "border-destructive" : "border-input"
            )}
          />
          <div className="flex items-start justify-between gap-2">
            <div>
              {textError ? (
                <p className="text-xs text-destructive">{textError}</p>
              ) : text.trim().length > 0 && text.trim().length < MIN_CHARS ? (
                <p className="text-xs text-muted-foreground">
                  {MIN_CHARS - text.trim().length} more characters needed
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "text-xs tabular-nums",
                text.length >= MAX_CHARS * 0.9
                  ? "text-amber-600"
                  : "text-muted-foreground"
              )}
            >
              {text.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost">
            <Link href="/client/reviews">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] px-8"
            disabled={touched && !isValid}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  )
}
