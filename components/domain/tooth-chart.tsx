"use client"

import { cn } from "@/lib/utils"

// ─── FDI layout ───────────────────────────────────────────────────────────────
// Displayed left-to-right on screen (patient perspective: R on left, L on right)

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11] // Q1, displayed 18→11
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28] // Q2, displayed 21→28
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41] // Q4, displayed 48→41
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38] // Q3, displayed 31→38

// ─── Tooth button ─────────────────────────────────────────────────────────────

interface ToothButtonProps {
  fdi: number
  isSelected: boolean
  onToggle: (fdi: number) => void
  arch: "upper" | "lower"
}

function ToothButton({ fdi, isSelected, onToggle, arch }: ToothButtonProps) {
  const pos = fdi % 10 // position from midline (1=central incisor, 8=3rd molar)
  // Vary height slightly by tooth type for a subtle anatomical hint
  const isMolar = pos >= 6
  const isPremolar = pos >= 4 && pos < 6

  return (
    <button
      type="button"
      onClick={() => onToggle(fdi)}
      aria-pressed={isSelected}
      title={`Tooth ${fdi}`}
      className={cn(
        "relative flex flex-col items-center justify-end gap-0 rounded-sm border text-[9px] font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-1",
        // Width: molars slightly wider, incisors slightly narrower
        isMolar ? "w-9" : isPremolar ? "w-8" : "w-7",
        // Height varies by arch + type
        arch === "upper"
          ? isMolar ? "h-11" : isPremolar ? "h-10" : "h-9"
          : isMolar ? "h-10" : isPremolar ? "h-9" : "h-8",
        isSelected
          ? "border-sage-500 bg-sage-500 text-white shadow-sm"
          : "border-warm-300 bg-white text-warm-500 hover:border-sage-400 hover:bg-sage-50 hover:text-sage-600"
      )}
    >
      {/* Crown body */}
      <div
        className={cn(
          "w-full flex-1",
          arch === "upper" ? "rounded-t-sm" : "rounded-b-sm",
          isSelected ? "bg-sage-400" : "bg-warm-100"
        )}
      />
      {/* FDI number */}
      <span className={cn("py-0.5 leading-none", isSelected ? "text-white" : "text-warm-600")}>
        {fdi}
      </span>
    </button>
  )
}

// ─── Arch row ─────────────────────────────────────────────────────────────────

interface ArchRowProps {
  leftTeeth: number[]
  rightTeeth: number[]
  arch: "upper" | "lower"
  selectedTeeth: number[]
  onToggle: (fdi: number) => void
}

function ArchRow({ leftTeeth, rightTeeth, arch, selectedTeeth, onToggle }: ArchRowProps) {
  return (
    <div className="flex items-end justify-center gap-0">
      {/* Left quadrant (patient's right) */}
      <div className="flex gap-px">
        {leftTeeth.map((fdi) => (
          <ToothButton
            key={fdi}
            fdi={fdi}
            isSelected={selectedTeeth.includes(fdi)}
            onToggle={onToggle}
            arch={arch}
          />
        ))}
      </div>

      {/* Midline divider */}
      <div className="mx-1.5 w-px self-stretch bg-warm-300" />

      {/* Right quadrant (patient's left) */}
      <div className="flex gap-px">
        {rightTeeth.map((fdi) => (
          <ToothButton
            key={fdi}
            fdi={fdi}
            isSelected={selectedTeeth.includes(fdi)}
            onToggle={onToggle}
            arch={arch}
          />
        ))}
      </div>
    </div>
  )
}

// ─── ToothChart ───────────────────────────────────────────────────────────────

export interface ToothChartProps {
  selectedTeeth: number[]
  onTeethChange: (teeth: number[]) => void
  category?: string
  className?: string
}

export default function ToothChart({
  selectedTeeth,
  onTeethChange,
  category,
  className,
}: ToothChartProps) {
  function handleToggle(fdi: number) {
    if (selectedTeeth.includes(fdi)) {
      onTeethChange(selectedTeeth.filter((t) => t !== fdi))
    } else {
      onTeethChange([...selectedTeeth, fdi])
    }
  }

  // Sorted summary for display
  const sorted = [...selectedTeeth].sort((a, b) => a - b)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Category heading */}
      {category && (
        <p className="text-sm font-medium text-warm-700">
          <span className="text-warm-800 font-semibold">{category}</span>
          {" — "}Select the teeth to be treated
        </p>
      )}

      {/* Arch labels row */}
      <div className="flex justify-between px-1 text-[10px] font-medium uppercase tracking-wider text-warm-400">
        <span>R</span>
        <span className="text-[10px] font-semibold text-warm-500">Upper Arch</span>
        <span>L</span>
      </div>

      {/* Chart — horizontally scrollable on small screens */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-max flex-col gap-1.5">
          {/* Upper arch */}
          <ArchRow
            leftTeeth={UPPER_RIGHT}
            rightTeeth={UPPER_LEFT}
            arch="upper"
            selectedTeeth={selectedTeeth}
            onToggle={handleToggle}
          />

          {/* Arch separator */}
          <div className="flex justify-center">
            <div className="h-px w-full max-w-sm bg-warm-200" />
          </div>

          {/* Lower arch */}
          <ArchRow
            leftTeeth={LOWER_RIGHT}
            rightTeeth={LOWER_LEFT}
            arch="lower"
            selectedTeeth={selectedTeeth}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Lower arch label */}
      <div className="flex justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-500">
          Lower Arch
        </span>
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between gap-3 rounded-md border border-warm-200 bg-warm-50 px-3 py-2">
        {selectedTeeth.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No teeth selected — click a tooth above to select it
          </p>
        ) : (
          <p className="text-xs text-warm-700">
            <span className="font-semibold text-sage-700">
              {selectedTeeth.length} {selectedTeeth.length === 1 ? "tooth" : "teeth"} selected:
            </span>{" "}
            {sorted.join(", ")}
          </p>
        )}
        {selectedTeeth.length > 0 && (
          <button
            type="button"
            onClick={() => onTeethChange([])}
            className="shrink-0 text-[11px] text-warm-500 hover:text-warm-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
