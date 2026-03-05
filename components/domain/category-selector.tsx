"use client"

import { Crown, Link2, Layers, Anchor, Network, Gem, ScanLine } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryItem {
  id: string
  name: string
  icon: React.ReactNode
  productCount?: number
  description?: string
  /** Display badge label, e.g. "New", "Popular" */
  badge?: string
  /** Used to apply teal accent styling for the aligner track */
  trackType?: "prosthetics" | "aligner"
}

interface CategorySelectorProps {
  categories: CategoryItem[]
  onSelect: (categoryId: string) => void
  selected: string | null
  layout?: "grid" | "list"
  className?: string
}

// ─── Track fork helper ────────────────────────────────────────────────────────

/** The category ID that triggers the aligner wizard track. */
export const ALIGNER_CATEGORY_ID = "aligner-design"

// ─── MVP dummy data ───────────────────────────────────────────────────────────

export const MVP_CATEGORIES: CategoryItem[] = [
  {
    id: "crowns",
    name: "Crowns",
    icon: <Crown className="h-5 w-5" />,
    productCount: 48,
    description: "Full-coverage ceramic, zirconia, and PFM crowns",
    badge: "Popular",
    trackType: "prosthetics",
  },
  {
    id: "bridges",
    name: "Bridges",
    icon: <Link2 className="h-5 w-5" />,
    productCount: 31,
    description: "Fixed partial dentures spanning multiple units",
    trackType: "prosthetics",
  },
  {
    id: "inlays-onlays",
    name: "Inlays / Onlays",
    icon: <Layers className="h-5 w-5" />,
    productCount: 22,
    description: "Conservative indirect restorations for posterior teeth",
    trackType: "prosthetics",
  },
  {
    id: "implant-abutments",
    name: "Implant Abutments",
    icon: <Anchor className="h-5 w-5" />,
    productCount: 19,
    description: "Custom and stock abutments for implant-supported restorations",
    trackType: "prosthetics",
  },
  {
    id: "partial-frameworks",
    name: "Partial Frameworks",
    icon: <Network className="h-5 w-5" />,
    productCount: 14,
    description: "Removable partial denture frameworks in metal or flexible resin",
    trackType: "prosthetics",
  },
  {
    id: "veneers",
    name: "Veneers",
    icon: <Gem className="h-5 w-5" />,
    productCount: 27,
    description: "Ultra-thin ceramic facings for anterior aesthetics",
    trackType: "prosthetics",
  },
  {
    id: ALIGNER_CATEGORY_ID,
    name: "Aligner Design",
    icon: <ScanLine className="h-5 w-5" />,
    productCount: 8,
    description: "Digital clear aligner treatment planning and staging",
    badge: "New",
    trackType: "aligner",
  },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

function CategoryBadge({ label, isAligner }: { label: string; isAligner: boolean }) {
  if (isAligner) {
    return (
      <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-teal-100 text-teal-700">
        {label}
      </span>
    )
  }
  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
      {label}
    </Badge>
  )
}

// ─── Grid card ────────────────────────────────────────────────────────────────

function GridCard({
  item,
  isSelected,
  onSelect,
}: {
  item: CategoryItem
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const isAligner = item.trackType === "aligner"

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        // Base
        "group relative flex flex-col rounded-xl border bg-card p-5 text-left",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Hover (unselected only)
        !isSelected && "hover:shadow-md hover:-translate-y-0.5",
        // Selected — aligner track
        isSelected && isAligner && "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20 shadow-sm",
        // Selected — prosthetics track
        isSelected && !isAligner && "border-sage-500 bg-sage-50 ring-2 ring-sage-500/20 shadow-sm",
        // Unselected
        !isSelected && "border-border"
      )}
      aria-pressed={isSelected}
    >
      {/* Top row: icon + badge */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isAligner
              ? "bg-teal-50 text-teal-500"
              : "bg-sage-50 text-sage-500"
          )}
        >
          {item.icon}
        </div>
        {item.badge && (
          <CategoryBadge label={item.badge} isAligner={isAligner} />
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-foreground leading-snug">
        {item.name}
      </p>

      {/* Provider count */}
      {item.productCount !== undefined && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.productCount} providers
        </p>
      )}

      {/* Description */}
      {item.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      )}
    </button>
  )
}

// ─── List row ─────────────────────────────────────────────────────────────────

function ListRow({
  item,
  isSelected,
  onSelect,
}: {
  item: CategoryItem
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const isAligner = item.trackType === "aligner"

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        // Base
        "group flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-3.5 text-left",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Hover (unselected only)
        !isSelected && "hover:shadow-md hover:-translate-y-0.5",
        // Selected
        isSelected && isAligner && "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20 shadow-sm",
        isSelected && !isAligner && "border-sage-500 bg-sage-50 ring-2 ring-sage-500/20 shadow-sm",
        // Unselected
        !isSelected && "border-border"
      )}
      aria-pressed={isSelected}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isAligner
            ? "bg-teal-50 text-teal-500"
            : "bg-sage-50 text-sage-500"
        )}
      >
        {item.icon}
      </div>

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>

      {/* Badge + count */}
      <div className="flex shrink-0 items-center gap-3">
        {item.badge && (
          <CategoryBadge label={item.badge} isAligner={isAligner} />
        )}
        {item.productCount !== undefined && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {item.productCount} providers
          </span>
        )}
      </div>
    </button>
  )
}

// ─── CategorySelector ─────────────────────────────────────────────────────────

export default function CategorySelector({
  categories,
  onSelect,
  selected,
  layout = "grid",
  className,
}: CategorySelectorProps) {
  if (layout === "list") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {categories.map((item) => (
          <ListRow
            key={item.id}
            item={item}
            isSelected={selected === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {categories.map((item) => (
        <GridCard
          key={item.id}
          item={item}
          isSelected={selected === item.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
