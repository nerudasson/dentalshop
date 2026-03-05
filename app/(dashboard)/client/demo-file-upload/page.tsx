"use client"

import { useState, useRef } from "react"
import FileUpload from "@/components/domain/file-upload"
import { Button } from "@/components/ui/button"
import type { FileInfo, UploadSection } from "@/lib/types"

// ─── Aligner sections ─────────────────────────────────────────────────────────

const ALIGNER_SECTIONS: UploadSection[] = [
  {
    label: "Intraoral Scans",
    acceptedFormats: [".stl", ".ply", ".obj"],
    required: true,
    maxFiles: 4,
    description: "Upper and lower arch scans",
  },
  {
    label: "Clinical Photos",
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    required: true,
    maxFiles: 10,
    description: "Frontal, lateral, and occlusal photos",
  },
  {
    label: "Supplementary Files",
    acceptedFormats: [".pdf", ".dcm", ".zip"],
    required: false,
    description: "X-rays, records, or other supporting documents",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoFileUploadPage() {
  const [singleFiles, setSingleFiles] = useState<FileInfo[]>([])
  const [alignerFiles, setAlignerFiles] = useState<FileInfo[]>([])
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function simulateProgress() {
    // Pick the first 2 complete files from the single zone to animate
    const targets = singleFiles
      .filter((f) => f.status === "complete")
      .slice(0, 2)

    if (targets.length === 0) return

    // Set them to uploading at 0%
    setSingleFiles((prev) =>
      prev.map((f) =>
        targets.find((t) => t.id === f.id)
          ? { ...f, status: "uploading" as const, progress: 0 }
          : f
      )
    )

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    progressIntervalRef.current = setInterval(() => {
      setSingleFiles((prev) => {
        const updated = prev.map((f) => {
          if (!targets.find((t) => t.id === f.id)) return f
          const next = (f.progress ?? 0) + 5
          if (next >= 100) return { ...f, status: "complete" as const, progress: 100 }
          return { ...f, progress: next }
        })

        const allDone = targets.every(
          (t) => updated.find((u) => u.id === t.id)?.status === "complete"
        )
        if (allDone && progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        return updated
      })
    }, 80)
  }

  const scanCount = alignerFiles.filter((f) => f.section === "Intraoral Scans").length
  const photoCount = alignerFiles.filter((f) => f.section === "Clinical Photos").length
  const suppCount = alignerFiles.filter((f) => f.section === "Supplementary Files").length

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">FileUpload — Component Demo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demonstrates single-zone and multi-section upload modes.
        </p>
      </div>

      {/* ── Demo 1: Single zone (prosthetics) ────────────────────────────────── */}
      <section className="space-y-4 rounded-lg border border-border bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            1 — Prosthetics: Scan Files
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Single drop zone accepting .stl, .ply, and .obj files. Max 5 files, 50 MB each.
          </p>
        </div>

        <FileUpload
          acceptedFormats={[".stl", ".ply", ".obj"]}
          maxFiles={5}
          files={singleFiles}
          onFilesChange={setSingleFiles}
          showProgress
        />

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {singleFiles.length} file{singleFiles.length !== 1 ? "s" : ""} attached
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={simulateProgress}
            disabled={singleFiles.filter((f) => f.status === "complete").length === 0}
          >
            Simulate Upload Progress
          </Button>
        </div>
      </section>

      {/* ── Demo 2: Sectioned upload (aligner) ───────────────────────────────── */}
      <section className="space-y-4 rounded-lg border border-border bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            2 — Aligner: Categorised Upload
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Three separate drop zones, each with its own accepted formats and limits.
          </p>
        </div>

        <FileUpload
          acceptedFormats={[".stl"]}
          files={alignerFiles}
          onFilesChange={setAlignerFiles}
          showProgress
          sections={ALIGNER_SECTIONS}
        />

        <div className="flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Scans:{" "}
            <span className="font-medium text-foreground">{scanCount}</span>
          </span>
          <span>
            Photos:{" "}
            <span className="font-medium text-foreground">{photoCount}</span>
          </span>
          <span>
            Supplementary:{" "}
            <span className="font-medium text-foreground">{suppCount}</span>
          </span>
          <span>
            Total:{" "}
            <span className="font-medium text-foreground">{alignerFiles.length}</span>
          </span>
        </div>
      </section>
    </div>
  )
}
