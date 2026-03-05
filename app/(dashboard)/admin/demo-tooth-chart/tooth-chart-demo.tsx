"use client"

import { useState } from "react"
import ToothChart from "@/components/domain/tooth-chart"

// ─── Demo section wrapper ─────────────────────────────────────────────────────

function DemoSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── ToothChartDemo ───────────────────────────────────────────────────────────

export default function ToothChartDemo() {
  const [adultSelected, setAdultSelected] = useState<number[]>([11, 21])
  const [childSelected, setChildSelected] = useState<number[]>([51, 61])

  return (
    <div className="space-y-6">
      {/* Adult — interactive */}
      <DemoSection
        title="Adult dentition (FDI notation)"
        description="Click to toggle individual teeth. Click and drag to select a contiguous range across the arch."
      >
        <ToothChart
          selectedTeeth={adultSelected}
          onChange={setAdultSelected}
          mode="adult"
        />
      </DemoSection>

      {/* Child — interactive */}
      <DemoSection
        title="Child dentition (primary / deciduous)"
        description="20 primary teeth, FDI 51–85. Same interaction model."
      >
        <ToothChart
          selectedTeeth={childSelected}
          onChange={setChildSelected}
          mode="child"
        />
      </DemoSection>

      {/* Disabled state */}
      <DemoSection
        title="Disabled state"
        description="All interactions disabled — used in read-only order detail views."
      >
        <ToothChart
          selectedTeeth={[11, 12, 13, 21, 22, 23]}
          onChange={() => {}}
          mode="adult"
          disabled
        />
      </DemoSection>

      {/* Custom highlight color — teal for aligner track */}
      <DemoSection
        title="Custom highlight color (teal — aligner track)"
        description="highlightColor='#1D8E7A' for aligner order flows."
      >
        <ToothChart
          selectedTeeth={[13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43]}
          onChange={() => {}}
          mode="adult"
          highlightColor="#1D8E7A"
        />
      </DemoSection>
    </div>
  )
}
