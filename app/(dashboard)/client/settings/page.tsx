"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CheckCircle2,
  CreditCard,
  Plus,
  Lock,
  Building2,
  Sliders,
  FileText,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DesignParamsForm from "@/components/domain/design-params-form"
import { cn } from "@/lib/utils"
import type { DesignParameters } from "@/lib/types"

// ─── Dummy saved state ────────────────────────────────────────────────────────

const SAVED_DEFAULTS: DesignParameters = {
  marginSettings: "0.05mm",
  spacerThickness: "0.03mm",
  minimumThickness: "0.5mm",
  contactStrength: "Medium",
  occlusionType: "Light Contact",
  specialInstructions: "",
}

const DELIVERY_FORMATS = [
  { id: "stl", label: "STL" },
  { id: "ply", label: "PLY" },
  { id: "obj", label: "OBJ" },
  { id: "exocad", label: "exocad project" },
  { id: "3shape", label: "3Shape project" },
]

// ─── Simple Toast ─────────────────────────────────────────────────────────────

interface ToastState {
  visible: boolean
  message: string
  type: "success" | "error"
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg backdrop-blur-sm transition-all duration-300",
        toast.visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
        toast.type === "success"
          ? "border-[hsl(104,35%,70%)] bg-[hsl(104,22%,94%)] text-[hsl(104,35%,25%)]"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <X className="h-4 w-4 shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "success",
  })

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type })
    const t = setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      3500
    )
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return { toast, show, dismiss }
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-6 py-4">
        <div className="mt-0.5 rounded-lg p-2 bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientSettingsPage() {
  const { toast, show: showToast, dismiss } = useToast()

  // A. Business Information
  const [businessName, setBusinessName] = useState("Smith Dental Clinic")
  const [location, setLocation] = useState("12 Harley Street, London W1G 9PG")
  const [email, setEmail] = useState("admin@smithdental.co.uk")
  const [phone, setPhone] = useState("+44 20 7123 4567")

  // B. Design Preferences
  const [designParams, setDesignParams] = useState<DesignParameters>(SAVED_DEFAULTS)
  const [savedDesignParams, setSavedDesignParams] = useState<DesignParameters>(SAVED_DEFAULTS)

  // C. File Format Preferences
  const [formats, setFormats] = useState<Set<string>>(new Set(["stl", "exocad"]))

  // D. Payment Method — dummy saved card
  const [hasCard] = useState(true)
  const cardLast4 = "4242"
  const cardBrand = "Visa"
  const cardExpiry = "09/27"

  function toggleFormat(id: string) {
    setFormats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleSave() {
    // Simulate save — in production this would call a Server Action
    setSavedDesignParams(designParams)
    showToast("Settings saved successfully.")
  }

  function handleSaveAsDefault(values: DesignParameters) {
    setSavedDesignParams(values)
    showToast("Design defaults updated.")
  }

  return (
    <>
      <div className="space-y-8 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your practice profile, design defaults, and billing.
          </p>
        </div>

        {/* A. Business Information */}
        <Section
          icon={<Building2 className="h-4 w-4" />}
          title="Business Information"
          description="Your practice's public-facing profile and contact details."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Business Name
              </label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Smith Dental Clinic"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Location / Address
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 12 Harley Street, London"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Contact Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@clinic.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +44 20 7000 0000"
              />
            </div>
          </div>
        </Section>

        {/* B. Design Preferences */}
        <Section
          icon={<Sliders className="h-4 w-4" />}
          title="Design Preferences — Prosthetics Defaults"
          description="These defaults will pre-fill your order requirements when placing new prosthetics orders."
        >
          <DesignParamsForm
            values={designParams}
            onChange={setDesignParams}
            defaults={savedDesignParams}
            showSaveAsDefault
            onSaveAsDefault={handleSaveAsDefault}
          />
        </Section>

        {/* C. File Format Preferences */}
        <Section
          icon={<FileText className="h-4 w-4" />}
          title="File Format Preferences"
          description="Select which file formats you prefer to receive for completed prosthetics designs."
        >
          <div className="flex flex-wrap gap-3">
            {DELIVERY_FORMATS.map((fmt) => {
              const checked = formats.has(fmt.id)
              return (
                <label
                  key={fmt.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    checked
                      ? "border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] text-[hsl(var(--primary))]"
                      : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleFormat(fmt.id)}
                  />
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]"
                        : "border-input"
                    )}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white fill-current">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </span>
                  {fmt.label}
                </label>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Providers will be notified of your preferences. Availability may vary by provider.
          </p>
        </Section>

        {/* D. Payment Method */}
        <Section
          icon={<CreditCard className="h-4 w-4" />}
          title="Payment Method"
          description="Card on file used for order payments. Managed securely via Stripe."
        >
          {hasCard ? (
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {/* Card graphic */}
                <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-warm-100 to-muted shadow-sm">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {cardBrand} ···· {cardLast4}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Expires {cardExpiry}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--primary))] bg-[hsl(104,22%,94%)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--primary))]">
                  <CheckCircle2 className="h-3 w-3" />
                  Default
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast("Stripe integration coming soon.", "error")}
                >
                  Update Card
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No payment method on file</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Add a card to pay for orders without re-entering details each time.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => showToast("Stripe integration coming soon.", "error")}
                className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(104,22%,94%)]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-4">
            <Lock className="h-3 w-3 shrink-0" />
            Card details are stored securely by Stripe and never touch our servers.
          </div>
        </Section>
      </div>

      {/* Sticky Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
        <p className="mr-auto text-sm text-muted-foreground hidden sm:block">
          Changes are saved to your account.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setDesignParams(savedDesignParams)
          }}
        >
          Discard Changes
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(104,35%,30%)] px-8"
        >
          Save Settings
        </Button>
      </div>

      {/* Toast */}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  )
}
