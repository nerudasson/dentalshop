"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Info,
  History,
  ChevronDown,
  FileText,
  Camera,
  Paperclip,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import OrderTimeline, { getAlignerTimeline } from "@/components/domain/order-timeline"
import FileDownloadList, { type DownloadableFile } from "@/components/domain/file-download-list"
import FileUpload from "@/components/domain/file-upload"
import MessageThread, { type ThreadMessage } from "@/components/domain/message-thread"
import { ProviderSimulationViewer } from "@/components/domain/simulation-viewer"
import type { OrderStatus, AlignerConfig, FileInfo, SimulationVersion } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

type Scenario = "in_progress" | "revision" | "review"

interface AlignerWorkspaceOrder {
  id: string
  reference: string
  status: OrderStatus
  client: {
    name: string
    practice: string
    location: string
  }
  alignerConfig: AlignerConfig
  deadlineDate: Date
  isRush: boolean
  receivedAt: Date
  patientFiles: {
    scans: DownloadableFile[]
    photos: DownloadableFile[]
    supplementary: DownloadableFile[]
  }
  simulationVersions: SimulationVersion[]
  revisionNotes?: string
  earnings: {
    designPrice: number
    commissionRate: number
    commissionAmount: number
    payout: number
    currency: string
  }
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-07")

const DUMMY_CONFIG: AlignerConfig = {
  archSelection: "both",
  treatmentGoals: ["crowding", "spacing", "midline"],
  additionalGoals: "Mild anterior crowding correction, patient prefers minimal attachments where possible.",
  complexityTier: "moderate",
  clinicalConstraints: {
    teethNotToMove: "17, 27, 37, 47",
    plannedExtractions: "",
    otherConstraints: "Patient has a fixed lower retainer on 31–41 — do not plan movements on those teeth.",
  },
  designPreferences: {
    includeAttachmentDesign: true,
    includeIPRProtocol: true,
    maxStagesPreferred: 24,
  },
}

const PATIENT_FILES = {
  scans: [
    { id: "sc1", name: "upper_arch_scan.stl", fileSize: 5_120_000, url: "#" },
    { id: "sc2", name: "lower_arch_scan.stl", fileSize: 4_870_000, url: "#" },
    { id: "sc3", name: "bite_registration.stl", fileSize: 1_340_000, url: "#" },
  ],
  photos: [
    { id: "ph1", name: "frontal_smile.jpg", fileSize: 2_800_000, url: "#" },
    { id: "ph2", name: "right_lateral.jpg", fileSize: 2_640_000, url: "#" },
    { id: "ph3", name: "left_lateral.jpg", fileSize: 2_510_000, url: "#" },
    { id: "ph4", name: "upper_occlusal.jpg", fileSize: 3_100_000, url: "#" },
    { id: "ph5", name: "lower_occlusal.jpg", fileSize: 2_990_000, url: "#" },
  ],
  supplementary: [
    { id: "su1", name: "panoramic_xray.dcm", fileSize: 8_200_000, url: "#" },
    { id: "su2", name: "cephalometric_xray.dcm", fileSize: 6_800_000, url: "#" },
    { id: "su3", name: "patient_notes.pdf", fileSize: 410_000, url: "#" },
  ],
}

const SIM_VERSIONS_V1: SimulationVersion[] = [
  {
    version: 1,
    url: "https://clincheck.example.com/case/2026-A0182-v1",
    submittedAt: new Date("2026-03-04T14:30:00"),
  },
]

const SIM_VERSIONS_V2: SimulationVersion[] = [
  {
    version: 2,
    url: "https://clincheck.example.com/case/2026-A0182-v2",
    submittedAt: new Date("2026-03-07T10:15:00"),
  },
  {
    version: 1,
    url: "https://clincheck.example.com/case/2026-A0182-v1",
    submittedAt: new Date("2026-03-04T14:30:00"),
  },
]

const ORDER_IN_PROGRESS: AlignerWorkspaceOrder = {
  id: "ord_182",
  reference: "ORD-2026-00182",
  status: "IN_PROGRESS",
  client: { name: "Dr. Amelia Torres", practice: "Torres Orthodontics", location: "Barcelona, ES" },
  alignerConfig: DUMMY_CONFIG,
  deadlineDate: new Date("2026-03-14"),
  isRush: false,
  receivedAt: new Date("2026-03-01"),
  patientFiles: PATIENT_FILES,
  simulationVersions: [],
  earnings: {
    designPrice: 850,
    commissionRate: 12.5,
    commissionAmount: 106.25,
    payout: 743.75,
    currency: "€",
  },
}

const ORDER_REVISION: AlignerWorkspaceOrder = {
  ...ORDER_IN_PROGRESS,
  id: "ord_174",
  reference: "ORD-2026-00174",
  status: "REVISION_REQUESTED",
  deadlineDate: new Date("2026-03-09"),
  isRush: true,
  simulationVersions: SIM_VERSIONS_V1,
  revisionNotes:
    "The simulation looks promising overall, but I have a few concerns:\n\n1. Stage 12 shows the upper left lateral incisor (22) moving too quickly — please spread this over 2–3 additional stages.\n2. The midline correction on the lower arch appears overcorrected by roughly 0.5mm. Please adjust.\n3. The attachment on tooth 14 is planned on the buccal surface which will be very visible to the patient. Can we use a more distal placement or an alternative attachment type?",
}

const ORDER_REVIEW: AlignerWorkspaceOrder = {
  ...ORDER_IN_PROGRESS,
  id: "ord_168",
  reference: "ORD-2026-00168",
  status: "REVIEW",
  deadlineDate: new Date("2026-03-12"),
  simulationVersions: SIM_VERSIONS_V2,
}

const ORDERS: Record<Scenario, AlignerWorkspaceOrder> = {
  in_progress: ORDER_IN_PROGRESS,
  revision: ORDER_REVISION,
  review: ORDER_REVIEW,
}

const MESSAGES: Record<Scenario, ThreadMessage[]> = {
  in_progress: [
    {
      id: "m1",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content:
        "Hi, all patient files have been uploaded. Please pay attention to the fixed lower retainer — the patient is very concerned about any pressure on those teeth.",
      sentAt: new Date("2026-03-01T09:30:00"),
    },
    {
      id: "m2",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content:
        "Thanks for the comprehensive files. I have reviewed the scans and photos — good quality. I have noted the lower retainer constraint and will plan around 31–41. Treatment plan should be ready within 5 business days.",
      sentAt: new Date("2026-03-01T11:45:00"),
    },
    {
      id: "m3",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content: "Excellent, thank you! Looking forward to seeing the simulation.",
      sentAt: new Date("2026-03-01T12:10:00"),
    },
  ],
  revision: [
    {
      id: "m1",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content: "Files uploaded. Rush delivery needed — patient appointment in 2 weeks.",
      sentAt: new Date("2026-03-01T09:00:00"),
    },
    {
      id: "m2",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content: "Understood, prioritising. Simulation ready in 3 days.",
      sentAt: new Date("2026-03-01T10:20:00"),
    },
    {
      id: "m3",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content: "Treatment simulation submitted for your review.",
      sentAt: new Date("2026-03-04T14:32:00"),
    },
    {
      id: "m4",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content:
        "Thank you! I have reviewed the simulation and requested some modifications — please see the revision notes for details.",
      sentAt: new Date("2026-03-05T16:45:00"),
    },
    {
      id: "m5",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content:
        "Got it — I will address all three points: spreading stage 12 movements, adjusting the lower midline, and repositioning the attachment on 14. Updated simulation coming today.",
      sentAt: new Date("2026-03-05T17:20:00"),
    },
  ],
  review: [
    {
      id: "m1",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content: "Files uploaded. Looking forward to the treatment plan.",
      sentAt: new Date("2026-03-01T09:00:00"),
    },
    {
      id: "m2",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content: "Treatment simulation (v1) ready and submitted. Please review at your convenience.",
      sentAt: new Date("2026-03-04T14:32:00"),
    },
    {
      id: "m3",
      senderRole: "client",
      senderName: "Torres Orthodontics",
      content:
        "Thank you! Some modifications needed — see revision notes. Please update the stage 12 movement speed and reposition the attachment on 14.",
      sentAt: new Date("2026-03-05T16:45:00"),
    },
    {
      id: "m4",
      senderRole: "provider",
      senderName: "ClearSmile Studio",
      content:
        "Updated simulation (v2) submitted. All three points have been addressed — stage 12 spread over 3 extra stages, lower midline corrected to 0mm, and the attachment on 14 moved to a more distal position.",
      sentAt: new Date("2026-03-07T10:17:00"),
    },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  crowding: "Crowding",
  spacing: "Spacing",
  deep_bite: "Deep Bite",
  open_bite: "Open Bite",
  crossbite: "Crossbite",
  midline: "Midline",
}

const ARCH_LABELS: Record<string, string> = {
  upper: "Upper Only",
  lower: "Lower Only",
  both: "Both Arches",
}

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: "Simple (≤14 stages)",
  moderate: "Moderate (15–25 stages)",
  complex: "Complex (26+ stages)",
}

function getDaysLeft(deadline: Date): number {
  return Math.floor((deadline.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
}

function deadlineLabel(deadline: Date): { text: string; colorClass: string } {
  const days = getDaysLeft(deadline)
  const dateStr = deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  if (days < 0) return { text: `${dateStr} — ${Math.abs(days)}d overdue`, colorClass: "text-red-700" }
  if (days === 0) return { text: `${dateStr} — due today`, colorClass: "text-amber-700" }
  if (days === 1) return { text: `${dateStr} — tomorrow`, colorClass: "text-amber-700" }
  return { text: `${dateStr} — ${days}d left`, colorClass: "text-green-700" }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  children,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
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

// ─── Config summary ───────────────────────────────────────────────────────────

function ConfigSummary({ config }: { config: AlignerConfig }) {
  const goals = config.treatmentGoals.map((g) => GOAL_LABELS[g] ?? g)
  const prefs = config.designPreferences

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Arch", value: ARCH_LABELS[config.archSelection] },
    { label: "Complexity", value: COMPLEXITY_LABELS[config.complexityTier] },
    {
      label: "Treatment goals",
      value: (
        <div className="flex flex-wrap gap-1">
          {goals.map((g) => (
            <Badge key={g} variant="secondary" className="text-xs">
              {g}
            </Badge>
          ))}
        </div>
      ),
    },
    { label: "Max stages", value: prefs.maxStagesPreferred ? `${prefs.maxStagesPreferred} stages` : "No limit" },
    { label: "Attachment design", value: prefs.includeAttachmentDesign ? "Yes" : "No" },
    { label: "IPR protocol", value: prefs.includeIPRProtocol ? "Yes" : "No" },
  ]

  const constraints = config.clinicalConstraints

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-warm-800">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Clinical constraints */}
      {(constraints.teethNotToMove || constraints.plannedExtractions || constraints.otherConstraints) && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clinical constraints
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {constraints.teethNotToMove && (
              <div className="rounded-lg border border-warm-200 bg-warm-50 px-3 py-2.5">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Teeth not to move
                </p>
                <p className="text-sm font-medium text-warm-800">{constraints.teethNotToMove}</p>
              </div>
            )}
            {constraints.plannedExtractions && (
              <div className="rounded-lg border border-warm-200 bg-warm-50 px-3 py-2.5">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Planned extractions
                </p>
                <p className="text-sm font-medium text-warm-800">{constraints.plannedExtractions}</p>
              </div>
            )}
          </div>
          {constraints.otherConstraints && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="mb-1 text-xs font-semibold text-amber-800">Other constraints</p>
                <p className="text-sm leading-relaxed text-amber-900">{constraints.otherConstraints}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional goals */}
      {config.additionalGoals && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div>
            <p className="mb-1 text-xs font-semibold text-blue-800">Additional goals</p>
            <p className="text-sm leading-relaxed text-blue-900">{config.additionalGoals}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Patient files section ────────────────────────────────────────────────────

function PatientFilesSection({
  files,
}: {
  files: AlignerWorkspaceOrder["patientFiles"]
}) {
  const subsections = [
    {
      label: "Intraoral Scans",
      icon: <FileText className="h-4 w-4 text-sage-600" />,
      files: files.scans,
      required: true,
    },
    {
      label: "Clinical Photos",
      icon: <Camera className="h-4 w-4 text-sage-600" />,
      files: files.photos,
      required: true,
    },
    {
      label: "Supplementary Files",
      icon: <Paperclip className="h-4 w-4 text-sage-600" />,
      files: files.supplementary,
      required: false,
    },
  ]

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Download these files to begin treatment planning in your software. All files are provided by the client.
      </p>
      {subsections.map((sub) => (
        <div key={sub.label}>
          <div className="mb-2 flex items-center gap-2">
            {sub.icon}
            <span className="text-sm font-medium text-warm-800">{sub.label}</span>
            {sub.required && (
              <Badge variant="outline" className="border-sage-200 bg-sage-50 text-xs text-sage-700">
                Required
              </Badge>
            )}
          </div>
          {sub.files.length > 0 ? (
            <FileDownloadList files={sub.files} showDownloadAll={sub.files.length > 1} />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
              No files in this section
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Revision notes accordion ─────────────────────────────────────────────────

function RevisionNotesAccordion({
  notes,
  submittedAt,
}: {
  notes: string
  submittedAt: Date
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-lg border border-orange-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 transition-colors hover:bg-orange-100"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Client modification request —{" "}
          {submittedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-orange-200 bg-orange-50/40 px-4 py-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-warm-800">{notes}</p>
        </div>
      )}
    </div>
  )
}

// ─── Treatment planning section ───────────────────────────────────────────────

type SimValidation = "idle" | "validating" | "valid" | "invalid"

function TreatmentPlanningSection({
  order,
  submitState,
  onSubmitted,
}: {
  order: AlignerWorkspaceOrder
  submitState: "idle" | "submitted"
  onSubmitted: () => void
}) {
  const [validationStatus, setValidationStatus] = useState<SimValidation>("idle")
  const [resubmitState, setResubmitState] = useState<"idle" | "submitted">("idle")
  const [resubmitValidation, setResubmitValidation] = useState<SimValidation>("idle")

  // Simulate async validation
  function handleValidate(url: string) {
    setValidationStatus("validating")
    setTimeout(() => {
      setValidationStatus(url.startsWith("https://") ? "valid" : "invalid")
    }, 800)
  }

  function handleResubmitValidate(url: string) {
    setResubmitValidation("validating")
    setTimeout(() => {
      setResubmitValidation(url.startsWith("https://") ? "valid" : "invalid")
    }, 800)
  }

  // ── IN_PROGRESS: first submission ──────────────────────────────────────────
  if (order.status === "IN_PROGRESS") {
    if (submitState === "submitted") {
      return (
        <div className="flex items-start gap-3 rounded-lg border border-sage-400 bg-sage-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
          <div>
            <p className="text-sm font-semibold text-warm-800">Simulation submitted for client review</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The client has been notified. You will be informed of their decision — approval releases
              payment, a modification request will appear here.
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Once you have completed the treatment plan in your aligner software, paste the shareable
          simulation link below. Validate it first to confirm the client can access it, then submit
          for their review.
        </p>
        <ProviderSimulationViewer
          validationStatus={validationStatus}
          onValidate={handleValidate}
          onSubmit={onSubmitted}
          versionHistory={order.simulationVersions}
        />
      </div>
    )
  }

  // ── REVISION_REQUESTED: resubmit ───────────────────────────────────────────
  if (order.status === "REVISION_REQUESTED") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Client has requested modifications</p>
            <p className="mt-0.5 text-xs text-orange-700">
              Review the feedback below, update your simulation in your aligner software, then submit the
              revised link.
            </p>
          </div>
        </div>

        {order.revisionNotes && (
          <RevisionNotesAccordion
            notes={order.revisionNotes}
            submittedAt={new Date("2026-03-05T16:45:00")}
          />
        )}

        <hr className="border-border" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Submit revised simulation
          </p>
          {resubmitState === "submitted" ? (
            <div className="flex items-start gap-3 rounded-lg border border-sage-400 bg-sage-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
              <div>
                <p className="text-sm font-semibold text-warm-800">Revised simulation submitted</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  The client has been notified and will review your updated treatment plan.
                </p>
              </div>
            </div>
          ) : (
            <ProviderSimulationViewer
              validationStatus={resubmitValidation}
              onValidate={handleResubmitValidate}
              onSubmit={() => setResubmitState("submitted")}
              versionHistory={order.simulationVersions}
            />
          )}
        </div>
      </div>
    )
  }

  // ── REVIEW: awaiting client decision ──────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Simulation under client review</p>
          <p className="mt-0.5 text-xs text-blue-700">
            Your treatment simulation has been submitted. The client is reviewing and will either
            approve the plan or request modifications. No action needed from you right now.
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Version history</p>
        <div className="divide-y divide-border rounded-lg border border-border bg-muted/20">
          {order.simulationVersions.map((v) => (
            <div key={v.version} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-full bg-sage-500 px-1.5 text-[10px] font-semibold text-white">
                  v{v.version}
                </span>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-xs truncate text-xs text-sage-700 underline underline-offset-2 hover:text-sage-600"
                >
                  {v.url}
                </a>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {v.submittedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Deliverables upload section ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DeliverablesUploadSection() {
  const [upperFiles, setUpperFiles] = useState<FileInfo[]>([])
  const [lowerFiles, setLowerFiles] = useState<FileInfo[]>([])
  const [docsFiles, setDocsFiles] = useState<FileInfo[]>([])
  const [submitted, setSubmitted] = useState(false)

  const uploadedCount =
    [...upperFiles, ...lowerFiles, ...docsFiles].filter((f) => f.status === "complete").length

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-sage-400 bg-sage-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">Deliverables uploaded successfully</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The client has been notified and can now download all aligner stage files and supporting
            documents. The order will be marked complete once they confirm receipt.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Upload all aligner stage STL files and supporting documents. Organise files by arch — the
        client will see them grouped by stage.
      </p>

      {/* Upper arch */}
      <div>
        <p className="mb-2 text-sm font-medium text-warm-800">Upper Arch Stages (.stl)</p>
        <FileUpload
          files={upperFiles}
          onFilesChange={setUpperFiles}
          acceptedFormats={[".stl"]}
          maxFileSize={20 * 1024 * 1024}
        />
      </div>

      {/* Lower arch */}
      <div>
        <p className="mb-2 text-sm font-medium text-warm-800">Lower Arch Stages (.stl)</p>
        <FileUpload
          files={lowerFiles}
          onFilesChange={setLowerFiles}
          acceptedFormats={[".stl"]}
          maxFileSize={20 * 1024 * 1024}
        />
      </div>

      {/* Supporting docs */}
      <div>
        <p className="mb-2 text-sm font-medium text-warm-800">Supporting Documents</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Movement table, IPR protocol, attachment guide, treatment summary — any relevant documents.
        </p>
        <FileUpload
          files={docsFiles}
          onFilesChange={setDocsFiles}
          acceptedFormats={[".pdf", ".xlsx", ".csv"]}
          maxFileSize={20 * 1024 * 1024}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {uploadedCount > 0
            ? `${uploadedCount} file${uploadedCount !== 1 ? "s" : ""} ready`
            : "Upload stage STL files to complete delivery"}
        </p>
        <Button
          disabled={upperFiles.filter((f) => f.status === "complete").length === 0}
          onClick={() => setSubmitted(true)}
          className="shrink-0 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] disabled:opacity-40"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Deliverables
        </Button>
      </div>
    </div>
  )
}

// ─── Earnings sidebar card ────────────────────────────────────────────────────

function EarningsCard({ earnings }: { earnings: AlignerWorkspaceOrder["earnings"] }) {
  const { designPrice, commissionRate, commissionAmount, payout, currency } = earnings
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
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
          <span className="text-muted-foreground">Commission ({commissionRate}%)</span>
          <span className="text-red-600">− {currency}{commissionAmount.toFixed(2)}</span>
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="flex items-baseline justify-between">
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

function ClientInfoCard({ client }: { client: AlignerWorkspaceOrder["client"] }) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
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
  current: Scenario
  onChange: (s: Scenario) => void
}) {
  if (process.env.NODE_ENV !== "development") return null
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Dev: Scenario
      </p>
      {(["in_progress", "revision", "review"] as Scenario[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
            current === s
              ? "bg-[hsl(var(--primary))] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {s === "in_progress" ? "In Progress" : s === "revision" ? "Revision Requested" : "Under Review"}
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderAlignerWorkspacePage() {
  const [scenario, setScenario] = useState<Scenario>("in_progress")
  const [simSubmitState, setSimSubmitState] = useState<"idle" | "submitted">("idle")

  // Reset submission state when switching scenarios
  useEffect(() => {
    setSimSubmitState("idle")
  }, [scenario])

  const order = ORDERS[scenario]
  const messages = MESSAGES[scenario]
  const timeline = getAlignerTimeline(order.status)
  const { text: deadlineText, colorClass: deadlineColor } = deadlineLabel(order.deadlineDate)

  // Show deliverables section after REVIEW (i.e. plan is approved in a real flow)
  // For demo, show it only in the "review" scenario as a preview toggle
  const _showDeliverables = false // toggled by a demo button below

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm">
          <Link
            href="/provider/dashboard"
            className="text-muted-foreground transition-colors hover:text-warm-800"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link
            href="/provider/queue"
            className="text-muted-foreground transition-colors hover:text-warm-800"
          >
            Order Queue
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-warm-800">{order.reference}</span>
        </nav>

        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-warm-800">{order.reference}</h1>
            <OrderStatusBadge status={order.status} />
            <Badge
              variant="outline"
              className="border-teal-200 bg-teal-50 text-xs text-teal-700"
            >
              Aligner Design
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
            <span className={cn("flex items-center gap-1 font-medium", deadlineColor)}>
              <Clock className="h-3.5 w-3.5" />
              {deadlineText}
            </span>
            <span>
              Received{" "}
              {order.receivedAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

          {/* ════ Main workspace ════ */}
          <div className="space-y-5">

            {/* ── 1. ALIGNER CONFIGURATION ── */}
            <Section
              title="Aligner Configuration"
              badge={
                <span className="rounded-full border border-warm-200 bg-warm-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warm-600">
                  Read Only
                </span>
              }
            >
              <ConfigSummary config={order.alignerConfig} />
            </Section>

            {/* ── 2. PATIENT FILES ── */}
            <Section title="Patient Files">
              <PatientFilesSection files={order.patientFiles} />
            </Section>

            {/* ── 3. TREATMENT PLANNING ── */}
            <Section title="Treatment Planning">
              <TreatmentPlanningSection
                order={order}
                submitState={simSubmitState}
                onSubmitted={() => setSimSubmitState("submitted")}
              />
            </Section>

            {/* ── 4. DELIVERABLES UPLOAD (post-approval) ── */}
            {order.status === "REVIEW" && (
              <Section
                title="Aligner Deliverables"
                badge={
                  <Badge
                    variant="outline"
                    className="border-warm-200 bg-warm-50 text-xs text-muted-foreground"
                  >
                    Available after plan approval
                  </Badge>
                }
              >
                <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Once the client approves the treatment plan, you can upload the aligner stage STL
                    files and supporting documents here. The client will receive a structured download
                    view organised by arch and stage.
                  </p>
                </div>
              </Section>
            )}

            {/* ── 5. MESSAGES ── */}
            <Section title="Messages">
              <MessageThread
                messages={messages}
                currentRole="provider"
                currentUserName="ClearSmile Studio"
              />
            </Section>
          </div>

          {/* ════ Sidebar ════ */}
          <aside className="space-y-4">

            {/* Status card */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
              </div>
              {order.status === "IN_PROGRESS" && (
                <p className="text-xs text-muted-foreground">
                  Download the patient files, prepare the treatment plan, and submit the simulation
                  link for client review.
                </p>
              )}
              {order.status === "REVISION_REQUESTED" && (
                <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5">
                  <p className="text-xs font-medium text-orange-800">
                    Client requested modifications — update your simulation and resubmit.
                  </p>
                </div>
              )}
              {order.status === "REVIEW" && (
                <p className="text-xs text-muted-foreground">
                  Your simulation is under client review. You will be notified of their decision.
                </p>
              )}
            </div>

            {/* Earnings */}
            <EarningsCard earnings={order.earnings} />

            {/* Order timeline */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
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
