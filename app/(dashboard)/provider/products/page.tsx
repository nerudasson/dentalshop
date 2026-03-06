"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Archive,
  ArchiveRestore,
  Copy,
  Package,
  FileText,
  ShoppingCart,
  CheckCircle2,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "Active" | "Draft" | "Archived"

interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  currency: string
  status: ProductStatus
  lastUpdated: Date
  ordersThisMonth: number
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "Crown Design",
    category: "Crowns",
    basePrice: 89,
    currency: "€",
    status: "Active",
    lastUpdated: new Date("2026-02-15"),
    ordersThisMonth: 14,
  },
  {
    id: "prod_002",
    name: "Bridge Design (3-Unit)",
    category: "Bridges",
    basePrice: 145,
    currency: "€",
    status: "Active",
    lastUpdated: new Date("2026-02-10"),
    ordersThisMonth: 6,
  },
  {
    id: "prod_003",
    name: "Inlay / Onlay",
    category: "Inlays/Onlays",
    basePrice: 75,
    currency: "€",
    status: "Active",
    lastUpdated: new Date("2026-01-28"),
    ordersThisMonth: 3,
  },
  {
    id: "prod_004",
    name: "Implant Abutment Custom",
    category: "Implant Abutments",
    basePrice: 120,
    currency: "€",
    status: "Draft",
    lastUpdated: new Date("2026-02-20"),
    ordersThisMonth: 0,
  },
  {
    id: "prod_005",
    name: "Partial Framework",
    category: "Partial Frameworks",
    basePrice: 195,
    currency: "€",
    status: "Active",
    lastUpdated: new Date("2026-01-15"),
    ordersThisMonth: 2,
  },
  {
    id: "prod_006",
    name: "Veneer Set (Per Unit)",
    category: "Veneers",
    basePrice: 65,
    currency: "€",
    status: "Archived",
    lastUpdated: new Date("2025-12-01"),
    ordersThisMonth: 0,
  },
  {
    id: "prod_007",
    name: "Aligner Design — Upper Arch",
    category: "Aligner Design",
    basePrice: 350,
    currency: "€",
    status: "Active",
    lastUpdated: new Date("2026-03-01"),
    ordersThisMonth: 8,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function statusBadgeClass(status: ProductStatus): string {
  switch (status) {
    case "Active":
      return "border-[#4a7c59]/40 bg-[#f3f7f3] text-[#4a7c59]"
    case "Draft":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "Archived":
      return "border-warm-200 bg-muted text-muted-foreground"
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalActive = products.filter((p: Product) => p.status === "Active").length
  const totalDraft = products.filter((p: Product) => p.status === "Draft").length
  const ordersThisMonth = products.reduce((sum: number, p: Product) => sum + p.ordersThisMonth, 0)

  // ── Actions ────────────────────────────────────────────────────────────────
  function toggleArchive(id: string) {
    setProducts((prev: Product[]) =>
      prev.map((p: Product) => {
        if (p.id !== id) return p
        return {
          ...p,
          status: p.status === "Archived" ? "Active" : ("Archived" as ProductStatus),
          lastUpdated: new Date(),
        }
      })
    )
  }

  function duplicate(id: string) {
    const source = products.find((p: Product) => p.id === id)
    if (!source) return
    const clone: Product = {
      ...source,
      id: `prod_${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: "Draft",
      lastUpdated: new Date(),
      ordersThisMonth: 0,
    }
    setProducts((prev: Product[]) => [...prev, clone])
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your service offerings, pricing, and availability.
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/products/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-[#4a7c59]" />}
          iconBg="bg-[#e8ede8]"
          label="Total Active"
          value={totalActive.toString()}
        />
        <StatCard
          icon={<FileText className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Total Draft"
          value={totalDraft.toString()}
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Orders This Month"
          value={ordersThisMonth.toString()}
        />
      </div>

      {/* ── Products Table ─────────────────────────────────────────────────── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Base Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product: Product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {product.currency}
                    {product.basePrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(product.lastUpdated)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      product={product}
                      onToggleArchive={toggleArchive}
                      onDuplicate={duplicate}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border md:hidden">
          {products.map((product: Product) => (
            <div key={product.id} className="flex items-start gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {product.name}
                  </p>
                  <RowActions
                    product={product}
                    onToggleArchive={toggleArchive}
                    onDuplicate={duplicate}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.category} · {product.currency}
                  {product.basePrice.toFixed(2)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(product.status)}`}
                  >
                    {product.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(product.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No products yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first product to start receiving orders.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/provider/products/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add New Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: ReactNode
  iconBg: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ─── RowActions ───────────────────────────────────────────────────────────────

function RowActions({
  product,
  onToggleArchive,
  onDuplicate,
}: {
  product: Product
  onToggleArchive: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/provider/products/${product.id}/edit`}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(product.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleArchive(product.id)}
          className={
            product.status === "Archived"
              ? "text-[#4a7c59] focus:text-[#4a7c59]"
              : "text-destructive focus:text-destructive"
          }
        >
          {product.status === "Archived" ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
