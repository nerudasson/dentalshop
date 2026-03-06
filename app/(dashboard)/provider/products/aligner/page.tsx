"use client"

import { useState } from "react"
import {
  Layers,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  ChevronRight,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignerSoftware = "SureSmile" | "Archform" | "OnyxCeph" | "uLab" | "Other"
type ComplexityTier = "Simple" | "Moderate" | "Complex"

interface CustomAddon {
  id: string
  name: string
  price: string
}

interface AlignerProductConfig {
  serviceEnabled: boolean
  selectedSoftware: AlignerSoftware[]
  otherSoftwareName: string
  softwareVersion: string
  standardTurnaround: string
  rushTurnaround: string
  treatmentPlanningDays: string
  acceptedComplexities: ComplexityTier[]
  pricingMatrix: Record<ComplexityTier, string>
  rushDesignFee: string
  refinementStagesFee: string
  designConsultationFee: string
  customAddons: CustomAddon[]
  deliverableDefaults: {
    includeMovementTable: boolean
    includeIPRProtocol: boolean
    includeAttachmentGuide: boolean
    includeTreatmentSummary: boolean
  }
}

// ─── Dummy initial values ─────────────────────────────────────────────────────

const INITIAL_CONFIG: AlignerProductConfig = {
  serviceEnabled: true,
  selectedSoftware: ["SureSmile", "Archform"],
  otherSoftwareName: "",
  softwareVersion: "2024.1",
  standardTurnaround: "5",
  rushTurnaround: "2",
  treatmentPlanningDays: "3",
  acceptedComplexities: ["Simple", "Moderate", "Complex"],
  pricingMatrix: {
    Simple: "280",
    Moderate: "420",
    Complex: "620",
  },
  rushDesignFee: "80",
  refinementStagesFee: "120",
  designConsultationFee: "60",
  customAddons: [
    { id: "addon_1", name: "Surgical Guide Integration", price: "150" },
  ],
  deliverableDefaults: {
    includeMovementTable: true,
    includeIPRProtocol: true,
    includeAttachmentGuide: true,
    includeTreatmentSummary: true,
  },
}

const ALIGNER_SOFTWARE: AlignerSoftware[] = [
  "SureSmile",
  "Archform",
  "OnyxCeph",
  "uLab",
  "Other",
]

const COMPLEXITY_TIERS: ComplexityTier[] = ["Simple", "Moderate", "Complex"]

const COMPLEXITY_DESCRIPTIONS: Record<ComplexityTier, string> = {
  Simple: "≤14 stages",
  Moderate: "15–25 stages",
  Complex: "26+ stages",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ede8] text-[#4a7c59]">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function FieldLabel({
  label,
  hint,
}: {
  label: string
  hint?: string
}) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  size = "md",
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
  size?: "md" | "lg"
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <div>
        <span
          className={
            size === "lg"
              ? "text-base font-semibold text-foreground"
              : "text-sm font-medium text-foreground"
          }
        >
          {label}
        </span>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        className={[
          "relative shrink-0 rounded-full transition-colors",
          size === "lg" ? "h-7 w-12" : "h-5 w-9",
          checked ? "bg-[#4a7c59]" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 rounded-full bg-white shadow transition-transform",
            size === "lg" ? "h-6 w-6" : "h-4 w-4",
            checked
              ? size === "lg"
                ? "translate-x-5"
                : "translate-x-4"
              : "translate-x-0.5",
          ].join(" ")}
        />
      </div>
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  visible,
  message,
}: {
  visible: boolean
  message: string
}) {
  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#4a7c59] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AlignerProductConfigPage() {
  const [config, setConfig] = useState<AlignerProductConfig>(INITIAL_CONFIG)
  const [toastVisible, setToastVisible] = useState(false)

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function patch(update: Partial<AlignerProductConfig>) {
    setConfig((prev) => ({ ...prev, ...update }))
  }

  function patchDeliverables(
    key: keyof AlignerProductConfig["deliverableDefaults"],
    val: boolean
  ) {
    setConfig((prev) => ({
      ...prev,
      deliverableDefaults: { ...prev.deliverableDefaults, [key]: val },
    }))
  }

  function toggleSoftware(sw: AlignerSoftware) {
    const current = config.selectedSoftware
    const next = current.includes(sw)
      ? current.filter((s) => s !== sw)
      : [...current, sw]
    patch({ selectedSoftware: next })
  }

  function toggleComplexity(tier: ComplexityTier) {
    const current = config.acceptedComplexities
    const next = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier]
    patch({ acceptedComplexities: next })
  }

  function updatePrice(tier: ComplexityTier, value: string) {
    patch({ pricingMatrix: { ...config.pricingMatrix, [tier]: value } })
  }

  function addAddon() {
    const newAddon: CustomAddon = {
      id: `addon_${Date.now()}`,
      name: "",
      price: "",
    }
    patch({ customAddons: [...config.customAddons, newAddon] })
  }

  function updateAddon(id: string, key: keyof Omit<CustomAddon, "id">, value: string) {
    patch({
      customAddons: config.customAddons.map((a) =>
        a.id === id ? { ...a, [key]: value } : a
      ),
    })
  }

  function removeAddon(id: string) {
    patch({ customAddons: config.customAddons.filter((a) => a.id !== id) })
  }

  function handleSave() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Products</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Aligner Design</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Aligner Design Service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your aligner service availability, turnaround times, pricing tiers, and deliverable defaults.
        </p>
      </div>

      <div className="space-y-5">

        {/* ── Section 1 — Service Setup ──────────────────────────────────────── */}
        <Section
          icon={<Layers className="h-4 w-4" />}
          title="Service Setup"
          description="Toggle availability and configure your aligner software stack."
        >
          <div className="space-y-6">
            {/* Service toggle */}
            <div
              className={[
                "rounded-lg border px-4 py-3.5 transition-colors",
                config.serviceEnabled
                  ? "border-[#4a7c59] bg-[#f3f7f3]"
                  : "border-border bg-background",
              ].join(" ")}
            >
              <Toggle
                checked={config.serviceEnabled}
                onChange={(val) => patch({ serviceEnabled: val })}
                label="Aligner Design Service Available"
                description="Clients can place aligner design orders with your studio."
                size="lg"
              />
            </div>

            {/* Software selection */}
            <div>
              <FieldLabel
                label="Aligner Software"
                hint="Select all software you use for aligner planning."
              />
              <div className="flex flex-wrap gap-2">
                {ALIGNER_SOFTWARE.map((sw) => {
                  const selected = config.selectedSoftware.includes(sw)
                  return (
                    <button
                      key={sw}
                      type="button"
                      onClick={() => toggleSoftware(sw)}
                      className={[
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selected
                          ? "border-[#4a7c59] bg-[#f3f7f3] text-[#4a7c59]"
                          : "border-border bg-background text-foreground hover:border-[#4a7c59]/60",
                      ].join(" ")}
                    >
                      {sw}
                    </button>
                  )
                })}
              </div>
              {config.selectedSoftware.includes("Other") && (
                <div className="mt-3">
                  <Input
                    placeholder="Enter software name…"
                    value={config.otherSoftwareName}
                    onChange={(e) => patch({ otherSoftwareName: e.target.value })}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>

            {/* Software version */}
            <div>
              <FieldLabel label="Software Version" />
              <Input
                placeholder="e.g. 2024.1"
                value={config.softwareVersion}
                onChange={(e) => patch({ softwareVersion: e.target.value })}
                className="max-w-xs"
              />
            </div>
          </div>
        </Section>

        {/* ── Section 2 — Turnaround Times ──────────────────────────────────── */}
        <Section
          icon={<Clock className="h-4 w-4" />}
          title="Turnaround Times"
          description="Business days from payment to file delivery."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <FieldLabel
                label="Standard Turnaround"
                hint="Days for regular orders"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={config.standardTurnaround}
                  onChange={(e) => patch({ standardTurnaround: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div>
              <FieldLabel
                label="Rush Turnaround"
                hint="Days for rush orders"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={config.rushTurnaround}
                  onChange={(e) => patch({ rushTurnaround: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div>
              <FieldLabel
                label="Treatment Planning"
                hint="Initial review & plan phase"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={config.treatmentPlanningDays}
                  onChange={(e) => patch({ treatmentPlanningDays: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 3 — Complexity & Pricing ──────────────────────────────── */}
        <Section
          icon={<DollarSign className="h-4 w-4" />}
          title="Complexity & Pricing"
          description="Set which complexity tiers you accept and your per-arch pricing."
        >
          <div className="space-y-5">
            {/* Accepted complexities */}
            <div>
              <FieldLabel label="Maximum Complexity Accepted" />
              <div className="flex flex-wrap gap-3">
                {COMPLEXITY_TIERS.map((tier) => {
                  const accepted = config.acceptedComplexities.includes(tier)
                  return (
                    <label
                      key={tier}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={() => toggleComplexity(tier)}
                        className="h-4 w-4 rounded border-border accent-[#4a7c59]"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {tier}
                      </span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {COMPLEXITY_DESCRIPTIONS[tier]}
                      </Badge>
                    </label>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Pricing matrix */}
            <div>
              <FieldLabel label="Per-Arch Pricing" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[340px] table-fixed text-sm">
                  <thead>
                    <tr>
                      <th className="w-36 pb-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
                      {COMPLEXITY_TIERS.map((tier) => (
                        <th
                          key={tier}
                          className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {tier}
                          <span className="ml-1 font-normal normal-case">
                            ({COMPLEXITY_DESCRIPTIONS[tier]})
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4 text-sm font-medium text-foreground">
                        Per Arch Price
                      </td>
                      {COMPLEXITY_TIERS.map((tier) => {
                        const isAccepted = config.acceptedComplexities.includes(tier)
                        return (
                          <td key={tier} className="px-2 py-2 text-center">
                            {isAccepted ? (
                              <div className="relative inline-flex items-center">
                                <span className="pointer-events-none absolute left-2.5 text-sm text-muted-foreground">
                                  €
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={config.pricingMatrix[tier]}
                                  onChange={(e) => updatePrice(tier, e.target.value)}
                                  className="w-24 pl-6 text-right"
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                — not offered
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4a7c59]" />
                Clients selecting &ldquo;Both Arches&rdquo; will be charged 2× the per-arch price.
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 4 — Add-on Pricing ────────────────────────────────────── */}
        <Section
          icon={<Plus className="h-4 w-4" />}
          title="Add-on Pricing"
          description="Optional fees applied on top of the base per-arch price."
        >
          <div className="space-y-4">
            {/* Standard add-ons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  {
                    key: "rushDesignFee",
                    label: "Rush Design Fee",
                    hint: "Added for rush turnaround orders",
                  },
                  {
                    key: "refinementStagesFee",
                    label: "Refinement Stages Fee",
                    hint: "Per refinement round after plan approval",
                  },
                  {
                    key: "designConsultationFee",
                    label: "Design Consultation Fee",
                    hint: "Pre-order clinical consultation",
                  },
                ] as const
              ).map(({ key, label, hint }) => (
                <div key={key}>
                  <FieldLabel label={label} hint={hint} />
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-2.5 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={config[key]}
                      onChange={(e) => patch({ [key]: e.target.value } as Partial<AlignerProductConfig>)}
                      className="pl-6"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Custom add-ons */}
            {config.customAddons.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Custom Add-ons</p>
                {config.customAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Add-on name"
                      value={addon.name}
                      onChange={(e) => updateAddon(addon.id, "name", e.target.value)}
                      className="flex-1"
                    />
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-2.5 text-sm text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={addon.price}
                        onChange={(e) => updateAddon(addon.id, "price", e.target.value)}
                        className="w-28 pl-6"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddon(addon.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAddon}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Add-on
            </Button>
          </div>
        </Section>

        {/* ── Section 5 — Deliverable Defaults ─────────────────────────────── */}
        <Section
          icon={<Layers className="h-4 w-4" />}
          title="Deliverable Defaults"
          description="Documents included by default in every aligner delivery package."
        >
          <div className="space-y-4">
            {(
              [
                {
                  key: "includeMovementTable",
                  label: "Include Movement Table",
                  description:
                    "Per-tooth movement data exported as a formatted PDF",
                },
                {
                  key: "includeIPRProtocol",
                  label: "Include IPR Protocol",
                  description:
                    "Interproximal reduction schedule per-contact point",
                },
                {
                  key: "includeAttachmentGuide",
                  label: "Include Attachment Guide",
                  description:
                    "Bonding jig design files and placement instructions",
                },
                {
                  key: "includeTreatmentSummary",
                  label: "Include Treatment Summary",
                  description:
                    "High-level overview PDF for the treating clinician",
                },
              ] as const
            ).map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <Toggle
                  checked={config.deliverableDefaults[key]}
                  onChange={(val) => patchDeliverables(key, val)}
                  label={label}
                  description={description}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Save button ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Changes apply to new orders only. Existing orders are unaffected.
          </p>
          <Button
            onClick={handleSave}
            className="gap-2 bg-[#4a7c59] text-white hover:bg-[#3d6849]"
          >
            Save Configuration
          </Button>
        </div>
      </div>

      <Toast visible={toastVisible} message="Configuration saved successfully." />
    </div>
  )
}
