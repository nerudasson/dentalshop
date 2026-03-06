"use client"

import { useState } from "react"
import StagedFileDownload from "@/components/domain/staged-file-download"
import type { AlignerDeliverables } from "@/lib/types"

// ─── Dummy data generators ────────────────────────────────────────────────────

function makeUpperFiles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const stage = i + 1
    const padded = String(stage).padStart(2, "0")
    return {
      id: `upper-${stage}`,
      stageNumber: stage,
      fileName: `Stage_${padded}_Upper.stl`,
      // Realistic STL file sizes: 200–600 KB per aligner stage
      fileSize: Math.round((220 + Math.random() * 360) * 1024),
      url: `https://files.example.com/case-4821/upper/stage-${padded}.stl`,
    }
  })
}

function makeLowerFiles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const stage = i + 1
    const padded = String(stage).padStart(2, "0")
    return {
      id: `lower-${stage}`,
      stageNumber: stage,
      fileName: `Stage_${padded}_Lower.stl`,
      fileSize: Math.round((200 + Math.random() * 340) * 1024),
      url: `https://files.example.com/case-4821/lower/stage-${padded}.stl`,
    }
  })
}

const UPPER = makeUpperFiles(22)
const LOWER = makeLowerFiles(22)

const SUPPORTING_DOCS = [
  {
    id: "doc-movement",
    name: "Movement_Table_Case4821.pdf",
    type: "movement_table" as const,
    fileSize: 1.4 * 1024 * 1024,
    url: "https://files.example.com/case-4821/docs/movement-table.pdf",
  },
  {
    id: "doc-ipr",
    name: "IPR_Protocol_Case4821.pdf",
    type: "ipr_protocol" as const,
    fileSize: 0.8 * 1024 * 1024,
    url: "https://files.example.com/case-4821/docs/ipr-protocol.pdf",
  },
  {
    id: "doc-attachment",
    name: "Attachment_Guide_Case4821.pdf",
    type: "attachment_guide" as const,
    fileSize: 2.1 * 1024 * 1024,
    url: "https://files.example.com/case-4821/docs/attachment-guide.pdf",
  },
  {
    id: "doc-summary",
    name: "Treatment_Summary_Case4821.pdf",
    type: "treatment_summary" as const,
    fileSize: 0.6 * 1024 * 1024,
    url: "https://files.example.com/case-4821/docs/treatment-summary.pdf",
  },
]

function computeTotalSize(deliverables: AlignerDeliverables): number {
  return [
    ...deliverables.upperArchFiles,
    ...deliverables.lowerArchFiles,
  ].reduce((sum, f) => sum + f.fileSize, 0) +
    deliverables.supportingDocuments.reduce((sum, d) => sum + d.fileSize, 0)
}

const FULL_DELIVERABLES: AlignerDeliverables = {
  upperArchFiles: UPPER,
  lowerArchFiles: LOWER,
  supportingDocuments: SUPPORTING_DOCS,
  totalStages: 22,
  totalSize: 0, // computed below
}
FULL_DELIVERABLES.totalSize = computeTotalSize(FULL_DELIVERABLES)

const UPPER_ONLY_DELIVERABLES: AlignerDeliverables = {
  upperArchFiles: makeUpperFiles(14),
  lowerArchFiles: [],
  supportingDocuments: SUPPORTING_DOCS.slice(0, 2),
  totalStages: 14,
  totalSize: 0,
}
UPPER_ONLY_DELIVERABLES.totalSize = computeTotalSize(UPPER_ONLY_DELIVERABLES)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoStagedFileDownloadPage() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  function handleDownloadFile(fileId: string) {
    setLastAction(`Download file: ${fileId}`)
  }

  function handleDownloadAll() {
    setLastAction("Download All as ZIP triggered")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">
          Staged File Download
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/staged-file-download
          </code>{" "}
          — aligner track only. Replaces flat file list for orders with 50+
          STL deliverables.
        </p>
      </div>

      {/* Last action */}
      {lastAction && (
        <div className="mb-6 rounded-lg bg-sage-50 px-4 py-2.5 text-xs text-sage-500">
          Last action:{" "}
          <span className="font-medium">{lastAction}</span>
        </div>
      )}

      {/* ── Scenario A: full bilateral case (22 upper + 22 lower + 4 docs) ── */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario A — Full bilateral case (22U + 22L + 4 docs)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Typical moderate-complexity bilateral aligner order. Expand each
            arch section to see individual stage files. Toggle the ZIP preview
            to see folder structure.
          </p>
        </div>

        <StagedFileDownload
          deliverables={FULL_DELIVERABLES}
          onDownloadFile={handleDownloadFile}
          onDownloadAll={handleDownloadAll}
        />
      </section>

      {/* ── Scenario B: upper arch only (14 stages) ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario B — Upper arch only (14 stages)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Simple upper-only case. Lower Arch section is hidden when empty.
          </p>
        </div>

        <StagedFileDownload
          deliverables={UPPER_ONLY_DELIVERABLES}
          onDownloadFile={handleDownloadFile}
          onDownloadAll={handleDownloadAll}
        />
      </section>
    </div>
  )
}
