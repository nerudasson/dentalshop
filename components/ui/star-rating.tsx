import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number        // 1–5, supports decimals (e.g. 4.3)
  max?: number          // default 5
  className?: string
  starClassName?: string
}

export default function StarRating({
  rating,
  max = 5,
  className,
  starClassName,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1) // 0, partial, or 1
        return (
          <StarIcon key={i} fill={fill} className={starClassName} />
        )
      })}
    </div>
  )
}

function StarIcon({ fill, className }: { fill: number; className?: string }) {
  const id = `star-gradient-${Math.random().toString(36).slice(2, 7)}`

  if (fill >= 1) {
    return (
      <Star
        className={cn("h-4 w-4 text-amber-400 fill-amber-400", className)}
        strokeWidth={1.5}
      />
    )
  }

  if (fill <= 0) {
    return (
      <Star
        className={cn("h-4 w-4 text-warm-300 fill-transparent", className)}
        strokeWidth={1.5}
      />
    )
  }

  // Partial fill via SVG gradient
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      className={cn("h-4 w-4", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset={`${fill * 100}%`} stopColor="#fbbf24" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={`url(#${id})`}
        stroke="#fbbf24"
      />
    </svg>
  )
}
