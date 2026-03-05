"use client"

import { useState } from "react"
import CategorySelector, {
  MVP_CATEGORIES,
  ALIGNER_CATEGORY_ID,
} from "@/components/domain/category-selector"
import { cn } from "@/lib/utils"

// ─── Track indicator ──────────────────────────────────────────────────────────

function TrackIndicator({ selectedId }: { selectedId: string | null }) {
  if (!selectedId) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No category selected — choose one to see which track activates.
      </p>
    )
  }

  const isAligner = selectedId === ALIGNER_CATEGORY_ID
  const label = MVP_CATEGORIES.find((c) => c.id === selectedId)?.name ?? selectedId

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Selected:</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">→</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          isAligner
            ? "bg-teal-100 text-teal-700"
            : "bg-sage-100 text-sage-700"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isAligner ? "bg-teal-500" : "bg-sage-500"
          )}
        />
        {isAligner ? "Aligner track" : "Prosthetics track"}
      </span>
    </div>
  )
}

// ─── CategoryDemo ─────────────────────────────────────────────────────────────

export default function CategoryDemo() {
  const [gridSelected, setGridSelected] = useState<string | null>(null)
  const [listSelected, setListSelected] = useState<string | null>(null)

  return (
    <div className="space-y-12">
      {/* Grid layout */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Grid layout
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              3 cols desktop · 2 cols tablet · 1 col mobile
            </p>
          </div>
          <TrackIndicator selectedId={gridSelected} />
        </div>
        <CategorySelector
          categories={MVP_CATEGORIES}
          selected={gridSelected}
          onSelect={setGridSelected}
          layout="grid"
        />
      </section>

      {/* List layout */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              List layout
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full-width rows — compact option for sidebars or modals
            </p>
          </div>
          <TrackIndicator selectedId={listSelected} />
        </div>
        <CategorySelector
          categories={MVP_CATEGORIES}
          selected={listSelected}
          onSelect={setListSelected}
          layout="list"
        />
      </section>
    </div>
  )
}
