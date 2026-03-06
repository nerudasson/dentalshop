import { cn } from "@/lib/utils"

export interface PriceLineItem {
  label: string
  amount: number
  isSubItem?: boolean
}

export interface PriceSummaryProps {
  lineItems: PriceLineItem[]
  subtotal: number
  serviceFee?: { label: string; percentage: number; amount: number }
  vat?: { label: string; percentage: number; amount: number }
  total: number
  currency?: string
  className?: string
}

function formatAmount(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2)}`
}

export default function PriceSummary({
  lineItems,
  subtotal,
  serviceFee,
  vat,
  total,
  currency = "€",
  className,
}: PriceSummaryProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      {/* Line items */}
      <div className="flex flex-col gap-2">
        {lineItems.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-baseline justify-between gap-3 text-sm",
              item.isSubItem && "pl-4 text-muted-foreground"
            )}
          >
            <span className={cn(item.isSubItem ? "text-xs" : "text-warm-800")}>
              {item.label}
            </span>
            <span
              className={cn(
                "shrink-0 tabular-nums",
                item.isSubItem ? "text-xs text-muted-foreground" : "text-warm-800"
              )}
            >
              {formatAmount(item.amount, currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Dotted separator before subtotal */}
      <div className="my-3 border-t border-dashed border-border" />

      {/* Subtotal */}
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular-nums text-warm-800">{formatAmount(subtotal, currency)}</span>
      </div>

      {/* Service fee */}
      {serviceFee && (
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {serviceFee.label}{" "}
            <span className="text-xs">({serviceFee.percentage}%)</span>
          </span>
          <span className="tabular-nums text-warm-800">
            {formatAmount(serviceFee.amount, currency)}
          </span>
        </div>
      )}

      {/* VAT */}
      {vat && (
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {vat.label}{" "}
            <span className="text-xs">({vat.percentage}%)</span>
          </span>
          <span className="tabular-nums text-warm-800">
            {formatAmount(vat.amount, currency)}
          </span>
        </div>
      )}

      {/* Thick separator before total */}
      <div className="my-3 border-t-2 border-border" />

      {/* Total */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold text-warm-800">Total</span>
        <span className="text-xl font-bold tabular-nums text-warm-800">
          {formatAmount(total, currency)}
        </span>
      </div>
    </div>
  )
}
