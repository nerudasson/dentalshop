"use client"

import { useState, useRef } from "react"
import {
  Check,
  X,
  Loader2,
  Link2,
  ExternalLink,
  ChevronDown,
  Clock,
  Layers,
  Timer,
  Scissors,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SimulationVersion, TreatmentSummary } from "@/lib/types"

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Version history list (shared sub-component) ──────────────────────────────

function VersionHistoryList({
  versions,
  activeUrl,
  onSelect,
}: {
  versions: SimulationVersion[]
  activeUrl?: string
  onSelect?: (url: string) => void
}) {
  if (versions.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      {versions.map((v) => {
        const isActive = v.url === activeUrl
        return (
          <div
            key={v.version}
            className={cn(
              "flex items-center justify-between rounded px-2 py-1.5",
              isActive ? "bg-sage-50" : "hover:bg-warm-50",
              onSelect && "cursor-pointer"
            )}
            onClick={() => onSelect?.(v.url)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-5 min-w-[28px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-sage-500 text-white"
                    : "bg-warm-100 text-warm-800"
                )}
              >
                v{v.version}
              </span>
              <span
                className={cn(
                  "max-w-[200px] truncate text-xs",
                  isActive ? "font-medium text-warm-800" : "text-muted-foreground"
                )}
                title={v.url}
              >
                {v.url}
              </span>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatDate(v.submittedAt)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── ValidationStatusBadge ────────────────────────────────────────────────────

type ValidationStatus = "idle" | "validating" | "valid" | "invalid"

function ValidationStatusBadge({ status }: { status: ValidationStatus }) {
  if (status === "idle") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-warm-300" />
        Not validated
      </span>
    )
  }

  if (status === "validating") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validating…
      </span>
    )
  }

  if (status === "valid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7f5] px-2.5 py-1 text-xs font-medium text-[#1D8E7A]">
        <Check className="h-3 w-3" />
        Link valid
      </span>
    )
  }

  // invalid
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-dental-error">
      <X className="h-3 w-3" />
      Invalid link
    </span>
  )
}

// ─── PROVIDER MODE ────────────────────────────────────────────────────────────

export interface ProviderSimulationViewerProps {
  /** Called when the provider clicks "Submit for Client Review" */
  onSubmit: (url: string) => void
  /** Called when the provider clicks "Validate Link" */
  onValidate: (url: string) => void
  /** Pre-populate the input with the most recently submitted URL */
  currentUrl?: string
  validationStatus: ValidationStatus
  versionHistory?: SimulationVersion[]
  className?: string
}

export function ProviderSimulationViewer({
  onSubmit,
  onValidate,
  currentUrl,
  validationStatus,
  versionHistory = [],
  className,
}: ProviderSimulationViewerProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl ?? "")
  const [showHistory, setShowHistory] = useState(false)

  function handleValidate() {
    const trimmed = inputUrl.trim()
    if (trimmed) onValidate(trimmed)
  }

  function handleSubmit() {
    const trimmed = inputUrl.trim()
    if (trimmed && validationStatus === "valid") onSubmit(trimmed)
  }

  const showPreview = validationStatus === "valid" && inputUrl.trim() !== ""

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* ── URL input section ── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Simulation Link
        </h3>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste simulation link (e.g. SureSmile, Archform URL)"
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleValidate()
              }}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={!inputUrl.trim() || validationStatus === "validating"}
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

        {/* Status badge row */}
        <div className="mt-3 flex items-center gap-3">
          <ValidationStatusBadge status={validationStatus} />
          {validationStatus === "invalid" && (
            <span className="text-xs text-dental-error">
              Unable to reach this URL. Check the link and try again.
            </span>
          )}
        </div>
      </div>

      {/* ── Link preview iframe ── */}
      {showPreview && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Link preview
            </span>
            <a
              href={inputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#1D8E7A] hover:underline"
            >
              Open in new tab
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <iframe
            src={inputUrl}
            title="Simulation preview"
            className="w-full border-0"
            style={{ height: 300 }}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}

      {/* ── Version history ── */}
      {versionHistory.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between"
            onClick={() => setShowHistory((s) => !s)}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Previous submissions ({versionHistory.length})
            </h3>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showHistory && "rotate-180"
              )}
            />
          </button>

          {showHistory && (
            <div className="mt-3">
              <VersionHistoryList
                versions={versionHistory}
                activeUrl={currentUrl}
                onSelect={(url) => setInputUrl(url)}
              />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Click a version to load its URL into the input above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Submit button ── */}
      <Button
        onClick={handleSubmit}
        disabled={validationStatus !== "valid"}
        className="w-full bg-sage-500 text-white hover:bg-sage-400 disabled:opacity-50 sm:w-auto sm:self-end"
        size="lg"
      >
        Submit for Client Review
      </Button>
    </div>
  )
}

// ─── TREATMENT SUMMARY PANEL ──────────────────────────────────────────────────

function TreatmentSummaryPanel({
  summary,
  className,
}: {
  summary: TreatmentSummary
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-5",
        className
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Treatment Summary
      </h3>

      {/* Total stages */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-50">
          <Layers className="h-4 w-4 text-sage-500" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Total stages</p>
          <p className="text-sm font-semibold text-warm-800">
            {summary.totalStages} stages
          </p>
          {(summary.upperArchStages !== undefined ||
            summary.lowerArchStages !== undefined) && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {summary.upperArchStages !== undefined &&
                `Upper: ${summary.upperArchStages}`}
              {summary.upperArchStages !== undefined &&
                summary.lowerArchStages !== undefined &&
                " · "}
              {summary.lowerArchStages !== undefined &&
                `Lower: ${summary.lowerArchStages}`}
            </p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-50">
          <Timer className="h-4 w-4 text-sage-500" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Estimated duration</p>
          <p className="text-sm font-semibold text-warm-800">
            {summary.estimatedDuration}
          </p>
        </div>
      </div>

      {/* IPR */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-50">
          <Scissors className="h-4 w-4 text-sage-500" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">IPR required</p>
          <p
            className={cn(
              "text-sm font-semibold",
              summary.iprRequired ? "text-[#F08C00]" : "text-[#1D8E7A]"
            )}
          >
            {summary.iprRequired ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── CLIENT MODE ──────────────────────────────────────────────────────────────

export interface ClientSimulationViewerProps {
  simulationUrl: string
  /** 'embed' shows iframe; 'link' shows a prominent open-in-tab button only */
  mode?: "embed" | "link"
  treatmentSummary?: TreatmentSummary
  versionHistory?: SimulationVersion[]
  className?: string
}

export function ClientSimulationViewer({
  simulationUrl,
  mode = "embed",
  treatmentSummary,
  versionHistory = [],
  className,
}: ClientSimulationViewerProps) {
  const [viewMode, setViewMode] = useState<"embed" | "link">(mode)
  const [activeUrl, setActiveUrl] = useState(simulationUrl)
  const [historyOpen, setHistoryOpen] = useState(false)
  // iframe load tracking
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeStatus, setIframeStatus] = useState<"loading" | "loaded" | "error">("loading")

  // Sorted newest-first for display; slot the current URL as the latest entry
  const allVersions: SimulationVersion[] = versionHistory.slice().sort(
    (a, b) => b.version - a.version
  )

  const activeVersion = allVersions.find((v) => v.url === activeUrl)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Toolbar row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Version selector */}
        {allVersions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-warm-800 hover:bg-warm-50"
              onClick={() => setHistoryOpen((s) => !s)}
            >
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {activeVersion ? `v${activeVersion.version}` : "Latest"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  historyOpen && "rotate-180"
                )}
              />
            </button>

            {historyOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[320px] rounded-lg border border-border bg-card p-3 shadow-md">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Version history
                </p>
                <VersionHistoryList
                  versions={allVersions}
                  activeUrl={activeUrl}
                  onSelect={(url) => {
                    setActiveUrl(url)
                    setHistoryOpen(false)
                    setIframeStatus("loading")
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Embed / link toggle */}
        <div className="flex rounded-md border border-border bg-secondary p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("embed")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "embed"
                ? "bg-white text-warm-800 shadow-sm"
                : "text-muted-foreground hover:text-warm-800"
            )}
          >
            Embed
          </button>
          <button
            type="button"
            onClick={() => setViewMode("link")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "link"
                ? "bg-white text-warm-800 shadow-sm"
                : "text-muted-foreground hover:text-warm-800"
            )}
          >
            Link only
          </button>
        </div>

        {/* Open in new tab — always visible and prominent */}
        <a
          href={activeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-sage-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sage-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </a>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left: iframe or link-only */}
        <div className="flex-1 overflow-hidden rounded-lg border border-border">
          {viewMode === "link" ? (
            /* Link-only fallback */
            <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 bg-warm-50 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50">
                <ExternalLink className="h-6 w-6 text-sage-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-warm-800">
                  View simulation in your browser
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Some aligner software cannot be embedded. Click below to open
                  the simulation.
                </p>
              </div>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-sage-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-400"
              >
                Open simulation
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="max-w-xs break-all text-[10px] text-muted-foreground">
                {activeUrl}
              </p>
            </div>
          ) : (
            /* Embed mode */
            <div className="relative">
              {/* Loading overlay */}
              {iframeStatus === "loading" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-warm-50">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
                    <p className="text-xs text-muted-foreground">
                      Loading simulation…
                    </p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {iframeStatus === "error" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-warm-50">
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <X className="h-5 w-5 text-dental-error" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-warm-800">
                        Preview not available
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This simulation cannot be embedded. Use the button below
                        to open it in your browser.
                      </p>
                    </div>
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-sage-500 px-3 py-2 text-sm font-medium text-white hover:bg-sage-400"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open simulation
                    </a>
                    <button
                      type="button"
                      onClick={() => setViewMode("link")}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-warm-800"
                    >
                      Switch to link-only view
                    </button>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={activeUrl}
                title="Aligner simulation"
                className="w-full border-0"
                style={{ minHeight: 500 }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={() => setIframeStatus("loaded")}
                onError={() => setIframeStatus("error")}
              />
            </div>
          )}
        </div>

        {/* Right: treatment summary */}
        {treatmentSummary && (
          <TreatmentSummaryPanel
            summary={treatmentSummary}
            className="lg:w-60 lg:shrink-0"
          />
        )}
      </div>
    </div>
  )
}

// ─── Default export ────────────────────────────────────────────────────────────
// Convenience re-export so consumers can do `import SimulationViewer from ...`

export default ClientSimulationViewer
