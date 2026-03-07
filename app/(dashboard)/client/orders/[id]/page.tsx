"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  History,
  Shield,
  Lock,
  Download,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import StarRating from "@/components/ui/star-rating"
import PriceSummary from "@/components/domain/price-summary"
import OrderTimeline, { getProstheticsTimeline } from "@/components/domain/order-timeline"
import FileDownloadList from "@/components/domain/file-download-list"
import MessageThread, { type ThreadMessage } from "@/components/domain/message-thread"
import type { OrderStatus, DesignParameters } from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_ORDER = {
  id: "ord_001",
  reference: "ORD-2024-00142",
  status: "REVIEW" as OrderStatus,
  category: "Crowns",
  selectedTeeth: [14, 15, 24],
  placedAt: new Date("2024-11-18T10:30:00"),
  provider: {
    id: "p1",
    name: "ClearCAD Studio",
    location: "Berlin, DE",
    rating: 4.9,
    reviewCount: 312,
    software: ["exocad", "3Shape"],
  },
  designParams: {
    marginSettings: "0.05mm",
    spacerThickness: "0.03mm",
    minimumThickness: "0.5mm",
    contactStrength: "Medium",
    occlusionType: "Medium Contact",
    specialInstructions:
      "Please ensure tight contacts on mesial side of tooth 14. Patient has a slightly deep bite.",
  } satisfies DesignParameters,
  scanFiles: [
    { id: "sf1", name: "upper_arch_scan.stl", fileSize: 4_210_000, url: "#", uploadedAt: new Date("2024-11-18T10:35:00") },
    { id: "sf2", name: "lower_arch_scan.stl", fileSize: 3_870_000, url: "#", uploadedAt: new Date("2024-11-18T10:35:00") },
    { id: "sf3", name: "bite_registration.stl", fileSize: 1_540_000, url: "#", uploadedAt: new Date("2024-11-18T10:35:00") },
  ],
  designFiles: [
    { id: "df1", name: "crown_14_final.stl", fileSize: 1_190_000, url: "#" },
    { id: "df2", name: "crown_15_final.stl", fileSize: 1_090_000, url: "#" },
    { id: "df3", name: "crown_24_final.stl", fileSize: 970_000, url: "#" },
  ],
  revisions: [
    {
      id: "rev1",
      requestedAt: new Date("2024-11-20T14:00:00"),
      notes:
        "The contact point on tooth 14 is slightly open. Please adjust the mesial contact to medium strength and recheck occlusal clearance.",
    },
  ],
  pricing: {
    basePrice: 85,
    additionalTeeth: 30,
    subtotal: 115,
    serviceFeePercent: 5,
    serviceFeeAmount: 5.75,
    vatPercent: 19,
    vatAmount: 22.94,
    total: 143.69,
  },
}

const DUMMY_MESSAGES: ThreadMessage[] = [
  {
    id: "msg1",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Hi! I have reviewed your scan files. Everything looks good — I will start working on the design shortly.",
    sentAt: new Date("2024-11-18T11:45:00"),
  },
  {
    id: "msg2",
    senderRole: "client",
    senderName: "Smith Dental",
    content:
      "Great, thank you! Please pay attention to the mesial contact on tooth 14. The patient has a tight bite.",
    sentAt: new Date("2024-11-18T12:10:00"),
  },
  {
    id: "msg3",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Noted! I have uploaded the design files for your review. Please check all three crowns and let me know if any adjustments are needed.",
    sentAt: new Date("2024-11-20T09:30:00"),
  },
]

// ─── Status-derived visibility ────────────────────────────────────────────────

function getVisibleSections(status: OrderStatus) {
  const isAtLeastInProgress = ["IN_PROGRESS", "REVIEW", "REVISION_REQUESTED", "COMPLETE", "DISPUTED", "RESOLVED"].includes(status)
  const hasDeliverables = ["REVIEW", "REVISION_REQUESTED", "COMPLETE", "DISPUTED", "RESOLVED"].includes(status)

  return {
    /** Always visible */
    showOrderInfo: true,
    /** Status-specific callout message (pending / in-progress) */
    showStatusCallout: ["PAID", "IN_PROGRESS", "REVISION_REQUESTED"].includes(status),
    /** Design files submitted by provider */
    showDesignDeliverables: hasDeliverables,
    /** Approve / Request Revision panel */
    showReviewDecision: status === "REVIEW",
    /** Message thread */
    showMessages: isAtLeastInProgress,
    /** Rating prompt after completion */
    showRatingPrompt: status === "COMPLETE",
  }
}

function getStatusCallout(status: OrderStatus): { icon: React.ReactNode; text: string; subtext?: string } | null {
  if (status === "PAID") {
    return {
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      text: "Waiting for provider to start",
      subtext: "Your provider has been notified and will begin work shortly.",
    }
  }
  if (status === "IN_PROGRESS") {
    return {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      text: "Provider is working on your design",
      subtext: "You will be notified once the design files are ready for review.",
    }
  }
  if (status === "REVISION_REQUESTED") {
    return {
      icon: <RotateCcw className="h-4 w-4 text-orange-500" />,
      text: "Revision in progress",
      subtext: "The provider is updating the design based on your revision request.",
    }
  }
  return null
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

// ─── Design parameters summary ────────────────────────────────────────────────

function DesignParamsSummary({ params }: { params: DesignParameters }) {
  const rows = [
    { label: "Margin", value: params.marginSettings },
    { label: "Spacer thickness", value: params.spacerThickness },
    { label: "Min. thickness", value: params.minimumThickness },
    { label: "Contact strength", value: params.contactStrength },
    { label: "Occlusion", value: params.occlusionType },
  ]

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-warm-800">{value}</dd>
          </div>
        ))}
      </dl>

      {params.specialInstructions && (
        <div className="rounded-md bg-warm-50 px-3 py-2.5">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Special instructions</p>
          <p className="text-sm text-warm-800">{params.specialInstructions}</p>
        </div>
      )}
    </div>
  )
}

// ─── Interactive star rating ──────────────────────────────────────────────────

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            className="cursor-pointer text-amber-400 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={display >= starValue ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-8 w-8"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

// ─── Revision history ─────────────────────────────────────────────────────────

function RevisionHistory({
  revisions,
}: {
  revisions: Array<{ id: string; requestedAt: Date; notes: string }>
}) {
  if (revisions.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        <span>Revision history</span>
      </div>
      <div className="space-y-2">
        {revisions.map((rev, idx) => (
          <div key={rev.id} className="rounded-md border border-orange-100 bg-orange-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-orange-700">
                Revision #{idx + 1}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {rev.requestedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-warm-800">{rev.notes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Approval confirmation dialog ─────────────────────────────────────────────

function ApprovalConfirmationDialog({
  providerName,
  totalAmount,
  providerNet,
  onConfirm,
  onCancel,
}: {
  providerName: string
  totalAmount: number
  providerNet: number
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100">
              <Shield className="h-4 w-4 text-sage-600" />
            </div>
            <h2 className="text-base font-semibold text-warm-800">
              Approve Design &amp; Release Payment
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="ml-4 rounded-md p-1 text-muted-foreground hover:text-warm-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-warm-800 font-medium">By approving this design, you confirm:</p>

          {/* Checklist */}
          <ul className="space-y-3">
            {[
              "The design files meet your requirements",
              "You authorize the release of payment to the provider",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                <span className="text-sm text-warm-800">{item}</span>
              </li>
            ))}
          </ul>

          {/* Amount */}
          <div className="rounded-lg border border-sage-200 bg-sage-50 px-4 py-3">
            <p className="text-sm font-semibold text-warm-800">
              €{totalAmount.toFixed(2)} will be released to {providerName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Provider receives €{providerNet.toFixed(2)} after platform commission
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-sage-500 text-white hover:bg-sage-400"
            onClick={onConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm &amp; Release Payment
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Review decision section ──────────────────────────────────────────────────

type DecisionState = "idle" | "confirming_approve" | "revising" | "confirmed_approve" | "confirmed_revise"

function ReviewDecisionPanel({
  revisions,
  providerName,
  totalAmount,
  providerNet,
}: {
  revisions: Array<{ id: string; requestedAt: Date; notes: string }>
  providerName: string
  totalAmount: number
  providerNet: number
}) {
  const [decision, setDecision] = useState<DecisionState>("idle")
  const [revisionNotes, setRevisionNotes] = useState("")

  if (decision === "confirmed_approve") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-sage-400 bg-sage-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Design approved</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Payment has been released to the provider. Your design files are ready to download.
          </p>
        </div>
      </div>
    )
  }

  if (decision === "confirmed_revise") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-4">
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Revision requested</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The provider has been notified and will revise the design based on your notes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Confirmation dialog (rendered in portal-like overlay) */}
      {decision === "confirming_approve" && (
        <ApprovalConfirmationDialog
          providerName={providerName}
          totalAmount={totalAmount}
          providerNet={providerNet}
          onConfirm={() => setDecision("confirmed_approve")}
          onCancel={() => setDecision("idle")}
        />
      )}

      <div className="space-y-4">
        {/* Instruction */}
        <div className="flex items-start gap-2 rounded-md bg-warm-50 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-warm-800">
            Review the design files in your CAD software before making a decision. Approving
            releases escrow payment to the provider.
          </p>
        </div>

        {/* Action buttons */}
        {decision === "idle" && (
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-sage-500 text-white hover:bg-sage-400"
              onClick={() => setDecision("confirming_approve")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Design
            </Button>
            <Button variant="outline" onClick={() => setDecision("revising")}>
              <RotateCcw className="h-4 w-4" />
              Request Revision
            </Button>
          </div>
        )}

        {/* Revision notes form */}
        {decision === "revising" && (
          <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 p-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-warm-800">
                Describe what needs to be changed
              </span>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. The mesial contact on tooth 14 is too light. Please increase to medium strength and adjust the occlusal clearance on tooth 15."
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-400"
                disabled={!revisionNotes.trim()}
                onClick={() => setDecision("confirmed_revise")}
              >
                Submit Revision Request
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDecision("idle")
                  setRevisionNotes("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Revision history */}
        <RevisionHistory revisions={revisions} />
      </div>
    </>
  )
}

// ─── Rating prompt (COMPLETE status) ─────────────────────────────────────────

function RatingPrompt({ providerName }: { providerName: string }) {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [comment, setComment] = useState("")

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-sage-400 bg-sage-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Review submitted</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Thank you for rating {providerName}. Your feedback helps the community.
          </p>
          <div className="mt-2">
            <StarRating rating={rating} starClassName="h-4 w-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-warm-800">
          How was your experience with <span className="font-medium">{providerName}</span>?
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your review helps other dentists and labs find great providers.
        </p>
      </div>

      <InteractiveStarRating value={rating} onChange={setRating} />

      {rating > 0 && (
        <div className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (optional)…"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            className="bg-sage-500 text-white hover:bg-sage-400"
            onClick={() => setSubmitted(true)}
          >
            <Star className="h-4 w-4" />
            Submit Review
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Escrow status card ───────────────────────────────────────────────────────

type EscrowCardVariant = "secured" | "in_review" | "completed"

function getEscrowCardVariant(status: OrderStatus): EscrowCardVariant {
  if (["COMPLETE", "RESOLVED"].includes(status)) return "completed"
  if (status === "REVIEW") return "in_review"
  return "secured"
}

function EscrowStatusCard({
  variant,
  totalAmount,
  providerName,
  escrowDaysRemaining = 12,
  releasedAt,
}: {
  variant: EscrowCardVariant
  totalAmount: number
  providerName: string
  escrowDaysRemaining?: number
  releasedAt?: Date
}) {
  const autoReleaseDays = 14
  const elapsed = autoReleaseDays - escrowDaysRemaining
  const progressPct = Math.round((elapsed / autoReleaseDays) * 100)
  const isWarning = escrowDaysRemaining <= 3

  if (variant === "completed") {
    const dateStr = releasedAt
      ? releasedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "recently"

    return (
      <div className="rounded-lg border border-sage-200 bg-sage-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-sage-500 shrink-0" />
          <span className="text-sm font-semibold text-warm-800">Payment Released</span>
        </div>
        <p className="text-lg font-bold text-warm-800">€{totalAmount.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">released to {providerName}</p>
        <p className="text-xs text-muted-foreground mt-1">Released on {dateStr}</p>
      </div>
    )
  }

  if (variant === "in_review") {
    return (
      <div className={cn(
        "rounded-lg border p-4",
        isWarning ? "border-amber-300 bg-amber-50" : "border-teal-200 bg-teal-50"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Lock className={cn("h-4 w-4 shrink-0", isWarning ? "text-amber-600" : "text-teal-600")} />
          <span className="text-sm font-semibold text-warm-800">Payment in Escrow</span>
        </div>
        <p className="text-lg font-bold text-warm-800">€{totalAmount.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">held securely</p>
        <p className={cn("text-xs mt-2 font-medium", isWarning ? "text-amber-700" : "text-muted-foreground")}>
          {isWarning
            ? `Auto-release in ${escrowDaysRemaining} days`
            : `Auto-releases in ${escrowDaysRemaining} days if no action taken`}
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-teal-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isWarning ? "bg-amber-500" : "bg-teal-500")}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className={cn("text-xs mt-1.5 tabular-nums", isWarning ? "text-amber-700 font-medium" : "text-muted-foreground")}>
          {escrowDaysRemaining} days remaining
        </p>
      </div>
    )
  }

  // variant === "secured"
  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-teal-600 shrink-0" />
        <span className="text-sm font-semibold text-warm-800">Payment Secured</span>
      </div>
      <p className="text-lg font-bold text-warm-800">€{totalAmount.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">held in escrow</p>
      <p className="text-xs text-muted-foreground mt-2">
        Funds will be released when you approve the design
      </p>
    </div>
  )
}

// ─── Payment receipt card ─────────────────────────────────────────────────────

function PaymentReceiptCard({
  totalAmount,
  providerName,
  releasedAt,
}: {
  totalAmount: number
  providerName: string
  releasedAt: Date
}) {
  const dateStr = releasedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-sage-200 bg-sage-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-medium text-warm-800">
            Payment of €{totalAmount.toFixed(2)} released to {providerName} on {dateStr}
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" className="shrink-0 gap-1.5 text-xs">
        <Download className="h-3.5 w-3.5" />
        Download Invoice
      </Button>
    </div>
  )
}

// ─── Provider sidebar card ────────────────────────────────────────────────────

function ProviderCard({
  provider,
}: {
  provider: typeof DUMMY_ORDER.provider
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Provider
      </h3>

      {/* Name + avatar */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-bold text-sage-800">
          {provider.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-warm-800">{provider.name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {provider.location}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <StarRating rating={provider.rating} starClassName="h-3.5 w-3.5" />
        <span className="text-xs text-muted-foreground">
          {provider.rating} ({provider.reviewCount} reviews)
        </span>
      </div>

      {/* Software pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {provider.software.map((sw) => (
          <Badge key={sw} variant="outline" className="bg-warm-50 text-xs text-warm-700">
            {sw}
          </Badge>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const order = DUMMY_ORDER
  const sections = getVisibleSections(order.status)
  const statusCallout = getStatusCallout(order.status)
  const escrowCardVariant = getEscrowCardVariant(order.status)
  const timeline = getProstheticsTimeline(order.status)
  // Provider net = design price minus 12.5% platform commission
  const providerNet = order.pricing.subtotal * 0.875
  // Dummy released date for COMPLETE status
  const paymentReleasedAt = new Date("2024-11-22T16:45:00")

  const formattedDate = order.placedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm">
          <Link href="/client/dashboard" className="text-muted-foreground hover:text-warm-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link href="/client/orders" className="text-muted-foreground hover:text-warm-800 transition-colors">
            Orders
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-warm-800">{order.reference}</span>
        </nav>

        {/* ── Page header ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-warm-800">{order.reference}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.provider.name} &middot; Placed {formattedDate}
            </p>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* ════ Main content ════ */}
          <div className="space-y-5">

            {/* Status callout banner */}
            {sections.showStatusCallout && statusCallout && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                {statusCallout.icon}
                <div>
                  <p className="text-sm font-semibold text-warm-800">{statusCallout.text}</p>
                  {statusCallout.subtext && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{statusCallout.subtext}</p>
                  )}
                </div>
              </div>
            )}

            {/* 1 ── Order info */}
            {sections.showOrderInfo && (
              <Section title="Order Info">
                <div className="space-y-5">
                  {/* Category + teeth */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Product category</p>
                      <p className="text-sm font-medium text-warm-800">{order.category}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        Selected teeth ({order.selectedTeeth.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {order.selectedTeeth.map((tooth) => (
                          <Badge
                            key={tooth}
                            variant="outline"
                            className="bg-sage-50 text-xs font-mono text-sage-800"
                          >
                            {tooth}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-border" />

                  {/* Design parameters */}
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Design parameters</p>
                    <DesignParamsSummary params={order.designParams} />
                  </div>

                  {/* Divider */}
                  <hr className="border-border" />

                  {/* Uploaded scan files */}
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                      Uploaded scan files
                    </p>
                    <FileDownloadList files={order.scanFiles} />
                  </div>
                </div>
              </Section>
            )}

            {/* 2 ── Design deliverables */}
            {sections.showDesignDeliverables && (
              <Section title="Design Deliverables">
                <p className="mb-3 text-xs text-muted-foreground">
                  Design files submitted by {order.provider.name}. Download and open in your CAD
                  software to review.
                </p>
                <FileDownloadList files={order.designFiles} />
              </Section>
            )}

            {/* 3 ── Review decision */}
            {sections.showReviewDecision && (
              <Section title="Review Decision">
                <ReviewDecisionPanel
                  revisions={order.revisions}
                  providerName={order.provider.name}
                  totalAmount={order.pricing.total}
                  providerNet={providerNet}
                />
              </Section>
            )}

            {/* 4 ── Rating prompt (COMPLETE) */}
            {sections.showRatingPrompt && (
              <Section title="Rate Your Provider">
                <div className="space-y-4">
                  <PaymentReceiptCard
                    totalAmount={order.pricing.total}
                    providerName={order.provider.name}
                    releasedAt={paymentReleasedAt}
                  />
                  <RatingPrompt providerName={order.provider.name} />
                </div>
              </Section>
            )}

            {/* 5 ── Message thread */}
            {sections.showMessages && (
              <Section title="Messages">
                <MessageThread
                  messages={DUMMY_MESSAGES}
                  currentRole="client"
                  currentUserName="Smith Dental"
                />
              </Section>
            )}
          </div>

          {/* ════ Sidebar ════ */}
          <aside className="space-y-4">
            {/* Price summary */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Order Total
              </p>
              <PriceSummary
                lineItems={[
                  { label: "Crown design (×1)", amount: order.pricing.basePrice },
                  { label: "Additional teeth (×2)", amount: order.pricing.additionalTeeth },
                ]}
                subtotal={order.pricing.subtotal}
                serviceFee={{
                  label: "Service Fee",
                  percentage: order.pricing.serviceFeePercent,
                  amount: order.pricing.serviceFeeAmount,
                }}
                vat={{
                  label: "VAT",
                  percentage: order.pricing.vatPercent,
                  amount: order.pricing.vatAmount,
                }}
                total={order.pricing.total}
              />
            </div>

            {/* Escrow status card */}
            <EscrowStatusCard
              variant={escrowCardVariant}
              totalAmount={order.pricing.total}
              providerName={order.provider.name}
              escrowDaysRemaining={escrowCardVariant === "in_review" ? 4 : undefined}
              releasedAt={escrowCardVariant === "completed" ? paymentReleasedAt : undefined}
            />

            {/* Order timeline */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Order Progress
              </p>
              <div className="rounded-lg border border-border bg-card p-4">
                <OrderTimeline events={timeline} />
              </div>
            </div>

            {/* Provider card */}
            <ProviderCard provider={order.provider} />
          </aside>
        </div>
      </div>
    </div>
  )
}
