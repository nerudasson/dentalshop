"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  StickyNote,
  Ban,
  RefreshCw,
  CreditCard,
  ExternalLink,
  User,
  Building2,
  Mail,
  Clock,
  RotateCcw,
  History,
  Shield,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import OrderTimeline, {
  getProstheticsTimeline,
  getAlignerTimeline,
} from "@/components/domain/order-timeline"
import PriceSummary from "@/components/domain/price-summary"
import FileDownloadList from "@/components/domain/file-download-list"
import { ADMIN_ORDERS, type AdminOrder, type AdminInternalNote } from "../_data"
import type { OrderStatus } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const OVERRIDEABLE_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "REVISION_REQUESTED",
  "REVIEW",
  "COMPLETE",
  "DISPUTED",
  "RESOLVED",
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className,
  badge,
}: {
  title: string
  children: React.ReactNode
  className?: string
  badge?: React.ReactNode
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {badge}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-36 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

// ─── Order-type badge ──────────────────────────────────────────────────────────

function OrderTypeBadge({ type }: { type: AdminOrder["orderType"] }) {
  if (type === "aligner") {
    return (
      <Badge
        variant="outline"
        className="border-[hsl(169_66%_34%)] text-[hsl(169_66%_34%)] font-normal"
      >
        Aligner
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)] font-normal"
    >
      Prosthetics
    </Badge>
  )
}

// ─── Read-only message thread ─────────────────────────────────────────────────

function ReadOnlyMessageBubble({
  message,
}: {
  message: AdminOrder["messages"][number]
}) {
  const isClient = message.senderRole === "client"
  return (
    <div className={cn("flex gap-3", isClient && "flex-row-reverse")}>
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isClient
              ? "bg-[hsl(104_22%_88%)] text-[hsl(104_36%_15%)]"
              : "bg-[hsl(60_6%_92%)] text-[hsl(30_10%_16%)]"
          )}
        >
          {getInitials(message.senderName)}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isClient && "items-end"
        )}
      >
        <div
          className={cn(
            "flex items-baseline gap-2",
            isClient && "flex-row-reverse"
          )}
        >
          <span className="text-xs font-medium text-foreground">
            {message.senderName}
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatDateTime(message.sentAt)}
          </span>
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isClient
              ? "rounded-tr-sm bg-[hsl(104_35%_36%)] text-white"
              : "rounded-tl-sm bg-[hsl(60_6%_92%)] text-foreground"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyThread({ messages }: { messages: AdminOrder["messages"] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-5">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No messages between client and provider.
          </p>
        ) : (
          messages.map((msg) => (
            <ReadOnlyMessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>
      {/* Admin-view notice */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Read-only admin view. Admins cannot send messages — this thread is
          between the client and provider only.
        </p>
      </div>
    </div>
  )
}

// ─── Cancel confirmation dialog ───────────────────────────────────────────────

function CancelDialog({
  orderId,
  onConfirm,
  onClose,
}: {
  orderId: string
  onConfirm: () => void
  onClose: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-base font-semibold text-foreground">
              Cancel Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-foreground">
            You are about to cancel order{" "}
            <span className="font-mono font-semibold">{orderId}</span>. This
            action will:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              Notify both client and provider by email
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              Initiate refund to client if payment was captured
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              Release escrow hold
            </li>
          </ul>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="accent-destructive"
            />
            <span className="text-foreground">
              I confirm this order should be cancelled
            </span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            disabled={!confirmed}
            onClick={onConfirm}
          >
            Cancel Order
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = typeof params.id === "string" ? params.id : ""

  const order = ADMIN_ORDERS.find((o) => o.id === orderId) ?? ADMIN_ORDERS[0]

  // ── Admin action state ──
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  // Override status
  const [overrideStatus, setOverrideStatus] = useState<string>("")
  const [overrideConfirmed, setOverrideConfirmed] = useState(false)
  const [overrideDone, setOverrideDone] = useState(false)

  // Internal notes
  const [notes, setNotes] = useState<AdminInternalNote[]>(order.internalNotes)
  const [noteDraft, setNoteDraft] = useState("")
  const [noteSaved, setNoteSaved] = useState(false)

  function handleCancelConfirm() {
    setCurrentStatus("RESOLVED")
    setCancelDone(true)
    setShowCancelDialog(false)
  }

  function handleOverrideApply() {
    if (!overrideStatus) return
    setCurrentStatus(overrideStatus as OrderStatus)
    setOverrideDone(true)
    setTimeout(() => {
      setOverrideDone(false)
      setOverrideStatus("")
      setOverrideConfirmed(false)
    }, 3000)
  }

  function handleAddNote() {
    const trimmed = noteDraft.trim()
    if (!trimmed) return
    const newNote: AdminInternalNote = {
      id: `note_${Date.now()}`,
      author: "admin@saga.dental",
      content: trimmed,
      createdAt: new Date(),
    }
    setNotes((prev) => [...prev, newNote])
    setNoteDraft("")
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2500)
  }

  // ── Derived display ──
  const isFinalStatus = ["COMPLETE", "RESOLVED"].includes(currentStatus)
  const canCancel = !cancelDone && !isFinalStatus
  const timeline =
    order.orderType === "prosthetics"
      ? getProstheticsTimeline(currentStatus)
      : getAlignerTimeline(currentStatus)

  return (
    <div className="max-w-6xl">
      {/* ── Breadcrumb ── */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/orders" className="hover:text-foreground">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono font-medium text-foreground">{order.id}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-bold text-foreground">
            {order.id}
          </h1>
          <OrderStatusBadge status={currentStatus} />
          <OrderTypeBadge type={order.orderType} />
          {cancelDone && (
            <Badge variant="destructive" className="font-normal">
              Cancelled by admin
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Created {formatDate(order.dateCreated)}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* ── LEFT: Main content ── */}
        <div className="flex flex-col gap-5">

          {/* Order Info */}
          <Section title="Order Information">
            <dl className="flex flex-col gap-3">
              <InfoRow label="Order reference" value={
                <span className="font-mono font-semibold">{order.id}</span>
              } />
              <InfoRow label="Client" value={`${order.client} (${order.clientEmail})`} />
              <InfoRow label="Provider" value={`${order.provider} (${order.providerEmail})`} />
              <InfoRow label="Category" value={order.category} />
              <InfoRow label="Order type" value={<OrderTypeBadge type={order.orderType} />} />
              <InfoRow label="Date created" value={formatDate(order.dateCreated)} />
              <InfoRow label="Current status" value={<OrderStatusBadge status={currentStatus} />} />
            </dl>
          </Section>

          {/* Prosthetics-specific section */}
          {order.orderType === "prosthetics" && (
            <Section title="Prosthetics Details">
              <div className="flex flex-col gap-5">
                {/* Teeth selection */}
                {order.selectedTeeth && order.selectedTeeth.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Selected Teeth (FDI)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.selectedTeeth.map((t) => (
                        <span
                          key={t}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[hsl(104_35%_36%)] bg-[hsl(104_22%_96%)] text-xs font-semibold text-[hsl(104_35%_36%)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design parameters */}
                {order.designParams && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Design Parameters
                    </p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                      {[
                        { label: "Margin", value: order.designParams.marginSettings },
                        { label: "Spacer thickness", value: order.designParams.spacerThickness },
                        { label: "Min. thickness", value: order.designParams.minimumThickness },
                        { label: "Contact strength", value: order.designParams.contactStrength },
                        { label: "Occlusion type", value: order.designParams.occlusionType },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {order.designParams.specialInstructions && (
                      <div className="mt-3 rounded-md bg-muted/40 px-3 py-2.5">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Special instructions
                        </p>
                        <p className="text-sm text-foreground">
                          {order.designParams.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan files */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Scan Files
                  </p>
                  <FileDownloadList
                    files={order.scanFiles ?? []}
                    emptyMessage="No scan files uploaded."
                  />
                </div>

                {/* Design files */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Design Files
                  </p>
                  <FileDownloadList
                    files={order.designFiles ?? []}
                    emptyMessage="No design files submitted yet."
                  />
                </div>

                {/* Revision history */}
                {order.revisions && order.revisions.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Revision History
                    </p>
                    <div className="space-y-2">
                      {order.revisions.map((rev, i) => (
                        <div
                          key={rev.id}
                          className="rounded-lg border border-[hsl(35_100%_47%/0.3)] bg-[hsl(35_100%_47%/0.06)] px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-[hsl(35_100%_47%)]">
                              Revision {i + 1}
                            </span>
                            <span>{formatDateTime(rev.requestedAt)}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-foreground">
                            {rev.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Aligner-specific section */}
          {order.orderType === "aligner" && (
            <Section title="Aligner Details">
              <div className="flex flex-col gap-5">
                {/* Config summary */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Treatment Configuration
                  </p>
                  <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Arch Selection
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-foreground">
                        {order.archSelection ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Complexity Tier
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-foreground">
                        {order.complexityTier ?? "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        Treatment Goals
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {(order.treatmentGoals ?? []).map((g) => (
                          <Badge
                            key={g}
                            variant="secondary"
                            className="font-normal text-xs"
                          >
                            {g}
                          </Badge>
                        ))}
                        {(!order.treatmentGoals ||
                          order.treatmentGoals.length === 0) && (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Simulation link */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Treatment Simulation
                  </p>
                  {order.simulationUrl ? (
                    <a
                      href={order.simulationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(169_66%_34%)] bg-[hsl(169_66%_34%/0.06)] px-3 py-2 text-sm text-[hsl(169_66%_34%)] hover:bg-[hsl(169_66%_34%/0.12)]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Simulation Link
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No simulation submitted yet.
                    </p>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Communication thread */}
          <Section
            title="Communication Thread"
            badge={
              <Badge variant="secondary" className="font-normal text-xs">
                Read-only
              </Badge>
            }
          >
            <ReadOnlyThread messages={order.messages} />
          </Section>

          {/* ── Admin Actions ── */}
          <section className="rounded-lg border border-[hsl(104_35%_36%/0.3)] bg-[hsl(104_35%_36%/0.04)]">
            <div className="border-b border-[hsl(104_35%_36%/0.2)] px-5 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[hsl(104_35%_36%)]" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(104_35%_36%)]">
                  Admin Actions
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                These actions are only visible and available to platform
                admins.
              </p>
            </div>
            <div className="divide-y divide-[hsl(104_35%_36%/0.1)] px-5">
              {/* 1 — Cancel Order */}
              <div className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Ban className="h-4 w-4 text-destructive" />
                      Cancel Order
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Cancels the order, notifies both parties, and initiates
                      refund processing.
                    </p>
                  </div>
                  {cancelDone ? (
                    <div className="flex items-center gap-1.5 text-sm text-destructive">
                      <CheckCircle2 className="h-4 w-4" />
                      Order cancelled
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!canCancel}
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
                {isFinalStatus && !cancelDone && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Order is already in a final state — cancellation not
                    available.
                  </p>
                )}
              </div>

              {/* 2 — Override Status */}
              <div className="py-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <RefreshCw className="h-4 w-4 text-[hsl(35_100%_47%)]" />
                  Override Status
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Force the order into a specific status for exceptional cases.
                  Use with care — this bypasses normal state machine logic.
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="w-56">
                    <Select
                      value={overrideStatus}
                      onValueChange={(v) => {
                        setOverrideStatus(v)
                        setOverrideConfirmed(false)
                        setOverrideDone(false)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target status" />
                      </SelectTrigger>
                      <SelectContent>
                        {OVERRIDEABLE_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {overrideStatus && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={overrideConfirmed}
                        onChange={(e) =>
                          setOverrideConfirmed(e.target.checked)
                        }
                        className="accent-[hsl(35_100%_47%)]"
                      />
                      Confirm override
                    </label>
                  )}
                  {overrideStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!overrideConfirmed}
                      onClick={handleOverrideApply}
                    >
                      Apply Override
                    </Button>
                  )}
                  {overrideDone && (
                    <span className="flex items-center gap-1.5 text-sm text-[hsl(166_49%_46%)]">
                      <CheckCircle2 className="h-4 w-4" />
                      Status updated
                    </span>
                  )}
                </div>
              </div>

              {/* 3 — Internal Notes */}
              <div className="py-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <StickyNote className="h-4 w-4 text-[hsl(169_66%_34%)]" />
                  Internal Notes
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Admin-only notes — never visible to client or provider.
                </p>

                {/* Existing notes */}
                {notes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-[hsl(169_66%_34%/0.25)] bg-[hsl(169_66%_34%/0.06)] px-4 py-3"
                      >
                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-[hsl(169_66%_34%)]">
                            {note.author}
                          </span>
                          <span>{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add note form */}
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={3}
                    placeholder="Add an internal note visible only to admins…"
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteDraft.trim()}
                    >
                      Add Note
                    </Button>
                    {noteSaved && (
                      <span className="flex items-center gap-1.5 text-sm text-[hsl(166_49%_46%)]">
                        <CheckCircle2 className="h-4 w-4" />
                        Note saved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="flex flex-col gap-5">
          {/* Financial Details */}
          <Section title="Financial Details">
            <div className="flex flex-col gap-4">
              <PriceSummary
                lineItems={[
                  {
                    label: "Design price",
                    amount: order.pricing.designPrice,
                  },
                  ...(order.pricing.additionalItems > 0
                    ? [
                        {
                          label: order.pricing.additionalItemsLabel,
                          amount: order.pricing.additionalItems,
                          isSubItem: true,
                        },
                      ]
                    : []),
                ]}
                subtotal={order.pricing.subtotal}
                serviceFee={{
                  label: "Client service fee",
                  percentage: order.pricing.clientFeePercent,
                  amount: order.pricing.clientFeeAmount,
                }}
                vat={{
                  label: "VAT",
                  percentage: order.pricing.vatPercent,
                  amount: order.pricing.vatAmount,
                }}
                total={order.pricing.total}
              />

              {/* Platform breakdown */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Platform Breakdown
                </p>
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Client payment
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      €{order.pricing.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Provider payout
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {order.pricing.providerPayout > 0
                        ? `€${order.pricing.providerPayout.toFixed(2)}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5">
                    <span className="font-medium text-[hsl(104_35%_36%)]">
                      Platform net
                    </span>
                    <span className="font-bold tabular-nums text-[hsl(104_35%_36%)]">
                      {order.pricing.platformFee > 0
                        ? `€${order.pricing.platformFee.toFixed(2)}`
                        : "€0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stripe IDs */}
              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  Stripe References
                </p>
                <div className="flex flex-col gap-1.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Charge ID
                    </p>
                    <p className="mt-0.5 break-all font-mono text-xs text-foreground">
                      {order.pricing.stripeChargeId || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Payout ID
                    </p>
                    <p className="mt-0.5 break-all font-mono text-xs text-foreground">
                      {order.pricing.stripePayoutId || (
                        <span className="text-muted-foreground">
                          Not yet paid out
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Parties */}
          <Section title="Parties">
            <div className="flex flex-col gap-4">
              {/* Client */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(104_22%_88%)]">
                  <User className="h-4 w-4 text-[hsl(104_36%_15%)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Client
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {order.client}
                  </p>
                  <a
                    href={`mailto:${order.clientEmail}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-3 w-3" />
                    {order.clientEmail}
                  </a>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Provider */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(60_6%_92%)]">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Provider
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {order.provider}
                  </p>
                  <a
                    href={`mailto:${order.providerEmail}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-3 w-3" />
                    {order.providerEmail}
                  </a>
                </div>
              </div>
            </div>
          </Section>

          {/* Order Timeline */}
          <Section title="Order Timeline">
            <OrderTimeline events={timeline} />
          </Section>

          {/* Disputed alert */}
          {currentStatus === "DISPUTED" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold text-destructive">
                  Dispute Open
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This order is under dispute. Review the communication thread and
                internal notes before taking action. Use &quot;Override Status&quot; to
                resolve once a decision is reached.
              </p>
            </div>
          )}

          {/* Revision requested alert */}
          {currentStatus === "REVISION_REQUESTED" && (
            <div className="rounded-lg border border-[hsl(35_100%_47%/0.3)] bg-[hsl(35_100%_47%/0.07)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[hsl(35_100%_47%)]" />
                <p className="text-sm font-semibold text-[hsl(35_100%_47%)]">
                  Revision In Progress
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                The client has requested revisions. The provider is updating the
                design.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Cancel dialog ── */}
      {showCancelDialog && (
        <CancelDialog
          orderId={order.id}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelDialog(false)}
        />
      )}
    </div>
  )
}
