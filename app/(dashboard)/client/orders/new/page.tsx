"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Package,
  Smile,
} from "lucide-react"
import WizardLayout, { type WizardStep } from "@/components/layout/wizard-layout"
import CategorySelector from "@/components/domain/category-selector"
import ToothChart from "@/components/domain/tooth-chart"
import ProviderList from "@/components/domain/provider-list"
import FileUpload from "@/components/domain/file-upload"
import DesignParamsForm from "@/components/domain/design-params-form"
import PriceSummary, { type PriceLineItem } from "@/components/domain/price-summary"
import EscrowBanner from "@/components/domain/escrow-banner"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import { Button } from "@/components/ui/button"
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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProviderSummaryBannerProps {
  provider: ProviderInfo
}

function ProviderSummaryBanner({ provider }: ProviderSummaryBannerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-sage-200 bg-sage-50 px-3 py-2.5 text-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-500 text-xs font-bold text-white">
        {provider.name.charAt(0)}
      </div>
      <span className="font-medium text-sage-700">{provider.name}</span>
      <span className="flex items-center gap-1 text-xs text-warm-600">
        <MapPin className="h-3 w-3" />
        {provider.location}
      </span>
      <span className="flex items-center gap-1 text-xs text-warm-600">
        <Clock className="h-3 w-3" />
        {provider.turnaroundDays} day turnaround
      </span>
      <span className="ml-auto font-semibold text-warm-800">
        from €{provider.price}
      </span>
    </div>
  )
}

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
    {
      label: `${state.category} Design`,
      amount: basePrice,
    },
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
      {/* Order summary card */}
      <div className="rounded-lg border border-border bg-warm-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-warm-800">
          Order Summary
        </h3>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs uppercase tracking-wide">Category</span>
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

      {/* Price breakdown */}
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

      {/* Escrow protection banner */}
      <EscrowBanner variant="payment" />
    </div>
  )
}

interface ConfirmationScreenProps {
  state: WizardState
  selectedProvider: ProviderInfo | null
}

function ConfirmationScreen({
  state,
  selectedProvider,
}: ConfirmationScreenProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        {/* Animated success ring */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-sage-200 opacity-60" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-sage-500 bg-sage-50">
            <CheckCircle2 className="h-10 w-10 text-sage-500" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-warm-800">Order Placed!</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your order has been submitted successfully.
        </p>

        {/* Order reference + status */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="font-mono text-lg font-semibold tracking-wide text-warm-800">
            ORD-2024-00142
          </span>
          <OrderStatusBadge status="PENDING_PAYMENT" />
        </div>

        {/* Order details pill row */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-warm-600">
          <span className="flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-3 py-1">
            <User className="h-3 w-3" />
            {state.category}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-3 py-1">
            <Smile className="h-3 w-3" />
            {state.selectedTeeth.length}{" "}
            {state.selectedTeeth.length === 1 ? "tooth" : "teeth"}
          </span>
          {selectedProvider && (
            <span className="flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-3 py-1">
              <Clock className="h-3 w-3" />
              {selectedProvider.turnaroundDays} day turnaround
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-3 py-1">
            <Package className="h-3 w-3" />
            {state.files.length} {state.files.length === 1 ? "file" : "files"}
          </span>
        </div>

        {/* Next steps */}
        <div className="mt-6 rounded-md border border-warm-200 bg-warm-50 p-4 text-left">
          <p className="text-sm font-semibold text-warm-800">What happens next?</p>
          <ul className="mt-2.5 space-y-1.5 text-xs text-warm-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500 text-[9px] font-bold text-white">
                1
              </span>
              Your design provider has been notified of your order
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500 text-[9px] font-bold text-white">
                2
              </span>
              Complete payment to move your order into production
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500 text-[9px] font-bold text-white">
                3
              </span>
              Funds are held in escrow — released only when you approve the design
            </li>
            {selectedProvider && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500 text-[9px] font-bold text-white">
                  4
                </span>
                Expected delivery:{" "}
                <span className="font-medium text-warm-700">
                  {selectedProvider.turnaroundDays} business days after payment
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/client/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/client/orders">View Orders</Link>
          </Button>
        </div>
      </div>
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
        // Aligner Design uses a different wizard — block proceeding
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
    return (
      <ConfirmationScreen state={state} selectedProvider={selectedProvider} />
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
              <strong>Aligner Design</strong> uses a separate wizard. The
              aligner order wizard is coming soon — please select a different
              category to continue.
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
          {/* Provider context */}
          {selectedProvider && (
            <ProviderSummaryBanner provider={selectedProvider} />
          )}

          {/* Scan files */}
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
              onFilesChange={(files) =>
                setState((s) => ({ ...s, files }))
              }
            />
          </div>

          {/* Design parameters */}
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
