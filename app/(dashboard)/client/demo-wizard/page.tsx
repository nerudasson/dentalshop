"use client"

import { useState } from "react"
import WizardLayout, { type WizardStep } from "@/components/layout/wizard-layout"

// ─── Step content stubs ───────────────────────────────────────────────────────

function CategoryStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Select Prosthetic Category</h2>
      <p className="text-sm text-muted-foreground">
        Choose the type of dental prosthetic design you need. This determines the
        workflow and design parameters for your order.
      </p>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {["Crown", "Bridge", "Implant Crown", "Veneer"].map((cat) => (
          <div
            key={cat}
            className="cursor-pointer rounded-md border border-border bg-background p-4 text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailsStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Design Details</h2>
      <p className="text-sm text-muted-foreground">
        Specify the tooth number, material, shade, and any special design notes
        for the lab.
      </p>
      <div className="space-y-3">
        <div className="rounded-md bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
          Tooth chart — coming soon
        </div>
        <div className="rounded-md bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
          Material & shade selector — coming soon
        </div>
        <div className="rounded-md bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
          Design notes textarea — coming soon
        </div>
      </div>
    </div>
  )
}

function FilesStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Upload Scan Files</h2>
      <p className="text-sm text-muted-foreground">
        Attach your STL, PLY, or DICOM scan files. You can skip this step and
        upload files later from the order workspace.
      </p>
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        File upload dropzone — coming soon
      </div>
    </div>
  )
}

function ReviewStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Review Your Order</h2>
      <p className="text-sm text-muted-foreground">
        Confirm the details below before placing your order. You will be taken to
        the payment screen next.
      </p>
      <div className="rounded-md border border-border divide-y divide-border text-sm">
        {[
          ["Category", "Crown"],
          ["Tooth", "#14 (Upper Left First Molar)"],
          ["Material", "Full Zirconia"],
          ["Shade", "A2"],
          ["Files", "0 attached"],
          ["Design price", "$85.00"],
          ["Service fee (5%)", "$4.25"],
          ["Total charged", "$89.25"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-2.5">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const DEMO_STEPS: WizardStep[] = [
  {
    id: "category",
    title: "Category",
    description: "Choose the type of prosthetic design you need.",
    component: <CategoryStep />,
  },
  {
    id: "details",
    title: "Details",
    description: "Specify tooth number, material, shade, and design notes.",
    component: <DetailsStep />,
  },
  {
    id: "files",
    title: "Upload Files",
    description: "Attach scan files (STL, PLY, DICOM). You can skip this step.",
    isOptional: true,
    component: <FilesStep />,
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm your order details before proceeding to payment.",
    component: <ReviewStep />,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoWizardPage() {
  const [currentStep, setCurrentStep] = useState(0)

  function handleNext() {
    setCurrentStep((s) => Math.min(s + 1, DEMO_STEPS.length - 1))
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  function handleStepClick(index: number) {
    if (index < currentStep) {
      setCurrentStep(index)
    }
  }

  return (
    <WizardLayout
      title="New Prosthetics Order"
      steps={DEMO_STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={handleStepClick}
      showSaveDraft
      onSaveDraft={() => alert("Draft saved (demo)")}
      nextLabel="Place Order"
    />
  )
}
