"use client"

import { useState } from "react"
import ProviderList from "@/components/domain/provider-list"
import type { ProviderInfo } from "@/lib/types"

const DUMMY_PROVIDERS: ProviderInfo[] = [
  {
    id: "prov_001",
    name: "ClearCAD Studio",
    rating: 4.9,
    reviewCount: 312,
    completedDesigns: 1840,
    turnaroundDays: 2,
    software: ["exocad", "3Shape"],
    price: 38,
    currency: "EUR",
    location: "Munich, Germany",
  },
  {
    id: "prov_002",
    name: "AlignPro Design",
    rating: 4.7,
    reviewCount: 184,
    completedDesigns: 920,
    turnaroundDays: 3,
    software: ["SureSmile", "Archform"],
    price: 55,
    currency: "EUR",
    location: "Amsterdam, Netherlands",
  },
  {
    id: "prov_003",
    name: "PrecisionDental Labs",
    rating: 4.5,
    reviewCount: 97,
    completedDesigns: 430,
    turnaroundDays: 5,
    software: ["exocad", "DentalCAD"],
    price: 29,
    currency: "EUR",
    location: "Warsaw, Poland",
  },
  {
    id: "prov_004",
    name: "SmileSync Co.",
    rating: 4.8,
    reviewCount: 256,
    completedDesigns: 1100,
    turnaroundDays: 1,
    software: ["Archform", "uLab"],
    price: 72,
    currency: "EUR",
    location: "Barcelona, Spain",
  },
  {
    id: "prov_005",
    name: "ZirconWorks",
    rating: 4.3,
    reviewCount: 48,
    completedDesigns: 210,
    turnaroundDays: 7,
    software: ["3Shape", "DentalCAD"],
    price: 22,
    currency: "EUR",
    location: "Bucharest, Romania",
  },
  {
    id: "prov_006",
    name: "Nordic CAD Hub",
    rating: 4.6,
    reviewCount: 133,
    completedDesigns: 670,
    turnaroundDays: 3,
    software: ["exocad", "SureSmile"],
    price: 45,
    currency: "EUR",
    location: "Stockholm, Sweden",
  },
]

const PROVIDER_BADGES: Record<string, string[]> = {
  prov_001: ["Top Rated"],
  prov_002: ["Aligner Specialist"],
  prov_004: ["Aligner Specialist", "Top Rated"],
  prov_006: ["New"],
}

export default function DemoProviderCardPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Choose a Design Provider</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step 3 of 4 — Browse and compare providers. Demo page for{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/provider-card
          </code>{" "}
          and{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            /components/domain/provider-list
          </code>
          .
        </p>
        {selectedId && (
          <p className="mt-2 text-sm font-medium text-sage-500">
            Selected: {DUMMY_PROVIDERS.find((p) => p.id === selectedId)?.name}
          </p>
        )}
      </div>

      <ProviderList
        providers={DUMMY_PROVIDERS}
        providerBadges={PROVIDER_BADGES}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId((prev: string | undefined) => (prev === id ? undefined : id))}
      />
    </div>
  )
}
