"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Smile, Package, User } from "lucide-react"
import WizardLayout, { type WizardStep } from "@/components/layout/wizard-layout"
import CategorySelector from "@/components/domain/category-selector"
import ToothChart from "@/components/domain/tooth-chart"
import ProviderList from "@/components/domain/provider-list"
import FileUpload from "@/components/domain/file-upload"
import DesignParamsForm from "@/components/domain/design-params-form"
import PriceSummary, { type PriceLineItem } from "@/components/domain/price-summary"
import EscrowBanner from "@/components/domain/escrow-banner"
import {
  ProviderSummaryBanner,
  WizardConfirmationScreen,
} from "./_components/wizard-shared"
import type { FileInfo, DesignParameters, ProviderInfo } from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_PROVIDERS: ProviderInfo[] = [
  {
    id: "p1",
    name: "ClearCAD Studio",
    rating: 4.9,
    reviewCount: 312,
    completedDesigns: 1840,
    turnaroundDays: 2,
    software: ["exocad", "3Shape"],
    price: 85,
    currency: "EUR",
    location: "Berlin, DE",
  },
  {
    id: "p2",
    name: "Dental Design Pro",
    rating: 4.7,
    reviewCount: 198,
    completedDesigns: 1203,
    turnaroundDays: 3,
    software: ["exocad"],
    price: 65,
    currency: "EUR",
    location: "Vienna, AT",
  },
  {
    id: "p3",
    name: "PrecisionCAD",
    rating: 4.8,
    reviewCount: 245,
    completedDesigns: 1567,
    turnaroundDays: 2,
    software: ["3Shape", "exocad"],
    price: 90,
    currency: "EUR",
    location: "Munich, DE",
  },
  {
    id: "p4",
    name: "SmileArchitect",
    rating: 4.5,
    reviewCount: 87,
    completedDesigns: 423,
    turnaroundDays: 5,
    software: ["3Shape"],
    price: 55,
    currency: "EUR",
    location: "Amsterdam, NL",
  },
  {
    id: "p5",
    name: "ArteDental CAD",
    rating: 4.6,
    reviewCount: 134,
    completedDesigns: 789,
    turnaroundDays: 4,
    software: ["exocad"],
    price: 70,
    currency: "EUR",
    location: "Barcelona, ES",
  },
  {
    id: "p6",
    name: "Nordic Designs",
    rating: 4.4,
    reviewCount: 56,
    completedDesigns: 312,
    turnaroundDays: 7,
    software: ["3Shape"],
    price: 48,
    currency: "EUR",
    location: "Stockholm, SE",
  },
]

const PROVIDER_BADGES: Record<string, string[]> = {
  p1: ["Top Rated", "Fast Delivery"],
  p3: ["Top Rated"],
}

const DEFAULT_DESIGN_PARAMS: DesignParameters = {
  marginSettings: "0.05mm",
  spacerThickness: "0.03mm",
  minimumThickness: "0.5mm",
  contactStrength: "Medium",
  occlusionType: "Medium Contact",
  specialInstructions: "",
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  category: string | null
  selectedTeeth: number[]
  selectedProviderId: string | null
  files: FileInfo[]
  designParams: DesignParameters
}

const INITIAL_STATE: WizardState = {
  category: null,
  selectedTeeth: [],
  selectedProviderId: null,
  files: [],
  designParams: DEFAULT_DESIGN_PARAMS,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDesignParamsValid(p: DesignParameters): boolean {
  const parseMm = (v: string) => parseFloat(v.replace("mm", "").trim())
  return (
    !isNaN(parseMm(p.marginSettings)) &&
    parseMm(p.marginSettings) > 0 &&
    !isNaN(parseMm(p.spacerThickness)) &&
    parseMm(p.spacerThickness) > 0 &&
    !isNaN(parseMm(p.minimumThickness)) &&
    parseMm(p.minimumThickness) > 0 &&
    p.contactStrength.length > 0 &&
    p.occlusionType.length > 0
  )
}

// ─── Review step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
  state: WizardState
  selectedProvider: ProviderInfo | null
}

function ReviewStep({ state, selectedProvider }: ReviewStepProps) {
  const basePrice = selectedProvider?.price ?? 0
  const additionalTeethCount = Math.max(0, state.selectedTeeth.length - 1)
  const additionalTeethPrice = additionalTeethCount * 15
  const designPrice = basePrice + additionalTeethPrice
  const serviceFeeRate = 0.05
  const vatRate = 0.19
  const serviceFeeAmount = designPrice * serviceFeeRate
  const vatAmount = designPrice * vatRate
  const total = designPrice + serviceFeeAmount + vatAmount

  const sortedTeeth = [...state.selectedTeeth].sort((a, b) => a - b)

  const lineItems: PriceLineItem[] = [
    { label: `${state.category} Design`, amount: basePrice },
    ...(additionalTeethCount > 0
      ? [
          {
            label: `Additional teeth (${additionalTeethCount} × €15)`,
            amount: additionalTeethPrice,
            isSubItem: true,
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-warm-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-warm-800">
          Order Summary
        </h3>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Category
            </dt>
            <dd className="font-medium text-warm-800">{state.category}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Teeth
            </dt>
            <dd className="text-right font-medium text-warm-800">
              {state.selectedTeeth.length}{" "}
              {state.selectedTeeth.length === 1 ? "tooth" : "teeth"} (
              {sortedTeeth.join(", ")})
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
              Scan Files
            </dt>
            <dd className="font-medium text-warm-800">
              {state.files.length}{" "}
              {state.files.length === 1 ? "file" : "files"} uploaded
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
          percentage: serviceFeeRate * 100,
          amount: serviceFeeAmount,
        }}
        vat={{
          label: "VAT",
          percentage: vatRate * 100,
          amount: vatAmount,
        }}
        total={total}
      />

      <EscrowBanner variant="payment" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProstheticsOrderPage() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const selectedProvider = useMemo(
    () => DUMMY_PROVIDERS.find((p) => p.id === state.selectedProviderId) ?? null,
    [state.selectedProviderId]
  )

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return !state.category || state.category === "Aligner Design"
      case 1:
        return state.selectedTeeth.length === 0
      case 2:
        return state.selectedProviderId === null
      case 3: {
        const hasFiles =
          state.files.filter((f) => f.status !== "error").length > 0
        return !hasFiles || !isDesignParamsValid(state.designParams)
      }
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
    const pills = [
      { icon: <User className="h-3 w-3" />, text: state.category ?? "" },
      {
        icon: <Smile className="h-3 w-3" />,
        text: `${state.selectedTeeth.length} ${state.selectedTeeth.length === 1 ? "tooth" : "teeth"}`,
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
        text: `${state.files.length} ${state.files.length === 1 ? "file" : "files"}`,
      },
    ]
    const nextSteps = [
      "Your design provider has been notified of your order",
      "Complete payment to move your order into production",
      "Funds are held in escrow — released only when you approve the design",
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
      />
    )
  }

  const steps: WizardStep[] = [
    {
      id: "category",
      title: "Category",
      description: "Choose the type of restoration",
      component: (
        <div className="flex flex-col gap-4">
          <CategorySelector
            value={state.category}
            onChange={(cat) => setState((s) => ({ ...s, category: cat }))}
          />
          {state.category === "Aligner Design" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <strong>Aligner Design</strong> uses a separate wizard.{" "}
              <Link
                href="/client/orders/new/aligner?from=redirect"
                className="font-semibold underline hover:text-amber-900"
              >
                Start the Aligner Wizard →
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "teeth",
      title: "Teeth",
      description: state.category
        ? `${state.category} — Select teeth`
        : "Select the teeth to treat",
      component: (
        <ToothChart
          selectedTeeth={state.selectedTeeth}
          onTeethChange={(teeth) =>
            setState((s) => ({ ...s, selectedTeeth: teeth }))
          }
          category={state.category ?? undefined}
        />
      ),
    },
    {
      id: "provider",
      title: "Provider",
      description: "Choose your design provider",
      component: (
        <div className="flex flex-col gap-4">
          {selectedProvider && (
            <ProviderSummaryBanner provider={selectedProvider} />
          )}
          <ProviderList
            providers={DUMMY_PROVIDERS}
            providerBadges={PROVIDER_BADGES}
            selectedId={state.selectedProviderId ?? undefined}
            onSelect={(id) =>
              setState((s) => ({ ...s, selectedProviderId: id }))
            }
          />
        </div>
      ),
    },
    {
      id: "upload",
      title: "Files & Params",
      description: "Upload scan files and set design parameters",
      component: (
        <div className="flex flex-col gap-8">
          {selectedProvider && (
            <ProviderSummaryBanner provider={selectedProvider} />
          )}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-warm-800">
              Scan Files
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Upload your intraoral or desktop scan files. Accepted formats:{" "}
              <span className="font-medium">.stl, .ply, .obj</span>
            </p>
            <FileUpload
              acceptedFormats={[".stl", ".ply", ".obj"]}
              files={state.files}
              onFilesChange={(files) => setState((s) => ({ ...s, files }))}
            />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-warm-800">
              Design Parameters
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Set the technical specifications for your{" "}
              <span className="font-medium">{state.category}</span> design.
            </p>
            <DesignParamsForm
              values={state.designParams}
              onChange={(params) =>
                setState((s) => ({ ...s, designParams: params }))
              }
              defaults={DEFAULT_DESIGN_PARAMS}
              showSaveAsDefault
            />
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Review & Pay",
      description: "Review your order and complete payment",
      component: (
        <ReviewStep state={state} selectedProvider={selectedProvider} />
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
      title="New Order"
      nextLabel="Place Order"
      showSaveDraft
    />
  )
}
