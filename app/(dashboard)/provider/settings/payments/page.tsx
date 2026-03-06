"use client"

import { useState } from "react"
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Landmark,
  Percent,
  Clock,
  ArrowUpRight,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import EscrowBanner from "@/components/domain/escrow-banner"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type StripeStatus = "not_connected" | "pending" | "connected"

interface PayoutRecord {
  id: string
  date: string
  orderRef: string
  gross: number
  commission: number
  net: number
  currency: string
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_PAYOUTS: PayoutRecord[] = [
  {
    id: "po_1",
    date: "2026-03-04",
    orderRef: "ORD-2026-00138",
    gross: 320,
    commission: 44.8,
    net: 275.2,
    currency: "€",
  },
  {
    id: "po_2",
    date: "2026-02-28",
    orderRef: "ORD-2026-00131",
    gross: 280,
    commission: 39.2,
    net: 240.8,
    currency: "€",
  },
  {
    id: "po_3",
    date: "2026-02-21",
    orderRef: "ORD-2026-00124",
    gross: 560,
    commission: 78.4,
    net: 481.6,
    currency: "€",
  },
  {
    id: "po_4",
    date: "2026-02-14",
    orderRef: "ORD-2026-00117",
    gross: 420,
    commission: 58.8,
    net: 361.2,
    currency: "€",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function fmt(amount: number, currency: string) {
  return `${currency}${amount.toFixed(2)}`
}

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

// ─── Stripe status cards ──────────────────────────────────────────────────────

function StripeNotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Landmark className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">No payout account connected</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a bank account via Stripe to receive payouts for completed orders.
            Stripe Connect is the industry-standard payment platform used by millions of
            marketplaces — your banking details are stored securely by Stripe, not by us.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {[
              "Payouts sent directly to your bank, typically within 2–3 business days",
              "Full transaction history available in your Stripe dashboard",
              "Supports SEPA transfers (EU), BACS (UK), ACH (US), and more",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4a7c59]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button
        onClick={onConnect}
        size="lg"
        className="w-full bg-[#4a7c59] text-white hover:bg-[#3d6849] sm:w-auto"
      >
        Set Up Payouts with Stripe
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
      <p className="text-xs text-muted-foreground">
        You will be redirected to Stripe to complete identity verification. This takes
        approximately 5 minutes.
      </p>
    </div>
  )
}

function StripePending() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="flex-1">
          <p className="font-semibold text-amber-900">Verification in progress</p>
          <p className="mt-1 text-sm text-amber-800">
            Stripe is reviewing your account details. This usually takes 1–2 business days.
            You may be asked to provide additional documentation.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
            >
              Complete Verification
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-700 hover:bg-amber-100"
            >
              Check Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StripeConnected() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-xl border border-[#4a7c59]/30 bg-[#f3f7f3] p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4a7c59]" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[#2d5038]">Payouts connected</p>
              <p className="mt-0.5 text-sm text-[#4a7c59]">
                Stripe Connect · Verified ✓
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#4a7c59]/40 text-[#4a7c59] hover:bg-[#e8ede8]"
            >
              Manage Account
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Bank account</p>
              <p className="mt-0.5 font-medium text-foreground">•••• •••• •••• 4821</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account holder</p>
              <p className="mt-0.5 font-medium text-foreground">ClearCAD Studio GmbH</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payout schedule</p>
              <p className="mt-0.5 font-medium text-foreground">Weekly (Mon)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Status switcher (dev only) ───────────────────────────────────────────────

const STATUS_LABELS: Record<StripeStatus, string> = {
  not_connected: "Not Connected",
  pending: "Pending",
  connected: "Connected",
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderPaymentsPage() {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("connected")

  function handleSetUpStripe() {
    setStripeStatus("pending")
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/provider/settings" className="hover:text-foreground">
            Settings
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Payouts</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Payout & Payment Setup
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your bank account to receive earnings from completed orders.
        </p>
      </div>

      {/* Dev scenario switcher */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium">Dev:</span>
          {(["not_connected", "pending", "connected"] as StripeStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStripeStatus(s)}
              className={[
                "rounded px-2 py-0.5 font-medium transition-colors",
                stripeStatus === s
                  ? "bg-foreground text-background"
                  : "hover:bg-muted-foreground/20",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5">

        {/* ── Stripe Connect ────────────────────────────────────────────────── */}
        <Section
          icon={<Landmark className="h-4 w-4" />}
          title="Stripe Connect"
          description="Secure bank payout integration powered by Stripe."
        >
          {stripeStatus === "not_connected" && (
            <StripeNotConnected onConnect={handleSetUpStripe} />
          )}
          {stripeStatus === "pending" && <StripePending />}
          {stripeStatus === "connected" && <StripeConnected />}
        </Section>

        {/* ── Platform Commission ───────────────────────────────────────────── */}
        <Section
          icon={<Percent className="h-4 w-4" />}
          title="Platform Commission"
          description="Fees deducted automatically from each order payout."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8ede8] text-lg font-bold text-[#4a7c59]">
                %
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  12–15% platform commission
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The exact rate depends on your service type and volume tier. Commission
                  is deducted from the design price before your payout is released.
                  Clients pay a separate service fee on top — your earnings are not
                  affected by what the client pays.
                </p>
              </div>
            </div>

            {/* Example calculation */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Example payout calculation
              </p>
              {[
                { label: "Design price (agreed with client)", value: "€320.00", muted: false },
                { label: "Platform commission (14%)", value: "− €44.80", muted: true },
                { label: "Your net payout", value: "€275.20", muted: false, bold: true },
              ].map(({ label, value, muted, bold }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className={["text-sm", muted ? "text-muted-foreground" : "text-foreground"].join(" ")}>
                    {label}
                  </span>
                  <span
                    className={[
                      "text-sm",
                      bold ? "font-semibold text-foreground" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4a7c59]" />
              Fees are locked at order creation and never changed retroactively.{" "}
              <button type="button" className="underline hover:text-foreground">
                View full fee schedule
              </button>
            </div>
          </div>
        </Section>

        {/* ── Recent Payouts ────────────────────────────────────────────────── */}
        <Section
          icon={<Clock className="h-4 w-4" />}
          title="Recent Payouts"
          description="Payouts from completed and approved orders."
        >
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "This month", value: "€595.20" },
                { label: "Last month", value: "€842.80" },
                { label: "Pending release", value: "€275.20" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-background px-3 py-3 text-center"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Table — desktop */}
            <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gross
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Commission
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Net Payout
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DUMMY_PAYOUTS.map((p) => (
                    <tr key={p.id} className="bg-background hover:bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(p.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {p.orderRef}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmt(p.gross, p.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-destructive">
                        − {fmt(p.commission, p.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {fmt(p.net, p.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="space-y-2 sm:hidden">
              {DUMMY_PAYOUTS.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-foreground">
                      {p.orderRef}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(p.date)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <p>Gross: {fmt(p.gross, p.currency)}</p>
                      <p className="text-destructive">
                        Commission: − {fmt(p.commission, p.currency)}
                      </p>
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {fmt(p.net, p.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-[#4a7c59] hover:underline"
            >
              View All Payouts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Section>

        {/* ── Escrow explanation ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="px-1 text-sm font-medium text-foreground">How escrow works for providers</p>
          <EscrowBanner variant="in_escrow" escrowDaysRemaining={4} />
          <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Provider escrow timeline</p>
            <ol className="mt-2 space-y-2">
              {[
                "Client pays — funds are held in escrow by the platform.",
                "You complete the design and submit deliverables.",
                "Client has 7 days to review and either approve or request revisions.",
                "On approval (or after 7 days with no response), funds are released and your payout is queued.",
                "Payout arrives in your Stripe-connected bank account within 2–3 business days.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8ede8] text-[10px] font-bold text-[#4a7c59]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
