"use client"

import { useState } from "react"
import {
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  Box,
  FolderOpen,
  FolderClosed,
  Archive,
  File,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  AlignerDeliverables,
  StageFile,
  SupportingDoc,
  SupportingDocType,
} from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function totalFiles(d: AlignerDeliverables): number {
  return d.upperArchFiles.length + d.lowerArchFiles.length + d.supportingDocuments.length
}

const DOC_TYPE_LABELS: Record<SupportingDocType, string> = {
  movement_table: "Movement Table",
  ipr_protocol: "IPR Protocol",
  attachment_guide: "Attachment Guide",
  treatment_summary: "Treatment Summary",
  other: "Document",
}

function docTypeIcon(type: SupportingDocType) {
  if (type === "other") return File
  return FileText
}

// ─── Sage outline button ───────────────────────────────────────────────────────
// The base Button component's 'outline' variant uses border-input (grey).
// For brand-coloured sage outlines we use a plain <button> with Tailwind classes.

function SageOutlineButton({
  children,
  onClick,
  className,
  size = "sm",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  size?: "xs" | "sm"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-sage-500 font-medium text-sage-500 transition-colors hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sage-400",
        size === "xs" && "px-2 py-1 text-[10px]",
        size === "sm" && "px-2.5 py-1.5 text-xs",
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── Stage file row ───────────────────────────────────────────────────────────

function StageFileRow({
  file,
  onDownload,
}: {
  file: StageFile
  onDownload: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0 hover:bg-warm-50">
      <Box className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-xs text-warm-800" title={file.fileName}>
        {file.fileName}
      </span>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {formatSize(file.fileSize)}
      </span>
      <SageOutlineButton size="xs" onClick={() => onDownload(file.id)}>
        <Download className="h-2.5 w-2.5" />
        DL
      </SageOutlineButton>
    </div>
  )
}

// ─── Arch section ─────────────────────────────────────────────────────────────

function ArchSection({
  label,
  files,
  onDownloadFile,
  onDownloadSection,
}: {
  label: string
  files: StageFile[]
  onDownloadFile: (id: string) => void
  onDownloadSection: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Section header */}
      <div className="flex items-center gap-2 bg-warm-50 px-4 py-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-sage-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-sage-500" />
          )}
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-sage-500" />
          ) : (
            <FolderClosed className="h-4 w-4 shrink-0 text-sage-500" />
          )}
          <span className="text-sm font-semibold text-sage-500">
            {label}
          </span>
          <span className="text-sm text-muted-foreground">
            — {files.length} stage{files.length !== 1 ? "s" : ""}
          </span>
        </button>

        <SageOutlineButton onClick={onDownloadSection}>
          <Download className="h-3 w-3" />
          Download {label.split(" ")[0]} Arch
        </SageOutlineButton>
      </div>

      {/* File list */}
      {open && (
        <div className="divide-y-0">
          {files.map((f) => (
            <StageFileRow key={f.id} file={f} onDownload={onDownloadFile} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Supporting documents section ─────────────────────────────────────────────

function SupportingDocsSection({
  docs,
  onDownloadFile,
}: {
  docs: SupportingDoc[]
  onDownloadFile: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  if (docs.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Section header */}
      <button
        type="button"
        className="flex w-full items-center gap-2 bg-warm-50 px-4 py-3 text-left"
        onClick={() => setOpen((s) => !s)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-sage-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-sage-500" />
        )}
        <FileText className="h-4 w-4 shrink-0 text-sage-500" />
        <span className="text-sm font-semibold text-sage-500">
          Supporting Documents
        </span>
        <span className="text-sm text-muted-foreground">
          — {docs.length} file{docs.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Doc rows */}
      {open && (
        <div>
          {docs.map((doc) => {
            const Icon = docTypeIcon(doc.type)
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 hover:bg-warm-50"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-warm-800">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {DOC_TYPE_LABELS[doc.type]} · {formatSize(doc.fileSize)}
                  </p>
                </div>
                <SageOutlineButton onClick={() => onDownloadFile(doc.id)}>
                  <Download className="h-3 w-3" />
                  Download
                </SageOutlineButton>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Folder structure preview ─────────────────────────────────────────────────

function FolderStructurePreview({
  deliverables,
}: {
  deliverables: AlignerDeliverables
}) {
  const [open, setOpen] = useState(false)

  const upperNames = deliverables.upperArchFiles
    .slice(0, 3)
    .map((f) => f.fileName)
  const lowerNames = deliverables.lowerArchFiles
    .slice(0, 3)
    .map((f) => f.fileName)
  const docNames = deliverables.supportingDocuments.map((d) => d.name)

  const moreUpper = Math.max(0, deliverables.upperArchFiles.length - 3)
  const moreLower = Math.max(0, deliverables.lowerArchFiles.length - 3)

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        onClick={() => setOpen((s) => !s)}
      >
        <Archive className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-xs font-medium text-warm-800">
          ZIP folder structure preview
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border bg-secondary px-5 py-4">
          <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-muted-foreground">
            {`AlignDesign_Order/\n`}
            {`  Upper_Arch/\n`}
            {upperNames.map((n) => `    ${n}\n`).join("")}
            {moreUpper > 0 ? `    … +${moreUpper} more files\n` : ""}
            {`  Lower_Arch/\n`}
            {lowerNames.map((n) => `    ${n}\n`).join("")}
            {moreLower > 0 ? `    … +${moreLower} more files\n` : ""}
            {`  Supporting_Documents/\n`}
            {docNames.map((n) => `    ${n}\n`).join("")}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface StagedFileDownloadProps {
  deliverables: AlignerDeliverables
  onDownloadFile: (fileId: string) => void
  onDownloadAll: () => void
  className?: string
}

export default function StagedFileDownload({
  deliverables,
  onDownloadFile,
  onDownloadAll,
  className,
}: StagedFileDownloadProps) {
  const fileCount = totalFiles(deliverables)

  function handleDownloadArch(arch: "upper" | "lower") {
    const files =
      arch === "upper"
        ? deliverables.upperArchFiles
        : deliverables.lowerArchFiles
    files.forEach((f) => onDownloadFile(f.id))
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Top bar: Download All ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-warm-800">Aligner Deliverables</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {fileCount} files · {formatSize(deliverables.totalSize)} total ·{" "}
            {deliverables.totalStages} stages
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadAll}
          className="inline-flex items-center gap-2 rounded-md bg-sage-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sage-400"
        >
          <Download className="h-4 w-4" />
          Download All as ZIP
        </button>
      </div>

      {/* ── Folder structure preview ── */}
      <FolderStructurePreview deliverables={deliverables} />

      {/* ── Upper arch ── */}
      {deliverables.upperArchFiles.length > 0 && (
        <ArchSection
          label="Upper Arch"
          files={deliverables.upperArchFiles}
          onDownloadFile={onDownloadFile}
          onDownloadSection={() => handleDownloadArch("upper")}
        />
      )}

      {/* ── Lower arch ── */}
      {deliverables.lowerArchFiles.length > 0 && (
        <ArchSection
          label="Lower Arch"
          files={deliverables.lowerArchFiles}
          onDownloadFile={onDownloadFile}
          onDownloadSection={() => handleDownloadArch("lower")}
        />
      )}

      {/* ── Supporting documents ── */}
      <SupportingDocsSection
        docs={deliverables.supportingDocuments}
        onDownloadFile={onDownloadFile}
      />
    </div>
  )
}
