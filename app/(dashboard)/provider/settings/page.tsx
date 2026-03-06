"use client"

import { useState } from "react"
import { Building2, Cpu, ImageIcon, Bell, ChevronRight, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import FileUpload from "@/components/domain/file-upload"
import type { FileInfo } from "@/lib/types"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type CadSoftware = "exocad" | "3Shape" | "DentalCAD" | "Other"
type AlignerSoftware = "SureSmile" | "Archform" | "OnyxCeph" | "uLab" | "Other"
type Language = "English" | "German" | "French" | "Spanish" | "Italian" | "Portuguese"

interface NotificationPrefs {
  newOrders: boolean
  messages: boolean
  reviews: boolean
}

interface ProviderSettings {
  businessName: string
  location: string
  description: string
  contactEmail: string
  phone: string
  website: string
  cadSoftware: CadSoftware[]
  otherCadSoftware: string
  alignerSoftware: AlignerSoftware[]
  otherAlignerSoftware: string
  alignerServiceActive: boolean
  categories: string[]
  language: Language
  notifications: NotificationPrefs
}

// ─── Dummy initial values ─────────────────────────────────────────────────────

const INITIAL: ProviderSettings = {
  businessName: "ClearCAD Studio",
  location: "Munich, Germany",
  description:
    "Specialist CAD design studio with 8 years of experience in prosthetic and aligner design. We work with practices across Europe delivering precision digital restorations.",
  contactEmail: "hello@clearcad.studio",
  phone: "+49 89 1234 5678",
  website: "https://clearcad.studio",
  cadSoftware: ["exocad", "3Shape"],
  otherCadSoftware: "",
  alignerSoftware: ["SureSmile", "Archform"],
  otherAlignerSoftware: "",
  alignerServiceActive: true,
  categories: ["Crowns", "Bridges", "Implant Abutments", "Aligner Design"],
  language: "English",
  notifications: { newOrders: true, messages: true, reviews: false },
}

const CAD_SOFTWARE: CadSoftware[] = ["exocad", "3Shape", "DentalCAD", "Other"]

const ALIGNER_SOFTWARE: AlignerSoftware[] = [
  "SureSmile",
  "Archform",
  "OnyxCeph",
  "uLab",
  "Other",
]

const MVP_CATEGORIES = [
  "Crowns",
  "Bridges",
  "Inlays/Onlays",
  "Implant Abutments",
  "Partial Frameworks",
  "Veneers",
  "Aligner Design",
]

const LANGUAGES: Language[] = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Portuguese",
]

// ─── Dummy portfolio thumbnails ───────────────────────────────────────────────

interface PortfolioItem {
  id: string
  name: string
}

const DUMMY_PORTFOLIO: PortfolioItem[] = [
  { id: "p1", name: "full-arch-lower.jpg" },
  { id: "p2", name: "crown-molar.jpg" },
  { id: "p3", name: "bridge-3unit.jpg" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ede8] text-[#4a7c59]">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        className={[
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#4a7c59]" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </div>
    </button>
  )
}

function PillToggle({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-[#4a7c59] bg-[#f3f7f3] text-[#4a7c59]"
          : "border-border bg-background text-foreground hover:border-[#4a7c59]/60",
      ].join(" ")}
    >
      {label}
    </button>
  )
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#4a7c59] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderSettingsPage() {
  const [settings, setSettings] = useState<ProviderSettings>(INITIAL)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(DUMMY_PORTFOLIO)
  const [portfolioFiles, setPortfolioFiles] = useState<FileInfo[]>([])
  const [toastVisible, setToastVisible] = useState(false)

  function patch(update: Partial<ProviderSettings>) {
    setSettings((prev) => ({ ...prev, ...update }))
  }

  function patchNotif(key: keyof NotificationPrefs, val: boolean) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: val },
    }))
  }

  function toggleCad(sw: CadSoftware) {
    const next = settings.cadSoftware.includes(sw)
      ? settings.cadSoftware.filter((s) => s !== sw)
      : [...settings.cadSoftware, sw]
    patch({ cadSoftware: next })
  }

  function toggleAligner(sw: AlignerSoftware) {
    const next = settings.alignerSoftware.includes(sw)
      ? settings.alignerSoftware.filter((s) => s !== sw)
      : [...settings.alignerSoftware, sw]
    patch({ alignerSoftware: next })
  }

  function toggleCategory(cat: string) {
    const next = settings.categories.includes(cat)
      ? settings.categories.filter((c) => c !== cat)
      : [...settings.categories, cat]
    patch({ categories: next })
  }

  function removePortfolioItem(id: string) {
    setPortfolioItems((prev) => prev.filter((p) => p.id !== id))
  }

  function handlePortfolioFilesChange(files: FileInfo[]) {
    setPortfolioFiles(files)
    // In production: upload to R2 then append to portfolioItems
  }

  function handleSave() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const totalPortfolio = portfolioItems.length + portfolioFiles.length
  const atPortfolioLimit = totalPortfolio >= 10

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Settings</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Studio Profile</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Studio Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your public profile, capabilities, and notification preferences.
        </p>
      </div>

      <div className="space-y-5">

        {/* ── A. Business Information ──────────────────────────────────────── */}
        <Section
          icon={<Building2 className="h-4 w-4" />}
          title="Business Information"
          description="Shown on your public provider profile and order listings."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel label="Business Name" />
                <Input
                  value={settings.businessName}
                  onChange={(e) => patch({ businessName: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel label="Location" hint="City, Country" />
                <Input
                  value={settings.location}
                  onChange={(e) => patch({ location: e.target.value })}
                  placeholder="e.g. Munich, Germany"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                label="Studio Description"
                hint="Briefly describe your experience and specialities. Shown to clients when selecting a provider."
              />
              <textarea
                value={settings.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={4}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel label="Contact Email" />
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel label="Phone" />
                <Input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel label="Website" />
                <Input
                  type="url"
                  value={settings.website}
                  onChange={(e) => patch({ website: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── B. Design Capabilities ────────────────────────────────────────── */}
        <Section
          icon={<Cpu className="h-4 w-4" />}
          title="Design Capabilities"
          description="Help clients understand your toolchain and service scope."
        >
          <div className="space-y-6">
            <div>
              <FieldLabel
                label="CAD Software"
                hint="Select all software you use for prosthetic design."
              />
              <div className="flex flex-wrap gap-2">
                {CAD_SOFTWARE.map((sw) => (
                  <PillToggle
                    key={sw}
                    label={sw}
                    selected={settings.cadSoftware.includes(sw)}
                    onClick={() => toggleCad(sw)}
                  />
                ))}
              </div>
              {settings.cadSoftware.includes("Other") && (
                <div className="mt-3">
                  <Input
                    placeholder="Enter software name…"
                    value={settings.otherCadSoftware}
                    onChange={(e) => patch({ otherCadSoftware: e.target.value })}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>

            {settings.alignerServiceActive && (
              <div>
                <FieldLabel
                  label="Aligner Planning Software"
                  hint="Select all software you use for aligner treatment planning."
                />
                <div className="flex flex-wrap gap-2">
                  {ALIGNER_SOFTWARE.map((sw) => (
                    <PillToggle
                      key={sw}
                      label={sw}
                      selected={settings.alignerSoftware.includes(sw)}
                      onClick={() => toggleAligner(sw)}
                    />
                  ))}
                </div>
                {settings.alignerSoftware.includes("Other") && (
                  <div className="mt-3">
                    <Input
                      placeholder="Enter software name…"
                      value={settings.otherAlignerSoftware}
                      onChange={(e) => patch({ otherAlignerSoftware: e.target.value })}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div>
              <FieldLabel
                label="Product Categories Offered"
                hint="Select the categories you actively design. Clients filter providers by category."
              />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {MVP_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-border accent-[#4a7c59]"
                    />
                    <span className="text-sm text-foreground">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── C. Portfolio ──────────────────────────────────────────────────── */}
        <Section
          icon={<ImageIcon className="h-4 w-4" />}
          title="Portfolio & Sample Work"
          description={`Showcase your best designs. Up to 10 images — ${totalPortfolio}/10 uploaded.`}
        >
          <div className="space-y-5">
            {portfolioItems.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Uploaded samples</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8ede8] to-[#d0dcd0]">
                        <ImageIcon className="h-6 w-6 text-[#4a7c59]/60" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="rounded-md bg-white/90 p-1.5 text-destructive"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!atPortfolioLimit ? (
              <FileUpload
                acceptedFormats={[".jpg", ".jpeg", ".png", ".webp"]}
                maxFiles={10 - portfolioItems.length}
                maxFileSize={10 * 1024 * 1024}
                files={portfolioFiles}
                onFilesChange={handlePortfolioFilesChange}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 py-5 text-center text-sm text-muted-foreground">
                Maximum of 10 portfolio images reached.{" "}
                <button
                  type="button"
                  onClick={() => removePortfolioItem(portfolioItems[0]?.id)}
                  className="underline hover:text-foreground"
                >
                  Remove one to upload more.
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* ── D. General Settings ───────────────────────────────────────────── */}
        <Section
          icon={<Bell className="h-4 w-4" />}
          title="General Settings"
          description="Language preferences and email notification controls."
        >
          <div className="space-y-6">
            <div>
              <FieldLabel
                label="Preferred Communication Language"
                hint="Used for client messages and platform emails."
              />
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <PillToggle
                    key={lang}
                    label={lang}
                    selected={settings.language === lang}
                    onClick={() => patch({ language: lang })}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Email Notifications</p>
              <div className="space-y-3">
                <Toggle
                  checked={settings.notifications.newOrders}
                  onChange={(v) => patchNotif("newOrders", v)}
                  label="New Orders"
                  description="Notify me when a new order is assigned to my queue."
                />
                <Separator />
                <Toggle
                  checked={settings.notifications.messages}
                  onChange={(v) => patchNotif("messages", v)}
                  label="Messages"
                  description="Notify me when a client sends a new message."
                />
                <Separator />
                <Toggle
                  checked={settings.notifications.reviews}
                  onChange={(v) => patchNotif("reviews", v)}
                  label="Reviews"
                  description="Notify me when a client leaves a review."
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Payment settings link card ────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Payout & Payment Setup</p>
              <p className="text-xs text-muted-foreground">
                Manage your Stripe Connect account and view payout history.
              </p>
            </div>
          </div>
          <Link href="/provider/settings/payments">
            <Button variant="outline" size="sm" className="gap-1">
              Open
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* ── Save ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Profile updates are visible to clients immediately.
          </p>
          <Button
            onClick={handleSave}
            className="bg-[#4a7c59] text-white hover:bg-[#3d6849]"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Toast visible={toastVisible} message="Settings saved successfully." />
    </div>
  )
}
