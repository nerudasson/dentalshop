"use client"

import { useMemo, useState } from "react"
import { Download, Plus } from "lucide-react"
import DataTable, { type ColumnDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { OrderStatus } from "@/lib/types"

// ─── Dummy data ───────────────────────────────────────────────────────────────

interface DemoOrder {
  id: string
  patient: string
  category: "prosthetics" | "aligner"
  tooth: string
  status: OrderStatus
  provider: string
  amount: number
  date: string
}

const ALL_ORDERS: DemoOrder[] = [
  { id: "ORD-001", patient: "James Whitmore",  category: "prosthetics", tooth: "#14 Crown",       status: "IN_PROGRESS",         provider: "ClearCAD Studio",   amount: 95,  date: "2026-03-01" },
  { id: "ORD-002", patient: "Sara Kim",        category: "aligner",     tooth: "Full arch",       status: "REVIEW",              provider: "AlignPro Design",   amount: 210, date: "2026-03-01" },
  { id: "ORD-003", patient: "Marco Rossi",     category: "prosthetics", tooth: "#3 Bridge",       status: "COMPLETE",            provider: "ClearCAD Studio",   amount: 175, date: "2026-02-28" },
  { id: "ORD-004", patient: "Anya Patel",      category: "aligner",     tooth: "Upper arch",      status: "PAID",                provider: "AlignPro Design",   amount: 190, date: "2026-02-28" },
  { id: "ORD-005", patient: "Ben Carter",      category: "prosthetics", tooth: "#19 Implant",     status: "IN_PROGRESS",         provider: "DentaCAD Co.",      amount: 140, date: "2026-02-27" },
  { id: "ORD-006", patient: "Yuki Tanaka",     category: "prosthetics", tooth: "#8 Veneer",       status: "REVISION_REQUESTED",  provider: "ClearCAD Studio",   amount: 80,  date: "2026-02-27" },
  { id: "ORD-007", patient: "Fatima Hassan",   category: "aligner",     tooth: "Lower arch",      status: "COMPLETE",            provider: "AlignPro Design",   amount: 195, date: "2026-02-26" },
  { id: "ORD-008", patient: "Luis Moreno",     category: "prosthetics", tooth: "#30 Crown",       status: "PENDING_PAYMENT",     provider: "DentaCAD Co.",      amount: 90,  date: "2026-02-26" },
  { id: "ORD-009", patient: "Clara Webb",      category: "prosthetics", tooth: "#4 Bridge",       status: "DISPUTED",            provider: "ClearCAD Studio",   amount: 160, date: "2026-02-25" },
  { id: "ORD-010", patient: "Ravi Nair",       category: "aligner",     tooth: "Full arch",       status: "IN_PROGRESS",         provider: "AlignPro Design",   amount: 220, date: "2026-02-25" },
  { id: "ORD-011", patient: "Emma Larsson",    category: "prosthetics", tooth: "#12 Crown",       status: "PAID",                provider: "DentaCAD Co.",      amount: 88,  date: "2026-02-24" },
  { id: "ORD-012", patient: "Daniel Park",     category: "prosthetics", tooth: "#18 Implant",     status: "COMPLETE",            provider: "ClearCAD Studio",   amount: 145, date: "2026-02-24" },
  { id: "ORD-013", patient: "Sofia Russo",     category: "aligner",     tooth: "Upper arch",      status: "REVIEW",              provider: "AlignPro Design",   amount: 205, date: "2026-02-23" },
  { id: "ORD-014", patient: "Thomas Müller",   category: "prosthetics", tooth: "#2 Crown",        status: "IN_PROGRESS",         provider: "DentaCAD Co.",      amount: 92,  date: "2026-02-23" },
  { id: "ORD-015", patient: "Amira Osei",      category: "prosthetics", tooth: "#15 Bridge",      status: "DRAFT",               provider: "ClearCAD Studio",   amount: 170, date: "2026-02-22" },
  { id: "ORD-016", patient: "Jake Wilson",     category: "aligner",     tooth: "Lower arch",      status: "COMPLETE",            provider: "AlignPro Design",   amount: 185, date: "2026-02-22" },
  { id: "ORD-017", patient: "Nina Volkov",     category: "prosthetics", tooth: "#29 Crown",       status: "REVISION_REQUESTED",  provider: "DentaCAD Co.",      amount: 87,  date: "2026-02-21" },
  { id: "ORD-018", patient: "Carlos Suarez",   category: "prosthetics", tooth: "#5 Veneer",       status: "RESOLVED",            provider: "ClearCAD Studio",   amount: 75,  date: "2026-02-21" },
  { id: "ORD-019", patient: "Mei Chen",        category: "aligner",     tooth: "Full arch",       status: "PAID",                provider: "AlignPro Design",   amount: 215, date: "2026-02-20" },
  { id: "ORD-020", patient: "Oliver Brown",    category: "prosthetics", tooth: "#20 Implant",     status: "IN_PROGRESS",         provider: "DentaCAD Co.",      amount: 150, date: "2026-02-20" },
]

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:               { label: "Draft",      className: "bg-muted text-muted-foreground border-transparent" },
  PENDING_PAYMENT:     { label: "Pending",    className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PAID:                { label: "Paid",       className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS:         { label: "In Progress",className: "bg-purple-50 text-purple-700 border-purple-200" },
  REVIEW:              { label: "Review",     className: "bg-orange-50 text-orange-700 border-orange-200" },
  REVISION_REQUESTED:  { label: "Revision",   className: "bg-red-50 text-red-700 border-red-200" },
  COMPLETE:            { label: "Complete",   className: "bg-green-50 text-green-700 border-green-200" },
  DISPUTED:            { label: "Disputed",   className: "bg-red-100 text-red-800 border-red-300" },
  RESOLVED:            { label: "Resolved",   className: "bg-gray-50 text-gray-700 border-gray-200" },
}

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: ColumnDef<DemoOrder>[] = [
  {
    id: "id",
    header: "Order ID",
    accessorKey: "id",
    sortable: true,
    width: "110px",
  },
  {
    id: "patient",
    header: "Patient",
    accessorKey: "patient",
    sortable: true,
    filterable: true,
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    filterable: true,
    cell: (value) => (
      <span className="capitalize text-sm">{String(value)}</span>
    ),
  },
  {
    id: "tooth",
    header: "Tooth / Type",
    accessorKey: "tooth",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    filterable: true,
    cell: (value) => {
      const cfg = STATUS_CONFIG[String(value)] ?? { label: String(value), className: "" }
      return (
        <Badge variant="outline" className={cfg.className}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    id: "provider",
    header: "Provider",
    accessorKey: "provider",
    filterable: true,
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    width: "100px",
    cell: (value) => (
      <span className="font-medium tabular-nums">${Number(value).toFixed(2)}</span>
    ),
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    sortable: true,
    width: "110px",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5

export default function DemoTablePage() {
  const [page, setPage] = useState(1)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Client-side filter + sort for demo purposes
  const filtered = useMemo(() => {
    let rows = [...ALL_ORDERS]
    const search = String(filters._search ?? "").toLowerCase()

    if (search) {
      rows = rows.filter((r) =>
        [r.patient, r.id, r.provider, r.tooth, r.status, r.category].some((v) =>
          String(v).toLowerCase().includes(search)
        )
      )
    }

    // Column filters (text match)
    const colFilters = Object.entries(filters).filter(([k]) => k !== "_search")
    for (const [key, value] of colFilters) {
      const term = String(value).toLowerCase()
      if (!term) continue
      rows = rows.filter((r) =>
        String((r as Record<string, unknown>)[key] ?? "")
          .toLowerCase()
          .includes(term)
      )
    }

    if (sortCol) {
      rows.sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortCol] ?? "")
        const bv = String((b as Record<string, unknown>)[sortCol] ?? "")
        const numeric = !isNaN(Number(av)) && !isNaN(Number(bv))
        const cmp = numeric ? Number(av) - Number(bv) : av.localeCompare(bv)
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return rows
  }, [filters, sortCol, sortDir])

  const paginatedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(columnId: string, direction: "asc" | "desc") {
    setSortCol(columnId)
    setSortDir(direction)
    setPage(1)
  }

  function handleFilter(incoming: Record<string, unknown>) {
    setFilters(incoming)
    setPage(1)
  }

  function simulateLoading() {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All platform orders — demo table showing sort, filter, search, and pagination.
      </p>

      <div className="mt-6">
        <DataTable<DemoOrder>
          columns={COLUMNS}
          data={paginatedData}
          searchable
          searchPlaceholder="Search orders…"
          isLoading={isLoading}
          emptyMessage="No orders match your search."
          onSort={handleSort}
          onFilter={handleFilter}
          onRowClick={(row) => alert(`Clicked: ${row.id} — ${row.patient}`)}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            onPageChange: setPage,
          }}
          headerActions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={simulateLoading}
              >
                <Download className="h-3.5 w-3.5" />
                Simulate Load
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                New Order
              </Button>
            </>
          }
        />
      </div>
    </div>
  )
}
