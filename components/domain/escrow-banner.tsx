import { CheckCircle2, Lock, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EscrowBannerProps {
  variant: "payment" | "in_escrow" | "released"
  /** Only used for the 'in_escrow' variant. */
  escrowDaysRemaining?: number
  className?: string
}

const HOW_IT_WORKS = [
  { step: 1, text: "Pay securely at checkout" },
  { step: 2, text: "Funds held until you approve the design" },
  { step: 3, text: "Release payment on approval" },
]

export default function EscrowBanner({
  variant,
  escrowDaysRemaining,
  className,
}: EscrowBannerProps) {
  if (variant === "payment") {
    return (
      <div
        className={cn(
          "rounded-md border-l-4 border-teal-500 bg-teal-50 p-4",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warm-800">
              Your payment is protected
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Funds are held securely until you approve the completed design.
            </p>
            <ol className="mt-3 flex flex-col gap-1.5">
              {HOW_IT_WORKS.map(({ step, text }) => (
                <li key={step} className="flex items-center gap-2 text-xs text-warm-800">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white text-[10px] font-bold leading-none">
                    {step}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "in_escrow") {
    const days = escrowDaysRemaining ?? 0
    // Auto-release window is 7 days; calculate progress
    const autoReleaseDays = 7
    const elapsed = Math.max(0, autoReleaseDays - days)
    const progressPct = Math.min(100, Math.round((elapsed / autoReleaseDays) * 100))

    return (
      <div
        className={cn(
          "rounded-md border-l-4 border-teal-500 bg-teal-50 p-4",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warm-800">
              Payment held securely
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Funds will be released to the provider once you approve the design.
            </p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>Payment received</span>
                <span>Auto-release in {days} day{days !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // released
  return (
    <div
      className={cn(
        "rounded-md border-l-4 border-sage-500 bg-sage-50 p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-500" />
        <div>
          <p className="text-sm font-semibold text-warm-800">
            Payment released to provider
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Thank you for approving the design. The transaction is complete.
          </p>
        </div>
      </div>
    </div>
  )
}
