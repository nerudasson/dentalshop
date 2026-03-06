"use client"

import { useState } from "react"
import DesignParamsForm from "@/components/domain/design-params-form"
import type { DesignParameters } from "@/lib/types"

// ─── Dummy defaults (simulating a client's saved profile) ─────────────────────

const SAVED_DEFAULTS: DesignParameters = {
  marginSettings: "0.05mm",
  spacerThickness: "0.03mm",
  minimumThickness: "0.5mm",
  contactStrength: "Medium",
  occlusionType: "Medium Contact",
  specialInstructions: "",
}

// ─── Demo ──────────────────────────────────────────────────────────────────────

export default function DemoDesignParamsPage() {
  // Scenario A: pre-filled with saved defaults
  const [valuesA, setValuesA] = useState<DesignParameters>({ ...SAVED_DEFAULTS })
  const [savedA, setSavedA] = useState<DesignParameters | null>(null)

  // Scenario B: blank form (new client, no defaults)
  const [valuesB, setValuesB] = useState<DesignParameters>({
    marginSettings: "",
    spacerThickness: "",
    minimumThickness: "",
    contactStrength: "",
    occlusionType: "",
    specialInstructions: "",
  })

  // Scenario C: disabled / read-only view
  const READONLY_VALUES: DesignParameters = {
    marginSettings: "0.07mm",
    spacerThickness: "0.04mm",
    minimumThickness: "0.6mm",
    contactStrength: "Heavy",
    occlusionType: "Light Contact",
    specialInstructions: "Match emergence profile to tooth #14. Avoid overbulking buccal surface.",
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Design Parameters Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/design-params-form
          </code>
        </p>
      </div>

      {/* Scenario A — pre-filled with saved defaults */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario A — Pre-filled with saved defaults
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Used in order creation step 5. Client has saved profile defaults.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <DesignParamsForm
            values={valuesA}
            onChange={setValuesA}
            defaults={SAVED_DEFAULTS}
            showSaveAsDefault
            onSaveAsDefault={(v) => setSavedA(v)}
          />
        </div>

        {savedA && (
          <div className="mt-3 rounded-md border border-sage-200 bg-sage-50 px-4 py-3">
            <p className="text-xs font-medium text-sage-700">
              onSaveAsDefault fired — values captured:
            </p>
            <pre className="mt-1 text-xs text-sage-600 overflow-x-auto">
              {JSON.stringify(savedA, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Scenario B — blank form, show save as defaults */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario B — Blank form (first-time client)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Used in client settings to establish default parameters. No prior defaults.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <DesignParamsForm
            values={valuesB}
            onChange={setValuesB}
            showSaveAsDefault
            onSaveAsDefault={(v) =>
              // In real use, this calls a Server Action to persist the defaults
              console.log("Save as defaults:", v)
            }
          />
        </div>
      </section>

      {/* Scenario C — disabled / order summary view */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-800">
            Scenario C — Read-only / locked order
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Used in order detail view after submission. All fields disabled.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <DesignParamsForm
            values={READONLY_VALUES}
            onChange={() => undefined}
            disabled
          />
        </div>
      </section>

      {/* Live values inspector (Scenario A) */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-warm-800">
            Live values — Scenario A
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Current DesignParameters object as you edit the form above.
          </p>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-secondary px-5 py-4 text-xs text-secondary-foreground">
          {JSON.stringify(valuesA, null, 2)}
        </pre>
      </section>
    </div>
  )
}
