"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import {
  Crown,
  Link2,
  Layers,
  Wrench,
  LayoutGrid,
  Sparkles,
  Plus,
  Trash2,
  ImageIcon,
  X,
  Euro,
  Percent,
  Check,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react"
import WizardLayout, { type WizardStep } from "@/components/layout/wizard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const PROSTHETICS_CATEGORIES = [
  {
    id: "Crowns",
    label: "Crowns",
    description: "Single-unit crown restorations",
    Icon: Crown,
  },
  {
    id: "Bridges",
    label: "Bridges",
    description: "Multi-unit bridge frameworks",
    Icon: Link2,
  },
  {
    id: "Inlays/Onlays",
    label: "Inlays / Onlays",
    description: "Conservative inlay and onlay restorations",
    Icon: Layers,
  },
  {
    id: "Implant Abutments",
    label: "Implant Abutments",
    description: "Custom implant abutment designs",
    Icon: Wrench,
  },
  {
    id: "Partial Frameworks",
    label: "Partial Frameworks",
    description: "Removable partial denture frameworks",
    Icon: LayoutGrid,
  },
  {
    id: "Veneers",
    label: "Veneers",
    description: "Anterior veneer restorations",
    Icon: Sparkles,
  },
]

const OUTPUT_FORMATS = [
  { id: "stl", label: "STL" },
  { id: "exocad", label: "exocad Project" },
  { id: "3shape", label: "3Shape Project" },
]

const SUGGESTED_ADDONS = [
  { name: "Rush Design", priceType: "fixed" as const, priceValue: "35" },
  { name: "Additional Views", priceType: "fixed" as const, priceValue: "15" },
  { name: "Design Consultation", priceType: "fixed" as const, priceValue: "25" },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddOn {
  id: string
  name: string
  priceType: "fixed" | "percentage"
  priceValue: string
  active: boolean
}

interface ComplexityTierConfig {
  price: string
  description: string
}

interface WizardState {
  // Step 1
  name: string
  category: string | null
  description: string
  imagePreview: string | null

  // Step 2
  basePrice: string
  useTiers: boolean
  tiers: {
    simple: ComplexityTierConfig
    moderate: ComplexityTierConfig
    complex: ComplexityTierConfig
  }
  standardDays: string
  rushAvailable: boolean
  rushDays: string
  outputFormats: string[]

  // Step 3
  addOns: AddOn[]
}

// ─── Dummy pre-filled state (Crown Design product) ────────────────────────────

const INITIAL_STATE: WizardState = {
  name: "Crown Design",
  category: "Crowns",
  description:
    "Professional single-unit crown designs using exocad and 3Shape. Fully anatomical contours, accurate margin adaptation, and natural-looking occlusal morphology. Compliant with standard preparation guidelines.",
  imagePreview: null,
  basePrice: "85",
  useTiers: true,
  tiers: {
    simple: {
      price: "75",
      description: "Standard single-unit restoration",
    },
    moderate: {
      price: "95",
      description: "Multi-unit or complex anatomy",
    },
    complex: {
      price: "130",
      description: "Full arch or challenging cases",
    },
  },
  standardDays: "3",
  rushAvailable: true,
  rushDays: "1",
  outputFormats: ["stl", "exocad"],
  addOns: [
    { id: "ao1", name: "Rush Design", priceType: "fixed", priceValue: "35", active: true },
    { id: "ao2", name: "Additional Views", priceType: "fixed", priceValue: "15", active: true },
    {
      id: "ao3",
      name: "Design Consultation",
      priceType: "fixed",
      priceValue: "25",
      active: false,
    },
  ],
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: "sm" | "md"
}

function ToggleSwitch({ checked, onChange, size = "md" }: ToggleSwitchProps) {
  const isSm = size === "sm"
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-sage-500" : "bg-warm-300",
        isSm ? "h-5 w-9" : "h-6 w-11"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
          isSm ? "h-4 w-4" : "h-5 w-5",
          checked ? (isSm ? "translate-x-4" : "translate-x-5") : "translate-x-0"
        )}
      />
    </button>
  )
}

// ─── Step 1 — Basic Setup ─────────────────────────────────────────────────────

interface Step1Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

function Step1BasicSetup({ state, onChange }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({ imagePreview: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Product name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-800">
          Product Name <span className="text-dental-error">*</span>
        </label>
        <Input
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Crown Design — Standard"
          className="max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          Shown to clients when browsing your profile
        </p>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-warm-800">
          Category <span className="text-dental-error">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Select the restoration type this product covers
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROSTHETICS_CATEGORIES.map(({ id, label, description, Icon }) => {
            const isSelected = state.category === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ category: id })}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-sage-500 bg-sage-50 ring-1 ring-sage-500"
                    : "border-border hover:border-sage-300 hover:bg-warm-50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    isSelected ? "bg-sage-500 text-white" : "bg-warm-100 text-warm-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-sage-700" : "text-warm-800"
                    )}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-800">
          Description <span className="text-dental-error">*</span>
        </label>
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Describe your service — software, materials, what's included, turnaround notes..."
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2",
            "text-sm text-warm-800 placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "resize-none"
          )}
        />
        <p className="text-xs text-muted-foreground">
          Clients read this before placing an order
        </p>
      </div>

      {/* Product image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-warm-800">
          Product Image{" "}
          <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Upload a representative example of your work — JPG or PNG, max 5 MB
        </p>
        {state.imagePreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.imagePreview}
              alt="Product preview"
              className="h-40 w-40 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => onChange({ imagePreview: null })}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-warm-50"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex h-28 w-44 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed",
              "border-warm-300 text-muted-foreground transition-colors",
              "hover:border-sage-400 hover:bg-sage-50 hover:text-sage-600"
            )}
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Upload image</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
    </div>
  )
}

// ─── Step 2 — Pricing & Turnaround ────────────────────────────────────────────

interface Step2Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

function Step2Pricing({ state, onChange }: Step2Props) {
  function toggleFormat(id: string) {
    const current = state.outputFormats
    if (current.includes(id)) {
      onChange({ outputFormats: current.filter((f) => f !== id) })
    } else {
      onChange({ outputFormats: [...current, id] })
    }
  }

  function updateTier(
    tier: "simple" | "moderate" | "complex",
    field: keyof ComplexityTierConfig,
    value: string
  ) {
    onChange({
      tiers: {
        ...state.tiers,
        [tier]: { ...state.tiers[tier], [field]: value },
      },
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Base price */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-warm-800">Base Price</h3>
        <p className="text-xs text-muted-foreground">
          Starting price shown to clients. Also used as the fallback when complexity tiers are
          disabled.
        </p>
        <div className="relative max-w-[160px]">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Euro className="h-4 w-4" />
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={state.basePrice}
            onChange={(e) => onChange({ basePrice: e.target.value })}
            className="pl-9"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Complexity tiers */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-warm-800">Complexity Tiers</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Offer different prices based on case complexity (recommended)
            </p>
          </div>
          <ToggleSwitch
            checked={state.useTiers}
            onChange={(v) => onChange({ useTiers: v })}
          />
        </div>

        {state.useTiers && (
          <div className="flex flex-col gap-3">
            {(
              [
                {
                  key: "simple" as const,
                  label: "Simple",
                  hint: "Standard single-unit, straightforward anatomy",
                },
                {
                  key: "moderate" as const,
                  label: "Moderate",
                  hint: "Multi-unit or complex anatomy",
                },
                {
                  key: "complex" as const,
                  label: "Complex",
                  hint: "Full arch or particularly challenging cases",
                },
              ] as const
            ).map(({ key, label, hint }) => (
              <div key={key} className="rounded-lg border border-border bg-warm-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-warm-800">{label}</span>
                  <span className="text-xs text-muted-foreground">— {hint}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Price</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Euro className="h-3.5 w-3.5" />
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={state.tiers[key].price}
                        onChange={(e) => updateTier(key, "price", e.target.value)}
                        className="pl-8 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Short Description
                    </label>
                    <Input
                      value={state.tiers[key].description}
                      onChange={(e) => updateTier(key, "description", e.target.value)}
                      placeholder="Shown next to the price..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Turnaround */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-warm-800">Turnaround Time</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Standard Delivery
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="30"
                value={state.standardDays}
                onChange={(e) => onChange({ standardDays: e.target.value })}
                className="max-w-[90px]"
              />
              <span className="text-sm text-muted-foreground">business days</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Rush Available
              </label>
              <ToggleSwitch
                checked={state.rushAvailable}
                onChange={(v) => onChange({ rushAvailable: v })}
                size="sm"
              />
            </div>
            {state.rushAvailable && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={state.rushDays}
                  onChange={(e) => onChange({ rushDays: e.target.value })}
                  className="max-w-[90px]"
                />
                <span className="text-sm text-muted-foreground">day rush turnaround</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output formats */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-warm-800">Output Formats</h3>
        <p className="text-xs text-muted-foreground">
          Select all file formats you can deliver to clients
        </p>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map(({ id, label }) => {
            const isChecked = state.outputFormats.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleFormat(id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500",
                  isChecked
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-border text-muted-foreground hover:border-sage-300 hover:text-warm-800"
                )}
              >
                {isChecked && <Check className="h-3 w-3" />}
                {label}
              </button>
            )
          })}
        </div>
        {state.outputFormats.length === 0 && (
          <p className="text-xs text-dental-error">Select at least one output format</p>
        )}
      </div>
    </div>
  )
}

// ─── Step 3 — Add-ons ─────────────────────────────────────────────────────────

interface Step3Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

function Step3AddOns({ state, onChange }: Step3Props) {
  function addCustomAddOn() {
    const newAddOn: AddOn = {
      id: generateId(),
      name: "",
      priceType: "fixed",
      priceValue: "",
      active: true,
    }
    onChange({ addOns: [...state.addOns, newAddOn] })
  }

  function addSuggestedAddOn(suggested: (typeof SUGGESTED_ADDONS)[0]) {
    const alreadyExists = state.addOns.some((a) => a.name === suggested.name)
    if (alreadyExists) return
    const newAddOn: AddOn = {
      id: generateId(),
      name: suggested.name,
      priceType: suggested.priceType,
      priceValue: suggested.priceValue,
      active: true,
    }
    onChange({ addOns: [...state.addOns, newAddOn] })
  }

  function updateAddOn(id: string, updates: Partial<AddOn>) {
    onChange({
      addOns: state.addOns.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })
  }

  function removeAddOn(id: string) {
    onChange({ addOns: state.addOns.filter((a) => a.id !== id) })
  }

  const suggestionsToShow = SUGGESTED_ADDONS.filter(
    (s) => !state.addOns.some((a) => a.name === s.name)
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-warm-800">Add-on Services</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Optional extras clients can add when placing an order. Inactive add-ons are hidden from
          clients.
        </p>
      </div>

      {/* Suggested add-ons */}
      {suggestionsToShow.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestionsToShow.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => addSuggestedAddOn(s)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-dashed border-sage-300 px-3 py-1.5",
                  "text-xs text-sage-600 transition-colors hover:border-sage-500 hover:bg-sage-50"
                )}
              >
                <Plus className="h-3 w-3" />
                {s.name} — €{s.priceValue}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add-on list */}
      {state.addOns.length > 0 ? (
        <div className="flex flex-col gap-3">
          {state.addOns.map((addOn) => (
            <div
              key={addOn.id}
              className={cn(
                "rounded-lg border p-4 transition-opacity",
                addOn.active ? "border-border" : "border-border opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Active toggle */}
                <div className="mt-1 shrink-0">
                  <ToggleSwitch
                    checked={addOn.active}
                    onChange={(v) => updateAddOn(addOn.id, { active: v })}
                    size="sm"
                  />
                </div>

                {/* Fields */}
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    value={addOn.name}
                    onChange={(e) => updateAddOn(addOn.id, { name: e.target.value })}
                    placeholder="Add-on name"
                    className="min-w-0 flex-1 text-sm"
                  />

                  {/* Price type toggle */}
                  <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => updateAddOn(addOn.id, { priceType: "fixed" })}
                      className={cn(
                        "flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        addOn.priceType === "fixed"
                          ? "bg-sage-500 text-white"
                          : "text-muted-foreground hover:text-warm-800"
                      )}
                    >
                      <Euro className="h-3 w-3" />
                      Fixed
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAddOn(addOn.id, { priceType: "percentage" })}
                      className={cn(
                        "flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        addOn.priceType === "percentage"
                          ? "bg-sage-500 text-white"
                          : "text-muted-foreground hover:text-warm-800"
                      )}
                    >
                      <Percent className="h-3 w-3" />%
                    </button>
                  </div>

                  {/* Price value */}
                  <div className="relative w-28 shrink-0">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                      {addOn.priceType === "fixed" ? "€" : "%"}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step={addOn.priceType === "fixed" ? "0.01" : "1"}
                      value={addOn.priceValue}
                      onChange={(e) => updateAddOn(addOn.id, { priceValue: e.target.value })}
                      className="pl-7 text-sm"
                      placeholder={addOn.priceType === "fixed" ? "0.00" : "0"}
                    />
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeAddOn(addOn.id)}
                  className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-warm-50 hover:text-dental-error"
                  aria-label="Remove add-on"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-warm-300 py-10 text-center text-sm text-muted-foreground">
          No add-ons yet. Use Quick Add above or create a custom one below.
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addCustomAddOn}
        className="self-start"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Custom Add-on
      </Button>
    </div>
  )
}

// ─── Step 4 — Preview & Activate ─────────────────────────────────────────────

interface Step4Props {
  state: WizardState
}

function Step4Preview({ state }: Step4Props) {
  const categoryDef = PROSTHETICS_CATEGORIES.find((c) => c.id === state.category)
  const CategoryIcon = categoryDef?.Icon
  const activeAddOns = state.addOns.filter((a) => a.active && a.name.trim() !== "")

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        This is how your product listing will appear to clients when browsing providers.
      </p>

      {/* Product preview card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-4 p-5">
          {state.imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.imagePreview}
              alt={state.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-sage-50">
              {CategoryIcon && <CategoryIcon className="h-8 w-8 text-sage-500" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-warm-800">
                {state.name || "Untitled Product"}
              </h2>
              {state.category && (
                <Badge variant="outline" className="border-sage-200 text-xs text-sage-700">
                  {state.category}
                </Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {state.description || "No description provided."}
            </p>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </p>
          {state.useTiers ? (
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "simple" as const, label: "Simple" },
                  { key: "moderate" as const, label: "Moderate" },
                  { key: "complex" as const, label: "Complex" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="rounded-lg bg-warm-50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-warm-800">
                    {state.tiers[key].price ? `€${state.tiers[key].price}` : "—"}
                  </p>
                  {state.tiers[key].description && (
                    <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                      {state.tiers[key].description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-warm-800">
                {state.basePrice ? `€${state.basePrice}` : "—"}
              </span>
              <span className="text-sm text-muted-foreground">base price</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Turnaround + formats */}
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 shrink-0 text-sage-500" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Turnaround</p>
              <p className="text-sm font-semibold text-warm-800">
                {state.standardDays} business days
                {state.rushAvailable && (
                  <span className="ml-1.5 text-xs font-normal text-amber-600">
                    · {state.rushDays}d rush available
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Output Formats</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {state.outputFormats.length > 0 ? (
                  state.outputFormats.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">
                      {OUTPUT_FORMATS.find((of) => of.id === f)?.label ?? f}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {activeAddOns.length > 0 && (
          <>
            <Separator />
            <div className="p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Add-on Services
              </p>
              <div className="flex flex-col gap-1.5">
                {activeAddOns.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-warm-800">{a.name}</span>
                    <span className="font-medium text-warm-800">
                      {a.priceType === "fixed" ? `+€${a.priceValue}` : `+${a.priceValue}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        You can edit or archive this product at any time from your Products dashboard.
      </p>
    </div>
  )
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

interface ConfirmationScreenProps {
  state: WizardState
  isDraft: boolean
}

function ConfirmationScreen({ state, isDraft }: ConfirmationScreenProps) {
  const categoryDef = PROSTHETICS_CATEGORIES.find((c) => c.id === state.category)
  const CategoryIcon = categoryDef?.Icon

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-10 text-center">
      {/* Success ring */}
      <div className="relative flex items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-sage-50" />
        <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <CheckCircle2 className="h-9 w-9 text-sage-500" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-warm-800">
          {isDraft ? "Product saved as draft" : "Product activated!"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isDraft
            ? "Your product has been saved. You can activate it from the Products dashboard when ready."
            : "Your product is now live and visible to clients placing orders on SAGA.DENTAL."}
        </p>
      </div>

      {/* Product summary pill */}
      <div className="flex w-full max-w-sm items-center gap-3 rounded-lg border border-sage-200 bg-sage-50 px-4 py-3">
        {CategoryIcon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sage-500">
            <CategoryIcon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-warm-800">{state.name}</p>
          <p className="text-xs text-muted-foreground">
            {state.category} ·{" "}
            {state.useTiers
              ? `from €${state.tiers.simple.price}`
              : `€${state.basePrice}`}
          </p>
        </div>
        {isDraft ? (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            Draft
          </Badge>
        ) : (
          <Badge className="shrink-0 bg-sage-500 text-white hover:bg-sage-500">
            Active
          </Badge>
        )}
      </div>

      {/* Next steps */}
      {!isDraft && (
        <div className="w-full max-w-sm rounded-lg border border-border bg-warm-50 px-4 py-3 text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next steps
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-warm-800">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" strokeWidth={3} />
              Clients can now find your product when placing orders
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" strokeWidth={3} />
              New orders will appear in your Order Queue
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" strokeWidth={3} />
              You can edit pricing or availability at any time
            </li>
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href="/provider/products">View All Products</Link>
        </Button>
        <Button asChild>
          <Link href="/provider/products/new">Add Another Product</Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [confirmed, setConfirmed] = useState<"active" | "draft" | null>(null)

  function update(updates: Partial<WizardState>) {
    setState((s) => ({ ...s, ...updates }))
  }

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return (
          state.name.trim() === "" ||
          state.category === null ||
          state.description.trim() === ""
        )
      case 1: {
        const baseOk = parseFloat(state.basePrice) > 0
        const daysOk = parseInt(state.standardDays) > 0
        const formatsOk = state.outputFormats.length > 0
        return !baseOk || !daysOk || !formatsOk
      }
      case 2:
        return false
      case 3:
        return false
      default:
        return false
    }
  }, [step, state])

  if (confirmed) {
    return <ConfirmationScreen state={state} isDraft={confirmed === "draft"} />
  }

  const steps: WizardStep[] = [
    {
      id: "basic",
      title: "Basic Setup",
      description: "Name, category, and description",
      component: <Step1BasicSetup state={state} onChange={update} />,
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Base price, tiers, and turnaround",
      component: <Step2Pricing state={state} onChange={update} />,
    },
    {
      id: "addons",
      title: "Add-ons",
      description: "Optional extras for clients",
      isOptional: true,
      component: <Step3AddOns state={state} onChange={update} />,
    },
    {
      id: "preview",
      title: "Preview",
      description: "Review before activating",
      component: <Step4Preview state={state} />,
    },
  ]

  return (
    <WizardLayout
      steps={steps}
      currentStep={step}
      onNext={() => {
        if (step === steps.length - 1) {
          setConfirmed("active")
        } else {
          setStep((s) => s + 1)
        }
      }}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onStepClick={(i) => setStep(i)}
      isNextDisabled={isNextDisabled}
      title="New Product"
      nextLabel="Activate Product"
      showSaveDraft
      onSaveDraft={() => setConfirmed("draft")}
    />
  )
}
