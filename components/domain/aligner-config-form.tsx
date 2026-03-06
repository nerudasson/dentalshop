"use client"

import {
  AlignCenter,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpToLine,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AlignerConfig, ArchSelection, ComplexityTier } from "@/lib/types"

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg bg-warm-50 p-5", className)}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-warm-500">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── Arch diagram SVG ─────────────────────────────────────────────────────────

/**
 * Simplified top-down occlusal view of the dental arches.
 * Upper arch = horseshoe opening toward bottom. Lower arch = toward top.
 * Selected arch(es) render in teal; inactive ones in warm-200.
 */
function ArchDiagram({
  selected,
  size = "lg",
}: {
  selected: ArchSelection
  size?: "sm" | "lg"
}) {
  const upperActive = selected === "upper" || selected === "both"
  const lowerActive = selected === "lower" || selected === "both"

  const upperFill = upperActive ? "#0d9488" : "#e5e0d8"   // teal-600 / warm-200 approx
  const lowerFill = lowerActive ? "#0d9488" : "#e5e0d8"

  const dim = size === "lg" ? "w-20 h-20" : "w-12 h-12"

  return (
    <svg
      viewBox="0 0 80 80"
      className={dim}
      aria-hidden="true"
    >
      {/* Upper arch — horseshoe opening downward */}
      <path
        d="M 8,42 C 8,12 72,12 72,42 L 65,42 C 65,22 15,22 15,42 Z"
        fill={upperFill}
        className="transition-colors duration-200"
      />
      {/* Lower arch — horseshoe opening upward */}
      <path
        d="M 8,46 C 8,76 72,76 72,46 L 65,46 C 65,66 15,66 15,46 Z"
        fill={lowerFill}
        className="transition-colors duration-200"
      />
    </svg>
  )
}

// ─── Arch selection ───────────────────────────────────────────────────────────

const ARCH_OPTIONS: { value: ArchSelection; label: string; sublabel: string }[] = [
  { value: "upper", label: "Upper Only", sublabel: "1 arch" },
  { value: "lower", label: "Lower Only", sublabel: "1 arch" },
  { value: "both",  label: "Both Arches", sublabel: "2 arches" },
]

function ArchSelection({
  value,
  onChange,
  disabled,
}: {
  value: ArchSelection
  onChange: (v: ArchSelection) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Live diagram */}
      <div className="flex items-center gap-4">
        <ArchDiagram selected={value} size="lg" />
        <p className="text-xs text-warm-500 leading-relaxed max-w-[16rem]">
          The highlighted arch(es) will be included in the aligner design.
          Pricing is calculated per arch.
        </p>
      </div>

      {/* Radio cards */}
      <div className="grid grid-cols-3 gap-2">
        {ARCH_OPTIONS.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => !disabled && onChange(opt.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-3 text-center transition-colors",
                isSelected
                  ? "border-teal-500 bg-teal-50"
                  : "border-border bg-white hover:border-warm-300",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <ArchDiagram selected={opt.value} size="sm" />
              <div>
                <p className={cn("text-xs font-semibold", isSelected ? "text-teal-700" : "text-warm-800")}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-warm-400">{opt.sublabel}</p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-warm-500">
        Pricing is per arch — selecting both arches doubles the base rate.
      </p>
    </div>
  )
}

// ─── Treatment goals ──────────────────────────────────────────────────────────

const TREATMENT_GOALS = [
  { slug: "crowding",   label: "Crowding Correction",   Icon: Minimize2 },
  { slug: "spacing",    label: "Spacing Closure",        Icon: Maximize2 },
  { slug: "deep_bite",  label: "Deep Bite Correction",   Icon: ArrowDownToLine },
  { slug: "open_bite",  label: "Open Bite Correction",   Icon: ArrowUpToLine },
  { slug: "crossbite",  label: "Crossbite Correction",   Icon: ArrowLeftRight },
  { slug: "midline",    label: "Midline Correction",     Icon: AlignCenter },
]

function TreatmentGoals({
  selected,
  additionalGoals,
  onToggle,
  onAdditionalChange,
  disabled,
}: {
  selected: string[]
  additionalGoals: string
  onToggle: (slug: string) => void
  onAdditionalChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TREATMENT_GOALS.map(({ slug, label, Icon }) => {
          const isChecked = selected.includes(slug)
          return (
            <label
              key={slug}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                isChecked
                  ? "border-teal-400 bg-teal-50 text-teal-800"
                  : "border-border bg-white text-warm-700 hover:border-warm-300",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(slug)}
                disabled={disabled}
                className="sr-only"
              />
              <Icon className={cn("h-3.5 w-3.5 shrink-0", isChecked ? "text-teal-600" : "text-warm-400")} />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </label>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-700">
          Additional treatment goals or notes
        </label>
        <textarea
          value={additionalGoals}
          onChange={(e) => onAdditionalChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="e.g. Improve facial profile, resolve posterior open bite on the right side…"
          className={cn(
            "flex w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
          )}
        />
      </div>
    </div>
  )
}

// ─── Complexity tier ──────────────────────────────────────────────────────────

const COMPLEXITY_OPTIONS: {
  value: ComplexityTier
  label: string
  stages: string
  description: string
  priceHint: string
}[] = [
  {
    value: "simple",
    label: "Simple",
    stages: "≤ 14 stages",
    description: "Minor corrections, single-arch simple movements",
    priceHint: "Base rate",
  },
  {
    value: "moderate",
    label: "Moderate",
    stages: "15–25 stages",
    description: "Moderate crowding or spacing, multi-arch treatment",
    priceHint: "+25%",
  },
  {
    value: "complex",
    label: "Complex",
    stages: "26+ stages",
    description: "Severe crowding, significant bite corrections, extractions",
    priceHint: "+60%",
  },
]

function ComplexityTierSelect({
  value,
  onChange,
  disabled,
}: {
  value: ComplexityTier
  onChange: (v: ComplexityTier) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {COMPLEXITY_OPTIONS.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            className={cn(
              "flex items-start gap-4 rounded-lg border-2 px-4 py-3 text-left transition-colors",
              isSelected
                ? "border-teal-500 bg-teal-50"
                : "border-border bg-white hover:border-warm-300",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            {/* Radio indicator */}
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                isSelected ? "border-teal-500 bg-teal-500" : "border-warm-300 bg-white"
              )}
            >
              {isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className={cn("text-sm font-semibold", isSelected ? "text-teal-800" : "text-warm-800")}>
                  {opt.label}
                </span>
                <span className={cn("text-xs tabular-nums", isSelected ? "text-teal-600" : "text-warm-400")}>
                  {opt.stages}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-warm-500">{opt.description}</p>
            </div>

            {/* Price hint */}
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                isSelected ? "bg-teal-100 text-teal-700" : "bg-warm-100 text-warm-500"
              )}
            >
              {opt.priceHint}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Clinical constraints ─────────────────────────────────────────────────────

function ClinicalConstraints({
  values,
  onChange,
  disabled,
}: {
  values: AlignerConfig["clinicalConstraints"]
  onChange: (v: AlignerConfig["clinicalConstraints"]) => void
  disabled?: boolean
}) {
  function set(key: keyof AlignerConfig["clinicalConstraints"], val: string) {
    onChange({ ...values, [key]: val })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-warm-700">
            Teeth not to move
          </label>
          <Input
            value={values.teethNotToMove}
            onChange={(e) => set("teethNotToMove", e.target.value)}
            disabled={disabled}
            placeholder="e.g. 17, 27, 37, 47"
          />
          <p className="text-xs text-warm-500">
            FDI notation — upper right 11–18, upper left 21–28,
            lower left 31–38, lower right 41–48
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-warm-700">
            Planned extractions
          </label>
          <Input
            value={values.plannedExtractions}
            onChange={(e) => set("plannedExtractions", e.target.value)}
            disabled={disabled}
            placeholder="e.g. 14, 24"
          />
          <p className="text-xs text-warm-500">
            Teeth to be extracted before or during treatment (FDI notation)
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-700">
          Other constraints
        </label>
        <textarea
          value={values.otherConstraints}
          onChange={(e) => set("otherConstraints", e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="e.g. Existing implant at 36, fixed retainer lower anteriors, patient has TMD — avoid posterior intrusion…"
          className={cn(
            "flex w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
          )}
        />
      </div>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-teal-500" : "bg-warm-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-[18px]" : "translate-x-1"
        )}
      />
    </button>
  )
}

// ─── Design preferences ───────────────────────────────────────────────────────

function DesignPreferences({
  values,
  onChange,
  disabled,
}: {
  values: AlignerConfig["designPreferences"]
  onChange: (v: AlignerConfig["designPreferences"]) => void
  disabled?: boolean
}) {
  function set<K extends keyof AlignerConfig["designPreferences"]>(
    key: K,
    val: AlignerConfig["designPreferences"][K]
  ) {
    onChange({ ...values, [key]: val })
  }

  const maxStagesRaw = values.maxStagesPreferred

  return (
    <div className="flex flex-col gap-5">
      {/* Toggle rows */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-warm-800">
              Include attachment design
            </span>
            <span className="text-xs text-warm-500">
              Provider will design composite attachment placement protocol
            </span>
          </div>
          <Toggle
            checked={values.includeAttachmentDesign}
            onChange={(v) => set("includeAttachmentDesign", v)}
            disabled={disabled}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-warm-800">
              Include IPR protocol
            </span>
            <span className="text-xs text-warm-500">
              Interproximal reduction chart included in deliverables
            </span>
          </div>
          <Toggle
            checked={values.includeIPRProtocol}
            onChange={(v) => set("includeIPRProtocol", v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Max stages */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-700">
          Maximum stages preferred
        </label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={60}
            step={1}
            value={maxStagesRaw ?? ""}
            onChange={(e) => {
              const v = e.target.value
              set("maxStagesPreferred", v === "" ? null : parseInt(v, 10))
            }}
            disabled={disabled}
            placeholder="No limit"
            className="w-36 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {maxStagesRaw !== null && (
            <button
              type="button"
              onClick={() => set("maxStagesPreferred", null)}
              disabled={disabled}
              className="text-xs text-warm-400 hover:text-warm-600 transition-colors"
            >
              Clear (no limit)
            </button>
          )}
        </div>
        <p className="text-xs text-warm-500">
          Leave blank for no limit. Provider will design the optimal number of stages.
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface AlignerConfigFormProps {
  values: AlignerConfig
  onChange: (values: AlignerConfig) => void
  disabled?: boolean
  className?: string
}

export default function AlignerConfigForm({
  values,
  onChange,
  disabled = false,
  className,
}: AlignerConfigFormProps) {
  function set<K extends keyof AlignerConfig>(key: K, val: AlignerConfig[K]) {
    onChange({ ...values, [key]: val })
  }

  function toggleGoal(slug: string) {
    const next = values.treatmentGoals.includes(slug)
      ? values.treatmentGoals.filter((g) => g !== slug)
      : [...values.treatmentGoals, slug]
    set("treatmentGoals", next)
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* 1. Arch Selection */}
      <Section title="Arch Selection">
        <ArchSelection
          value={values.archSelection}
          onChange={(v) => set("archSelection", v)}
          disabled={disabled}
        />
      </Section>

      {/* 2. Treatment Goals */}
      <Section title="Treatment Goals">
        <TreatmentGoals
          selected={values.treatmentGoals}
          additionalGoals={values.additionalGoals}
          onToggle={toggleGoal}
          onAdditionalChange={(v) => set("additionalGoals", v)}
          disabled={disabled}
        />
      </Section>

      {/* 3. Complexity Tier */}
      <Section title="Complexity Tier">
        <ComplexityTierSelect
          value={values.complexityTier}
          onChange={(v) => set("complexityTier", v)}
          disabled={disabled}
        />
      </Section>

      {/* 4. Clinical Constraints */}
      <Section title="Clinical Constraints">
        <ClinicalConstraints
          values={values.clinicalConstraints}
          onChange={(v) => set("clinicalConstraints", v)}
          disabled={disabled}
        />
      </Section>

      {/* 5. Design Preferences */}
      <Section title="Design Preferences">
        <DesignPreferences
          values={values.designPreferences}
          onChange={(v) => set("designPreferences", v)}
          disabled={disabled}
        />
      </Section>
    </div>
  )
}
