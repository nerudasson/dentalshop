"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToothChartProps {
  selectedTeeth: number[]
  onChange: (teeth: number[]) => void
  mode?: "adult" | "child"
  disabled?: boolean
  /** Default: '#4A7A3B' (sage-500) */
  highlightColor?: string
  className?: string
}

interface ToothGeom {
  number: number
  cx: number
  cy: number
  w: number
  h: number
  jaw: "upper" | "lower"
  quadrant: 1 | 2 | 3 | 4
}

// ─── Adult geometry ───────────────────────────────────────────────────────────
//
// ViewBox: 0 0 600 185
// 16 teeth per row. Left→right display order:
//   Upper: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
//   Lower: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38

const VB_W = 600
const VB_H = 185

const ADULT_UPPER_NUMS = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const ADULT_LOWER_NUMS = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const ADULT_WIDTHS     = [30, 28, 32, 20, 20, 18, 16, 18, 18, 16, 18, 20, 20, 32, 28, 30]
const ADULT_HEIGHTS    = [30, 30, 32, 24, 24, 26, 22, 22, 22, 22, 26, 24, 24, 32, 30, 30]
const ADULT_GAP = 3
const ADULT_ARCH_AMP = 15
const ADULT_Y_UPPER = 87   // occlusal Y at center incisors (bottom of upper teeth)
const ADULT_Y_LOWER = 107  // occlusal Y at center incisors (top of lower teeth)

// Display order used for range-drag selection
export const ADULT_DISPLAY_ORDER = [
  ...ADULT_UPPER_NUMS,
  ...ADULT_LOWER_NUMS,
]

// ─── Child geometry ───────────────────────────────────────────────────────────
//
// 10 teeth per row, 5 per quadrant. Primary (deciduous) dentition.
// Upper: 55 54 53 52 51 | 61 62 63 64 65
// Lower: 85 84 83 82 81 | 71 72 73 74 75

const CHILD_UPPER_NUMS = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
const CHILD_LOWER_NUMS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
const CHILD_WIDTHS     = [28, 26, 20, 16, 16, 16, 16, 20, 26, 28]
const CHILD_HEIGHTS    = [28, 28, 24, 20, 20, 20, 20, 24, 28, 28]
const CHILD_GAP = 4
const CHILD_ARCH_AMP = 12
const CHILD_Y_UPPER = 87
const CHILD_Y_LOWER = 107

export const CHILD_DISPLAY_ORDER = [
  ...CHILD_UPPER_NUMS,
  ...CHILD_LOWER_NUMS,
]

// ─── Geometry builder ─────────────────────────────────────────────────────────

function buildTeeth(
  upperNums: number[],
  lowerNums: number[],
  widths: number[],
  heights: number[],
  gap: number,
  archAmp: number,
  yUpper: number,
  yLower: number,
): ToothGeom[] {
  const n = widths.length
  const totalW = widths.reduce((a, b) => a + b, 0) + (n - 1) * gap
  let x = (VB_W - totalW) / 2

  const teeth: ToothGeom[] = []

  for (let i = 0; i < n; i++) {
    const w = widths[i]
    const cx = x + w / 2
    const dy = archAmp * Math.pow((i - (n - 1) / 2) / ((n - 1) / 2), 2)
    const h = heights[i]

    // Upper tooth: occlusal surface is the BOTTOM edge (hangs down)
    const upperOcclusal = yUpper + dy
    teeth.push({
      number: upperNums[i],
      cx,
      cy: upperOcclusal - h / 2,
      w,
      h,
      jaw: "upper",
      quadrant: i < n / 2 ? 1 : 2,
    })

    // Lower tooth: occlusal surface is the TOP edge (rises up)
    const lowerOcclusal = yLower + dy
    teeth.push({
      number: lowerNums[i],
      cx,
      cy: lowerOcclusal + h / 2,
      w,
      h,
      jaw: "lower",
      quadrant: i < n / 2 ? 4 : 3,
    })

    x += w + gap
  }

  return teeth
}

// Pre-computed at module level — never recreated
const ADULT_TEETH = buildTeeth(
  ADULT_UPPER_NUMS, ADULT_LOWER_NUMS,
  ADULT_WIDTHS, ADULT_HEIGHTS,
  ADULT_GAP, ADULT_ARCH_AMP, ADULT_Y_UPPER, ADULT_Y_LOWER,
)
const CHILD_TEETH = buildTeeth(
  CHILD_UPPER_NUMS, CHILD_LOWER_NUMS,
  CHILD_WIDTHS, CHILD_HEIGHTS,
  CHILD_GAP, CHILD_ARCH_AMP, CHILD_Y_UPPER, CHILD_Y_LOWER,
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTeethRange(start: number, end: number, order: number[]): number[] {
  const si = order.indexOf(start)
  const ei = order.indexOf(end)
  if (si === -1 || ei === -1) return start === end ? [start] : []
  const [lo, hi] = si <= ei ? [si, ei] : [ei, si]
  return order.slice(lo, hi + 1)
}

function getEffectiveSelection(
  selected: number[],
  isDragging: boolean,
  dragPreview: Set<number>,
  isRemoving: boolean,
): Set<number> {
  const sel = new Set(selected)
  if (!isDragging || dragPreview.size === 0) return sel
  if (isRemoving) {
    dragPreview.forEach((n) => sel.delete(n))
  } else {
    dragPreview.forEach((n) => sel.add(n))
  }
  return sel
}

function buildSummary(selected: number[]): string {
  if (selected.length === 0) return "No teeth selected"
  if (selected.length <= 5) {
    return `Selected: ${[...selected].sort((a, b) => a - b).join(", ")}`
  }
  return `${selected.length} teeth selected`
}

// ─── Arch gum polyline points ─────────────────────────────────────────────────

function getGumPoints(teeth: ToothGeom[], jaw: "upper" | "lower"): string {
  return teeth
    .filter((t) => t.jaw === jaw)
    .sort((a, b) => a.cx - b.cx)
    .map((t) =>
      jaw === "upper"
        ? `${t.cx},${t.cy - t.h / 2}`
        : `${t.cx},${t.cy + t.h / 2}`
    )
    .join(" ")
}

// ─── Quadrant label data ──────────────────────────────────────────────────────

function getQuadrantLabels(teeth: ToothGeom[], n: number) {
  const upper = teeth.filter((t) => t.jaw === "upper").sort((a, b) => a.cx - b.cx)
  const q1 = upper.slice(0, n / 2)
  const q2 = upper.slice(n / 2)
  const q1cx = (q1[0].cx + q1[q1.length - 1].cx) / 2
  const q2cx = (q2[0].cx + q2[q2.length - 1].cx) / 2

  return [
    { label: "UPPER RIGHT", x: q1cx, y: 18 },
    { label: "UPPER LEFT",  x: q2cx, y: 18 },
    { label: "LOWER LEFT",  x: q2cx, y: VB_H - 10 },
    { label: "LOWER RIGHT", x: q1cx, y: VB_H - 10 },
  ]
}

// ─── ToothChart ───────────────────────────────────────────────────────────────

const DEFAULT_HIGHLIGHT = "#4A7A3B" // sage-500

export default function ToothChart({
  selectedTeeth,
  onChange,
  mode = "adult",
  disabled = false,
  highlightColor = DEFAULT_HIGHLIGHT,
  className,
}: ToothChartProps) {
  const teeth = mode === "adult" ? ADULT_TEETH : CHILD_TEETH
  const displayOrder = mode === "adult" ? ADULT_DISPLAY_ORDER : CHILD_DISPLAY_ORDER
  const n = displayOrder.length / 2 // teeth per row

  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAnchor, setDragAnchor] = useState<number | null>(null)
  const [dragAnchorWasSelected, setDragAnchorWasSelected] = useState(false)
  const [dragPreview, setDragPreview] = useState<Set<number>>(new Set())

  // Commit drag selection on global mouseup
  const commitDrag = useCallback(() => {
    if (!isDragging || dragAnchor === null) return
    if (dragAnchorWasSelected) {
      onChange(selectedTeeth.filter((t) => !dragPreview.has(t)))
    } else {
      onChange([...new Set([...selectedTeeth, ...dragPreview])])
    }
    setIsDragging(false)
    setDragAnchor(null)
    setDragPreview(new Set())
  }, [isDragging, dragAnchor, dragAnchorWasSelected, dragPreview, selectedTeeth, onChange])

  useEffect(() => {
    window.addEventListener("mouseup", commitDrag)
    return () => window.removeEventListener("mouseup", commitDrag)
  }, [commitDrag])

  const handleMouseDown = useCallback(
    (toothNum: number) => {
      if (disabled) return
      const wasSelected = selectedTeeth.includes(toothNum)
      setIsDragging(true)
      setDragAnchor(toothNum)
      setDragAnchorWasSelected(wasSelected)
      setDragPreview(new Set([toothNum]))
    },
    [disabled, selectedTeeth],
  )

  const handleMouseEnter = useCallback(
    (toothNum: number) => {
      setHoveredTooth(toothNum)
      if (!isDragging || dragAnchor === null) return
      const range = getTeethRange(dragAnchor, toothNum, displayOrder)
      setDragPreview(new Set(range))
    },
    [isDragging, dragAnchor, displayOrder],
  )

  const effectiveSel = getEffectiveSelection(
    selectedTeeth,
    isDragging,
    dragPreview,
    dragAnchorWasSelected,
  )

  const quadrantLabels = getQuadrantLabels(teeth, n)
  const upperGumPoints = getGumPoints(teeth, "upper")
  const lowerGumPoints = getGumPoints(teeth, "lower")

  // Midline x = midpoint between last Q1 upper and first Q2 upper tooth
  const upperSorted = teeth
    .filter((t) => t.jaw === "upper")
    .sort((a, b) => a.cx - b.cx)
  const midlineX = (upperSorted[n - 1].cx + upperSorted[n].cx) / 2

  const upperTop = Math.min(...teeth.filter((t) => t.jaw === "upper").map((t) => t.cy - t.h / 2))
  const lowerBot = Math.max(...teeth.filter((t) => t.jaw === "lower").map((t) => t.cy + t.h / 2))

  return (
    <div className={cn("w-full select-none", className)}>
      {/* SVG tooth chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          style={{ minWidth: 320, maxWidth: VB_W, display: "block" }}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => !isDragging && setHoveredTooth(null)}
          aria-label="Dental tooth chart"
          role="group"
        >
          {/* Background */}
          <rect x={0} y={0} width={VB_W} height={VB_H} fill="#FAFAF8" rx={8} />

          {/* Quadrant labels */}
          {quadrantLabels.map(({ label, x, y }) => (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={8}
              letterSpacing={0.8}
              fill="#C0BCBA"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={600}
            >
              {label}
            </text>
          ))}

          {/* Arch gum lines */}
          <polyline
            points={upperGumPoints}
            fill="none"
            stroke="#E1E8DC"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={lowerGumPoints}
            fill="none"
            stroke="#E1E8DC"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Midline */}
          <line
            x1={midlineX}
            y1={upperTop - 4}
            x2={midlineX}
            y2={lowerBot + 4}
            stroke="#D4D1CA"
            strokeWidth={1}
            strokeDasharray="3,3"
          />

          {/* Teeth */}
          {teeth.map((t) => {
            const isSelected = effectiveSel.has(t.number)
            const isHovered = hoveredTooth === t.number && !isDragging
            const isInPreview = isDragging && dragPreview.has(t.number)

            const fill = isSelected
              ? highlightColor
              : disabled
              ? "#F5F4F1"
              : "#FFFFFF"

            const stroke = isSelected
              ? highlightColor
              : isHovered || isInPreview
              ? "#9BB89A"
              : "#E8E4DE"

            const txLeft  = t.cx - t.w / 2
            const txTop   = t.cy - t.h / 2

            return (
              <g key={t.number}>
                <rect
                  x={txLeft}
                  y={txTop}
                  width={t.w}
                  height={t.h}
                  rx={4}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? 2 : 1.5}
                  opacity={disabled ? 0.55 : 1}
                  style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "fill 0.1s, stroke 0.1s",
                  }}
                  onMouseDown={!disabled ? () => handleMouseDown(t.number) : undefined}
                  onMouseEnter={() => handleMouseEnter(t.number)}
                  onMouseLeave={() => {
                    if (!isDragging) setHoveredTooth(null)
                  }}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Tooth ${t.number}`}
                />

                {/* Tooth number label (small, always visible) */}
                <text
                  x={t.cx}
                  y={t.cy + 3}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={600}
                  fill={isSelected ? "rgba(255,255,255,0.85)" : "#C0BCBA"}
                  pointerEvents="none"
                >
                  {t.number}
                </text>
              </g>
            )
          })}

          {/* Hover tooltip */}
          {hoveredTooth && !isDragging && !disabled && (() => {
            const t = teeth.find((td) => td.number === hoveredTooth)
            if (!t) return null
            const tipX = Math.min(Math.max(t.cx, 18), VB_W - 18)
            const tipY =
              t.jaw === "upper"
                ? Math.max(t.cy - t.h / 2 - 22, 2)
                : t.cy + t.h / 2 + 4

            return (
              <g pointerEvents="none">
                <rect
                  x={tipX - 14}
                  y={tipY}
                  width={28}
                  height={17}
                  rx={3}
                  fill="#2D2A26"
                  opacity={0.9}
                />
                <text
                  x={tipX}
                  y={tipY + 12}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={700}
                  fill="#FFFFFF"
                >
                  {hoveredTooth}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Controls & summary */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {buildSummary(selectedTeeth)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onChange([...displayOrder])}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || selectedTeeth.length === 0}
            onClick={() => onChange([])}
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
}
