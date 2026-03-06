"use client"

import React, { useState } from "react"
import {
  Settings2,
  Plus,
  Pencil,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ────────────────────────────────────────────────────────────────────

type FeeScope = "global" | "service_type" | "organization"
type FeeType = "client_fee" | "provider_commission"
type ChangeType = "created" | "updated" | "deleted"

interface FeeOverride {
  id: string
  scope: FeeScope
  target: string
  feeType: FeeType
  percentage: number
  minAmount: number | null
  maxAmount: number | null
  expiryDate: string | null
  createdBy: string
  createdAt: Date
}

interface AuditLogEntry {
  id: string
  date: Date
  changedBy: string
  changeType: ChangeType
  scope: string
  oldValue: string
  newValue: string
}

interface GlobalDefaults {
  clientFeePercent: string
  providerCommissionPercent: string
  clientMinAmount: string
  clientMaxAmount: string
  providerMinAmount: string
  providerMaxAmount: string
}

interface OverrideFormState {
  scopeType: "service_type" | "organization"
  serviceType: string
  orgTarget: string
  feeType: FeeType | ""
  percentage: string
  minAmount: string
  maxAmount: string
  expiryDate: string
  notes: string
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_OVERRIDES: FeeOverride[] = [
  {
    id: "ov_001",
    scope: "service_type",
    target: "Aligner Design",
    feeType: "client_fee",
    percentage: 4,
    minAmount: null,
    maxAmount: 50,
    expiryDate: null,
    createdBy: "admin@saga.dental",
    createdAt: new Date("2024-10-01"),
  },
  {
    id: "ov_002",
    scope: "service_type",
    target: "Prosthetics Design",
    feeType: "provider_commission",
    percentage: 12,
    minAmount: 5,
    maxAmount: null,
    expiryDate: "2025-06-30",
    createdBy: "admin@saga.dental",
    createdAt: new Date("2024-09-15"),
  },
  {
    id: "ov_003",
    scope: "organization",
    target: "ClearCAD Studio",
    feeType: "provider_commission",
    percentage: 10,
    minAmount: null,
    maxAmount: null,
    expiryDate: null,
    createdBy: "admin@saga.dental",
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "ov_004",
    scope: "organization",
    target: "SmilePro Labs",
    feeType: "client_fee",
    percentage: 3,
    minAmount: null,
    maxAmount: 30,
    expiryDate: "2025-03-31",
    createdBy: "admin@saga.dental",
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "ov_005",
    scope: "organization",
    target: "DentaDesign Munich",
    feeType: "provider_commission",
    percentage: 8,
    minAmount: 4,
    maxAmount: 100,
    expiryDate: null,
    createdBy: "support@saga.dental",
    createdAt: new Date("2025-01-10"),
  },
]

const DUMMY_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "al_001",
    date: new Date("2025-01-10T09:14:00"),
    changedBy: "support@saga.dental",
    changeType: "created",
    scope: "Org — DentaDesign Munich",
    oldValue: "—",
    newValue: "Provider commission 8%",
  },
  {
    id: "al_002",
    date: new Date("2024-12-01T11:30:00"),
    changedBy: "admin@saga.dental",
    changeType: "created",
    scope: "Org — SmilePro Labs",
    oldValue: "—",
    newValue: "Client fee 3% (max €30)",
  },
  {
    id: "al_003",
    date: new Date("2024-11-20T15:45:00"),
    changedBy: "admin@saga.dental",
    changeType: "updated",
    scope: "Global",
    oldValue: "Client fee 6%",
    newValue: "Client fee 5%",
  },
  {
    id: "al_004",
    date: new Date("2024-11-15T10:00:00"),
    changedBy: "admin@saga.dental",
    changeType: "deleted",
    scope: "Org — QuickSmile GmbH",
    oldValue: "Provider commission 9%",
    newValue: "—",
  },
  {
    id: "al_005",
    date: new Date("2024-11-01T08:22:00"),
    changedBy: "admin@saga.dental",
    changeType: "created",
    scope: "Org — ClearCAD Studio",
    oldValue: "—",
    newValue: "Provider commission 10%",
  },
  {
    id: "al_006",
    date: new Date("2024-10-18T14:10:00"),
    changedBy: "admin@saga.dental",
    changeType: "updated",
    scope: "Global",
    oldValue: "Provider commission 15%",
    newValue: "Provider commission 15% (min €8)",
  },
  {
    id: "al_007",
    date: new Date("2024-10-01T09:05:00"),
    changedBy: "admin@saga.dental",
    changeType: "created",
    scope: "Service — Aligner Design",
    oldValue: "—",
    newValue: "Client fee 4% (max €50)",
  },
  {
    id: "al_008",
    date: new Date("2024-09-30T16:55:00"),
    changedBy: "admin@saga.dental",
    changeType: "updated",
    scope: "Service — Prosthetics Design",
    oldValue: "Provider commission 15%",
    newValue: "Provider commission 12% (min €5)",
  },
  {
    id: "al_009",
    date: new Date("2024-09-15T10:30:00"),
    changedBy: "admin@saga.dental",
    changeType: "created",
    scope: "Service — Prosthetics Design",
    oldValue: "—",
    newValue: "Provider commission 15%",
  },
  {
    id: "al_010",
    date: new Date("2024-09-01T12:00:00"),
    changedBy: "admin@saga.dental",
    changeType: "created",
    scope: "Global",
    oldValue: "—",
    newValue: "Client fee 6%, Provider commission 15%",
  },
]

const DUMMY_ORGS = [
  "ClearCAD Studio",
  "SmilePro Labs",
  "DentaDesign Munich",
  "NovaDental Warsaw",
  "ArcForm Berlin",
  "PrecisionCAD Prague",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ScopeBadge({ scope }: { scope: FeeScope }) {
  if (scope === "global") {
    return (
      <Badge variant="secondary" className="font-normal text-xs">
        Global
      </Badge>
    )
  }
  if (scope === "service_type") {
    return (
      <Badge
        variant="outline"
        className="border-[hsl(169_66%_34%)] text-[hsl(169_66%_34%)] font-normal text-xs"
      >
        Service Type
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-[hsl(104_35%_36%)] text-[hsl(104_35%_36%)] font-normal text-xs"
    >
      Organization
    </Badge>
  )
}

function FeeTypeBadge({ feeType }: { feeType: FeeType }) {
  if (feeType === "client_fee") {
    return (
      <span className="text-sm text-foreground">Client Service Fee</span>
    )
  }
  return (
    <span className="text-sm text-foreground">Provider Commission</span>
  )
}

function ChangeTypeBadge({ changeType }: { changeType: ChangeType }) {
  if (changeType === "created") {
    return (
      <Badge
        variant="outline"
        className="border-[hsl(166_49%_46%)] text-[hsl(166_49%_46%)] font-normal text-xs"
      >
        Created
      </Badge>
    )
  }
  if (changeType === "updated") {
    return (
      <Badge
        variant="outline"
        className="border-[hsl(35_100%_47%)] text-[hsl(35_100%_47%)] font-normal text-xs"
      >
        Updated
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="font-normal text-xs">
      Deleted
    </Badge>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

function FieldRow({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[180px_1fr] sm:items-center">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-col gap-1">
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

function AmountInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground">
        €
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-7"
        placeholder={placeholder ?? "No limit"}
      />
    </div>
  )
}

function PercentInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative flex items-center">
      <Input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8"
        placeholder={placeholder ?? "0"}
      />
      <span className="pointer-events-none absolute right-3 text-sm text-muted-foreground">
        %
      </span>
    </div>
  )
}

// ─── Create Override Modal ─────────────────────────────────────────────────────

const BLANK_FORM: OverrideFormState = {
  scopeType: "service_type",
  serviceType: "",
  orgTarget: "",
  feeType: "",
  percentage: "",
  minAmount: "",
  maxAmount: "",
  expiryDate: "",
  notes: "",
}

function CreateOverrideModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (form: OverrideFormState) => void
}) {
  const [form, setForm] = useState<OverrideFormState>(BLANK_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof OverrideFormState, string>>>({})

  function set<K extends keyof OverrideFormState>(key: K, value: OverrideFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof OverrideFormState, string>> = {}
    if (form.scopeType === "service_type" && !form.serviceType) {
      e.serviceType = "Select a service type."
    }
    if (form.scopeType === "organization" && !form.orgTarget) {
      e.orgTarget = "Select an organization."
    }
    if (!form.feeType) e.feeType = "Select a fee type."
    if (!form.percentage || Number(form.percentage) <= 0) {
      e.percentage = "Enter a percentage greater than 0."
    }
    if (Number(form.percentage) > 100) {
      e.percentage = "Percentage cannot exceed 100."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (validate()) onSave(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Create Fee Override
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Scope type */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Scope Type
              </p>
              <div className="flex gap-3">
                {(["service_type", "organization"] as const).map((s) => (
                  <label
                    key={s}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm transition-colors",
                      form.scopeType === s
                        ? "border-[hsl(104_35%_36%)] bg-[hsl(104_22%_96%)] text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <input
                      type="radio"
                      name="scopeType"
                      value={s}
                      checked={form.scopeType === s}
                      onChange={() => set("scopeType", s)}
                      className="accent-[hsl(104_35%_36%)]"
                    />
                    {s === "service_type" ? "Service Type" : "Organization"}
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional target */}
            {form.scopeType === "service_type" ? (
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  Service Type
                </p>
                <Select
                  value={form.serviceType}
                  onValueChange={(v) => set("serviceType", v)}
                >
                  <SelectTrigger
                    className={cn(errors.serviceType && "border-destructive")}
                  >
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prosthetics">
                      Prosthetics Design
                    </SelectItem>
                    <SelectItem value="aligner">Aligner Design</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.serviceType}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  Organization
                </p>
                <Select
                  value={form.orgTarget}
                  onValueChange={(v) => set("orgTarget", v)}
                >
                  <SelectTrigger
                    className={cn(errors.orgTarget && "border-destructive")}
                  >
                    <SelectValue placeholder="Search and select a provider org" />
                  </SelectTrigger>
                  <SelectContent>
                    {DUMMY_ORGS.map((org) => (
                      <SelectItem key={org} value={org}>
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.orgTarget && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.orgTarget}
                  </p>
                )}
              </div>
            )}

            {/* Fee type */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                Fee Type
              </p>
              <Select
                value={form.feeType}
                onValueChange={(v) => set("feeType", v as FeeType)}
              >
                <SelectTrigger
                  className={cn(errors.feeType && "border-destructive")}
                >
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_fee">
                    Client Service Fee
                  </SelectItem>
                  <SelectItem value="provider_commission">
                    Provider Commission
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.feeType && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.feeType}
                </p>
              )}
            </div>

            {/* Percentage */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                Percentage
              </p>
              <PercentInput
                value={form.percentage}
                onChange={(v) => set("percentage", v)}
              />
              {errors.percentage && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.percentage}
                </p>
              )}
            </div>

            {/* Min / Max */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  Min Amount{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </p>
                <AmountInput
                  value={form.minAmount}
                  onChange={(v) => set("minAmount", v)}
                />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">
                  Max Amount{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </p>
                <AmountInput
                  value={form.maxAmount}
                  onChange={(v) => set("maxAmount", v)}
                />
              </div>
            </div>

            {/* Expiry date */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                Expiry Date{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank for no expiry. Override deactivates automatically on
                this date.
              </p>
            </div>

            {/* Notes */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="Add context or reason for this override…"
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Override</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminFeesPage() {
  // Global defaults state
  const [globals, setGlobals] = useState<GlobalDefaults>({
    clientFeePercent: "5",
    providerCommissionPercent: "15",
    clientMinAmount: "",
    clientMaxAmount: "",
    providerMinAmount: "8",
    providerMaxAmount: "",
  })
  const [globalsSaved, setGlobalsSaved] = useState(false)

  // Overrides state
  const [overrides, setOverrides] = useState<FeeOverride[]>(DUMMY_OVERRIDES)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Audit log filters
  const [auditFilterType, setAuditFilterType] = useState<"all" | ChangeType>("all")
  const [auditFilterFrom, setAuditFilterFrom] = useState("")
  const [auditFilterTo, setAuditFilterTo] = useState("")
  const [auditExpanded, setAuditExpanded] = useState(true)

  // ── Global defaults handlers ──
  function handleGlobalsUpdate() {
    setGlobalsSaved(true)
    setTimeout(() => setGlobalsSaved(false), 3000)
  }

  function setGlobal<K extends keyof GlobalDefaults>(key: K, value: string) {
    setGlobals((prev) => ({ ...prev, [key]: value }))
    setGlobalsSaved(false)
  }

  // ── Override handlers ──
  function handleCreateOverride(form: OverrideFormState) {
    const target =
      form.scopeType === "service_type"
        ? form.serviceType === "prosthetics"
          ? "Prosthetics Design"
          : "Aligner Design"
        : form.orgTarget

    const newOverride: FeeOverride = {
      id: `ov_${Date.now()}`,
      scope: form.scopeType,
      target,
      feeType: form.feeType as FeeType,
      percentage: Number(form.percentage),
      minAmount: form.minAmount ? Number(form.minAmount) : null,
      maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
      expiryDate: form.expiryDate || null,
      createdBy: "admin@saga.dental",
      createdAt: new Date(),
    }
    setOverrides((prev) => [newOverride, ...prev])
    setShowCreateModal(false)
  }

  function handleDeleteOverride(id: string) {
    setOverrides((prev) => prev.filter((o) => o.id !== id))
    setDeleteConfirmId(null)
  }

  // ── Audit log filter ──
  const filteredAuditLog = DUMMY_AUDIT_LOG.filter((entry) => {
    if (auditFilterType !== "all" && entry.changeType !== auditFilterType) {
      return false
    }
    if (auditFilterFrom) {
      const from = new Date(auditFilterFrom)
      if (entry.date < from) return false
    }
    if (auditFilterTo) {
      const to = new Date(auditFilterTo)
      to.setHours(23, 59, 59)
      if (entry.date > to) return false
    }
    return true
  })

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Fee Configuration
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform fees and commission rates. Changes take effect on new
          orders only — existing orders are not affected.
        </p>
      </div>

      {/* ── Section 1: Global Defaults ──────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader
          title="Global Defaults"
          description="Baseline fee rates applied when no more-specific override matches."
        />

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Client Service Fee column */}
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Client Service Fee
              </p>
              <div className="flex flex-col gap-4">
                <FieldRow label="Percentage" hint="Added on top of the design price at checkout.">
                  <PercentInput
                    value={globals.clientFeePercent}
                    onChange={(v) => setGlobal("clientFeePercent", v)}
                  />
                </FieldRow>
                <FieldRow label="Minimum amount" hint="Minimum charged regardless of % calculation.">
                  <AmountInput
                    value={globals.clientMinAmount}
                    onChange={(v) => setGlobal("clientMinAmount", v)}
                    placeholder="No minimum"
                  />
                </FieldRow>
                <FieldRow label="Maximum cap" hint="Fee never exceeds this amount.">
                  <AmountInput
                    value={globals.clientMaxAmount}
                    onChange={(v) => setGlobal("clientMaxAmount", v)}
                    placeholder="No cap"
                  />
                </FieldRow>
              </div>
            </div>

            {/* Provider Commission column */}
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Provider Commission
              </p>
              <div className="flex flex-col gap-4">
                <FieldRow label="Percentage" hint="Deducted from design price before payout.">
                  <PercentInput
                    value={globals.providerCommissionPercent}
                    onChange={(v) =>
                      setGlobal("providerCommissionPercent", v)
                    }
                  />
                </FieldRow>
                <FieldRow label="Minimum amount" hint="Minimum deducted regardless of % calculation.">
                  <AmountInput
                    value={globals.providerMinAmount}
                    onChange={(v) => setGlobal("providerMinAmount", v)}
                    placeholder="No minimum"
                  />
                </FieldRow>
                <FieldRow label="Maximum cap" hint="Commission never exceeds this amount.">
                  <AmountInput
                    value={globals.providerMaxAmount}
                    onChange={(v) => setGlobal("providerMaxAmount", v)}
                    placeholder="No cap"
                  />
                </FieldRow>
              </div>
            </div>
          </div>

          {/* Example calculation */}
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              Example calculation at current rates
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3">
              {(() => {
                const designPrice = 85
                const clientRate = Number(globals.clientFeePercent) / 100 || 0
                const providerRate =
                  Number(globals.providerCommissionPercent) / 100 || 0
                const clientTotal = designPrice * (1 + clientRate)
                const providerPayout = designPrice * (1 - providerRate)
                const platformFee = clientTotal - providerPayout
                return (
                  <>
                    <div className="text-muted-foreground">
                      Design price:{" "}
                      <span className="font-medium text-foreground">
                        €{designPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Client pays:{" "}
                      <span className="font-medium text-foreground">
                        €{clientTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Provider receives:{" "}
                      <span className="font-medium text-foreground">
                        €{providerPayout.toFixed(2)}
                      </span>
                    </div>
                    <div className="sm:col-span-3 text-muted-foreground">
                      Platform net:{" "}
                      <span className="font-medium text-[hsl(104_35%_36%)]">
                        €{platformFee.toFixed(2)}
                      </span>{" "}
                      <span className="text-xs">
                        ({((platformFee / clientTotal) * 100).toFixed(1)}%
                        effective take rate)
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleGlobalsUpdate}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              Update Global Defaults
            </Button>
            {globalsSaved && (
              <span className="flex items-center gap-1.5 text-sm text-[hsl(166_49%_46%)]">
                <CheckCircle2 className="h-4 w-4" />
                Saved successfully
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 2: Fee Overrides ─────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Fee Overrides
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Override global defaults for specific service types or
              organizations.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Override
          </Button>
        </div>

        {/* Cascade priority explanation */}
        <div className="mb-5 flex gap-3 rounded-lg border border-[hsl(169_66%_34%/0.3)] bg-[hsl(169_66%_34%/0.05)] p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(169_66%_34%)]" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Cascade priority:</span> Overrides are
            applied in priority order:{" "}
            <span className="font-medium text-[hsl(104_35%_36%)]">
              Organization
            </span>{" "}
            &gt;{" "}
            <span className="font-medium text-[hsl(169_66%_34%)]">
              Service Type
            </span>{" "}
            &gt;{" "}
            <span className="font-medium text-muted-foreground">Global</span>.
            The most specific matching override wins.
          </p>
        </div>

        {/* Overrides table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Fee Type
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Percentage
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Min / Max
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overrides.map((override) => (
                  <tr
                    key={override.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <ScopeBadge scope={override.scope} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {override.target}
                    </td>
                    <td className="px-4 py-3">
                      <FeeTypeBadge feeType={override.feeType} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      {override.percentage}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {override.minAmount !== null
                        ? `€${override.minAmount}`
                        : "—"}{" "}
                      /{" "}
                      {override.maxAmount !== null
                        ? `€${override.maxAmount}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {override.expiryDate ? (
                        <span
                          className={cn(
                            "text-sm",
                            new Date(override.expiryDate) < new Date()
                              ? "text-destructive"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDate(new Date(override.expiryDate))}
                          {new Date(override.expiryDate) < new Date() && (
                            <span className="ml-1 text-xs font-medium text-destructive">
                              (expired)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {override.createdBy}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirmId === override.id ? (
                          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            <span className="text-xs text-destructive">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDeleteOverride(override.id)}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingOverrideId(override.id)
                              }
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmId(override.id)
                              }
                              className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {overrides.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No overrides configured. Global defaults apply to all
                      orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {overrides.length > 0 && (
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {overrides.length} override
              {overrides.length !== 1 ? "s" : ""} active
            </div>
          )}
        </div>

        {/* Edit banner (placeholder — would open same modal pre-filled) */}
        {editingOverrideId && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-[hsl(35_100%_47%/0.3)] bg-[hsl(35_100%_47%/0.08)] px-4 py-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-[hsl(35_100%_47%)]" />
            <span className="text-foreground">
              Edit functionality would open a pre-filled version of the Create
              Override modal.
            </span>
            <button
              onClick={() => setEditingOverrideId(null)}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* ── Section 3: Audit Log ─────────────────────────────────────────────── */}
      <section className="mb-10">
        {/* Collapsible header */}
        <button
          className="mb-6 flex w-full items-center justify-between text-left"
          onClick={() => setAuditExpanded((v) => !v)}
        >
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Audit Log
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Complete history of fee configuration changes.
            </p>
          </div>
          {auditExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {auditExpanded && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              <div className="w-44">
                <Select
                  value={auditFilterType}
                  onValueChange={(v) =>
                    setAuditFilterType(v as "all" | ChangeType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Change type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All changes</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From</span>
                <Input
                  type="date"
                  value={auditFilterFrom}
                  onChange={(e) => setAuditFilterFrom(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">To</span>
                <Input
                  type="date"
                  value={auditFilterTo}
                  onChange={(e) => setAuditFilterTo(e.target.value)}
                  className="w-36"
                />
              </div>
              {(auditFilterType !== "all" ||
                auditFilterFrom ||
                auditFilterTo) && (
                <button
                  onClick={() => {
                    setAuditFilterType("all")
                    setAuditFilterFrom("")
                    setAuditFilterTo("")
                  }}
                  className="text-sm text-[hsl(104_35%_36%)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Audit table */}
            <div className="rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Changed By
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Change Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Scope
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Old Value
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        New Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAuditLog.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDateTime(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {entry.changedBy}
                        </td>
                        <td className="px-4 py-3">
                          <ChangeTypeBadge changeType={entry.changeType} />
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {entry.scope}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {entry.oldValue}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {entry.newValue}
                        </td>
                      </tr>
                    ))}
                    {filteredAuditLog.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          No entries match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredAuditLog.length > 0 && (
                <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  Showing {filteredAuditLog.length} of {DUMMY_AUDIT_LOG.length}{" "}
                  entries
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Create Override Modal */}
      {showCreateModal && (
        <CreateOverrideModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateOverride}
        />
      )}
    </div>
  )
}
