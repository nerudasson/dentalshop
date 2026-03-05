"use client"

import { useState } from "react"
import StarRating from "@/components/ui/star-rating"

export default function InteractiveStarDemo() {
  const [rating, setRating] = useState(0)

  return (
    <div className="flex items-center gap-4">
      <StarRating value={rating} onChange={setRating} size="md" showValue={rating > 0} />
      {rating === 0 && (
        <span className="text-xs text-muted-foreground">Hover to preview, click to rate</span>
      )}
      {rating > 0 && (
        <button
          type="button"
          onClick={() => setRating(0)}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}
