"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Crown,
  Link2,
  Layers,
  Wrench,
  LayoutGrid,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Copy,
  PackageCheck,
  Package,
  PackageX,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "active" | "draft" | "archived"

interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  useTiers: boolean
  minTierPrice: number
  status: ProductStatus
  ordersThisMonth: number
  lastUpdated: string
}

// ─── Dummy data ────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "Crown Design",
    category: "Crowns",
    basePrice: 85,
    useTiers: true,
    minTierPrice: 75,
    status: "active",
    ordersThisMonth: 12,
    lastUpdated: "2026-03-05",
  },
  {
    id: "prod_002",
    name: "Crown Design — Premium",
    category: "Crowns",
    basePrice: 130,
    useTiers: false,
    minTierPrice: 130,
    status: "active",
    ordersThisMonth: 7,
    lastUpdated: "2026-03-04",
  },
  {
    id: "prod_003",
    name: "Bridge Framework",
    category: "Bridges",
    basePrice: 120,
    useTiers: true,
    minTierPrice: 95,
    status: "active",
    ordersThisMonth: 4,
    lastUpdated: "2026-02-28",
  },
  {
    id: "prod_004",
    name: "Inlay / Onlay Design",
    category: "Inlays/Onlays",
    basePrice: 65,
    useTiers: false,
    minTierPrice: 65,
    status: "draft",
    ordersThisMonth: 0,
    lastUpdated: "2026-03-01",
  },
  {
    id: "prod_005",
    name: "Veneer Set",
    category: "Veneers",
    basePrice: 90,
    useTiers: false,
    minTierPrice: 90,
    status: "draft",
    ordersThisMonth: 0,
    lastUpdated: "2026-02-20",
  },
  {
    id: "prod_006",
    name: "Implant Abutment Design",
    category: "Implant Abutments",
    basePrice: 110,
    useTiers: true,
    minTierPrice: 90,
    status: "archived",
    ordersThisMonth: 0,
    lastUpdated: "2026-01-15",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Crowns: Crown,
  Bridges: Link2,
  "Inlays/Onlays": Layers,
  "Implant Abutments": Wrench,
  "Partial Frameworks": LayoutGrid,
  Veneers: Sparkles,
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function generateId(): string {
  return "prod_" + Math.random().toString(36).slice(2, 9)
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const config = {
    active: {
      label: "Active",
      className: "border-sage-200 bg-sage-50 text-sage-700",
    },
    draft: {
      label: "Draft",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    archived: {
      label: "Archived",
      className: "border-warm-300 bg-warm-100 text-muted-foreground",
    },
  } as const

  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {label}
    </Badge>
  )
}

// ─── Category Icon Cell ───────────────────────────────────────────────────────

function CategoryCell({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] ?? Crown
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-sage-50">
        <Icon className="h-3.5 w-3.5 text-sage-500" />
      </div>
      <span className="text-sm text-warm-800">{category}</span>
    </div>
  )
}

// ─── Row Actions ─────────────────────────────────────────────────────────────

interface RowActionsProps {
  product: Product
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onDuplicate: (id: string) => void
}

function RowActions({ product, onArchive, onUnarchive, onDuplicate }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="Product actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/provider/products/${product.id}/edit`} className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => onDuplicate(product.id)}
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {product.status === "archived" ? (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => onUnarchive(product.id)}
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Unarchive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="flex items-center gap-2 text-muted-foreground"
            onClick={() => onArchive(product.id)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Mobile Product Card ──────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onDuplicate: (id: string) => void
}

function ProductCard({ product, onArchive, onUnarchive, onDuplicate }: ProductCardProps) {
  const Icon = CATEGORY_ICONS[product.category] ?? Crown
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        product.status === "archived" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sage-50">
            <Icon className="h-5 w-5 text-sage-500" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-warm-800">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
        </div>
        <RowActions
          product={product}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDuplicate={onDuplicate}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</p>
          <p className="mt-0.5 text-sm font-semibold text-warm-800">
            {product.useTiers ? `from €${product.minTierPrice}` : `€${product.basePrice}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-0.5">
            <ProductStatusBadge status={product.status} />
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Orders</p>
          <p className="mt-0.5 text-sm font-semibold text-warm-800">{product.ordersThisMonth}</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Updated {formatDate(product.lastUpdated)}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [filter, setFilter] = useState<"all" | ProductStatus>("all")

  const totalActive = products.filter((p) => p.status === "active").length
  const totalDraft = products.filter((p) => p.status === "draft").length
  const ordersThisMonth = products.reduce((sum, p) => sum + p.ordersThisMonth, 0)

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.status === filter)

  function handleArchive(id: string) {
    setProducts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, status: "archived" as const } : p))
    )
  }

  function handleUnarchive(id: string) {
    setProducts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, status: "draft" as const } : p))
    )
  }

  function handleDuplicate(id: string) {
    const source = products.find((p) => p.id === id)
    if (!source) return
    const duplicate: Product = {
      ...source,
      id: generateId(),
      name: `${source.name} (Copy)`,
      status: "draft",
      ordersThisMonth: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setProducts((ps) => {
      const idx = ps.findIndex((p) => p.id === id)
      const next = [...ps]
      next.splice(idx + 1, 0, duplicate)
      return next
    })
  }

  const filterTabs: { value: "all" | ProductStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your design service offerings, pricing, and availability
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/products/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sage-50">
            <PackageCheck className="h-5 w-5 text-sage-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Active</p>
            <p className="text-2xl font-bold text-warm-800">{totalActive}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50">
            <Package className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Draft</p>
            <p className="text-2xl font-bold text-warm-800">{totalDraft}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50">
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orders This Month</p>
            <p className="text-2xl font-bold text-warm-800">{ordersThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {filterTabs.map((tab) => {
          const count =
            tab.value === "all"
              ? products.length
              : products.filter((p) => p.status === tab.value).length
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "border-sage-500 text-sage-700"
                  : "border-transparent text-muted-foreground hover:text-warm-800"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  filter === tab.value
                    ? "bg-sage-100 text-sage-700"
                    : "bg-warm-100 text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-dashed border-warm-300 py-16 text-center">
          <PackageX className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-warm-800">No products found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === "all"
              ? "Add your first product to start receiving orders."
              : `No ${filter} products yet.`}
          </p>
          {filter === "all" && (
            <Button asChild className="mt-4">
              <Link href="/provider/products/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
          )}
        </div>
      )}

      {filteredProducts.length > 0 && (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-warm-50">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Base Price
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Orders / Mo
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Last Updated
                    </th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={cn(
                        "group transition-colors hover:bg-warm-50",
                        product.status === "archived" && "opacity-60"
                      )}
                    >
                      {/* Product name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const Icon = CATEGORY_ICONS[product.category] ?? Crown
                            return (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sage-50">
                                <Icon className="h-4 w-4 text-sage-500" />
                              </div>
                            )
                          })()}
                          <span className="font-medium text-warm-800">{product.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <CategoryCell category={product.category} />
                      </td>

                      {/* Base price */}
                      <td className="px-4 py-3 font-medium text-warm-800">
                        {product.useTiers ? (
                          <span>
                            from €{product.minTierPrice}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              (tiered)
                            </span>
                          </span>
                        ) : (
                          `€${product.basePrice}`
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <ProductStatusBadge status={product.status} />
                      </td>

                      {/* Orders this month */}
                      <td className="px-4 py-3">
                        {product.ordersThisMonth > 0 ? (
                          <span className="font-semibold text-warm-800">
                            {product.ordersThisMonth}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Last updated */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(product.lastUpdated)}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-3 text-right">
                        <RowActions
                          product={product}
                          onArchive={handleArchive}
                          onUnarchive={handleUnarchive}
                          onDuplicate={handleDuplicate}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table footer */}
              <div className="border-t border-border px-4 py-2.5">
                <p className="text-xs text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} product
                  {products.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
