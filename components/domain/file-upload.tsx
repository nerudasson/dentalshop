"use client"

import { useRef, useState, useCallback } from "react"
import {
  UploadCloud,
  X,
  File,
  FileText,
  Image,
  Box,
  Archive,
  ScanLine,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { FileInfo, UploadSection } from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (["stl", "ply", "obj"].includes(ext)) return Box
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return Image
  if (ext === "dcm") return ScanLine
  if (ext === "pdf") return FileText
  if (["zip", "tar", "gz"].includes(ext)) return Archive
  return File
}

function validateFile(
  file: File,
  acceptedFormats: string[],
  maxFileSize: number
): { valid: true } | { valid: false; reason: string } {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "")
  const normalised = acceptedFormats.map((f) => f.toLowerCase())
  if (!normalised.includes(ext)) {
    return {
      valid: false,
      reason: `"${file.name}" — unsupported format (${ext}). Accepted: ${acceptedFormats.join(", ")}`,
    }
  }
  if (file.size > maxFileSize) {
    return {
      valid: false,
      reason: `"${file.name}" — file too large (${formatFileSize(file.size)}, max ${formatFileSize(maxFileSize)})`,
    }
  }
  return { valid: true }
}

// ─── FileRow ──────────────────────────────────────────────────────────────────

interface FileRowProps {
  file: FileInfo
  showProgress: boolean
  onRemove: () => void
  disabled?: boolean
}

function FileRow({ file, showProgress, onRemove, disabled }: FileRowProps) {
  const Icon = getFileIcon(file.name)
  const isError = file.status === "error"
  const isUploading = file.status === "uploading"

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
        isError
          ? "border-dental-error/30 bg-dental-error/5 text-dental-error"
          : "border-border bg-white hover:bg-warm-100"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isError ? "text-dental-error" : "text-muted-foreground"
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {file.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-xs",
              isError ? "text-dental-error" : "text-muted-foreground"
            )}
          >
            {formatFileSize(file.size)}
          </span>
        </div>

        {isError && file.errorMessage && (
          <p className="mt-0.5 text-xs text-dental-error">{file.errorMessage}</p>
        )}

        {showProgress && isUploading && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-sage-500 transition-all duration-200"
              style={{ width: `${file.progress ?? 0}%` }}
            />
          </div>
        )}
      </div>

      {!isUploading && (
        <div className="shrink-0">
          {file.status === "complete" && !isError && (
            <CheckCircle2 className="h-3.5 w-3.5 text-dental-success" />
          )}
          {isError && <AlertCircle className="h-3.5 w-3.5 text-dental-error" />}
        </div>
      )}
      {isUploading && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {file.progress ?? 0}%
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 disabled:pointer-events-none"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── DropZoneArea ─────────────────────────────────────────────────────────────

interface DropZoneAreaProps {
  acceptedFormats: string[]
  maxFiles: number
  maxFileSize: number
  currentCount: number
  disabled?: boolean
  onAdd: (files: File[]) => void
  onReject: (rejections: { name: string; reason: string }[]) => void
}

function DropZoneArea({
  acceptedFormats,
  maxFiles,
  maxFileSize,
  currentCount,
  disabled,
  onAdd,
  onReject,
}: DropZoneAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    (rawFiles: File[]) => {
      const valid: File[] = []
      const rejected: { name: string; reason: string }[] = []

      const remaining = maxFiles - currentCount
      rawFiles.slice(0, remaining + rejected.length).forEach((file) => {
        const result = validateFile(file, acceptedFormats, maxFileSize)
        if (result.valid) {
          if (valid.length < remaining) {
            valid.push(file)
          } else {
            rejected.push({
              name: file.name,
              reason: `"${file.name}" — max ${maxFiles} file(s) allowed`,
            })
          }
        } else {
          rejected.push({ name: file.name, reason: result.reason })
        }
      })

      // Check if any files were skipped due to maxFiles
      rawFiles.slice(remaining + rejected.length).forEach((file) => {
        rejected.push({
          name: file.name,
          reason: `"${file.name}" — max ${maxFiles} file(s) allowed`,
        })
      })

      if (valid.length > 0) onAdd(valid)
      if (rejected.length > 0) onReject(rejected)
    },
    [acceptedFormats, maxFileSize, maxFiles, currentCount, onAdd, onReject]
  )

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return
    const dropped = Array.from(e.dataTransfer.files)
    processFiles(dropped)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    processFiles(selected)
    // Reset input so same file can be re-added after removal
    e.target.value = ""
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="File upload drop zone"
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors select-none",
        isDragOver
          ? "border-sage-400 bg-sage-50"
          : "border-warm-300 bg-white hover:border-sage-400 hover:bg-sage-50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <UploadCloud
        className={cn(
          "h-8 w-8 transition-colors",
          isDragOver ? "text-sage-500" : "text-muted-foreground"
        )}
      />
      <div>
        <p className="text-sm font-medium text-foreground">
          Drag files here or{" "}
          <span className="text-sage-500 underline-offset-2 hover:underline">
            click to browse
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Accepted: {acceptedFormats.join(", ")}
        </p>
        {maxFiles < Infinity && (
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} file{maxFiles !== 1 ? "s" : ""},{" "}
            max {formatFileSize(maxFileSize)} each
          </p>
        )}
      </div>
    </div>
  )
}

// ─── FileUpload (main export) ─────────────────────────────────────────────────

export interface FileUploadProps {
  acceptedFormats: string[]
  maxFiles?: number
  maxFileSize?: number
  onFilesChange: (files: FileInfo[]) => void
  files: FileInfo[]
  showProgress?: boolean
  sections?: UploadSection[]
  disabled?: boolean
  className?: string
}

export default function FileUpload({
  acceptedFormats,
  maxFiles = 10,
  maxFileSize = 52_428_800,
  onFilesChange,
  files,
  showProgress = false,
  sections,
  disabled = false,
  className,
}: FileUploadProps) {
  const [rejections, setRejections] = useState<{ name: string; reason: string }[]>([])

  function buildFileInfo(file: File, sectionLabel?: string): FileInfo {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "complete",
      section: sectionLabel,
    }
  }

  function handleAdd(rawFiles: File[], sectionLabel?: string) {
    const newInfos = rawFiles.map((f) => buildFileInfo(f, sectionLabel))
    onFilesChange([...files, ...newInfos])
  }

  function handleReject(newRejections: { name: string; reason: string }[]) {
    setRejections((prev) => [...prev, ...newRejections])
  }

  function handleRemove(id: string) {
    onFilesChange(files.filter((f) => f.id !== id))
  }

  function dismissRejections() {
    setRejections([])
  }

  // ── Single-zone mode ────────────────────────────────────────────────────────
  if (!sections) {
    return (
      <div className={cn("space-y-3", className)}>
        <DropZoneArea
          acceptedFormats={acceptedFormats}
          maxFiles={maxFiles}
          maxFileSize={maxFileSize}
          currentCount={files.length}
          disabled={disabled}
          onAdd={(raw) => handleAdd(raw)}
          onReject={handleReject}
        />

        {rejections.length > 0 && (
          <RejectionBanner rejections={rejections} onDismiss={dismissRejections} />
        )}

        {files.length > 0 && (
          <ul className="space-y-1.5">
            {files.map((file) => (
              <li key={file.id}>
                <FileRow
                  file={file}
                  showProgress={showProgress}
                  onRemove={() => handleRemove(file.id)}
                  disabled={disabled}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ── Multi-section mode ──────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-6", className)}>
      {sections.map((section) => {
        const sectionFiles = files.filter((f) => f.section === section.label)
        const sectionMax = section.maxFiles ?? maxFiles

        return (
          <div key={section.label} className="space-y-2">
            {/* Section header */}
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {section.label}
              </h3>
              {section.required ? (
                <span className="text-xs font-medium text-dental-error">Required</span>
              ) : (
                <span className="text-xs text-muted-foreground">Optional</span>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {sectionFiles.length}/{sectionMax}
              </span>
            </div>
            {section.description && (
              <p className="text-xs text-muted-foreground">{section.description}</p>
            )}

            <DropZoneArea
              acceptedFormats={section.acceptedFormats}
              maxFiles={sectionMax}
              maxFileSize={maxFileSize}
              currentCount={sectionFiles.length}
              disabled={disabled}
              onAdd={(raw) => handleAdd(raw, section.label)}
              onReject={handleReject}
            />

            {sectionFiles.length > 0 && (
              <ul className="space-y-1.5">
                {sectionFiles.map((file) => (
                  <li key={file.id}>
                    <FileRow
                      file={file}
                      showProgress={showProgress}
                      onRemove={() => handleRemove(file.id)}
                      disabled={disabled}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      {rejections.length > 0 && (
        <RejectionBanner rejections={rejections} onDismiss={dismissRejections} />
      )}
    </div>
  )
}

// ─── RejectionBanner ──────────────────────────────────────────────────────────

interface RejectionBannerProps {
  rejections: { name: string; reason: string }[]
  onDismiss: () => void
}

function RejectionBanner({ rejections, onDismiss }: RejectionBannerProps) {
  return (
    <div className="rounded-md border border-dental-error/30 bg-dental-error/5 p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-dental-error" />
        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-semibold text-dental-error">
            {rejections.length} file{rejections.length !== 1 ? "s" : ""} rejected
          </p>
          <ul className="space-y-0.5">
            {rejections.map((r, i) => (
              <li key={i} className="text-xs text-dental-error/80">
                {r.reason}
              </li>
            ))}
          </ul>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-dental-error hover:bg-dental-error/10 hover:text-dental-error"
          onClick={onDismiss}
          aria-label="Dismiss errors"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
