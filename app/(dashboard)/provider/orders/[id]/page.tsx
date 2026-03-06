"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  Zap,
  MapPin,
  History,
  ChevronDown,
  Info,
  Upload,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import OrderTimeline, { getProstheticsTimeline } from "@/components/domain/order-timeline"
import FileDownloadList, { type DownloadableFile } from "@/components/domain/file-download-list"
import FileUpload from "@/components/domain/file-upload"
import MessageThread, { type ThreadMessage } from "@/components/domain/message-thread"
import type { OrderStatus, DesignParameters, FileInfo } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Revision {
  id: string
  requestedAt: Date
  notes: string
  submittedFiles: DownloadableFile[]
}

interface WorkspaceOrder {
  id: string
  reference: string
  status: OrderStatus
  client: {
    name: string
    practice: string
    location: string
  }
  category: string
  selectedTeeth: number[]
  designParams: DesignParameters
  deadlineDate: Date
  isRush: boolean
  receivedAt: Date
  scanFiles: DownloadableFile[]
  submittedDesignFiles: DownloadableFile[]
  revisions: Revision[]
  earnings: {
    designPrice: number
    commissionRate: number
    commissionAmount: number
    payout: number
    currency: string
  }
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const SHARED_DESIGN_PARAMS: DesignParameters = {
  marginSettings: "0.05mm",
  spacerThickness: "0.04mm",
  minimumThickness: "0.6mm",
  contactStrength: "Heavy",
  occlusionType: "Medium Contact",
  specialInstructions:
    "Pontic on tooth 15. Ensure connector cross-section between 14–15 is at least 9mm² for posterior bridge strength. Patient has parafunctional habits — check occlusal contacts carefully.",
}

const DUMMY_IN_PROGRESS: WorkspaceOrder = {
  id: "ord_155",
  reference: "ORD-2026-00155",
  status: "IN_PROGRESS",
  client: {
    name: "Dr. Marcus Weber",
    practice: "Valley Dental Lab",
    location: "Munich, DE",
  },
  category: "Bridges",
  selectedTeeth: [14, 15, 16],
  designParams: SHARED_DESIGN_PARAMS,
  deadlineDate: new Date("2026-03-10"),
  isRush: false,
  receivedAt: new Date("2026-03-02"),
  scanFiles: [
    { id: "sf1", name: "upper_arch_scan.stl", fileSize: 4_820_000, url: "#" },
    { id: "sf2", name: "lower_arch_scan.stl", fileSize: 4_230_000, url: "#" },
    { id: "sf3", name: "bite_registration.stl", fileSize: 1_680_000, url: "#" },
    { id: "sf4", name: "prep_scan_close.stl", fileSize: 2_140_000, url: "#" },
  ],
  submittedDesignFiles: [],
  revisions: [],
  earnings: {
    designPrice: 420,
    commissionRate: 12.5,
    commissionAmount: 52.5,
    payout: 367.5,
    currency: "€",
  },
}

const DUMMY_REVISION: WorkspaceOrder = {
  id: "ord_147",
  reference: "ORD-2026-00147",
  status: "REVISION_REQUESTED",
  client: {
    name: "Dr. Sarah Chen",
    practice: "Valley Dental Lab",
    location: "Munich, DE",
  },
  category: "Partial Frameworks",
  selectedTeeth: [14, 15, 16, 44, 45, 46],
  designParams: {
    marginSettings: "0.05mm",
    spacerThickness: "0.03mm",
    minimumThickness: "0.5mm",
    contactStrength: "Medium",
    occlusionType: "Light Contact",
    specialInstructions:
      "Upper framework: palatal major connector needs 8mm minimum width. Lower framework: lingual plate must cover the cingulum of anteriors. Both frameworks to be designed in cobalt-chrome.",
  },
  deadlineDate: new Date("2026-03-09"),
  isRush: true,
  receivedAt: new Date("2026-02-18"),
  scanFiles: [
    { id: "sf1", name: "upper_arch_full.stl", fileSize: 5_100_000, url: "#" },
    { id: "sf2", name: "lower_arch_full.stl", fileSize: 4_870_000, url: "#" },
    { id: "sf3", name: "bite_registration.stl", fileSize: 1_540_000, url: "#" },
    { id: "sf4", name: "periapical_xrays.pdf", fileSize: 3_200_000, url: "#" },
  ],
  submittedDesignFiles: [
    { id: "df1", name: "framework_upper_v1.stl", fileSize: 2_310_000, url: "#" },
    { id: "df2", name: "framework_lower_v1.stl", fileSize: 1_980_000, url: "#" },
    { id: "df3", name: "combined_occlusal_v1.stl", fileSize: 3_200_000, url: "#" },
  ],
  revisions: [
    {
      id: "rev1",
      requestedAt: new Date("2026-03-06T09:15:00"),
      notes:
        "The major connector on the upper framework is too narrow in the palatal region — it needs to be at least 8mm wide for patient comfort and rigidity. The occlusal rests on teeth 14 and 16 appear shallow; please deepen to at least 1.5mm. The lower framework looks good overall — a minor adjustment is needed on the lingual plate height (currently sitting 1mm below the cingulum, should be flush).",
      submittedFiles: [
        { id: "df1", name: "framework_upper_v1.stl", fileSize: 2_310_000, url: "#" },
        { id: "df2", name: "framework_lower_v1.stl", fileSize: 1_980_000, url: "#" },
        { id: "df3", name: "combined_occlusal_v1.stl", fileSize: 3_200_000, url: "#" },
      ],
    },
  ],
  earnings: {
    designPrice: 480,
    commissionRate: 12.5,
    commissionAmount: 60,
    payout: 420,
    currency: "€",
  },
}

const MESSAGES_IN_PROGRESS: ThreadMessage[] = [
  {
    id: "m1",
    senderRole: "client",
    senderName: "Valley Dental Lab",
    content:
      "Hi, all four scan files are uploaded. Please pay close attention to the connector size requirement — this patient has strong occlusal forces. Let me know if anything is unclear.",
    sentAt: new Date("2026-03-02T11:20:00"),
  },
  {
    id: "m2",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Thanks for the files! Everything is good quality. I have noted the 9mm² connector requirement and will model accordingly. Will have a design ready for your review within 4 days.",
    sentAt: new Date("2026-03-02T14:05:00"),
  },
  {
    id: "m3",
    senderRole: "client",
    senderName: "Valley Dental Lab",
    content: "Perfect — much appreciated. Looking forward to the design!",
    sentAt: new Date("2026-03-02T14:28:00"),
  },
]

const MESSAGES_REVISION: ThreadMessage[] = [
  {
    id: "m1",
    senderRole: "client",
    senderName: "Valley Dental Lab",
    content:
      "Scans uploaded. Please prioritise the upper framework — patient appointment is next week. The lower can follow shortly after if needed.",
    sentAt: new Date("2026-02-18T09:00:00"),
  },
  {
    id: "m2",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content: "Noted, prioritising the upper framework. Will get the design to you within 3 days.",
    sentAt: new Date("2026-02-18T10:30:00"),
  },
  {
    id: "m3",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Design files are ready for your review. Both frameworks have been modelled per the instructions.",
    sentAt: new Date("2026-02-22T16:30:00"),
  },
  {
    id: "m4",
    senderRole: "client",
    senderName: "Valley Dental Lab",
    content:
      "The upper framework major connector is too narrow — needs to be at least 8mm. See the revision notes for the full list of changes needed.",
    sentAt: new Date("2026-03-06T09:15:00"),
  },
  {
    id: "m5",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Understood. I will widen the palatal connector, deepen the occlusal rests, and adjust the lingual plate height. Updated design within 24 hours.",
    sentAt: new Date("2026-03-06T10:05:00"),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-06")

function getDaysLeft(deadline: Date): number {
  return Math.floor((deadline.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
}

function deadlineLabel(deadline: Date): { text: string; colorClass: string } {
  const days = getDaysLeft(deadline)
  const dateStr = deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  if (days < 0)
    return { text: `${dateStr} — ${Math.abs(days)}d overdue`, colorClass: "text-red-700" }
  if (days === 0) return { text: `${dateStr} — due today`, colorClass: "text-amber-700" }
  if (days === 1) return { text: `${dateStr} — tomorrow`, colorClass: "text-amber-700" }
  return { text: `${dateStr} — ${days}d left`, colorClass: "text-green-700" }
}

// ─── Read-only tooth chart ─────────────────────────────────────────────────────
// Inline re-implementation of the FDI chart without interactivity.
// We can't pass `disabled` to ToothChart so we render a display-only version.

const FDI_ROWS = {
  upperLeft: [18, 17, 16, 15, 14, 13, 12, 11],
  upperRight: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerRight: [31, 32, 33, 34, 35, 36, 37, 38],
}

function ROToothCell({ fdi, selected }: { fdi: number; selected: boolean }) {
  const pos = fdi % 10
  const isUpper = fdi <= 28
  const isMolar = pos >= 6
  const isPremolar = pos >= 4 && pos < 6

  const w = isMolar ? "w-9" : isPremolar ? "w-8" : "w-7"
  const h = isUpper
    ? isMolar ? "h-11" : isPremolar ? "h-10" : "h-9"
    : isMolar ? "h-10" : isPremolar ? "h-9" : "h-8"

  return (
    <div
      title={`Tooth ${fdi}`}
      className={cn(
        "relative flex flex-col items-center justify-end rounded-sm border text-[9px] font-semibold",
        w,
        h,
        selected
          ? "border-sage-500 bg-sage-500 text-white shadow-sm"
          : "border-warm-200 bg-warm-50 text-warm-400"
      )}
    >
      <div
        className={cn(
          "w-full flex-1",
          isUpper ? "rounded-t-sm" : "rounded-b-sm",
          selected ? "bg-sage-400" : "bg-warm-100"
        )}
      />
      <span className={cn("py-0.5 leading-none", selected ? "text-white" : "text-warm-500")}>
        {fdi}
      </span>
    </div>
  )
}

function ROArchRow({
  left,
  right,
  selected,
}: {
  left: number[]
  right: number[]
  selected: number[]
}) {
  return (
    <div className="flex items-end justify-center gap-0">
      <div className="flex gap-px">
        {left.map((fdi) => (
          <ROToothCell key={fdi} fdi={fdi} selected={selected.includes(fdi)} />
        ))}
      </div>
      <div className="mx-1.5 w-px self-stretch bg-warm-300" />
      <div className="flex gap-px">
        {right.map((fdi) => (
          <ROToothCell key={fdi} fdi={fdi} selected={selected.includes(fdi)} />
        ))}
      </div>
    </div>
  )
}

function ReadOnlyToothChart({ selectedTeeth }: { selectedTeeth: number[] }) {
  const sorted = [...selectedTeeth].sort((a, b) => a - b)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between px-1 text-[10px] font-medium uppercase tracking-wider text-warm-400">
        <span>R</span>
        <span className="font-semibold text-warm-500">Upper Arch</span>
        <span>L</span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-max flex-col gap-1.5">
          <ROArchRow
            left={FDI_ROWS.upperLeft}
            right={FDI_ROWS.upperRight}
            selected={selectedTeeth}
          />
          <div className="flex justify-center">
            <div className="h-px w-full max-w-sm bg-warm-200" />
          </div>
          <ROArchRow
            left={FDI_ROWS.lowerLeft}
            right={FDI_ROWS.lowerRight}
            selected={selectedTeeth}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-500">
          Lower Arch
        </span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-warm-200 bg-warm-50 px-3 py-2">
        <span className="text-xs font-semibold text-sage-700">
          {selectedTeeth.length} {selectedTeeth.length === 1 ? "tooth" : "teeth"} selected:
        </span>
        <span className="text-xs text-warm-700">{sorted.join(", ")}</span>
      </div>
    </div>
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
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-warm-800">{value}</dd>
          </div>
        ))}
      </dl>

      {params.specialInstructions && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="mb-1 text-xs font-semibold text-amber-800">Special instructions</p>
            <p className="text-sm leading-relaxed text-amber-900">
              {params.specialInstructions}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  children,
  className,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {badge}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

// ─── Submit area ──────────────────────────────────────────────────────────────

function SubmitDesignArea({
  files,
  onFilesChange,
  onSubmit,
}: {
  files: FileInfo[]
  onFilesChange: (f: FileInfo[]) => void
  onSubmit: () => void
}) {
  const readyCount = files.filter((f) => f.status === "complete").length
  const canSubmit = readyCount > 0

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Upload your completed design files (.stl, .ply, .obj). The client will download and
        review these in their CAD software before approving or requesting changes.
      </p>
      <FileUpload
        files={files}
        onFilesChange={onFilesChange}
        acceptedFormats={[".stl", ".ply", ".obj"]}
        maxFileSize={50 * 1024 * 1024}
      />
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {canSubmit
            ? `${readyCount} file${readyCount !== 1 ? "s" : ""} ready to submit`
            : "Upload at least one design file to submit"}
        </p>
        <Button
          disabled={!canSubmit}
          onClick={onSubmit}
          className="shrink-0 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] disabled:opacity-40"
        >
          <Upload className="mr-2 h-4 w-4" />
          Submit for Client Review
        </Button>
      </div>
    </div>
  )
}

// ─── Revision files accordion ─────────────────────────────────────────────────

function RevisionFilesAccordion({ revision }: { revision: Revision }) {
  const [open, setOpen] = useState(false)

  if (revision.submittedFiles.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-orange-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 transition-colors hover:bg-orange-100"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Previously submitted files (v1)
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-orange-200 bg-orange-50/40 px-4 py-3">
          <FileDownloadList
            files={revision.submittedFiles}
            showDownloadAll={false}
          />
        </div>
      )}
    </div>
  )
}

// ─── Earnings sidebar card ────────────────────────────────────────────────────

function EarningsCard({ earnings }: { earnings: WorkspaceOrder["earnings"] }) {
  const { designPrice, commissionRate, commissionAmount, payout, currency } = earnings
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Your Earnings
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Design price</span>
          <span className="font-medium text-foreground">
            {currency}{designPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Commission ({commissionRate}%)
          </span>
          <span className="text-red-600">− {currency}{commissionAmount.toFixed(2)}</span>
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-foreground">Your payout</span>
          <span className="text-lg font-bold text-[hsl(var(--primary))]">
            {currency}{payout.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Paid out within 2 business days of client approval.
      </p>
    </div>
  )
}

// ─── Client sidebar card ──────────────────────────────────────────────────────

function ClientInfoCard({ client }: { client: WorkspaceOrder["client"] }) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Client
      </h3>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-100 text-sm font-bold text-warm-700">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-warm-800">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.practice}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        {client.location}
      </div>
    </div>
  )
}

// ─── Dev scenario switcher ────────────────────────────────────────────────────

function DevScenarioSwitcher({
  current,
  onChange,
}: {
  current: "in_progress" | "revision"
  onChange: (s: "in_progress" | "revision") => void
}) {
  if (process.env.NODE_ENV !== "development") return null
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        Dev: Scenario
      </p>
      {(["in_progress", "revision"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-left",
            current === s
              ? "bg-[hsl(var(--primary))] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {s === "in_progress" ? "In Progress" : "Revision Requested"}
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderWorkspacePage() {
  const [scenario, setScenario] = useState<"in_progress" | "revision">("in_progress")

  // Per-scenario upload state (reset when switching for demo clarity)
  const [designFiles, setDesignFiles] = useState<FileInfo[]>([])
  const [revisedFiles, setRevisedFiles] = useState<FileInfo[]>([])
  const [submitState, setSubmitState] = useState<"idle" | "submitted">("idle")
  const [reviseSubmitState, setReviseSubmitState] = useState<"idle" | "submitted">("idle")

  const order = scenario === "in_progress" ? DUMMY_IN_PROGRESS : DUMMY_REVISION
  const messages =
    scenario === "in_progress" ? MESSAGES_IN_PROGRESS : MESSAGES_REVISION
  const timeline = getProstheticsTimeline(order.status)
  const { text: deadlineText, colorClass: deadlineColor } = deadlineLabel(order.deadlineDate)

  const canSubmitRevised = revisedFiles.some((f) => f.status === "complete")

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm">
          <Link
            href="/provider/dashboard"
            className="text-muted-foreground hover:text-warm-800 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link
            href="/provider/queue"
            className="text-muted-foreground hover:text-warm-800 transition-colors"
          >
            Order Queue
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-warm-800">{order.reference}</span>
        </nav>

        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-bold text-warm-800">{order.reference}</h1>
            <OrderStatusBadge status={order.status} />
            <Badge
              variant="outline"
              className="bg-muted/40 text-xs text-[hsl(var(--primary))]"
            >
              Prosthetics
            </Badge>
            {order.isRush && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                <Zap className="h-3 w-3" />
                Rush Order
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {order.client.practice} · {order.client.name}
            </span>
            <span>{order.category}</span>
            <span className={cn("flex items-center gap-1 font-medium", deadlineColor)}>
              <Clock className="h-3.5 w-3.5" />
              {deadlineText}
            </span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

          {/* ════ Main workspace ════ */}
          <div className="space-y-5">

            {/* ── 1. CLIENT REQUIREMENTS ── */}
            <Section
              title="Client Requirements"
              badge={
                <span className="rounded-full border border-warm-200 bg-warm-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warm-600">
                  Read Only
                </span>
              }
            >
              <div className="space-y-6">
                {/* Tooth chart */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {order.category} — teeth to treat
                  </p>
                  <div className="rounded-lg border border-warm-200 bg-warm-50 p-3">
                    <ReadOnlyToothChart selectedTeeth={order.selectedTeeth} />
                  </div>
                </div>

                <hr className="border-border" />

                {/* Design parameters */}
                <div>
                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                    Design parameters
                  </p>
                  <DesignParamsSummary params={order.designParams} />
                </div>
              </div>
            </Section>

            {/* ── 2. CLIENT SCAN FILES ── */}
            <Section title="Client Scan Files">
              <p className="mb-3 text-xs text-muted-foreground">
                Download these files to work locally in your CAD software. All files are
                provided by the client.
              </p>
              <FileDownloadList files={order.scanFiles} />
            </Section>

            {/* ── 3. DESIGN UPLOAD (IN_PROGRESS only) ── */}
            {order.status === "IN_PROGRESS" && (
              <Section title="Upload Completed Design">
                {submitState === "submitted" ? (
                  <div className="flex items-start gap-3 rounded-lg border border-sage-400 bg-sage-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
                    <div>
                      <p className="text-sm font-semibold text-warm-800">
                        Design submitted for client review
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        The client has been notified and will review your design. You will be
                        informed of their decision — approval releases payment, revision
                        request will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <SubmitDesignArea
                    files={designFiles}
                    onFilesChange={setDesignFiles}
                    onSubmit={() => setSubmitState("submitted")}
                  />
                )}
              </Section>
            )}

            {/* ── 4. REVISION MANAGEMENT (REVISION_REQUESTED only) ── */}
            {order.status === "REVISION_REQUESTED" && (
              <Section title="Revision Requested">
                <div className="space-y-5">

                  {/* Alert banner */}
                  <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800">
                        Client has requested changes
                      </p>
                      <p className="mt-0.5 text-xs text-orange-700">
                        Review the feedback below, update your design locally, then upload the
                        revised files and resubmit.
                      </p>
                    </div>
                  </div>

                  {/* Client feedback notes */}
                  {order.revisions.map((rev, idx) => (
                    <div key={rev.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                          Client feedback — Revision #{idx + 1}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {rev.requestedAt.toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50/60 px-4 py-3">
                        <p className="text-sm leading-relaxed text-warm-800">{rev.notes}</p>
                      </div>
                    </div>
                  ))}

                  {/* Previously submitted files (accordion) */}
                  {order.revisions.map((rev) => (
                    <RevisionFilesAccordion key={rev.id} revision={rev} />
                  ))}

                  <hr className="border-border" />

                  {/* Upload revised design */}
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                      Upload revised design files
                    </p>

                    {reviseSubmitState === "submitted" ? (
                      <div className="flex items-start gap-3 rounded-lg border border-sage-400 bg-sage-50 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
                        <div>
                          <p className="text-sm font-semibold text-warm-800">
                            Revised design submitted
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            The client has been notified and will review your updated design.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileUpload
                          files={revisedFiles}
                          onFilesChange={setRevisedFiles}
                          acceptedFormats={[".stl", ".ply", ".obj"]}
                          maxFileSize={50 * 1024 * 1024}
                        />
                        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                          <p className="text-xs text-muted-foreground">
                            {canSubmitRevised
                              ? `${revisedFiles.filter((f) => f.status === "complete").length} revised file${revisedFiles.filter((f) => f.status === "complete").length !== 1 ? "s" : ""} ready`
                              : "Upload revised files to resubmit"}
                          </p>
                          <Button
                            disabled={!canSubmitRevised}
                            onClick={() => setReviseSubmitState("submitted")}
                            className="shrink-0 bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-40"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Submit Revised Design
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* ── 5. MESSAGES ── */}
            <Section title="Messages">
              <MessageThread
                messages={messages}
                currentRole="provider"
                currentUserName="ClearCAD Studio"
              />
            </Section>
          </div>

          {/* ════ Sidebar ════ */}
          <aside className="space-y-4">

            {/* Status card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <OrderStatusBadge status={order.status} />
              </div>
              {order.status === "IN_PROGRESS" && (
                <p className="text-xs text-muted-foreground">
                  Upload your completed design files in the workspace and submit for client
                  review when ready.
                </p>
              )}
              {order.status === "REVISION_REQUESTED" && (
                <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5">
                  <p className="text-xs font-medium text-orange-800">
                    Revision needed — update your design and resubmit.
                  </p>
                </div>
              )}
            </div>

            {/* Earnings */}
            <EarningsCard earnings={order.earnings} />

            {/* Order timeline */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Order Progress
              </h3>
              <OrderTimeline events={timeline} />
            </div>

            {/* Client info */}
            <ClientInfoCard client={order.client} />

            {/* Received date */}
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="mb-0.5 text-xs text-muted-foreground">Order received</p>
              <p className="text-sm font-medium text-foreground">
                {order.receivedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Dev-only scenario switcher */}
      <DevScenarioSwitcher current={scenario} onChange={setScenario} />
    </div>
  )
}
