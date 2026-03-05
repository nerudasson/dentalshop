"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StarRatingSize = "sm" | "md" | "lg"

interface StarRatingProps {
  /** Current value (1–5). Supports decimals for display mode (e.g. 3.5). */
  value: number
  /** If provided, component is interactive (click to rate). */
  onChange?: (value: number) => void
  /** Forces display-only mode even if onChange is provided. */
  readonly?: boolean
  size?: StarRatingSize
  /** Show numeric value (e.g. "4.5") after the stars. */
  showValue?: boolean
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_ICON: Record<StarRatingSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
}

const SIZE_TEXT: Record<StarRatingSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

// ─── StarRating ───────────────────────────────────────────────────────────────

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const isInteractive = !readonly && typeof onChange === "function"
  const iconClass = SIZE_ICON[size]
  const textClass = SIZE_TEXT[size]

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {/* Stars row */}
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => isInteractive && setHoverValue(null)}
        aria-label={`Rating: ${value} out of 5`}
      >
        {([1, 2, 3, 4, 5] as const).map((star) => {
          if (isInteractive) {
            const active = (hoverValue ?? value) >= star
            return (
              <button
                key={star}
                type="button"
                onClick={() => (onChange as (v: number) => void)(star)}
                onMouseEnter={() => setHoverValue(star)}
                className="rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                aria-label={`Rate ${star} out of 5`}
              >
                <Star
                  className={cn(
                    iconClass,
                    "transition-colors",
                    active ? "text-amber-500" : "text-warm-300"
                  )}
                  fill="currentColor"
                />
              </button>
            )
          }

          // Display mode — compute partial fill for this star position
          const fill = Math.min(1, Math.max(0, value - (star - 1)))

          if (fill >= 0.9) {
            return (
              <Star
                key={star}
                className={cn(iconClass, "text-amber-500")}
                fill="currentColor"
                aria-hidden
              />
            )
          }

          if (fill < 0.1) {
            return (
              <Star
                key={star}
                className={cn(iconClass, "text-warm-300")}
                fill="currentColor"
                aria-hidden
              />
            )
          }

          // Partial (half) star: clip the filled version at fill%
          return (
            <span
              key={star}
              className="relative inline-block leading-none"
              aria-hidden
            >
              {/* Empty base */}
              <Star className={cn(iconClass, "text-warm-300")} fill="currentColor" />
              {/* Filled overlay, clipped to fill% width */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className={cn(iconClass, "text-amber-500")}
                  fill="currentColor"
                />
              </span>
            </span>
          )
        })}
      </div>

      {/* Numeric value */}
      {showValue && (
        <span
          className={cn(
            textClass,
            "font-medium tabular-nums text-foreground"
          )}
          aria-hidden
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
