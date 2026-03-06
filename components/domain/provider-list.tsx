"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProviderCard from "@/components/domain/provider-card"
import type { ProviderInfo } from "@/lib/types"

type SortKey = "price" | "rating" | "turnaround"

const TURNAROUND_OPTIONS: { label: string; max: number }[] = [
  { label: "Any turnaround", max: Infinity },
  { label: "1–2 days", max: 2 },
  { label: "Up to 3 days", max: 3 },
  { label: "Up to 5 days", max: 5 },
  { label: "Up to 7 days", max: 7 },
]

export interface ProviderListProps {
  providers: ProviderInfo[]
  /** Map from provider id to badge array */
  providerBadges?: Record<string, string[]>
  selectedId?: string
  onSelect: (id: string) => void
  showPrice?: boolean
}

export default function ProviderList({
  providers,
  providerBadges,
  selectedId,
  onSelect,
  showPrice = true,
}: ProviderListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("rating")
  const [maxTurnaround, setMaxTurnaround] = useState<number>(Infinity)
  const [activeSoftware, setActiveSoftware] = useState<string | null>(null)

  // Collect all unique software names across all providers
  const allSoftware = useMemo(() => {
    const set = new Set<string>()
    providers.forEach((p) => p.software.forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [providers])

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (p.turnaroundDays > maxTurnaround) return false
      if (activeSoftware && !p.software.includes(activeSoftware)) return false
      return true
    })
  }, [providers, maxTurnaround, activeSoftware])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "price") return a.price - b.price
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "turnaround") return a.turnaroundDays - b.turnaroundDays
      return 0
    })
  }, [filtered, sortBy])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Software filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveSoftware(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeSoftware === null
                ? "bg-sage-500 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All software
          </button>
          {allSoftware.map((sw) => (
            <button
              key={sw}
              onClick={() => setActiveSoftware(activeSoftware === sw ? null : sw)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeSoftware === sw
                  ? "bg-sage-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {sw}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Turnaround filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={maxTurnaround === Infinity ? "Infinity" : String(maxTurnaround)}
            onValueChange={(v) =>
              setMaxTurnaround(v === "Infinity" ? Infinity : Number(v))
            }
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TURNAROUND_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.label}
                  value={opt.max === Infinity ? "Infinity" : String(opt.max)}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating" className="text-xs">
                Best rated
              </SelectItem>
              <SelectItem value="price" className="text-xs">
                Lowest price
              </SelectItem>
              <SelectItem value="turnaround" className="text-xs">
                Fastest turnaround
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {sorted.length} provider{sorted.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No providers match the current filters.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setActiveSoftware(null)
              setMaxTurnaround(Infinity)
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onSelect={onSelect}
              isSelected={selectedId === provider.id}
              showPrice={showPrice}
              badges={providerBadges?.[provider.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
