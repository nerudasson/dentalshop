import PriceSummary from "@/components/domain/price-summary"
import EscrowBanner from "@/components/domain/escrow-banner"

// ─── Prosthetics order ────────────────────────────────────────────────────────

const PROSTHETICS_LINE_ITEMS = [
  { label: "Full-arch zirconia crown (×3)", amount: 114.00 },
  { label: "Rush delivery add-on", amount: 18.00 },
  { label: "Sub-total add-on breakdown", amount: 18.00, isSubItem: true },
  { label: "Per-item rush fee (×3 × €6.00)", amount: 18.00, isSubItem: true },
]
const PROSTHETICS_SUBTOTAL = 132.00
const PROSTHETICS_SERVICE_FEE = { label: "Service Fee", percentage: 5, amount: 6.60 }
const PROSTHETICS_VAT = { label: "VAT", percentage: 19, amount: 26.45 }
const PROSTHETICS_TOTAL = 165.05

// ─── Aligner order ────────────────────────────────────────────────────────────

const ALIGNER_LINE_ITEMS = [
  { label: "Upper arch aligner series", amount: 75.00 },
  { label: "Lower arch aligner series", amount: 75.00 },
  { label: "Case complexity surcharge", amount: 20.00 },
  { label: "Moderate complexity", amount: 20.00, isSubItem: true },
  { label: "Estimated 24 stages", amount: 0.00, isSubItem: true },
]
const ALIGNER_SUBTOTAL = 170.00
const ALIGNER_SERVICE_FEE = { label: "Service Fee", percentage: 5, amount: 8.50 }
const ALIGNER_VAT = { label: "VAT", percentage: 19, amount: 33.97 }
const ALIGNER_TOTAL = 212.47

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPriceSummaryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Price Summary &amp; Escrow Banner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">/components/domain/price-summary</code>
          {" "}and{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">/components/domain/escrow-banner</code>
        </p>
      </div>

      {/* Price breakdowns */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-warm-800">Price Summaries</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Prosthetics */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Prosthetics order</p>
            <PriceSummary
              lineItems={PROSTHETICS_LINE_ITEMS}
              subtotal={PROSTHETICS_SUBTOTAL}
              serviceFee={PROSTHETICS_SERVICE_FEE}
              vat={PROSTHETICS_VAT}
              total={PROSTHETICS_TOTAL}
            />
          </div>

          {/* Aligner */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Aligner order</p>
            <PriceSummary
              lineItems={ALIGNER_LINE_ITEMS}
              subtotal={ALIGNER_SUBTOTAL}
              serviceFee={ALIGNER_SERVICE_FEE}
              vat={ALIGNER_VAT}
              total={ALIGNER_TOTAL}
            />
          </div>
        </div>
      </section>

      {/* Escrow banners */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-warm-800">Escrow Banner Variants</h2>
        <div className="flex flex-col gap-4 max-w-lg">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              payment — shown at checkout
            </p>
            <EscrowBanner variant="payment" />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              in_escrow — shown on order detail (3 days remaining)
            </p>
            <EscrowBanner variant="in_escrow" escrowDaysRemaining={3} />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              released — payment approved
            </p>
            <EscrowBanner variant="released" />
          </div>
        </div>
      </section>
    </div>
  )
}
