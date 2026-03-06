"use client"

import { Check, Clock, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import StarRating from "@/components/ui/star-rating"
import { cn } from "@/lib/utils"
import type { ProviderInfo } from "@/lib/types"

export interface ProviderCardProps {
  provider: ProviderInfo
  onSelect: (id: string) => void
  isSelected: boolean
  showPrice?: boolean
  badges?: string[]
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function ProviderCard({
  provider,
  onSelect,
  isSelected,
  showPrice = true,
  badges,
}: ProviderCardProps) {
  const {
    id,
    name,
    logo,
    rating,
    reviewCount,
    completedDesigns,
    turnaroundDays,
    software,
    price,
    currency,
    location,
  } = provider

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-card shadow-sm transition-all duration-150",
        isSelected
          ? "border-sage-500 bg-sage-50 shadow-md ring-1 ring-sage-500"
          : "border-border hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Avatar className="h-12 w-12 shrink-0 rounded-md">
          {logo && <AvatarImage src={logo} alt={name} className="object-contain" />}
          <AvatarFallback className="rounded-md bg-sage-500 text-white text-sm font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-warm-800 leading-tight">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        </div>
      </div>

      {/* Optional badge row */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Stats */}
      <div className="flex flex-col gap-2 p-4">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <span className="text-sm font-medium text-warm-800">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({reviewCount.toLocaleString()} review{reviewCount !== 1 ? "s" : ""})
          </span>
        </div>

        {/* Turnaround */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0 text-sage-500" />
          <span>
            {turnaroundDays} day{turnaroundDays !== 1 ? "s" : ""} turnaround
          </span>
        </div>

        {/* Completed designs */}
        <p className="text-xs text-muted-foreground">
          {completedDesigns.toLocaleString()} design{completedDesigns !== 1 ? "s" : ""} completed
        </p>

        {/* Software pills */}
        <div className="flex flex-wrap gap-1">
          {software.map((sw) => (
            <span
              key={sw}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {sw}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: price + select */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border p-4">
        {showPrice ? (
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-warm-800">
              {formatPrice(price, currency)}
            </p>
          </div>
        ) : (
          <div />
        )}

        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className={cn(
            "shrink-0 gap-1.5",
            isSelected && "bg-sage-500 hover:bg-sage-400 text-white"
          )}
          onClick={() => onSelect(id)}
          aria-pressed={isSelected}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </article>
  )
}
