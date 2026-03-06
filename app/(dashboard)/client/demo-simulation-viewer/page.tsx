"use client"

import { useState } from "react"
import {
  ProviderSimulationViewer,
  ClientSimulationViewer,
} from "@/components/domain/simulation-viewer"
import type { SimulationVersion, TreatmentSummary } from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_HISTORY: SimulationVersion[] = [
  {
    version: 1,
    url: "https://example-archform.com/sim/case-4821-v1",
    submittedAt: new Date("2026-02-10T09:14:00"),
  },
  {
    version: 2,
    url: "https://example-archform.com/sim/case-4821-v2",
    submittedAt: new Date("2026-02-17T14:30:00"),
  },
  {
    version: 3,
    url: "https://example-archform.com/sim/case-4821-v3",
    submittedAt: new Date("2026-02-24T11:05:00"),
  },
]

const DUMMY_TREATMENT_SUMMARY: TreatmentSummary = {
  totalStages: 22,
  estimatedDuration: "11 months",
  iprRequired: true,
  upperArchStages: 22,
  lowerArchStages: 18,
}

// A real embeddable URL for demo purposes (Wikipedia is generally embeddable)
const DEMO_EMBED_URL = "https://en.wikipedia.org/wiki/Clear_aligners"

// ─── Provider mode wrapper (needs local state to simulate validation) ─────────

function ProviderModeDemo() {
  const [status, setStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle")
  const [lastSubmitted, setLastSubmitted] = useState<string | undefined>(
    undefined
  )

  function handleValidate(url: string) {
    setStatus("validating")
    // Simulate async validation — treat any URL starting with https:// as valid
    setTimeout(() => {
      setStatus(url.startsWith("https://") ? "valid" : "invalid")
    }, 1200)
  }

  function handleSubmit(url: string) {
    setLastSubmitted(url)
    alert(`Submitted for client review:\n${url}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <ProviderSimulationViewer
        onValidate={handleValidate}
        onSubmit={handleSubmit}
        currentUrl={lastSubmitted}
        validationStatus={status}
        versionHistory={DUMMY_HISTORY}
      />

      {lastSubmitted && (
        <div className="rounded-lg bg-sage-50 px-4 py-3 text-xs text-sage-500">
          Last submitted URL:{" "}
          <span className="font-medium">{lastSubmitted}</span>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoSimulationViewerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Simulation Viewer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/simulation-viewer
          </code>{" "}
          — aligner track only. Two modes: provider input and client viewer.
        </p>
      </div>

      {/* ── MODE 1: Provider input ── */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Mode 1 — Provider Input
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Provider pastes a simulation URL, validates it, optionally previews,
            then submits for client review. Try entering a valid{" "}
            <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">
              https://…
            </code>{" "}
            URL and clicking Validate.
          </p>
        </div>

        <ProviderModeDemo />
      </section>

      {/* ── MODE 2: Client viewer — embed ── */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Mode 2a — Client Viewer (embed)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Large embedded iframe with treatment summary panel and version
            history dropdown. Includes embed / link-only toggle and an "Open in
            new tab" button.
          </p>
        </div>

        <ClientSimulationViewer
          simulationUrl={DEMO_EMBED_URL}
          mode="embed"
          treatmentSummary={DUMMY_TREATMENT_SUMMARY}
          versionHistory={DUMMY_HISTORY}
        />
      </section>

      {/* ── MODE 2: Client viewer — link only ── */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Mode 2b — Client Viewer (link-only default)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Forced into link-only mode — useful when the provider knows the
            aligner software blocks iframes.
          </p>
        </div>

        <ClientSimulationViewer
          simulationUrl="https://suresimulate.example.com/patient/dr-smith-case-192"
          mode="link"
          treatmentSummary={{
            totalStages: 14,
            estimatedDuration: "7 months",
            iprRequired: false,
            upperArchStages: 14,
            lowerArchStages: 12,
          }}
          versionHistory={[
            {
              version: 1,
              url: "https://suresimulate.example.com/patient/dr-smith-case-192",
              submittedAt: new Date("2026-03-01T10:00:00"),
            },
          ]}
        />
      </section>

      {/* ── MODE 2: Client viewer — no treatment summary ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Mode 2c — Client Viewer (no treatment summary, no history)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Minimal configuration — only the URL is required.
          </p>
        </div>

        <ClientSimulationViewer
          simulationUrl={DEMO_EMBED_URL}
          mode="embed"
        />
      </section>
    </div>
  )
}
