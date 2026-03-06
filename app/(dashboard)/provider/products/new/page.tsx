"use client"

import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Clock,
  Tag,
  Star,
  FileText,
  Layers,
  Grid3X3,
  Square,
  Minus,
  Anchor,
  ImageIcon,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import WizardLayout, { WizardStep } from "@/components/layout/wizard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const PROSTHETICS_CATEGORIES = [
  {
    id: "crowns",
    label: "Crowns",
    description: "Single-unit crown restorations",
    icon: <StarIcon />,
  },
  {
    id: "bridges",
    label: "Bridges",
    description: "Multi-unit bridge restorations",
    icon: <Minus className="h-5 w-5" />,
  },
  {
    id: "inlays_onlays",
    label: "Inlays / Onlays",
    description: "Conservative intra-coronal restorations",
    icon: <Square className="h-5 w-5" />,
  },
  {
    id: "implant_abutments",
    label: "Implant Abutments",
    description: "Custom implant abutments",
    icon: <Anchor className="h-5 w-5" />,
  },
  {
    id: "partial_frameworks",
    label: "Partial Frameworks",
    description: "RPD metal frameworks",
    icon: <Grid3X3 className="h-5 w-5" />,
  },
  {
    id: "veneers",
    label: "Veneers",
    description: "Thin ceramic veneers",
    icon: <Layers className="h-5 w-5" />,
  },
]

function StarIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

const OUTPUT_FORMATS = [
  { id: "stl", label: "STL", description: "Universal 3D mesh format" },
  {
    id: "exocad",
    label: "exocad project",
    description: "Native exocad design file",
  },
  {
    id: "3shape",
    label: "3Shape project",
    description: "Native 3Shape design file",
  },
]

const SUGGESTED_ADDONS = [
  {
    name: "Rush Design",
    priceType: "fixed" as const,
    priceValue: "45",
  },
  {
    name: "Additional Views",
    priceType: "fixed" as const,
    priceValue: "25",
  },
  {
    name: "Design Consultation",
    priceType: "fixed" as const,
    priceValue: "60",
  },
]

// ─── Form State Types ─────────────────────────────────────────────────────────

interface TierConfig {
  price: string
  description: string
}

interface AddOn {
  id: string
  name: string
  priceType: "fixed" | "percentage"
  priceValue: string
  active: boolean
}

interface ProductFormState {
  // Step 1
  name: string
  category: string | null
  description: string
  imagePreview: string | null
  // Step 2
  basePrice: string
  tiersEnabled: boolean
  tiers: {
    simple: TierConfig
    moderate: TierConfig
    complex: TierConfig
  }
  standardDays: string
  rushAvailable: boolean
  rushDays: string
  outputFormats: string[]
  // Step 3
  addOns: AddOn[]
}

// ─── Pre-filled Crown Design State ───────────────────────────────────────────

const INITIAL_STATE: ProductFormState = {
  name: "Crown Design",
  category: "crowns",
  description:
    "Full-contour crown design for single-unit restorations. Compatible with all major milling systems. Delivered as STL and/or native exocad/3Shape project files.",
  imagePreview: null,
  basePrice: "89",
  tiersEnabled: true,
  tiers: {
    simple: {
      price: "75",
      description: "Standard single-unit restoration",
    },
    moderate: {
      price: "89",
      description: "Multi-unit or complex anatomy",
    },
    complex: {
      price: "115",
      description: "Full arch or challenging cases",
    },
  },
  standardDays: "3",
  rushAvailable: true,
  rushDays: "1",
  outputFormats: ["stl", "exocad"],
  addOns: [
    {
      id: "ao_001",
      name: "Rush Design",
      priceType: "fixed",
      priceValue: "45",
      active: true,
    },
    {
      id: "ao_002",
      name: "Additional Views",
      priceType: "fixed",
      priceValue: "25",
      active: true,
    },
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ProductFormState>(INITIAL_STATE)
  const [isComplete, setIsComplete] = useState(false)

  // ── Field helpers ──────────────────────────────────────────────────────────
  function setField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev: ProductFormState) => ({ ...prev, [key]: value }))
  }

  function setTierField(
    tier: keyof ProductFormState["tiers"],
    key: keyof TierConfig,
    value: string
  ) {
    setForm((prev: ProductFormState) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: { ...prev.tiers[tier], [key]: value },
      },
    }))
  }

  // ── Step validation ────────────────────────────────────────────────────────
  function isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return form.name.trim().length > 0 && form.category !== null
      case 1:
        return (
          form.basePrice.trim().length > 0 &&
          parseFloat(form.basePrice) > 0 &&
          form.standardDays.trim().length > 0 &&
          parseInt(form.standardDays) > 0 &&
          form.outputFormats.length > 0
        )
      case 2:
        return true // add-ons are optional
      case 3:
        return true // preview step, always valid
      default:
        return false
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep((s: number) => s + 1)
    } else {
      // Final step: activate
      setIsComplete(true)
    }
  }

  function handleBack() {
    setStep((s: number) => Math.max(0, s - 1))
  }

  function handleSaveDraft() {
    // Dummy: navigate away as if saved
    router.push("/provider/products")
  }

  if (isComplete) {
    return <ConfirmationScreen onDone={() => router.push("/provider/products")} />
  }

  const steps: WizardStep[] = [
    {
      id: "basic",
      title: "Basic Setup",
      description: "Name your product, choose a category, and add a description.",
      component: (
        <StepBasicSetup
          form={form}
          setField={setField}
        />
      ),
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Set your base price, complexity tiers, and turnaround time.",
      component: (
        <StepPricingTurnaround
          form={form}
          setField={setField}
          setTierField={setTierField}
        />
      ),
    },
    {
      id: "addons",
      title: "Add-ons",
      isOptional: true,
      description: "Offer optional extras clients can add to their order.",
      component: (
        <StepAddOns
          form={form}
          setForm={setForm}
        />
      ),
    },
    {
      id: "preview",
      title: "Preview",
      description:
        "Review how your product will appear to clients, then activate it.",
      component: (
        <StepPreview form={form} />
      ),
    },
  ]

  return (
    <WizardLayout
      title="New Product"
      steps={steps}
      currentStep={step}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={(i) => {
        if (i < step) setStep(i)
      }}
      isNextDisabled={!isStepValid(step)}
      showSaveDraft
      onSaveDraft={handleSaveDraft}
      nextLabel="Activate Product"
    />
  )
}

// ─── Step 1: Basic Setup ──────────────────────────────────────────────────────

function StepBasicSetup({
  form,
  setField,
}: {
  form: ProductFormState
  setField: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) => void
}) {
  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setField("imagePreview", ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Product name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Product Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Crown Design"
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground">
          This is shown to clients when browsing providers.
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Category <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROSTHETICS_CATEGORIES.map((cat) => {
            const isSelected = form.category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setField("category", cat.id)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                  isSelected
                    ? "border-[#4a7c59] bg-[#f3f7f3] ring-1 ring-[#4a7c59]"
                    : "border-border bg-background hover:border-[#4a7c59]/40 hover:bg-[#f3f7f3]/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    isSelected
                      ? "bg-[#4a7c59] text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {cat.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isSelected ? "text-[#4a7c59]" : "text-foreground"
                  )}
                >
                  {cat.label}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {cat.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Describe what's included, software used, delivery format…"
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <p className="text-right text-xs text-muted-foreground">
          {form.description.length}/500
        </p>
      </div>

      {/* Product image (optional) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Product Image{" "}
          <span className="font-normal text-muted-foreground">(Optional)</span>
        </label>
        {form.imagePreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.imagePreview}
              alt="Product preview"
              className="h-36 w-36 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => setField("imagePreview", null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-[#4a7c59]/40 hover:bg-[#f3f7f3]/50">
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Click to upload image
            </span>
            <span className="text-xs text-muted-foreground">
              JPG or PNG up to 4 MB
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}

// ─── Step 2: Pricing & Turnaround ─────────────────────────────────────────────

function StepPricingTurnaround({
  form,
  setField,
  setTierField,
}: {
  form: ProductFormState
  setField: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) => void
  setTierField: (
    tier: keyof ProductFormState["tiers"],
    key: keyof TierConfig,
    value: string
  ) => void
}) {
  function toggleFormat(id: string) {
    setField(
      "outputFormats",
      form.outputFormats.includes(id)
        ? form.outputFormats.filter((f) => f !== id)
        : [...form.outputFormats, id]
    )
  }

  const tiers: Array<{
    key: keyof ProductFormState["tiers"]
    label: string
    badge: string
    badgeClass: string
  }> = [
    {
      key: "simple",
      label: "Simple",
      badge: "≤ 1 unit",
      badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      key: "moderate",
      label: "Moderate",
      badge: "Multi-unit",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      key: "complex",
      label: "Complex",
      badge: "Full arch",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
    },
  ]

  return (
    <div className="space-y-7">
      {/* Base price */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Base Price <span className="text-destructive">*</span>
        </label>
        <div className="relative w-40">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            €
          </span>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.basePrice}
            onChange={(e) => setField("basePrice", e.target.value)}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Default price shown when no complexity tier is selected.
        </p>
      </div>

      {/* Complexity tiers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Complexity Tiers
            </p>
            <p className="text-xs text-muted-foreground">
              Optional — recommended for orders that vary in complexity
            </p>
          </div>
          <Toggle
            checked={form.tiersEnabled}
            onChange={(v) => setField("tiersEnabled", v)}
            label={form.tiersEnabled ? "Enabled" : "Disabled"}
          />
        </div>

        {form.tiersEnabled && (
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.key}
                className="rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {tier.label}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tier.badgeClass}`}
                  >
                    {tier.badge}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Price
                    </label>
                    <div className="relative w-36">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.tiers[tier.key].price}
                        onChange={(e) =>
                          setTierField(tier.key, "price", e.target.value)
                        }
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Description
                    </label>
                    <Input
                      value={form.tiers[tier.key].description}
                      onChange={(e) =>
                        setTierField(tier.key, "description", e.target.value)
                      }
                      placeholder="Short description for clients"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Turnaround */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Turnaround Time <span className="text-destructive">*</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="relative w-32">
            <Input
              type="number"
              min={1}
              value={form.standardDays}
              onChange={(e) => setField("standardDays", e.target.value)}
              placeholder="3"
            />
          </div>
          <span className="text-sm text-muted-foreground">business days (standard)</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={form.rushAvailable}
            onChange={(v) => setField("rushAvailable", v)}
            label="Rush available"
          />
        </div>

        {form.rushAvailable && (
          <div className="flex items-center gap-3 pl-1">
            <div className="relative w-32">
              <Input
                type="number"
                min={1}
                value={form.rushDays}
                onChange={(e) => setField("rushDays", e.target.value)}
                placeholder="1"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              business days (rush)
            </span>
          </div>
        )}
      </div>

      {/* Output formats */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Supported Output Formats <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Select all file types you can deliver.
        </p>
        <div className="space-y-2">
          {OUTPUT_FORMATS.map((fmt) => {
            const checked = form.outputFormats.includes(fmt.id)
            return (
              <label
                key={fmt.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFormat(fmt.id)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#4a7c59]"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{fmt.label}</p>
                  <p className="text-xs text-muted-foreground">{fmt.description}</p>
                </div>
              </label>
            )
          })}
        </div>
        {form.outputFormats.length === 0 && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            Select at least one output format.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Step 3: Add-ons ──────────────────────────────────────────────────────────

function StepAddOns({
  form,
  setForm,
}: {
  form: ProductFormState
  setForm: Dispatch<SetStateAction<ProductFormState>>
}) {
  function addAddon(preset?: { name: string; priceType: "fixed" | "percentage"; priceValue: string }) {
    const newAddon: AddOn = {
      id: `ao_${Date.now()}`,
      name: preset?.name ?? "",
      priceType: preset?.priceType ?? "fixed",
      priceValue: preset?.priceValue ?? "",
      active: true,
    }
    setForm((prev: ProductFormState) => ({ ...prev, addOns: [...prev.addOns, newAddon] }))
  }

  function removeAddon(id: string) {
    setForm((prev: ProductFormState) => ({
      ...prev,
      addOns: prev.addOns.filter((a: AddOn) => a.id !== id),
    }))
  }

  function updateAddon(id: string, patch: Partial<AddOn>) {
    setForm((prev: ProductFormState) => ({
      ...prev,
      addOns: prev.addOns.map((a: AddOn) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  }

  const existingNames = form.addOns.map((a) => a.name.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Suggested add-ons */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Quick Add</p>
        <p className="text-xs text-muted-foreground">
          Pre-fill common add-ons with one click.
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_ADDONS.map((s) => {
            const alreadyAdded = existingNames.includes(s.name.toLowerCase())
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => !alreadyAdded && addAddon(s)}
                disabled={alreadyAdded}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  alreadyAdded
                    ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                    : "border-[#4a7c59]/30 bg-[#f3f7f3] text-[#4a7c59] hover:bg-[#e8ede8]"
                )}
              >
                <Plus className="h-3 w-3" />
                {s.name}
                {alreadyAdded && " (added)"}
              </button>
            )
          })}
        </div>
      </div>

      {/* Add-on list */}
      {form.addOns.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Configured Add-ons
          </p>
          {form.addOns.map((addon) => (
            <div
              key={addon.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                addon.active ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Name */}
                <div className="flex-1 space-y-1 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </label>
                  <Input
                    value={addon.name}
                    onChange={(e) => updateAddon(addon.id, { name: e.target.value })}
                    placeholder="Add-on name"
                  />
                </div>

                {/* Active toggle */}
                <div className="shrink-0 pt-5">
                  <Toggle
                    checked={addon.active}
                    onChange={(v) => updateAddon(addon.id, { active: v })}
                  />
                </div>

                {/* Remove */}
                <div className="shrink-0 pt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAddon(addon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove add-on</span>
                  </Button>
                </div>
              </div>

              {/* Price type + value row */}
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Price Type
                  </label>
                  <div className="flex gap-4">
                    {(["fixed", "percentage"] as const).map((type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-1.5 text-sm"
                      >
                        <input
                          type="radio"
                          value={type}
                          checked={addon.priceType === type}
                          onChange={() => updateAddon(addon.id, { priceType: type })}
                          className="accent-[#4a7c59]"
                        />
                        {type === "fixed" ? "Fixed Amount" : "Percentage"}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {addon.priceType === "fixed" ? "Amount (€)" : "Percentage (%)"}
                  </label>
                  <div className="relative w-32">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {addon.priceType === "fixed" ? "€" : "%"}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={addon.priceType === "fixed" ? 0.01 : 1}
                      max={addon.priceType === "percentage" ? 100 : undefined}
                      value={addon.priceValue}
                      onChange={(e) =>
                        updateAddon(addon.id, { priceValue: e.target.value })
                      }
                      className="pl-7"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add custom */}
      <Button
        variant="outline"
        onClick={() => addAddon()}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Custom Add-on
      </Button>

      {form.addOns.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <Tag className="mx-auto h-7 w-7 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            No add-ons configured
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add-ons are optional. Skip this step if not needed.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Preview & Activate ───────────────────────────────────────────────

function StepPreview({ form }: { form: ProductFormState }) {
  const selectedCategory = PROSTHETICS_CATEGORIES.find(
    (c) => c.id === form.category
  )
  const activeAddOns = form.addOns.filter((a) => a.active && a.name && a.priceValue)

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#4a7c59]/20 bg-[#f3f7f3]/50 px-4 py-3 text-sm text-[#4a7c59]">
        This is how your product will appear to clients when they browse
        providers. Review and activate when ready.
      </div>

      {/* Product card preview */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start gap-4">
            {form.imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imagePreview}
                alt="Product"
                className="h-14 w-14 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#e8ede8] text-[#4a7c59]">
                <Package className="h-7 w-7" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-foreground">
                {form.name || (
                  <span className="italic text-muted-foreground">
                    Untitled product
                  </span>
                )}
              </p>
              {selectedCategory && (
                <span className="mt-1 inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {selectedCategory.label}
                </span>
              )}
              {form.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="border-b border-border px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </p>
          {form.tiersEnabled ? (
            <div className="space-y-2">
              {(["simple", "moderate", "complex"] as const).map((tier) => {
                const t = form.tiers[tier]
                if (!t.price) return null
                const labels = {
                  simple: "Simple",
                  moderate: "Moderate",
                  complex: "Complex",
                }
                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {labels[tier]}
                      </span>
                      {t.description && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          — {t.description}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      €{parseFloat(t.price || "0").toFixed(2)}
                    </span>
                  </div>
                )
              })}
              <div className="border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
                Base price: €{parseFloat(form.basePrice || "0").toFixed(2)} (when
                no tier is selected)
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Base price</span>
              <span className="text-lg font-bold text-foreground">
                €{parseFloat(form.basePrice || "0").toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Turnaround + formats */}
        <div className="border-b border-border px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {form.standardDays
                ? `${form.standardDays} business day${parseInt(form.standardDays) !== 1 ? "s" : ""} standard`
                : "—"}
              {form.rushAvailable && form.rushDays && (
                <span className="ml-1">
                  · {form.rushDays} day rush available
                </span>
              )}
            </div>
          </div>
          {form.outputFormats.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.outputFormats.map((id) => {
                const fmt = OUTPUT_FORMATS.find((f) => f.id === id)
                return fmt ? (
                  <span
                    key={id}
                    className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {fmt.label}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Add-ons */}
        {activeAddOns.length > 0 && (
          <div className="px-5 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available Add-ons
            </p>
            <div className="space-y-1.5">
              {activeAddOns.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">{addon.name}</span>
                  <span className="text-sm font-medium text-foreground">
                    +{addon.priceType === "fixed" ? "€" : ""}
                    {parseFloat(addon.priceValue || "0").toFixed(
                      addon.priceType === "fixed" ? 2 : 0
                    )}
                    {addon.priceType === "percentage" ? "%" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Click <strong>Activate Product</strong> below to publish, or{" "}
        <strong>Save Draft</strong> to continue editing later.
      </p>
    </div>
  )
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

function ConfirmationScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#4a7c59]/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#e8ede8]">
          <CheckCircle2 className="h-10 w-10 text-[#4a7c59]" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-foreground">
        Product Activated!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your product is now live and visible to clients on the platform.
      </p>

      <div className="mt-6 w-full rounded-xl border border-border bg-card px-5 py-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Next Steps
        </p>
        <ul className="mt-3 space-y-2">
          {[
            "Clients can now find your product when placing orders",
            "You'll be notified when a new order matches your product",
            "Update pricing or add-ons anytime from the Products page",
          ].map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4a7c59]" />
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={onDone}>View Products</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Add Another
        </Button>
      </div>
    </div>
  )
}

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-[#4a7c59]" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-foreground">{label}</span>
      )}
    </label>
  )
}
