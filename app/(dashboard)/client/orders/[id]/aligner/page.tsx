"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  MapPin,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Target,
  Sliders,
  Clock,
  Lock,
  X,
  FileStack,
  MessageSquare,
  LayoutDashboard,
  FolderOpen,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import StarRating from "@/components/ui/star-rating"
import PriceSummary from "@/components/domain/price-summary"
import EscrowBanner from "@/components/domain/escrow-banner"
import OrderTimeline, { getAlignerTimeline } from "@/components/domain/order-timeline"
import FileDownloadList from "@/components/domain/file-download-list"
import StagedFileDownload from "@/components/domain/staged-file-download"
import { ClientSimulationViewer } from "@/components/domain/simulation-viewer"
import MessageThread, { type ThreadMessage } from "@/components/domain/message-thread"
import type {
  OrderStatus,
  AlignerConfig,
  AlignerDeliverables,
  SimulationVersion,
  TreatmentSummary,
} from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_ALIGNER_CONFIG: AlignerConfig = {
  archSelection: "both",
  treatmentGoals: ["crowding", "spacing", "deep_bite"],
  additionalGoals:
    "Patient has mild TMJ sensitivity — avoid excessive lateral movements in early stages.",
  complexityTier: "moderate",
  clinicalConstraints: {
    teethNotToMove: "17, 27",
    plannedExtractions: "",
    otherConstraints:
      "Patient has existing composite resin on upper right central incisor — account for in attachment placement.",
  },
  designPreferences: {
    includeAttachmentDesign: true,
    includeIPRProtocol: true,
    maxStagesPreferred: 25,
  },
}

const DUMMY_ORDER = {
  id: "ord_002",
  reference: "ORD-2024-00387",
  status: "REVIEW" as OrderStatus,
  placedAt: new Date("2024-11-15T09:00:00"),
  provider: {
    id: "p3",
    name: "ClearSmile Studio",
    location: "Munich, DE",
    rating: 4.8,
    reviewCount: 178,
    software: ["SureSmile", "Archform"],
  },
  alignerConfig: DUMMY_ALIGNER_CONFIG,
  pricing: {
    upperArch: 280,
    lowerArch: 280,
    complexityPremium: 80,
    subtotal: 640,
    serviceFeePercent: 5,
    serviceFeeAmount: 32,
    vatPercent: 19,
    vatAmount: 127.68,
    total: 799.68,
  },
}

const DUMMY_INTRAORAL_SCANS = [
  { id: "is1", name: "upper_arch_intraoral.stl", fileSize: 4_810_000, url: "#" },
  { id: "is2", name: "lower_arch_intraoral.stl", fileSize: 4_190_000, url: "#" },
  { id: "is3", name: "bite_registration.stl", fileSize: 2_130_000, url: "#" },
]

const DUMMY_CLINICAL_PHOTOS = [
  { id: "cp1", name: "frontal_smile_full.jpg", fileSize: 3_210_000, url: "#" },
  { id: "cp2", name: "lateral_profile_left.jpg", fileSize: 2_850_000, url: "#" },
  { id: "cp3", name: "occlusal_upper.jpg", fileSize: 2_440_000, url: "#" },
  { id: "cp4", name: "occlusal_lower.jpg", fileSize: 2_610_000, url: "#" },
]

const DUMMY_SUPPLEMENTARY = [
  { id: "su1", name: "panoramic_xray_nov24.dcm", fileSize: 9_200_000, url: "#" },
]

const DUMMY_SIMULATION_URL =
  "https://simulation.clearsmile-studio.example/view/ORD-2024-00387-v1"

const DUMMY_SIMULATION_VERSIONS: SimulationVersion[] = [
  {
    url: DUMMY_SIMULATION_URL,
    submittedAt: new Date("2024-11-22T14:30:00"),
    version: 1,
  },
]

const DUMMY_TREATMENT_SUMMARY: TreatmentSummary = {
  totalStages: 22,
  estimatedDuration: "11–13 months",
  iprRequired: true,
  upperArchStages: 22,
  lowerArchStages: 19,
}

// Deliverables are shown only in COMPLETE status, but we define them here for completeness
const DUMMY_DELIVERABLES: AlignerDeliverables = {
  upperArchFiles: Array.from({ length: 22 }, (_, i) => ({
    id: `ua${i + 1}`,
    stageNumber: i + 1,
    fileName: `Stage_${String(i + 1).padStart(2, "0")}_Upper.stl`,
    fileSize: 830_000 + (i % 5) * 40_000,
    url: "#",
  })),
  lowerArchFiles: Array.from({ length: 19 }, (_, i) => ({
    id: `la${i + 1}`,
    stageNumber: i + 1,
    fileName: `Stage_${String(i + 1).padStart(2, "0")}_Lower.stl`,
    fileSize: 740_000 + (i % 5) * 35_000,
    url: "#",
  })),
  supportingDocuments: [
    {
      id: "sd1",
      name: "movement_table_complete.pdf",
      type: "movement_table",
      fileSize: 450_000,
      url: "#",
    },
    {
      id: "sd2",
      name: "ipr_protocol_chart.pdf",
      type: "ipr_protocol",
      fileSize: 320_000,
      url: "#",
    },
    {
      id: "sd3",
      name: "attachment_guide_v2.pdf",
      type: "attachment_guide",
      fileSize: 280_000,
      url: "#",
    },
    {
      id: "sd4",
      name: "treatment_summary_report.pdf",
      type: "treatment_summary",
      fileSize: 520_000,
      url: "#",
    },
  ],
  totalSize: 22 * 880_000 + 19 * 780_000 + 1_570_000,
  totalStages: 22,
}

const DUMMY_MESSAGES: ThreadMessage[] = [
  {
    id: "msg1",
    senderRole: "client",
    senderName: "Smith Dental",
    content:
      "Hi! Please note the TMJ sensitivity — keep lateral movements conservative in the first 6 stages.",
    sentAt: new Date("2024-11-15T10:30:00"),
  },
  {
    id: "msg2",
    senderRole: "provider",
    senderName: "ClearSmile Studio",
    content:
      "Noted! We'll keep the initial stages conservative and plan for gradual lateral movements. I'll also flag this in the movement table.",
    sentAt: new Date("2024-11-15T11:45:00"),
  },
  {
    id: "msg3",
    senderRole: "provider",
    senderName: "ClearSmile Studio",
    content:
      "The treatment simulation is ready for your review. Please check the movement table and IPR schedule carefully — we've planned IPR on teeth 14/24 at stage 8.",
    sentAt: new Date("2024-11-22T14:35:00"),
  },
]

// ─── Goal display labels ───────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  crowding: "Crowding",
  spacing: "Spacing",
  deep_bite: "Deep Bite",
  open_bite: "Open Bite",
  crossbite: "Crossbite",
  midline: "Midline",
}

const ARCH_LABELS: Record<string, string> = {
  upper: "Upper only",
  lower: "Lower only",
  both: "Both arches",
}

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: "Simple (≤14 stages)",
  moderate: "Moderate (15–25 stages)",
  complex: "Complex (26+ stages)",
}

// ─── Tab configuration ────────────────────────────────────────────────────────

type TabId = "overview" | "files" | "treatment-plan" | "deliverables" | "messages"

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
}

function buildTabs(status: OrderStatus): TabDef[] {
  const showTreatmentPlan = ["REVIEW", "REVISION_REQUESTED", "COMPLETE", "RESOLVED"].includes(
    status
  )
  const showDeliverables = ["COMPLETE", "RESOLVED"].includes(status)

  const tabs: TabDef[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    },
    {
      id: "files",
      label: "Files",
      icon: <FolderOpen className="h-3.5 w-3.5" />,
    },
  ]

  if (showTreatmentPlan) {
    tabs.push({
      id: "treatment-plan",
      label: "Treatment Plan",
      icon: <Activity className="h-3.5 w-3.5" />,
    })
  }

  if (showDeliverables) {
    tabs.push({
      id: "deliverables",
      label: "Deliverables",
      icon: <FileStack className="h-3.5 w-3.5" />,
    })
  }

  tabs.push({
    id: "messages",
    label: "Messages",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  })

  return tabs
}

function getEscrowVariant(status: OrderStatus): "payment" | "in_escrow" | "released" {
  if (["COMPLETE", "RESOLVED"].includes(status)) return "released"
  if (["PAID", "IN_PROGRESS", "REVIEW", "REVISION_REQUESTED", "DISPUTED"].includes(status))
    return "in_escrow"
  return "payment"
}

// ─── Quick status description ──────────────────────────────────────────────────

function getStatusDescription(status: OrderStatus): string {
  switch (status) {
    case "PAID":
      return "Waiting for provider to review your files"
    case "IN_PROGRESS":
      return "Provider is working on your treatment plan"
    case "REVIEW":
      return "Treatment simulation ready — awaiting your approval"
    case "REVISION_REQUESTED":
      return "Provider is revising the treatment plan"
    case "COMPLETE":
      return "Treatment plan approved — deliverables available"
    default:
      return "Order active"
  }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {title && (
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </h2>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ─── Config row ───────────────────────────────────────────────────────────────

function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-full text-xs text-muted-foreground sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="text-sm text-warm-800">{value}</dd>
    </div>
  )
}

// ─── Treatment configuration summary (Overview tab) ───────────────────────────

function ConfigSummary({ config }: { config: AlignerConfig }) {
  return (
    <dl className="space-y-3">
      <ConfigRow label="Arches" value={ARCH_LABELS[config.archSelection] ?? config.archSelection} />

      <ConfigRow
        label="Complexity"
        value={COMPLEXITY_LABELS[config.complexityTier] ?? config.complexityTier}
      />

      <ConfigRow
        label="Treatment goals"
        value={
          <div className="flex flex-wrap gap-1.5">
            {config.treatmentGoals.map((g) => (
              <Badge key={g} variant="outline" className="bg-sage-50 text-xs text-sage-800">
                {GOAL_LABELS[g] ?? g}
              </Badge>
            ))}
          </div>
        }
      />

      {config.additionalGoals && (
        <ConfigRow label="Additional goals" value={config.additionalGoals} />
      )}

      {config.clinicalConstraints.teethNotToMove && (
        <ConfigRow
          label="Teeth not to move"
          value={
            <span className="font-mono text-xs text-warm-800">
              {config.clinicalConstraints.teethNotToMove}
            </span>
          }
        />
      )}

      {config.clinicalConstraints.plannedExtractions && (
        <ConfigRow
          label="Planned extractions"
          value={
            <span className="font-mono text-xs text-warm-800">
              {config.clinicalConstraints.plannedExtractions}
            </span>
          }
        />
      )}

      {config.clinicalConstraints.otherConstraints && (
        <ConfigRow
          label="Other constraints"
          value={config.clinicalConstraints.otherConstraints}
        />
      )}

      <ConfigRow
        label="Design preferences"
        value={
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 text-xs",
                config.designPreferences.includeAttachmentDesign
                  ? "text-sage-700"
                  : "text-muted-foreground line-through"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  config.designPreferences.includeAttachmentDesign
                    ? "bg-sage-500"
                    : "bg-warm-300"
                )}
              />
              Attachment design included
            </span>
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 text-xs",
                config.designPreferences.includeIPRProtocol
                  ? "text-sage-700"
                  : "text-muted-foreground line-through"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  config.designPreferences.includeIPRProtocol
                    ? "bg-sage-500"
                    : "bg-warm-300"
                )}
              />
              IPR protocol included
            </span>
            {config.designPreferences.maxStagesPreferred && (
              <span className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-300" />
                Max {config.designPreferences.maxStagesPreferred} stages preferred
              </span>
            )}
          </div>
        }
      />
    </dl>
  )
}

// ─── Provider card (Overview tab sidebar area) ────────────────────────────────

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

      <div className="mt-3 flex items-center gap-2">
        <StarRating rating={provider.rating} starClassName="h-3.5 w-3.5" />
        <span className="text-xs text-muted-foreground">
          {provider.rating} ({provider.reviewCount} reviews)
        </span>
      </div>

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

// ─── Files tab content ────────────────────────────────────────────────────────

function FilesTabContent() {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-sage-500" />
          <h3 className="text-sm font-semibold text-warm-800">Intraoral Scans</h3>
          <Badge variant="outline" className="bg-red-50 text-xs text-red-600">
            Required
          </Badge>
        </div>
        <FileDownloadList files={DUMMY_INTRAORAL_SCANS} />
      </div>

      <hr className="border-border" />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-sage-500" />
          <h3 className="text-sm font-semibold text-warm-800">Clinical Photos</h3>
          <Badge variant="outline" className="bg-red-50 text-xs text-red-600">
            Required
          </Badge>
        </div>
        <FileDownloadList files={DUMMY_CLINICAL_PHOTOS} />
      </div>

      <hr className="border-border" />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-warm-800">Supplementary Files</h3>
          <Badge variant="outline" className="bg-warm-100 text-xs text-warm-600">
            Optional
          </Badge>
        </div>
        <FileDownloadList files={DUMMY_SUPPLEMENTARY} />
      </div>
    </div>
  )
}

// ─── Treatment plan decision panel ───────────────────────────────────────────

type PlanDecisionState =
  | "idle"
  | "modifying"
  | "rejecting"
  | "confirmed_approve"
  | "confirmed_modify"
  | "confirmed_reject"

function TreatmentPlanDecision() {
  const [decision, setDecision] = useState<PlanDecisionState>("idle")
  const [modifyNotes, setModifyNotes] = useState("")

  if (decision === "confirmed_approve") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-sage-400 bg-sage-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Treatment plan approved</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The provider has been notified and will begin preparing your aligner files.
          </p>
        </div>
      </div>
    )
  }

  if (decision === "confirmed_modify") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-4">
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Modification requested</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ClearSmile Studio will revise the treatment plan based on your feedback.
          </p>
        </div>
      </div>
    )
  }

  if (decision === "confirmed_reject") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
        <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Treatment plan rejected</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This order has been flagged. Our support team will be in touch to resolve the dispute.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Guidance callout */}
      <div className="flex items-start gap-2 rounded-md bg-warm-50 px-3 py-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-warm-800">
          Review the simulation carefully before approving. Approval releases the payment to the
          provider and authorises production of your aligners.
        </p>
      </div>

      {/* Primary action buttons */}
      {decision === "idle" && (
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-sage-500 text-white hover:bg-sage-400"
            onClick={() => setDecision("confirmed_approve")}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Treatment Plan
          </Button>
          <Button variant="outline" onClick={() => setDecision("modifying")}>
            <RotateCcw className="h-4 w-4" />
            Request Modifications
          </Button>
          <Button
            variant="ghost"
            className="ml-auto text-muted-foreground hover:text-red-600"
            onClick={() => setDecision("rejecting")}
          >
            Reject plan
          </Button>
        </div>
      )}

      {/* Modification notes form */}
      {decision === "modifying" && (
        <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-warm-800">
              Describe the changes needed
            </span>
            <textarea
              value={modifyNotes}
              onChange={(e) => setModifyNotes(e.target.value)}
              placeholder="e.g. Reduce IPR on teeth 13/23 to 0.3mm. Stages 1–4 should have less buccal movement on upper left. Please recheck the finishing position of tooth 21."
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-orange-500 text-white hover:bg-orange-400"
              disabled={!modifyNotes.trim()}
              onClick={() => setDecision("confirmed_modify")}
            >
              Submit Modification Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDecision("idle")
                setModifyNotes("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reject confirmation */}
      {decision === "rejecting" && (
        <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-warm-800">Reject this treatment plan?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                This will open a dispute and pause your order. Our support team will contact you to
                resolve the issue.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-red-500 text-white hover:bg-red-400"
              onClick={() => setDecision("confirmed_reject")}
            >
              Confirm Rejection
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDecision("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overview tab content ─────────────────────────────────────────────────────

function OverviewTabContent({
  config,
  status,
  provider,
}: {
  config: AlignerConfig
  status: OrderStatus
  provider: typeof DUMMY_ORDER.provider
}) {
  const timeline = getAlignerTimeline(status)

  return (
    <div className="space-y-5">
      {/* Treatment configuration */}
      <Section title="Treatment Configuration">
        <ConfigSummary config={config} />
      </Section>

      {/* Timeline */}
      <Section title="Order Progress">
        <OrderTimeline events={timeline} />
      </Section>

      {/* Provider */}
      <ProviderCard provider={provider} />
    </div>
  )
}

// ─── Treatment plan tab content ───────────────────────────────────────────────

function TreatmentPlanTabContent({
  status,
  simulationUrl,
  treatmentSummary,
  versionHistory,
}: {
  status: OrderStatus
  simulationUrl: string
  treatmentSummary: TreatmentSummary
  versionHistory: SimulationVersion[]
}) {
  const showReviewControls = status === "REVIEW"

  return (
    <div className="space-y-5">
      {/* Simulation viewer */}
      <Section title="Treatment Simulation">
        <ClientSimulationViewer
          simulationUrl={simulationUrl}
          treatmentSummary={treatmentSummary}
          versionHistory={versionHistory}
        />
      </Section>

      {/* Review decision (only in REVIEW status) */}
      {showReviewControls && (
        <Section title="Your Decision">
          <TreatmentPlanDecision />
        </Section>
      )}

      {/* Approved banner (REVISION_REQUESTED / COMPLETE) */}
      {(status === "REVISION_REQUESTED") && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <div>
            <p className="text-sm font-semibold text-warm-800">Revision in progress</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The provider is updating the treatment plan based on your feedback. A new simulation
              will be submitted when ready.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlignerOrderDetailPage() {
  const order = DUMMY_ORDER
  const tabs = buildTabs(order.status)
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const escrowVariant = getEscrowVariant(order.status)

  // Ensure the active tab is always one of the visible tabs
  const activeTabDef = tabs.find((t) => t.id === activeTab) ?? tabs[0]
  const resolvedTab = activeTabDef.id

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
          <Link
            href="/client/dashboard"
            className="text-muted-foreground transition-colors hover:text-warm-800"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link
            href="/client/orders"
            className="text-muted-foreground transition-colors hover:text-warm-800"
          >
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
              <Badge variant="outline" className="bg-teal-50 text-xs text-teal-700">
                Aligner Design
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.provider.name} &middot; Placed {formattedDate}
            </p>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* ════ Main content ════ */}
          <div className="flex flex-col gap-0">

            {/* Tab bar */}
            <div
              className="mb-4 flex items-center gap-0.5 overflow-x-auto rounded-xl border border-border bg-secondary p-1"
              role="tablist"
              aria-label="Order sections"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={resolvedTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    resolvedTab === tab.id
                      ? "bg-white text-warm-800 shadow-sm"
                      : "text-muted-foreground hover:text-warm-800"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div
              role="tabpanel"
              id={`tabpanel-${resolvedTab}`}
              aria-labelledby={`tab-${resolvedTab}`}
            >
              {resolvedTab === "overview" && (
                <OverviewTabContent
                  config={order.alignerConfig}
                  status={order.status}
                  provider={order.provider}
                />
              )}

              {resolvedTab === "files" && (
                <Section>
                  <FilesTabContent />
                </Section>
              )}

              {resolvedTab === "treatment-plan" && (
                <TreatmentPlanTabContent
                  status={order.status}
                  simulationUrl={DUMMY_SIMULATION_URL}
                  treatmentSummary={DUMMY_TREATMENT_SUMMARY}
                  versionHistory={DUMMY_SIMULATION_VERSIONS}
                />
              )}

              {resolvedTab === "deliverables" && (
                <Section title="Aligner Deliverables">
                  <StagedFileDownload
                    deliverables={DUMMY_DELIVERABLES}
                    onDownloadFile={() => {}}
                    onDownloadAll={() => {}}
                  />
                </Section>
              )}

              {resolvedTab === "messages" && (
                <Section title="Messages">
                  <MessageThread
                    messages={DUMMY_MESSAGES}
                    currentRole="client"
                    currentUserName="Smith Dental"
                  />
                </Section>
              )}
            </div>
          </div>

          {/* ════ Sidebar ════ */}
          <aside className="space-y-4">
            {/* Quick status */}
            <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
              <div>
                <p className="text-xs font-semibold text-warm-800">
                  {getStatusDescription(order.status)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Case: Moderate bilateral · 22 planned stages
                </p>
              </div>
            </div>

            {/* Price summary */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Order Total
              </p>
              <PriceSummary
                lineItems={[
                  { label: "Aligner design — upper arch", amount: order.pricing.upperArch },
                  { label: "Aligner design — lower arch", amount: order.pricing.lowerArch },
                  {
                    label: "Moderate complexity premium",
                    amount: order.pricing.complexityPremium,
                  },
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

            {/* Escrow banner */}
            <EscrowBanner
              variant={escrowVariant}
              escrowDaysRemaining={escrowVariant === "in_escrow" ? 5 : undefined}
            />

            {/* Tab-hidden sections notice (when Deliverables not yet available) */}
            {!["COMPLETE", "RESOLVED"].includes(order.status) && (
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-border px-4 py-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-warm-800">Deliverables not yet ready</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    STL files will be available after you approve the treatment plan and the
                    provider uploads them.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
