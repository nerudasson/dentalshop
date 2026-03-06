"use client"

import { useState, useCallback } from "react"
import { BookmarkCheck, RotateCcw, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { DesignParameters } from "@/lib/types"

// ─── Validation ───────────────────────────────────────────────────────────────

const MM_RANGES = {
  marginSettings:  { min: 0.01, max: 0.5,  label: "Margin settings" },
  spacerThickness: { min: 0.01, max: 0.3,  label: "Spacer thickness" },
  minimumThickness:{ min: 0.3,  max: 3.0,  label: "Minimum thickness" },
} as const

type MmField = keyof typeof MM_RANGES

function parseMm(value: string): number {
  return parseFloat(value.replace("mm", "").trim())
}

function formatMm(num: number): string {
  // Preserve up to 3 significant decimal places, strip trailing zeros
  return `${parseFloat(num.toFixed(3))}mm`
}

function validateMm(field: MmField, raw: string): string | null {
  const num = parseMm(raw)
  if (isNaN(num) || num <= 0) return "Must be a positive number"
  const { min, max } = MM_RANGES[field]
  if (num < min || num > max) return `Range: ${min}–${max} mm`
  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string
  helper: string
  error?: string | null
  children: React.ReactNode
  className?: string
}

function FieldWrapper({ label, helper, error, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-warm-700">{label}</label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <Info className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : (
        <p className="text-xs text-warm-500">{helper}</p>
      )}
    </div>
  )
}

interface MmInputProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  disabled?: boolean
  placeholder?: string
}

function MmInput({ value, onChange, onBlur, disabled, placeholder }: MmInputProps) {
  // Show numeric string in the input, append "mm" on blur
  const numericDisplay = value ? parseMm(value).toString() : ""

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    // Allow partial entry (e.g. "0." while typing)
    onChange(raw ? `${raw}mm` : "")
  }

  return (
    <div className="relative flex items-center">
      <Input
        type="number"
        step="0.001"
        min="0"
        value={isNaN(parseMm(value)) ? "" : parseMm(value).toString()}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder ?? "0.00"}
        className="pr-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-3 text-xs text-muted-foreground">
        mm
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface DesignParamsFormProps {
  values: DesignParameters
  onChange: (values: DesignParameters) => void
  defaults?: DesignParameters
  showSaveAsDefault?: boolean
  onSaveAsDefault?: (values: DesignParameters) => void
  disabled?: boolean
  className?: string
}

type FieldErrors = Partial<Record<MmField, string | null>>

export default function DesignParamsForm({
  values,
  onChange,
  defaults,
  showSaveAsDefault = false,
  onSaveAsDefault,
  disabled = false,
  className,
}: DesignParamsFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saveChecked, setSaveChecked] = useState(false)

  const hasDefaults = !!defaults
  const usingDefaults =
    hasDefaults &&
    JSON.stringify(values) === JSON.stringify(defaults)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const setMmField = useCallback(
    (field: MmField, raw: string) => {
      onChange({ ...values, [field]: raw })
    },
    [values, onChange]
  )

  const blurMmField = useCallback(
    (field: MmField) => {
      const err = validateMm(field, values[field])
      setErrors((prev) => ({ ...prev, [field]: err }))
      // Normalise the stored string on blur if valid
      if (!err) {
        const num = parseMm(values[field])
        onChange({ ...values, [field]: formatMm(num) })
      }
    },
    [values, onChange]
  )

  const setSelectField = useCallback(
    (field: keyof DesignParameters, val: string) => {
      onChange({ ...values, [field]: val })
    },
    [values, onChange]
  )

  function handleResetToDefaults() {
    if (defaults) {
      onChange(defaults)
      setErrors({})
    }
  }

  function handleSaveCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked
    setSaveChecked(checked)
    if (checked && onSaveAsDefault) {
      onSaveAsDefault(values)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Defaults badge */}
      {hasDefaults && (
        <div className="flex items-center justify-between gap-3">
          {usingDefaults ? (
            <Badge
              variant="secondary"
              className="gap-1.5 bg-sage-50 text-sage-700 border-sage-200"
            >
              <BookmarkCheck className="h-3.5 w-3.5" />
              Using your saved defaults
            </Badge>
          ) : (
            <div />
          )}
          {!usingDefaults && (
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={disabled}
              className="flex items-center gap-1 text-xs text-warm-500 hover:text-warm-700 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to defaults
            </button>
          )}
        </div>
      )}

      {/* Row 1: Margin Settings + Spacer Thickness */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldWrapper
          label="Margin Settings"
          helper="Distance between preparation margin and restoration edge"
          error={errors.marginSettings}
        >
          <MmInput
            value={values.marginSettings}
            onChange={(v) => setMmField("marginSettings", v)}
            onBlur={() => blurMmField("marginSettings")}
            disabled={disabled}
            placeholder="0.05"
          />
        </FieldWrapper>

        <FieldWrapper
          label="Spacer Thickness"
          helper="Cement gap between preparation and restoration"
          error={errors.spacerThickness}
        >
          <MmInput
            value={values.spacerThickness}
            onChange={(v) => setMmField("spacerThickness", v)}
            onBlur={() => blurMmField("spacerThickness")}
            disabled={disabled}
            placeholder="0.03"
          />
        </FieldWrapper>
      </div>

      {/* Row 2: Minimum Thickness + Contact Strength */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldWrapper
          label="Minimum Thickness"
          helper="Minimum wall thickness of the restoration"
          error={errors.minimumThickness}
        >
          <MmInput
            value={values.minimumThickness}
            onChange={(v) => setMmField("minimumThickness", v)}
            onBlur={() => blurMmField("minimumThickness")}
            disabled={disabled}
            placeholder="0.5"
          />
        </FieldWrapper>

        <FieldWrapper
          label="Contact Strength"
          helper="Force applied at proximal contact points"
        >
          <Select
            value={values.contactStrength}
            onValueChange={(v) => setSelectField("contactStrength", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact strength" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Light">Light</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Heavy">Heavy</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* Row 3: Occlusion Type */}
      <FieldWrapper
        label="Occlusion Type"
        helper="Level of contact with the opposing dentition"
      >
        <Select
          value={values.occlusionType}
          onValueChange={(v) => setSelectField("occlusionType", v)}
          disabled={disabled}
        >
          <SelectTrigger className="md:w-1/2">
            <SelectValue placeholder="Select occlusion type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Light Contact">Light Contact</SelectItem>
            <SelectItem value="Medium Contact">Medium Contact</SelectItem>
            <SelectItem value="Heavy Contact">Heavy Contact</SelectItem>
          </SelectContent>
        </Select>
      </FieldWrapper>

      {/* Row 4: Special Instructions */}
      <FieldWrapper
        label="Special Instructions"
        helper="Any additional notes or requirements for the design provider"
      >
        <textarea
          value={values.specialInstructions}
          onChange={(e) => setSelectField("specialInstructions", e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="e.g. Please ensure the emergence profile matches the adjacent tooth #14. Avoid overbulking the buccal surface."
          className={cn(
            "flex w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[100px]"
          )}
        />
      </FieldWrapper>

      {/* Save as defaults */}
      {showSaveAsDefault && (
        <div className="border-t border-dashed border-border pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-warm-700 hover:text-warm-900 transition-colors">
            <input
              type="checkbox"
              checked={saveChecked}
              onChange={handleSaveCheckbox}
              disabled={disabled}
              className="h-4 w-4 rounded border-input accent-sage-500"
            />
            Save as my defaults
            <span className="text-xs text-warm-500 font-normal">
              — pre-fill this form for future orders
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
