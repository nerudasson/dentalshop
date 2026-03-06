"use client"

import { useState } from "react"
import FileDownloadList from "@/components/domain/file-download-list"
import type { DownloadableFile } from "@/lib/types"

// ─── Dummy data ────────────────────────────────────────────────────────────────

const SAMPLE_FILES: DownloadableFile[] = [
  {
    id: "file_001",
    name: "upper-arch-scan.stl",
    type: "stl",
    size: 4_823_441,
    url: "#",
    uploadedAt: new Date("2026-03-01"),
  },
  {
    id: "file_002",
    name: "lower-arch-scan.ply",
    type: "ply",
    size: 3_917_882,
    url: "#",
    uploadedAt: new Date("2026-03-01"),
  },
  {
    id: "file_003",
    name: "crown-24-design-final.obj",
    type: "obj",
    size: 1_245_678,
    url: "#",
    uploadedAt: new Date("2026-03-03"),
  },
  {
    id: "file_004",
    name: "treatment-notes.pdf",
    type: "pdf",
    size: 245_120,
    url: "#",
    uploadedAt: new Date("2026-02-28"),
  },
  {
    id: "file_005",
    name: "design-deliverables-final.zip",
    type: "zip",
    size: 9_437_184,
    url: "#",
    uploadedAt: new Date("2026-03-04"),
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoFileDownloadPage() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  function handleDownload(fileId: string) {
    const file = SAMPLE_FILES.find((f) => f.id === fileId)
    setLastAction(`Downloaded: ${file?.name ?? fileId}`)
  }

  function handleDownloadAll() {
    setLastAction("Downloaded all files as ZIP")
  }

  return (
    <div className="max-w-2xl space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          FileDownloadList — Component Demo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tier 2 domain component. Used for scan files (provider side), design
          deliverables (prosthetics), and general file lists.
        </p>
        {lastAction && (
          <p className="mt-2 text-sm font-medium text-dental-success">
            ✓ {lastAction}
          </p>
        )}
      </div>

      {/* Demo 1: Full list with title + Download All */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Design Deliverables — Full List
          </h2>
          <p className="text-sm text-muted-foreground">
            5 files with mixed types. Title header and "Download All as ZIP"
            button are shown automatically.
          </p>
        </div>
        <FileDownloadList
          files={SAMPLE_FILES}
          title="Design Files"
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
        />
      </section>

      <hr className="border-border" />

      {/* Demo 2: Scan files, no title */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Scan Files — No Title
          </h2>
          <p className="text-sm text-muted-foreground">
            No title prop — the header shows the file count alongside the
            Download All button.
          </p>
        </div>
        <FileDownloadList
          files={SAMPLE_FILES.slice(0, 2)}
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
        />
      </section>

      <hr className="border-border" />

      {/* Demo 3: Single file — Download All auto-hidden */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Single File
          </h2>
          <p className="text-sm text-muted-foreground">
            One file — "Download All" is hidden automatically (
            <code className="text-xs">showDownloadAll</code> defaults to{" "}
            <code className="text-xs">false</code> when{" "}
            <code className="text-xs">files.length &lt;= 1</code>).
          </p>
        </div>
        <FileDownloadList
          files={[SAMPLE_FILES[2]]}
          title="Deliverable"
          onDownload={handleDownload}
        />
      </section>

      <hr className="border-border" />

      {/* Demo 4: Empty state */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Empty State
          </h2>
          <p className="text-sm text-muted-foreground">
            No files yet — empty state with placeholder copy.
          </p>
        </div>
        <FileDownloadList
          files={[]}
          title="Scan Files"
          onDownload={handleDownload}
        />
      </section>
    </div>
  )
}
