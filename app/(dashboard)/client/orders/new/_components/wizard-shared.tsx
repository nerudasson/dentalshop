"use client"

import Link from "next/link"
import { CheckCircle2, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import OrderStatusBadge from "@/components/ui/order-status-badge"
import type { ProviderInfo } from "@/lib/types"

// ─── ProviderSummaryBanner ────────────────────────────────────────────────────

export interface ProviderSummaryBannerProps {
  provider: ProviderInfo
  /** Override the price label, e.g. "per arch". Defaults to "from €{price}". */
  priceSuffix?: string
}

export function ProviderSummaryBanner({
  provider,
  priceSuffix,
}: ProviderSummaryBannerProps) {
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
        {priceSuffix && (
          <span className="ml-0.5 text-xs font-medium text-warm-500">
            {priceSuffix}
          </span>
        )}
      </span>
    </div>
  )
}

// ─── WizardConfirmationScreen ─────────────────────────────────────────────────

export interface ConfirmationPill {
  icon: React.ReactNode
  text: string
}

export interface WizardConfirmationScreenProps {
  selectedProvider: ProviderInfo | null
  pills: ConfirmationPill[]
  nextSteps: string[]
  orderRef?: string
}

export function WizardConfirmationScreen({
  pills,
  nextSteps,
  orderRef = "ORD-2024-00142",
}: WizardConfirmationScreenProps) {
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
            {orderRef}
          </span>
          <OrderStatusBadge status="PENDING_PAYMENT" />
        </div>

        {/* Info pills */}
        {pills.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-warm-600">
            {pills.map((pill, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-3 py-1"
              >
                {pill.icon}
                {pill.text}
              </span>
            ))}
          </div>
        )}

        {/* Next steps */}
        <div className="mt-6 rounded-md border border-warm-200 bg-warm-50 p-4 text-left">
          <p className="text-sm font-semibold text-warm-800">
            What happens next?
          </p>
          <ul className="mt-2.5 space-y-1.5 text-xs text-warm-600">
            {nextSteps.map((stepText, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-500 text-[9px] font-bold text-white">
                  {i + 1}
                </span>
                {stepText}
              </li>
            ))}
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
