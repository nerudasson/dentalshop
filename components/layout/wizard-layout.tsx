import React from "react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardLayoutProps {
  children: React.ReactNode
  /** Ordered list of step names */
  steps: string[]
  /** 0-based index of the current step */
  currentStep: number
  /** Wizard title displayed at the top */
  title: string
  className?: string
}

// ─── WizardLayout ─────────────────────────────────────────────────────────────

/**
 * Multi-step form wrapper used by the New Order wizards.
 * Provides a consistent header with step indicators and a centred content area.
 *
 * Not yet connected to any real wizard — stub ready for Tier 3 page build.
 */
export default function WizardLayout({
  children,
  steps,
  currentStep,
  title,
  className,
}: WizardLayoutProps) {
  return (
    <div className={cn("mx-auto max-w-2xl w-full", className)}>
      {/* Title */}
      <h1 className="mb-6 text-2xl font-semibold text-foreground">{title}</h1>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-0">
        {steps.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isLast = i === steps.length - 1

          return (
            <React.Fragment key={step}>
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "border-2 border-primary bg-background text-primary",
                    !isDone && !isActive && "border-2 border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mb-4 h-[2px] flex-1",
                    isDone ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Content */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}
