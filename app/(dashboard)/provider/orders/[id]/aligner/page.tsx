"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Link2,
  ExternalLink,
  Loader2,
  Check,
  X,
  ChevronDown,
  Download,
  ImageIcon,
  Upload,
  History,
  Info,
  Layers,
  Timer,
  Scissors,
  FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import OrderTimeline, { getAlignerTimeline } from "@/components/domain/order-timeline"
import FileDownloadList, { type DownloadableFile } from "@/components/domain/file-download-list"
import FileUpload from "@/components/domain/file-upload"
import MessageThread, { type ThreadMessage } from "@/components/domain/message-thread"
import type { OrderStatus, AlignerConfig, FileInfo, UploadSection } from "@/lib/types"

// ─── Scenario type (for dev mode) ────────────────────────────────────────────
// Maps to real OrderStatus but also tracks sub-phases within IN_PROGRESS

type WorkspaceScenario =
  | "treatment_planning"     // IN_PROGRESS — Phase 1, first-time plan submission
  | "simulation_submitted"   // REVIEW      — sim sent, awaiting client decision
  | "modifications_requested" // REVISION_REQUESTED — client wants changes
  | "plan_approved"          // IN_PROGRESS — Phase 2, upload final STLs

const SCENARIO_STATUS: Record<WorkspaceScenario, OrderStatus> = {
  treatment_planning: "IN_PROGRESS",
  simulation_submitted: "REVIEW",
  modifications_requested: "REVISION_REQUESTED",
  plan_approved: "IN_PROGRESS",
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimulationSubmission {
  url: string
  submittedAt: Date
  version: number
  treatmentSummary: {
    totalStages: number
    upperArchStages: number | null
    lowerArchStages: number | null
    estimatedDuration: string
    iprRequired: boolean
    technicalNotes: string
  }
}

interface Modification {
  id: string
  requestedAt: Date
  notes: string
  simulationVersion: number
}

interface AlignerWorkspaceOrder {
  id: string
  reference: string
  client: { name: string; practice: string; location: string }
  alignerConfig: AlignerConfig
  deadlineDate: Date
  isRush: boolean
  receivedAt: Date
  intaoralScans: DownloadableFile[]
  clinicalPhotos: DownloadableFile[]
  supplementaryFiles: DownloadableFile[]
  previousSubmissions: SimulationSubmission[]
  modifications: Modification[]
  earnings: {
    designPrice: number
    commissionRate: number
    commissionAmount: number
    payout: number
    currency: string
  }
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_ORDER: AlignerWorkspaceOrder = {
  id: "ord_157",
  reference: "ORD-2026-00157",
  client: {
    name: "Dr. Laura Petersen",
    practice: "Bright Smiles Orthodontics",
    location: "Hamburg, DE",
  },
  alignerConfig: {
    archSelection: "both",
    treatmentGoals: ["crowding", "spacing", "deep_bite"],
    additionalGoals:
      "Patient has mild TMJ sensitivity — keep lateral tooth movements conservative in the first 6 stages. Patient prefers fewer stages overall.",
    complexityTier: "moderate",
    clinicalConstraints: {
      teethNotToMove: "17, 27",
      plannedExtractions: "",
      otherConstraints:
        "Existing composite resin on upper right central incisor (11) — plan attachment placement to avoid this restoration.",
    },
    designPreferences: {
      includeAttachmentDesign: true,
      includeIPRProtocol: true,
      maxStagesPreferred: 25,
    },
  },
  deadlineDate: new Date("2026-03-12"),
  isRush: false,
  receivedAt: new Date("2026-03-04"),
  intaoralScans: [
    { id: "is1", name: "upper_arch_intraoral.stl", fileSize: 4_810_000, url: "#" },
    { id: "is2", name: "lower_arch_intraoral.stl", fileSize: 4_190_000, url: "#" },
    { id: "is3", name: "bite_registration.stl", fileSize: 2_130_000, url: "#" },
  ],
  clinicalPhotos: [
    { id: "cp1", name: "frontal_smile_full.jpg", fileSize: 3_210_000, url: "#" },
    { id: "cp2", name: "lateral_profile_left.jpg", fileSize: 2_850_000, url: "#" },
    { id: "cp3", name: "occlusal_upper_view.jpg", fileSize: 2_440_000, url: "#" },
    { id: "cp4", name: "occlusal_lower_view.jpg", fileSize: 2_610_000, url: "#" },
    { id: "cp5", name: "right_buccal_view.jpg", fileSize: 2_380_000, url: "#" },
    { id: "cp6", name: "left_buccal_view.jpg", fileSize: 2_290_000, url: "#" },
  ],
  supplementaryFiles: [
    { id: "su1", name: "panoramic_xray_mar26.dcm", fileSize: 9_200_000, url: "#" },
    { id: "su2", name: "cbct_scan_full.dcm", fileSize: 42_600_000, url: "#" },
  ],
  previousSubmissions: [
    {
      url: "https://archform.example/case/ORD-2026-00157-v1",
      submittedAt: new Date("2026-03-08T15:30:00"),
      version: 1,
      treatmentSummary: {
        totalStages: 24,
        upperArchStages: 24,
        lowerArchStages: 21,
        estimatedDuration: "12–14 months",
        iprRequired: true,
        technicalNotes:
          "IPR planned at stages 8 and 14 on teeth 14–15 and 24–25. Attachments on 6 teeth per arch for rotation control. Conservative lateral movements in stages 1–6 per clinical notes.",
      },
    },
  ],
  modifications: [
    {
      id: "mod1",
      requestedAt: new Date("2026-03-09T10:15:00"),
      notes:
        "The upper arch staging looks too aggressive in stages 3–5. The lateral incisor rotation in stage 4 exceeds our protocol for TMJ-sensitive patients — please spread this movement across stages 4–7. Also, the IPR amount on 14–15 (0.5mm) should be reduced to 0.3mm maximum. Please update the movement table accordingly and resubmit.",
      simulationVersion: 1,
    },
  ],
  earnings: {
    designPrice: 540,
    commissionRate: 12.5,
    commissionAmount: 67.5,
    payout: 472.5,
    currency: "€",
  },
}

const MESSAGES_TREATMENT_PLANNING: ThreadMessage[] = [
  {
    id: "m1",
    senderRole: "client",
    senderName: "Bright Smiles Orthodontics",
    content:
      "All patient files uploaded. Please pay close attention to the TMJ sensitivity note — this patient has had issues before with aggressive lateral movements. The CBCT is included for full reference.",
    sentAt: new Date("2026-03-04T11:20:00"),
  },
  {
    id: "m2",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Files received and reviewed — good quality scans. Noted on the TMJ sensitivity. I'll plan conservative early-stage movements and flag them clearly in the movement table. I'll have the simulation ready for your review within 3 days.",
    sentAt: new Date("2026-03-04T14:05:00"),
  },
]

const MESSAGES_MODIFICATIONS: ThreadMessage[] = [
  ...MESSAGES_TREATMENT_PLANNING,
  {
    id: "m3",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Treatment simulation v1 submitted for your review. Please check the movement table carefully — IPR is planned at stages 8 and 14.",
    sentAt: new Date("2026-03-08T15:35:00"),
  },
  {
    id: "m4",
    senderRole: "client",
    senderName: "Bright Smiles Orthodontics",
    content:
      "Thanks for submitting. The overall plan looks good but stages 3–5 on the upper arch are too aggressive for this patient. Please see the modification request for the full details.",
    sentAt: new Date("2026-03-09T10:15:00"),
  },
  {
    id: "m5",
    senderRole: "provider",
    senderName: "ClearCAD Studio",
    content:
      "Understood — I'll spread the lateral incisor rotation across stages 4–7 and reduce the IPR to 0.3mm. Will resubmit by tomorrow.",
    sentAt: new Date("2026-03-09T11:00:00"),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-06")

function deadlineLabel(
  deadline: Date
): { text: string; colorClass: string } {
  const days = Math.floor(
    (deadline.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  )
  const ds = deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  if (days < 0)
    return { text: `${ds} — ${Math.abs(days)}d overdue`, colorClass: "text-red-700" }
  if (days === 0) return { text: `${ds} — due today`, colorClass: "text-amber-700" }
  if (days === 1) return { text: `${ds} — tomorrow`, colorClass: "text-amber-700" }
  return { text: `${ds} — ${days}d left`, colorClass: "text-green-700" }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const GOAL_LABELS: Record<string, string> = {
  crowding: "Crowding",
  spacing: "Spacing",
  deep_bite: "Deep Bite",
  open_bite: "Open Bite",
  crossbite: "Crossbite",
  midline: "Midline",
}

const ARCH_LABELS: Record<string, string> = {
  upper: "Upper arch only",
  lower: "Lower arch only",
  both: "Both arches",
}

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: "Simple (≤14 stages)",
  moderate: "Moderate (15–25 stages)",
  complex: "Complex (26+ stages)",
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
    <section className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
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

// ─── Clinical photo grid ──────────────────────────────────────────────────────

function ClinicalPhotoGrid({ photos }: { photos: DownloadableFile[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative overflow-hidden rounded-lg border border-border bg-warm-50"
        >
          {/* Placeholder image area */}
          <div className="flex h-28 items-center justify-center bg-warm-100">
            <ImageIcon className="h-8 w-8 text-warm-300" />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium text-warm-700" title={photo.name}>
                {photo.name}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatBytes(photo.fileSize)}</p>
            </div>
            <a
              href={photo.url}
              download={photo.name}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-warm-100 hover:text-foreground"
              aria-label={`Download ${photo.name}`}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Treatment configuration summary ─────────────────────────────────────────

function TreatmentConfigSummary({ config }: { config: AlignerConfig }) {
  const { archSelection, treatmentGoals, additionalGoals, complexityTier, clinicalConstraints, designPreferences } = config

  return (
    <div className="space-y-5">
      {/* Row 1: Arch + Complexity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Arch selection</p>
          <p className="text-sm font-semibold text-warm-800">{ARCH_LABELS[archSelection]}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Complexity tier</p>
          <p className="text-sm font-semibold text-warm-800">{COMPLEXITY_LABELS[complexityTier]}</p>
        </div>
      </div>

      {/* Treatment goals */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Treatment goals</p>
        <div className="flex flex-wrap gap-1.5">
          {treatmentGoals.map((g) => (
            <Badge key={g} variant="outline" className="bg-sage-50 text-xs font-medium text-sage-800">
              {GOAL_LABELS[g] ?? g}
            </Badge>
          ))}
        </div>
        {additionalGoals && (
          <p className="mt-2 text-xs text-muted-foreground italic">{additionalGoals}</p>
        )}
      </div>

      {/* Clinical constraints */}
      {(clinicalConstraints.teethNotToMove ||
        clinicalConstraints.plannedExtractions ||
        clinicalConstraints.otherConstraints) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Info className="h-3.5 w-3.5" />
            Clinical constraints
          </p>
          {clinicalConstraints.teethNotToMove && (
            <div>
              <p className="text-[10px] font-medium text-amber-700">Teeth not to move</p>
              <p className="text-sm text-amber-900 font-mono">{clinicalConstraints.teethNotToMove}</p>
            </div>
          )}
          {clinicalConstraints.plannedExtractions && (
            <div>
              <p className="text-[10px] font-medium text-amber-700">Planned extractions</p>
              <p className="text-sm text-amber-900 font-mono">{clinicalConstraints.plannedExtractions}</p>
            </div>
          )}
          {clinicalConstraints.otherConstraints && (
            <div>
              <p className="text-[10px] font-medium text-amber-700">Other constraints</p>
              <p className="text-sm leading-relaxed text-amber-900">{clinicalConstraints.otherConstraints}</p>
            </div>
          )}
        </div>
      )}

      {/* Design preferences */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Design preferences</p>
        <div className="flex flex-wrap gap-2">
          {designPreferences.includeAttachmentDesign && (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              Attachment design
            </span>
          )}
          {designPreferences.includeIPRProtocol && (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              IPR protocol
            </span>
          )}
          {designPreferences.maxStagesPreferred !== null && (
            <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Max {designPreferences.maxStagesPreferred} stages preferred
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Validation status badge ──────────────────────────────────────────────────

type ValidationStatus = "idle" | "validating" | "valid" | "invalid"

function ValidationBadge({ status }: { status: ValidationStatus }) {
  if (status === "idle")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-warm-300" />
        Not validated
      </span>
    )
  if (status === "validating")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validating…
      </span>
    )
  if (status === "valid")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
        <Check className="h-3 w-3" />
        Link valid
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <X className="h-3 w-3" />
      Invalid link
    </span>
  )
}

// ─── Simulation URL section ───────────────────────────────────────────────────
// Inline re-implementation of the ProviderSimulationViewer URL input portion,
// so we can combine it with the treatment summary form in a single unified section.

interface SimUrlSectionProps {
  simUrl: string
  onSimUrlChange: (v: string) => void
  validationStatus: ValidationStatus
  onValidate: () => void
  previousSubmissions: SimulationSubmission[]
}

function SimUrlSection({
  simUrl,
  onSimUrlChange,
  validationStatus,
  onValidate,
  previousSubmissions,
}: SimUrlSectionProps) {
  const [historyOpen, setHistoryOpen] = useState(false)

  const showPreview = validationStatus === "valid" && simUrl.trim() !== ""

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Paste the shareable simulation link from your aligner software (SureSmile, Archform,
        OnyxCeph, uLab, etc.). Validate the link before submitting.
      </p>

      {/* URL input row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={simUrl}
            onChange={(e) => onSimUrlChange(e.target.value)}
            placeholder="Paste simulation URL…"
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") onValidate()
            }}
          />
        </div>
        <Button
          variant="outline"
          onClick={onValidate}
          disabled={!simUrl.trim() || validationStatus === "validating"}
          className="shrink-0"
        >
          {validationStatus === "validating" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Validating…
            </>
          ) : (
            "Validate Link"
          )}
        </Button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-3">
        <ValidationBadge status={validationStatus} />
        {validationStatus === "invalid" && (
          <span className="text-xs text-red-600">
            Could not reach this URL. Check the link and try again.
          </span>
        )}
      </div>

      {/* Preview iframe */}
      {showPreview && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">Link preview</span>
            <a
              href={simUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
            >
              Open in new tab
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <iframe
            src={simUrl}
            title="Simulation preview"
            className="w-full border-0"
            style={{ height: 280 }}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}

      {/* Version history */}
      {previousSubmissions.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between bg-card px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Previous submissions ({previousSubmissions.length})
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", historyOpen && "rotate-180")}
            />
          </button>
          {historyOpen && (
            <div className="border-t border-border bg-muted/10 px-4 py-3 space-y-2">
              {previousSubmissions.map((s) => (
                <div
                  key={s.version}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-full bg-warm-100 px-1.5 text-[10px] font-semibold text-warm-800">
                      v{s.version}
                    </span>
                    <span
                      className="truncate text-xs text-muted-foreground"
                      title={s.url}
                    >
                      {s.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {s.submittedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <button
                      onClick={() => onSimUrlChange(s.url)}
                      className="text-[10px] text-teal-700 hover:underline"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Treatment summary form ───────────────────────────────────────────────────

interface TreatmentSummaryValues {
  totalStages: string
  upperArchStages: string
  lowerArchStages: string
  estimatedDuration: string
  iprRequired: boolean
  technicalNotes: string
}

function TreatmentSummaryForm({
  values,
  onChange,
  archSelection,
}: {
  values: TreatmentSummaryValues
  onChange: (v: TreatmentSummaryValues) => void
  archSelection: "upper" | "lower" | "both"
}) {
  function set(field: keyof TreatmentSummaryValues, value: string | boolean) {
    onChange({ ...values, [field]: value })
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-warm-800 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"

  return (
    <div className="space-y-4">
      {/* Stage counts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Total stages <span className="text-red-500">*</span>
          </span>
          <input
            type="number"
            min={1}
            max={60}
            value={values.totalStages}
            onChange={(e) => set("totalStages", e.target.value)}
            placeholder="e.g. 22"
            className={inputClass}
          />
        </label>
        {(archSelection === "upper" || archSelection === "both") && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Upper arch stages
            </span>
            <input
              type="number"
              min={1}
              max={60}
              value={values.upperArchStages}
              onChange={(e) => set("upperArchStages", e.target.value)}
              placeholder="e.g. 22"
              className={inputClass}
            />
          </label>
        )}
        {(archSelection === "lower" || archSelection === "both") && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Lower arch stages
            </span>
            <input
              type="number"
              min={1}
              max={60}
              value={values.lowerArchStages}
              onChange={(e) => set("lowerArchStages", e.target.value)}
              placeholder="e.g. 19"
              className={inputClass}
            />
          </label>
        )}
      </div>

      {/* Duration + IPR */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Estimated duration <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={values.estimatedDuration}
            onChange={(e) => set("estimatedDuration", e.target.value)}
            placeholder="e.g. 11–13 months"
            className={inputClass}
          />
        </label>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            IPR required
          </span>
          <div className="flex items-center gap-3 pt-1">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                    values.iprRequired === v
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]"
                      : "border-muted-foreground"
                  )}
                  onClick={() => set("iprRequired", v)}
                >
                  {values.iprRequired === v && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm text-warm-800">{v ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Technical notes */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Technical notes
        </span>
        <textarea
          value={values.technicalNotes}
          onChange={(e) => set("technicalNotes", e.target.value)}
          rows={3}
          placeholder="IPR locations and amounts, attachment positions, movement notes for the client's reference…"
          className={cn(inputClass, "resize-none")}
        />
      </label>
    </div>
  )
}

// ─── Supporting documents upload ─────────────────────────────────────────────

const SUPPORTING_DOC_SECTIONS: UploadSection[] = [
  {
    label: "Movement Table",
    acceptedFormats: [".pdf", ".xlsx", ".csv"],
    required: true,
    maxFiles: 1,
    description: "Stage-by-stage tooth movement data",
  },
  {
    label: "IPR Protocol",
    acceptedFormats: [".pdf"],
    required: false,
    maxFiles: 1,
    description: "IPR chart with locations, stages, and amounts",
  },
  {
    label: "Attachment Guide",
    acceptedFormats: [".pdf"],
    required: false,
    maxFiles: 1,
    description: "Attachment type and placement positions per tooth",
  },
  {
    label: "Treatment Summary PDF",
    acceptedFormats: [".pdf"],
    required: false,
    maxFiles: 1,
    description: "Full treatment plan summary report",
  },
]

// ─── Phase 1: Simulation submission section ───────────────────────────────────

interface PhaseOneProps {
  scenario: WorkspaceScenario
  order: AlignerWorkspaceOrder
}

function PhaseOneSection({ scenario, order }: PhaseOneProps) {
  const [simUrl, setSimUrl] = useState("")
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")
  const [summaryValues, setSummaryValues] = useState<TreatmentSummaryValues>({
    totalStages: "",
    upperArchStages: "",
    lowerArchStages: "",
    estimatedDuration: "",
    iprRequired: false,
    technicalNotes: "",
  })
  const [supportingDocs, setSupportingDocs] = useState<FileInfo[]>([])
  const [submitState, setSubmitState] = useState<"idle" | "submitted">("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-populate with previous submission data if re-submitting
  useEffect(() => {
    if (
      scenario === "modifications_requested" &&
      order.previousSubmissions.length > 0
    ) {
      const prev = order.previousSubmissions[order.previousSubmissions.length - 1]
      setSimUrl(prev.url)
      const s = prev.treatmentSummary
      setSummaryValues({
        totalStages: String(s.totalStages),
        upperArchStages: s.upperArchStages !== null ? String(s.upperArchStages) : "",
        lowerArchStages: s.lowerArchStages !== null ? String(s.lowerArchStages) : "",
        estimatedDuration: s.estimatedDuration,
        iprRequired: s.iprRequired,
        technicalNotes: s.technicalNotes,
      })
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [scenario, order.previousSubmissions])

  function handleValidate() {
    setValidationStatus("validating")
    timerRef.current = setTimeout(() => {
      setValidationStatus(simUrl.trim() ? "valid" : "invalid")
    }, 1200)
  }

  const canSubmit =
    validationStatus === "valid" &&
    summaryValues.totalStages.trim() !== "" &&
    summaryValues.estimatedDuration.trim() !== ""

  if (submitState === "submitted") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-teal-400 bg-teal-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-warm-800">
            {scenario === "modifications_requested"
              ? "Revised simulation submitted for review"
              : "Simulation submitted for client review"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The client has been notified. You will be informed once they approve or request further changes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modification alert (revision scenario) */}
      {scenario === "modifications_requested" &&
        order.modifications.map((mod) => (
          <div key={mod.id}>
            <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
              <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <p className="text-sm font-semibold text-orange-800">
                    Client requested modifications
                  </p>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {mod.requestedAt.toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-orange-900">{mod.notes}</p>
                <p className="mt-2 text-xs text-orange-700">
                  Re-submit below after updating the simulation — the form is pre-filled with your previous values.
                </p>
              </div>
            </div>
          </div>
        ))}

      {/* Simulation URL */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          1. Simulation link
        </p>
        <SimUrlSection
          simUrl={simUrl}
          onSimUrlChange={(v) => {
            setSimUrl(v)
            if (validationStatus !== "idle") setValidationStatus("idle")
          }}
          validationStatus={validationStatus}
          onValidate={handleValidate}
          previousSubmissions={order.previousSubmissions}
        />
      </div>

      <hr className="border-border" />

      {/* Treatment summary */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          2. Treatment summary
        </p>
        <TreatmentSummaryForm
          values={summaryValues}
          onChange={setSummaryValues}
          archSelection={order.alignerConfig.archSelection}
        />
      </div>

      <hr className="border-border" />

      {/* Supporting documents */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          3. Supporting documents
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Movement table is required. IPR protocol and attachment guide are strongly recommended.
        </p>
        <FileUpload
          files={supportingDocs}
          onFilesChange={setSupportingDocs}
          acceptedFormats={[".pdf", ".xlsx", ".csv"]}
          maxFileSize={20 * 1024 * 1024}
          sections={SUPPORTING_DOC_SECTIONS}
        />
      </div>

      <hr className="border-border" />

      {/* Submit CTA */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {!canSubmit && validationStatus !== "valid"
            ? "Validate the simulation link to continue"
            : !canSubmit
            ? "Fill in total stages and duration to submit"
            : "Ready to submit for client review"}
        </p>
        <Button
          disabled={!canSubmit}
          onClick={() => setSubmitState("submitted")}
          className="shrink-0 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] disabled:opacity-40"
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          {scenario === "modifications_requested"
            ? "Resubmit for Client Review"
            : "Submit Simulation for Client Review"}
        </Button>
      </div>
    </div>
  )
}

// ─── Phase 1 submitted (awaiting review) ─────────────────────────────────────

function SimulationSubmittedView({ submission }: { submission: SimulationSubmission }) {
  const s = submission.treatmentSummary
  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-300 bg-blue-50 p-4">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Awaiting client review</p>
          <p className="mt-0.5 text-xs text-blue-700">
            Your simulation was submitted on{" "}
            {submission.submittedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . You will be notified once the client makes a decision.
          </p>
        </div>
      </div>

      {/* Submitted summary */}
      <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Submitted treatment summary
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total stages", value: `${s.totalStages} stages` },
            { label: "Upper arch", value: s.upperArchStages !== null ? `${s.upperArchStages} stages` : "—" },
            { label: "Lower arch", value: s.lowerArchStages !== null ? `${s.lowerArchStages} stages` : "—" },
            { label: "Duration", value: s.estimatedDuration },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-warm-800">{value}</p>
            </div>
          ))}
        </div>
        {s.technicalNotes && (
          <div>
            <p className="text-[10px] text-muted-foreground">Technical notes</p>
            <p className="text-xs leading-relaxed text-warm-700 mt-0.5">{s.technicalNotes}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <a
            href={submission.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-warm-800 hover:bg-warm-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open simulation (v{submission.version})
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Phase 2: Deliverables upload ────────────────────────────────────────────

function PhaseTwoSection({ order }: { order: AlignerWorkspaceOrder }) {
  const [upperFiles, setUpperFiles] = useState<FileInfo[]>([])
  const [lowerFiles, setLowerFiles] = useState<FileInfo[]>([])
  const [finalDocs, setFinalDocs] = useState<FileInfo[]>([])
  const [submitState, setSubmitState] = useState<"idle" | "submitted">("idle")

  const archSelection = order.alignerConfig.archSelection
  const showUpper = archSelection === "upper" || archSelection === "both"
  const showLower = archSelection === "lower" || archSelection === "both"

  const expectedStages = order.previousSubmissions[0]?.treatmentSummary
  const expectedUpper = expectedStages?.upperArchStages ?? null
  const expectedLower = expectedStages?.lowerArchStages ?? null

  const upperCount = upperFiles.filter((f) => f.status === "complete").length
  const lowerCount = lowerFiles.filter((f) => f.status === "complete").length

  const canSubmit =
    (!showUpper || upperCount > 0) && (!showLower || lowerCount > 0)

  if (submitState === "submitted") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-teal-400 bg-teal-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Deliverables submitted</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            All aligner files and supporting documents have been delivered to the client. Order will be marked complete upon their confirmation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Treatment plan approved banner */}
      <div className="flex items-start gap-3 rounded-lg border border-teal-300 bg-teal-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-teal-900">Treatment plan approved!</p>
          <p className="mt-0.5 text-xs text-teal-700">
            The client has approved your treatment plan. Upload the final aligner design files (STL per stage) and supporting documents to complete the order.
          </p>
        </div>
      </div>

      {/* Upper arch upload */}
      {showUpper && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upper arch STL files
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              {expectedUpper !== null && (
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    upperCount >= expectedUpper ? "text-teal-700" : "text-muted-foreground"
                  )}
                >
                  {upperCount} / {expectedUpper} stages
                </span>
              )}
              {expectedUpper !== null && upperCount >= expectedUpper && (
                <FileCheck className="h-3.5 w-3.5 text-teal-600" />
              )}
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Name files{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              Stage_01_Upper.stl
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              Stage_02_Upper.stl
            </code>
            , etc.
          </p>
          <FileUpload
            files={upperFiles}
            onFilesChange={setUpperFiles}
            acceptedFormats={[".stl", ".ply"]}
            maxFileSize={20 * 1024 * 1024}
            maxFiles={60}
          />
        </div>
      )}

      {showUpper && showLower && <hr className="border-border" />}

      {/* Lower arch upload */}
      {showLower && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lower arch STL files
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              {expectedLower !== null && (
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    lowerCount >= expectedLower ? "text-teal-700" : "text-muted-foreground"
                  )}
                >
                  {lowerCount} / {expectedLower} stages
                </span>
              )}
              {expectedLower !== null && lowerCount >= expectedLower && (
                <FileCheck className="h-3.5 w-3.5 text-teal-600" />
              )}
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Name files{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              Stage_01_Lower.stl
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              Stage_02_Lower.stl
            </code>
            , etc.
          </p>
          <FileUpload
            files={lowerFiles}
            onFilesChange={setLowerFiles}
            acceptedFormats={[".stl", ".ply"]}
            maxFileSize={20 * 1024 * 1024}
            maxFiles={60}
          />
        </div>
      )}

      <hr className="border-border" />

      {/* Final supporting documents */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Final supporting documents
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Upload final versions of movement table, IPR protocol, and attachment guide.
        </p>
        <FileUpload
          files={finalDocs}
          onFilesChange={setFinalDocs}
          acceptedFormats={[".pdf", ".xlsx"]}
          maxFileSize={20 * 1024 * 1024}
          sections={SUPPORTING_DOC_SECTIONS}
        />
      </div>

      <hr className="border-border" />

      {/* Submit CTA */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {canSubmit
            ? "All required files uploaded — ready to deliver"
            : "Upload STL files for all required arches to submit"}
        </p>
        <Button
          disabled={!canSubmit}
          onClick={() => setSubmitState("submitted")}
          className="shrink-0 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] disabled:opacity-40"
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          Submit Deliverables
        </Button>
      </div>
    </div>
  )
}

// ─── Earnings card ────────────────────────────────────────────────────────────

function EarningsCard({ earnings }: { earnings: AlignerWorkspaceOrder["earnings"] }) {
  const { designPrice, commissionRate, commissionAmount, payout, currency } = earnings
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Your Earnings
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Design price</span>
          <span className="font-medium">
            {currency}{designPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Commission ({commissionRate}%)</span>
          <span className="text-red-600">− {currency}{commissionAmount.toFixed(2)}</span>
        </div>
        <div className="my-0.5 h-px bg-border" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-foreground">Your payout</span>
          <span className="text-lg font-bold text-[hsl(var(--primary))]">
            {currency}{payout.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Paid within 2 business days of client approval.
      </p>
    </div>
  )
}

// ─── Client info card ─────────────────────────────────────────────────────────

function ClientInfoCard({ client }: { client: AlignerWorkspaceOrder["client"] }) {
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

// ─── Phase indicator badge ────────────────────────────────────────────────────

function PhaseBadge({ scenario }: { scenario: WorkspaceScenario }) {
  if (scenario === "treatment_planning" || scenario === "modifications_requested") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        <Layers className="h-3 w-3" />
        Phase 1: Treatment Planning
      </span>
    )
  }
  if (scenario === "simulation_submitted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
        <Clock className="h-3 w-3" />
        Awaiting Client Review
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
      <Upload className="h-3 w-3" />
      Phase 2: Deliverables
    </span>
  )
}

// ─── Dev scenario switcher ────────────────────────────────────────────────────

function DevScenarioSwitcher({
  current,
  onChange,
}: {
  current: WorkspaceScenario
  onChange: (s: WorkspaceScenario) => void
}) {
  if (process.env.NODE_ENV !== "development") return null

  const options: { key: WorkspaceScenario; label: string }[] = [
    { key: "treatment_planning", label: "Treatment Planning" },
    { key: "simulation_submitted", label: "Sim Submitted" },
    { key: "modifications_requested", label: "Modifications" },
    { key: "plan_approved", label: "Plan Approved (P2)" },
  ]

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        Dev: Scenario
      </p>
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-left",
            current === key
              ? "bg-[hsl(var(--primary))] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderAlignerWorkspacePage() {
  const [scenario, setScenario] = useState<WorkspaceScenario>("treatment_planning")

  const order = DUMMY_ORDER
  const status = SCENARIO_STATUS[scenario]
  const timeline = getAlignerTimeline(status)
  const { text: deadlineText, colorClass: deadlineColor } = deadlineLabel(order.deadlineDate)

  const messages =
    scenario === "modifications_requested" || scenario === "simulation_submitted"
      ? MESSAGES_MODIFICATIONS
      : MESSAGES_TREATMENT_PLANNING

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

        {/* ── Order header ── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-bold text-warm-800">{order.reference}</h1>
            <OrderStatusBadge status={status} />
            <Badge
              variant="outline"
              className="border-teal-300 bg-teal-50 text-xs font-medium text-teal-700"
            >
              Aligner Design
            </Badge>
            {order.isRush && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                <Zap className="h-3 w-3" />
                Rush Order
              </span>
            )}
            <PhaseBadge scenario={scenario} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {order.client.practice} · {order.client.name}
            </span>
            <span>
              {order.alignerConfig.archSelection === "both"
                ? "Both Arches"
                : order.alignerConfig.archSelection === "upper"
                ? "Upper Only"
                : "Lower Only"}{" "}
              ·{" "}
              {COMPLEXITY_LABELS[order.alignerConfig.complexityTier]}
            </span>
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

            {/* ── PATIENT FILES ── */}
            <Section
              title="Patient Files"
              badge={
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download All
                </Button>
              }
            >
              <div className="space-y-6">
                {/* Intraoral scans */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Intraoral scans
                  </p>
                  <FileDownloadList files={order.intaoralScans} />
                </div>

                <hr className="border-border" />

                {/* Clinical photos */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Clinical photos ({order.clinicalPhotos.length} images)
                  </p>
                  <ClinicalPhotoGrid photos={order.clinicalPhotos} />
                </div>

                <hr className="border-border" />

                {/* Supplementary files */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Supplementary files (X-rays, CBCT)
                  </p>
                  <FileDownloadList files={order.supplementaryFiles} />
                </div>
              </div>
            </Section>

            {/* ── TREATMENT CONFIGURATION ── */}
            <Section
              title="Treatment Configuration"
              badge={
                <span className="rounded-full border border-warm-200 bg-warm-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warm-600">
                  Read Only
                </span>
              }
            >
              <TreatmentConfigSummary config={order.alignerConfig} />
            </Section>

            {/* ── PHASE 1: SIMULATION SUBMISSION ── */}
            {(scenario === "treatment_planning" ||
              scenario === "modifications_requested") && (
              <Section
                title="Phase 1 — Simulation Submission"
                badge={
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Action Required
                  </span>
                }
              >
                <PhaseOneSection scenario={scenario} order={order} />
              </Section>
            )}

            {/* ── PHASE 1: AWAITING REVIEW ── */}
            {scenario === "simulation_submitted" && (
              <Section title="Phase 1 — Simulation Submitted">
                <SimulationSubmittedView
                  submission={order.previousSubmissions[order.previousSubmissions.length - 1]}
                />
              </Section>
            )}

            {/* ── PHASE 2: DELIVERABLE UPLOAD ── */}
            {scenario === "plan_approved" && (
              <Section
                title="Phase 2 — Upload Deliverables"
                badge={
                  <span className="rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-700">
                    Action Required
                  </span>
                }
              >
                <PhaseTwoSection order={order} />
              </Section>
            )}

            {/* ── MESSAGES ── */}
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

            {/* Status + Phase card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </h3>
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={status} />
              </div>
              <PhaseBadge scenario={scenario} />
              <p className="text-xs text-muted-foreground">
                {scenario === "treatment_planning" &&
                  "Review patient files and submit a simulation link with treatment summary."}
                {scenario === "simulation_submitted" &&
                  "Simulation submitted — waiting for client to approve or request modifications."}
                {scenario === "modifications_requested" &&
                  "Client has requested changes. Review the feedback and resubmit your updated simulation."}
                {scenario === "plan_approved" &&
                  "Treatment plan approved. Upload final STL files for each arch and all supporting documents."}
              </p>
            </div>

            {/* Earnings */}
            <EarningsCard earnings={order.earnings} />

            {/* Aligner timeline */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Order Progress
              </h3>
              <OrderTimeline events={timeline} />
            </div>

            {/* Client info */}
            <ClientInfoCard client={order.client} />

            {/* Arch + Complexity at a glance */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Case Overview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-warm-800">{ARCH_LABELS[order.alignerConfig.archSelection]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-warm-800">{COMPLEXITY_LABELS[order.alignerConfig.complexityTier]}</span>
                </div>
                {order.alignerConfig.designPreferences.includeIPRProtocol && (
                  <div className="flex items-center gap-2">
                    <Scissors className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-warm-800">IPR protocol required</span>
                  </div>
                )}
                {order.alignerConfig.designPreferences.maxStagesPreferred !== null && (
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-warm-800">
                      Max {order.alignerConfig.designPreferences.maxStagesPreferred} stages preferred
                    </span>
                  </div>
                )}
              </div>
            </div>

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

      {/* Dev scenario switcher */}
      <DevScenarioSwitcher current={scenario} onChange={setScenario} />
    </div>
  )
}
