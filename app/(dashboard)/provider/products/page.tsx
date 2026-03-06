import Link from "next/link"
import { ChevronRight, AlignCenter, Boxes } from "lucide-react"

export default function ProviderProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Products</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your service offerings, pricing, and availability.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Aligner Design card */}
        <Link
          href="/provider/products/aligner"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-[#4a7c59]/60 hover:bg-[#f3f7f3]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8ede8] text-[#4a7c59]">
            <AlignCenter className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Aligner Design</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Per-arch pricing · complexity tiers · deliverable defaults
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Prosthetics placeholder */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 opacity-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Prosthetics Design</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Category-based pricing · coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
