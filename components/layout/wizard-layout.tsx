"use client"

import React from "react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardStep {
  id: string
  title: string
  description?: string
  isOptional?: boolean
  component: React.ReactNode
}

interface WizardLayoutProps {
  steps: WizardStep[]
  /** 0-based index of the current step */
  currentStep: number
  onNext: () => void
  onBack: () => void
  /** Called when a completed step dot is clicked — allows jumping back */
  onStepClick?: (index: number) => void
  isNextDisabled?: boolean
  showSaveDraft?: boolean
  onSaveDraft?: () => void
  title: string
  /** Button label on the final step. Defaults to "Complete". */
  nextLabel?: string
}

// ─── WizardLayout ─────────────────────────────────────────────────────────────

export default function WizardLayout({
  steps,
  currentStep,
  onNext,
  onBack,
  onStepClick,
  isNextDisabled = false,
  showSaveDraft = false,
  onSaveDraft,
  title,
  nextLabel = "Complete",
}: WizardLayoutProps) {
  const isLastStep = currentStep === steps.length - 1
  const activeStep = steps[currentStep]

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Title */}
      <h1 className="mb-6 text-2xl font-semibold text-foreground">{title}</h1>

      {/* Step indicator row */}
      <div className="mb-8 flex items-start">
        {steps.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isLast = i === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                {isDone ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(i)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      "bg-primary text-primary-foreground",
                      onStepClick
                        ? "cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        : "cursor-default"
                    )}
                    aria-label={`Go back to step ${i + 1}: ${step.title}`}
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                ) : (
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      isActive
                        ? "border-2 border-primary bg-background text-primary"
                        : "border-2 border-muted bg-background text-muted-foreground"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {i + 1}
                  </div>
                )}

                {/* Step label — hidden on mobile, visible sm+ */}
                <div className="hidden sm:flex flex-col items-center gap-0.5 text-center max-w-[80px]">
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-tight",
                      isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.isOptional && (
                    <span className="text-[9px] text-muted-foreground leading-tight">
                      (Optional)
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className={cn(
                    "mt-4 h-[2px] flex-1",
                    isDone ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step description */}
      {activeStep.description && (
        <p className="mb-4 text-sm text-muted-foreground">{activeStep.description}</p>
      )}

      {/* Step content — key forces remount on step change, triggering animation */}
      <div
        key={currentStep}
        className="animate-step-in rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        {activeStep.component}
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {/* Back — hidden on step 0 */}
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        {/* Save Draft + Next/Complete */}
        <div className="flex items-center gap-3">
          {showSaveDraft && (
            <Button variant="ghost" onClick={onSaveDraft}>
              Save Draft
            </Button>
          )}
          <Button onClick={onNext} disabled={isNextDisabled}>
            {isLastStep ? nextLabel : "Continue"}
            {!isLastStep && <ChevronRight className="ml-1.5 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
