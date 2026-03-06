"use client"

import { useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ScanLine, Package, Layers } from "lucide-react"
import WizardLayout, { type WizardStep } from "@/components/layout/wizard-layout"
import CategorySelector from "@/components/domain/category-selector"
import AlignerConfigForm from "@/components/domain/aligner-config-form"
import ProviderList from "@/components/domain/provider-list"
import FileUpload from "@/components/domain/file-upload"
import PriceSummary, { type PriceLineItem } from "@/components/domain/price-summary"
import EscrowBanner from "@/components/domain/escrow-banner"
import {
  ProviderSummaryBanner,
  WizardConfirmationScreen,
} from "../_components/wizard-shared"
import type {
  FileInfo,
  ProviderInfo,
  AlignerConfig,
  ArchSelection,
  UploadSection,
} from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

const ALIGNER_PROVIDERS: ProviderInfo[] = [
  {
    id: "a1",
    name: "AlignerWorks Studio",
    rating: 4.8,
    reviewCount: 234,
    completedDesigns: 1102,
    turnaroundDays: 5,
    software: ["SureSmile", "Archform"],
    price: 85,
    currency: "EUR",
    location: "Berlin, DE",
  },
  {
    id: "a2",
    name: "SmilePlan Pro",
    rating: 4.7,
    reviewCount: 187,
    completedDesigns: 876,
    turnaroundDays: 7,
    software: ["OnyxCeph", "uLab"],
    price: 75,
    currency: "EUR",
    location: "Vienna, AT",
  },
  {
    id: "a3",
    name: "TreatmentCAD",
    rating: 4.9,
    reviewCount: 312,
    completedDesigns: 1589,
    turnaroundDays: 4,
    software: ["SureSmile", "uLab"],
    price: 95,
    currency: "EUR",
    location: "Amsterdam, NL",
  },
  {
    id: "a4",
    name: "OrthoDesigns EU",
    rating: 4.5,
    reviewCount: 98,
    completedDesigns: 456,
    turnaroundDays: 8,
    software: ["Archform", "OnyxCeph"],
    price: 70,
    currency: "EUR",
    location: "Barcelona, ES",
  },
]

const ALIGNER_PROVIDER_BADGES: Record<string, string[]> = {
  a1: ["Aligner Specialist", "Top Rated"],
  a3: ["Top Rated", "Fast Delivery"],
}

const UPLOAD_SECTIONS: UploadSection[] = [
  {
    label: "Intraoral Scans",
    acceptedFormats: [".stl", ".ply", ".obj"],
    required: true,
    description: "Upper and lower arch scans",
  },
  {
    label: "Clinical Photos",
    acceptedFormats: [".jpg", ".png"],
    required: true,
    description: "Front, left, right occlusion views",
  },
  {
    label: "Supplementary Files",
    acceptedFormats: [".jpg", ".png", ".dcm", ".pdf"],
    required: false,
    description: "X-rays, CBCT scans, or other records",
  },
]

const COMPLEXITY_PREMIUMS: Record<string, number> = {
  simple: 0,
  moderate: 30,
  complex: 60,
}

const ARCH_LABELS: Record<ArchSelection, string> = {
  upper: "Upper Arch Only",
  lower: "Lower Arch Only",
  both: "Both Arches",
}

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: "Simple (≤14 stages)",
  moderate: "Moderate (15–25 stages)",
  complex: "Complex (26+ stages)",
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  category: string
  alignerConfig: AlignerConfig
  selectedProviderId: string | null
  files: FileInfo[]
}

const INITIAL_ALIGNER_CONFIG: AlignerConfig = {
  archSelection: "upper",
  treatmentGoals: [],
  additionalGoals: "",
  complexityTier: "simple",
  clinicalConstraints: {
    teethNotToMove: "",
    plannedExtractions: "",
    otherConstraints: "",
  },
  designPreferences: {
    includeAttachmentDesign: false,
    includeIPRProtocol: false,
    maxStagesPreferred: null,
  },
}

const INITIAL_STATE: WizardState = {
  category: "Aligner Design",
  alignerConfig: INITIAL_ALIGNER_CONFIG,
  selectedProviderId: null,
  files: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isUploadValid(files: FileInfo[]): boolean {
  const requiredSections = ["Intraoral Scans", "Clinical Photos"]
  return requiredSections.every((label) =>
    files.some((f) => f.section === label && f.status !== "error")
  )
}

function calculateAlignerPrice(config: AlignerConfig, baseArchPrice: number) {
  const archCount = config.archSelection === "both" ? 2 : 1
  const archTotal = archCount * baseArchPrice
  const complexityPremium = COMPLEXITY_PREMIUMS[config.complexityTier] ?? 0
  const designPrice = archTotal + complexityPremium
  const serviceFeeRate = 0.05
  const vatRate = 0.19
  const serviceFeeAmount = designPrice * serviceFeeRate
  // VAT applied on (designPrice + serviceFee) per standard EU dental billing
  const vatAmount = (designPrice + serviceFeeAmount) * vatRate
  const total = designPrice + serviceFeeAmount + vatAmount
  return { archCount, archTotal, complexityPremium, designPrice, serviceFeeAmount, vatAmount, total }
}

// ─── Review step ──────────────────────────────────────────────────────────────

interface AlignerReviewStepProps {
  state: WizardState
  selectedProvider: ProviderInfo | null
}

function AlignerReviewStep({ state, selectedProvider }: AlignerReviewStepProps) {
  const { config } = { config: state.alignerConfig }
  const baseArchPrice = selectedProvider?.price ?? 85
  const { archCount, archTotal, complexityPremium, designPrice, serviceFeeAmount, vatAmount, total } =
    calculateAlignerPrice(config, baseArchPrice)

  const goalLabels = config.treatmentGoals.join(", ") || "—"
  const totalFiles = state.files.filter((f) => f.status !== "error").length

  // Build per-arch line items
  const archLineItems: PriceLineItem[] = []
  if (config.archSelection === "upper" || config.archSelection === "both") {
    archLineItems.push({ label: "Upper Arch Design", amount: baseArchPrice })
  }
  if (config.archSelection === "lower" || config.archSelection === "both") {
    archLineItems.push({ label: "Lower Arch Design", amount: baseArchPrice })
  }

  const lineItems: PriceLineItem[] = [
    ...archLineItems,
    ...(complexityPremium > 0
      ? [
          {
            label: `Complexity Premium (${config.complexityTier.charAt(0).toUpperCase() + config.complexityTier.slice(1)})`,
            amount: complexityPremium,
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Order summary */}
      <div className="rounded-lg border border-border bg-warm-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-warm-800">
          Order Summary
        </h3>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Arch Selection
            </dt>
            <dd className="font-medium text-warm-800">
              {ARCH_LABELS[config.archSelection]} ({archCount}{" "}
              {archCount === 1 ? "arch" : "arches"})
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Complexity
            </dt>
            <dd className="font-medium text-warm-800">
              {COMPLEXITY_LABELS[config.complexityTier]}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Treatment Goals
            </dt>
            <dd className="text-right font-medium text-warm-800 capitalize">
              {goalLabels}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Provider
            </dt>
            <dd className="font-medium text-warm-800">
              {selectedProvider?.name ?? "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Patient Files
            </dt>
            <dd className="font-medium text-warm-800">
              {totalFiles} {totalFiles === 1 ? "file" : "files"} uploaded
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Turnaround
            </dt>
            <dd className="font-medium text-warm-800">
              {selectedProvider?.turnaroundDays ?? "—"} business days
            </dd>
          </div>
        </dl>
      </div>

      <PriceSummary
        lineItems={lineItems}
        subtotal={designPrice}
        serviceFee={{
          label: "Service Fee",
          percentage: 5,
          amount: serviceFeeAmount,
        }}
        vat={{
          label: "VAT",
          percentage: 19,
          amount: vatAmount,
        }}
        total={total}
      />

      <EscrowBanner variant="payment" />
    </div>
  )
}

// ─── Inner wizard (needs useSearchParams) ─────────────────────────────────────

function AlignerOrderWizard() {
  const searchParams = useSearchParams()
  // If arriving from the prosthetics wizard redirect, skip the category step
  const [step, setStep] = useState(
    searchParams.get("from") === "redirect" ? 1 : 0
  )
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const selectedProvider = useMemo(
    () =>
      ALIGNER_PROVIDERS.find((p) => p.id === state.selectedProviderId) ?? null,
    [state.selectedProviderId]
  )

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        // Must have Aligner Design selected to proceed in this wizard
        return state.category !== "Aligner Design"
      case 1:
        // Require arch selection (always set) + at least 1 treatment goal + complexity (always set)
        return state.alignerConfig.treatmentGoals.length === 0
      case 2:
        return state.selectedProviderId === null
      case 3:
        return !isUploadValid(state.files)
      case 4:
        return false
      default:
        return false
    }
  }, [step, state])

  function handleNext() {
    if (step === 4) {
      setIsConfirmed(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  function handleStepClick(index: number) {
    setStep(index)
  }

  if (isConfirmed) {
    const baseArchPrice = selectedProvider?.price ?? 85
    const { archCount } = calculateAlignerPrice(state.alignerConfig, baseArchPrice)
    const totalFiles = state.files.filter((f) => f.status !== "error").length

    const pills = [
      { icon: <ScanLine className="h-3 w-3" />, text: "Aligner Design" },
      {
        icon: <Layers className="h-3 w-3" />,
        text: `${ARCH_LABELS[state.alignerConfig.archSelection]} (${archCount} arch${archCount > 1 ? "es" : ""})`,
      },
      ...(selectedProvider
        ? [
            {
              icon: <Package className="h-3 w-3" />,
              text: `${selectedProvider.turnaroundDays} day turnaround`,
            },
          ]
        : []),
      {
        icon: <Package className="h-3 w-3" />,
        text: `${totalFiles} ${totalFiles === 1 ? "file" : "files"}`,
      },
    ]

    const nextSteps = [
      "Your provider will review the patient files and begin treatment planning",
      "Complete payment to move your order into production",
      "You'll receive a simulation link for review within the estimated turnaround time",
      ...(selectedProvider
        ? [
            `Expected delivery: ${selectedProvider.turnaroundDays} business days after payment`,
          ]
        : []),
    ]

    return (
      <WizardConfirmationScreen
        selectedProvider={selectedProvider}
        pills={pills}
        nextSteps={nextSteps}
        orderRef="ORD-2024-00143"
      />
    )
  }

  const steps: WizardStep[] = [
    {
      id: "category",
      title: "Category",
      description: "Confirm your order type",
      component: (
        <div className="flex flex-col gap-4">
          <CategorySelector
            value={state.category}
            onChange={(cat) => setState((s) => ({ ...s, category: cat }))}
          />
          {state.category !== "Aligner Design" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              This is the Aligner Design wizard.{" "}
              <Link
                href="/client/orders/new"
                className="font-semibold underline hover:text-amber-900"
              >
                Switch to the prosthetics wizard →
              </Link>{" "}
              for other restoration types.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "aligner-config",
      title: "Configuration",
      description: "Set arch selection, goals, and complexity",
      component: (
        <AlignerConfigForm
          values={state.alignerConfig}
          onChange={(config) =>
            setState((s) => ({ ...s, alignerConfig: config }))
          }
        />
      ),
    },
    {
      id: "provider",
      title: "Provider",
      description: "Choose your aligner design provider",
      component: (
        <div className="flex flex-col gap-4">
          {selectedProvider && (
            <ProviderSummaryBanner
              provider={selectedProvider}
              priceSuffix="/arch"
            />
          )}
          <ProviderList
            providers={ALIGNER_PROVIDERS}
            providerBadges={ALIGNER_PROVIDER_BADGES}
            selectedId={state.selectedProviderId ?? undefined}
            onSelect={(id) =>
              setState((s) => ({ ...s, selectedProviderId: id }))
            }
            priceLabel="per arch"
          />
        </div>
      ),
    },
    {
      id: "upload",
      title: "Patient Files",
      description: "Upload scans, photos, and supplementary records",
      component: (
        <div className="flex flex-col gap-6">
          {selectedProvider && (
            <ProviderSummaryBanner
              provider={selectedProvider}
              priceSuffix="/arch"
            />
          )}
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Upload all patient records for treatment planning. Intraoral scans
              and clinical photos are required; supplementary files are optional.
            </p>
            <p className="mb-4 text-xs font-medium text-warm-600">
              {
                UPLOAD_SECTIONS.filter(
                  (s) =>
                    s.required &&
                    state.files.some(
                      (f) => f.section === s.label && f.status !== "error"
                    )
                ).length
              }{" "}
              of {UPLOAD_SECTIONS.filter((s) => s.required).length} required
              sections filled
            </p>
            <FileUpload
              acceptedFormats={[".stl", ".ply", ".obj", ".jpg", ".png", ".dcm", ".pdf"]}
              files={state.files}
              onFilesChange={(files) => setState((s) => ({ ...s, files }))}
              sections={UPLOAD_SECTIONS}
            />
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Review & Pay",
      description: "Review your aligner order and complete payment",
      component: (
        <AlignerReviewStep state={state} selectedProvider={selectedProvider} />
      ),
    },
  ]

  return (
    <WizardLayout
      steps={steps}
      currentStep={step}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={handleStepClick}
      isNextDisabled={isNextDisabled}
      title="New Aligner Order"
      nextLabel="Place Order"
      showSaveDraft
    />
  )
}

// ─── Page (wraps inner wizard in Suspense for useSearchParams) ────────────────

export default function NewAlignerOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading wizard…</div>
      }
    >
      <AlignerOrderWizard />
    </Suspense>
  )
}
