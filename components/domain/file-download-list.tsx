"use client"

import {
  File,
  FileText,
  ImageIcon,
  Box,
  Archive,
  ScanLine,
  Download,
  FolderDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { DownloadableFile } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  const ext = type.toLowerCase().replace(/^\./, "")
  if (["stl", "ply", "obj"].includes(ext)) return Box
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return ImageIcon
  if (ext === "dcm") return ScanLine
  if (ext === "pdf") return FileText
  if (["zip", "tar", "gz"].includes(ext)) return Archive
  return File
}

// ─── FileDownloadRow ──────────────────────────────────────────────────────────

interface FileDownloadRowProps {
  file: DownloadableFile
  onDownload: (fileId: string) => void
}

function FileDownloadRow({ file, onDownload }: FileDownloadRowProps) {
  const Icon = getFileIcon(file.type)
  const ext = file.type.toLowerCase().replace(/^\./, "").toUpperCase()

  return (
    <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-warm-100">
      {/* Type icon */}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {file.name}
          </span>
          <span className="shrink-0 rounded bg-warm-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warm-800 transition-colors group-hover:bg-white">
            {ext}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-xs text-warm-500">{formatFileSize(file.size)}</span>
          {file.uploadedAt && (
            <>
              <span className="text-xs text-warm-300">·</span>
              <span className="text-xs text-muted-foreground">
                {file.uploadedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Per-file download button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDownload(file.id)}
        className="shrink-0 border-sage-500 text-sage-500 hover:border-sage-600 hover:bg-sage-50 hover:text-sage-600"
        aria-label={`Download ${file.name}`}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="ml-1.5">Download</span>
      </Button>
    </div>
  )
}

// ─── FileDownloadList (main export) ───────────────────────────────────────────

export interface FileDownloadListProps {
  files: DownloadableFile[]
  /** Defaults to true when files.length > 1 */
  showDownloadAll?: boolean
  onDownload: (fileId: string) => void
  onDownloadAll?: () => void
  title?: string
  className?: string
}

export default function FileDownloadList({
  files,
  showDownloadAll,
  onDownload,
  onDownloadAll,
  title,
  className,
}: FileDownloadListProps) {
  const shouldShowDownloadAll = showDownloadAll ?? files.length > 1
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const hasHeader = title || (shouldShowDownloadAll && files.length > 0)

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-white", className)}>
      {/* Header row */}
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          {title ? (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          ) : (
            <span className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          )}

          {shouldShowDownloadAll && files.length > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={onDownloadAll}
              className="shrink-0 bg-sage-500 text-white hover:bg-sage-600"
            >
              <FolderDown className="h-3.5 w-3.5" />
              <span className="ml-1.5">
                Download All as ZIP
                <span className="ml-1 opacity-70">({formatFileSize(totalSize)})</span>
              </span>
            </Button>
          )}
        </div>
      )}

      {/* File rows / empty state */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <File className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No files available</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Files will appear here once they have been uploaded.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {files.map((file) => (
            <li key={file.id}>
              <FileDownloadRow file={file} onDownload={onDownload} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
