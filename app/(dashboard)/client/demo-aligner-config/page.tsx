"use client"

import { useState } from "react"
import AlignerConfigForm from "@/components/domain/aligner-config-form"
import type { AlignerConfig } from "@/lib/types"

// ─── Dummy initial values ─────────────────────────────────────────────────────

const INITIAL_BLANK: AlignerConfig = {
  archSelection: "both",
  treatmentGoals: [],
  additionalGoals: "",
  complexityTier: "moderate",
  clinicalConstraints: {
    teethNotToMove: "",
    plannedExtractions: "",
    otherConstraints: "",
  },
  designPreferences: {
    includeAttachmentDesign: true,
    includeIPRProtocol: true,
    maxStagesPreferred: null,
  },
}

const INITIAL_PREFILLED: AlignerConfig = {
  archSelection: "both",
  treatmentGoals: ["crowding", "deep_bite", "midline"],
  additionalGoals: "Improve smile aesthetics — patient is self-conscious about upper crowding.",
  complexityTier: "moderate",
  clinicalConstraints: {
    teethNotToMove: "17, 27",
    plannedExtractions: "",
    otherConstraints: "Fixed retainer on lower anteriors 31–41. Patient reports mild TMD — avoid excessive posterior intrusion.",
  },
  designPreferences: {
    includeAttachmentDesign: true,
    includeIPRProtocol: true,
    maxStagesPreferred: 20,
  },
}

const READONLY_VALUES: AlignerConfig = {
  archSelection: "upper",
  treatmentGoals: ["spacing", "crossbite"],
  additionalGoals: "",
  complexityTier: "simple",
  clinicalConstraints: {
    teethNotToMove: "17",
    plannedExtractions: "",
    otherConstraints: "",
  },
  designPreferences: {
    includeAttachmentDesign: true,
    includeIPRProtocol: false,
    maxStagesPreferred: 12,
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoAlignerConfigPage() {
  const [valuesBlank, setValuesBlank] = useState<AlignerConfig>(INITIAL_BLANK)
  const [valuesPrefilled, setValuesPrefilled] = useState<AlignerConfig>(INITIAL_PREFILLED)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Aligner Configuration Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/aligner-config-form
          </code>
          {" "}— used in aligner order creation step 2.
        </p>
      </div>

      {/* Scenario A — blank / new order */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario A — Blank form (new aligner order)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Default state with only sensible defaults pre-set.
          </p>
        </div>

        <AlignerConfigForm values={valuesBlank} onChange={setValuesBlank} />

        {/* Live values inspector */}
        <details className="mt-5">
          <summary className="cursor-pointer text-xs font-medium text-warm-500 hover:text-warm-700">
            Live values (Scenario A)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary px-5 py-4 text-xs text-secondary-foreground">
            {JSON.stringify(valuesBlank, null, 2)}
          </pre>
        </details>
      </section>

      {/* Scenario B — pre-filled (editing existing draft) */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario B — Pre-filled (editing a draft order)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Typical moderate-complexity bilateral case with some constraints.
          </p>
        </div>

        <AlignerConfigForm values={valuesPrefilled} onChange={setValuesPrefilled} />

        <details className="mt-5">
          <summary className="cursor-pointer text-xs font-medium text-warm-500 hover:text-warm-700">
            Live values (Scenario B)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary px-5 py-4 text-xs text-secondary-foreground">
            {JSON.stringify(valuesPrefilled, null, 2)}
          </pre>
        </details>
      </section>

      {/* Scenario C — disabled / read-only */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario C — Read-only (submitted order)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            All fields disabled — used in order detail view after submission.
          </p>
        </div>

        <AlignerConfigForm
          values={READONLY_VALUES}
          onChange={() => undefined}
          disabled
        />
      </section>
    </div>
  )
}
