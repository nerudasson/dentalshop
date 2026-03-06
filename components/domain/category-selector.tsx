"use client"

import {
  Crown,
  Link2,
  Layers,
  Wrench,
  LayoutGrid,
  Sparkles,
  ScanLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// ─── Category definitions ─────────────────────────────────────────────────────

interface CategoryDef {
  id: string
  label: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<{ className?: string }>
  isAligner?: boolean
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "Crowns",
    label: "Crowns",
    description: "Single-unit crown restorations",
    Icon: Crown,
  },
  {
    id: "Bridges",
    label: "Bridges",
    description: "Multi-unit bridge frameworks",
    Icon: Link2,
  },
  {
    id: "Inlays/Onlays",
    label: "Inlays / Onlays",
    description: "Conservative inlay and onlay restorations",
    Icon: Layers,
  },
  {
    id: "Implant Abutments",
    label: "Implant Abutments",
    description: "Custom implant abutment designs",
    Icon: Wrench,
  },
  {
    id: "Partial Frameworks",
    label: "Partial Frameworks",
    description: "Removable partial denture frameworks",
    Icon: LayoutGrid,
  },
  {
    id: "Veneers",
    label: "Veneers",
    description: "Anterior veneer restorations",
    Icon: Sparkles,
  },
  {
    id: "Aligner Design",
    label: "Aligner Design",
    description: "Clear aligner treatment planning",
    Icon: ScanLine,
    isAligner: true,
  },
]

// ─── CategorySelector ─────────────────────────────────────────────────────────

export interface CategorySelectorProps {
  value: string | null
  onChange: (category: string) => void
  className?: string
}

export default function CategorySelector({
  value,
  onChange,
  className,
}: CategorySelectorProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-sm text-muted-foreground">
        Select the type of restoration you need designed.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIES.map(({ id, label, description, Icon, isAligner }) => {
          const isSelected = value === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2",
                isSelected
                  ? "border-sage-500 bg-sage-50 ring-1 ring-sage-500"
                  : "border-border hover:border-sage-300 hover:bg-warm-50"
              )}
            >
              {/* Icon box */}
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
                  isSelected
                    ? "bg-sage-500 text-white"
                    : "bg-warm-100 text-warm-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-sage-700" : "text-warm-800"
                    )}
                  >
                    {label}
                  </p>
                  {isAligner && (
                    <Badge
                      variant="outline"
                      className="border-sage-200 bg-white text-[10px] text-sage-600"
                    >
                      Separate wizard
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>

              {/* Selected checkmark */}
              {isSelected && !isAligner && (
                <div className="shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2 6l3 3 5-5"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
