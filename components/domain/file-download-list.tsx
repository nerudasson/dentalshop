import { Download, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DownloadableFile {
  id: string
  name: string
  /** File size in bytes */
  fileSize: number
  /** URL for the download link */
  url: string
  uploadedAt?: Date
}

export interface FileDownloadListProps {
  files: DownloadableFile[]
  /** Show "Download All as ZIP" header row; defaults to true */
  showDownloadAll?: boolean
  /** Message shown when the files array is empty */
  emptyMessage?: string
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getTotalSize(files: DownloadableFile[]): number {
  return files.reduce((acc, f) => acc + f.fileSize, 0)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FileDownloadList({
  files,
  showDownloadAll = true,
  emptyMessage = "No files available.",
  className,
}: FileDownloadListProps) {
  if (files.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border px-4 py-8 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const totalSize = getTotalSize(files)

  return (
    <div className={cn("space-y-2", className)}>
      {/* Download-all bar (shown when multiple files present) */}
      {showDownloadAll && files.length > 1 && (
        <div className="flex items-center justify-between rounded-md border border-border bg-warm-50 px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {files.length} files &middot; {formatFileSize(totalSize)}
          </span>
          <Button variant="outline" size="sm" asChild>
            <a href="#" download>
              <Download className="h-3.5 w-3.5" />
              Download All as ZIP
            </a>
          </Button>
        </div>
      )}

      {/* File rows */}
      <div className="divide-y divide-border rounded-md border border-border">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-warm-100"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-warm-800">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
            </div>

            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a href={file.url} download={file.name} aria-label={`Download ${file.name}`}>
                <Download className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
