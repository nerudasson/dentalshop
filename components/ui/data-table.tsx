"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T = Record<string, unknown>> {
  id: string
  header: string
  accessorKey?: string
  sortable?: boolean
  filterable?: boolean
  cell?: (value: unknown, row: T) => React.ReactNode
  width?: string
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: ColumnDef<T>[]
  data: T[]
  onSort?: (columnId: string, direction: "asc" | "desc") => void
  onFilter?: (filters: Record<string, unknown>) => void
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: PaginationConfig
  isLoading?: boolean
  emptyMessage?: string
  headerActions?: React.ReactNode
}

type SortDirection = "asc" | "desc"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3) {
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, "…", current - 1, current, current + 1, "…", total]
}

function getCellValue(row: unknown, accessorKey: string): unknown {
  return (row as Record<string, unknown>)[accessorKey]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({
  columnId,
  sortColumn,
  sortDirection,
}: {
  columnId: string
  sortColumn: string | null
  sortDirection: SortDirection
}) {
  if (sortColumn !== columnId) {
    return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 shrink-0 opacity-40" />
  }
  return sortDirection === "asc" ? (
    <ChevronUp className="ml-1 inline h-3.5 w-3.5 shrink-0 text-sage-600" />
  ) : (
    <ChevronDown className="ml-1 inline h-3.5 w-3.5 shrink-0 text-sage-600" />
  )
}

function FilterPanel({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-background p-2 shadow-md">
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter…"
          className="h-7 text-xs"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function SkeletonRows({ columns, count }: { columns: ColumnDef[]; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {columns.map((col, colIdx) => (
            <TableCell
              key={col.id}
              style={col.width ? { width: col.width } : undefined}
              className={colIdx === 0 ? "sticky left-0 bg-background" : undefined}
            >
              <div
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${60 + ((rowIdx * colIdx + colIdx * 7) % 40)}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export default function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  onSort,
  onFilter,
  onRowClick,
  searchable = false,
  searchPlaceholder = "Search…",
  pagination,
  isLoading = false,
  emptyMessage = "No results found.",
  headerActions,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [searchValue, setSearchValue] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null)

  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Close filter panel on outside click
  useEffect(() => {
    if (!openFilterColumn) return
    function handleClick(e: MouseEvent) {
      if (
        tableContainerRef.current &&
        !tableContainerRef.current.contains(e.target as Node)
      ) {
        setOpenFilterColumn(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [openFilterColumn])

  function handleSort(columnId: string) {
    let direction: SortDirection = "asc"
    if (sortColumn === columnId) {
      direction = sortDirection === "asc" ? "desc" : "asc"
    }
    setSortColumn(columnId)
    setSortDirection(direction)
    onSort?.(columnId, direction)
  }

  function handleColumnFilter(columnId: string, value: string) {
    const updated = { ...columnFilters, [columnId]: value }
    if (!value) delete updated[columnId]
    setColumnFilters(updated)
    onFilter?.({ ...updated, _search: searchValue })
  }

  function handleSearch(value: string) {
    setSearchValue(value)
    onFilter?.({ ...columnFilters, _search: value })
  }

  function toggleFilterColumn(columnId: string) {
    setOpenFilterColumn((prev) => (prev === columnId ? null : columnId))
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0

  const showingFrom = pagination
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0
  const showingTo = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : 0

  const hasActiveFilters =
    searchValue || Object.keys(columnFilters).length > 0

  return (
    <div className="flex flex-col gap-3" ref={tableContainerRef}>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      {(searchable || headerActions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 w-56 pl-8 text-sm"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {hasActiveFilters && (
              <span className="text-xs text-muted-foreground">
                Filters active
              </span>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                {columns.map((col, colIdx) => {
                  const isActiveSort = sortColumn === col.id
                  const hasActiveFilter = !!columnFilters[col.id]

                  return (
                    <TableHead
                      key={col.id}
                      style={col.width ? { width: col.width } : undefined}
                      className={cn(
                        "bg-warm-100 text-xs font-semibold uppercase tracking-wide select-none",
                        colIdx === 0 && "sticky left-0 z-10",
                        isActiveSort && "text-sage-600"
                      )}
                    >
                      <div className="relative flex items-center gap-1">
                        {/* Sort button */}
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => handleSort(col.id)}
                            className={cn(
                              "flex items-center gap-0 hover:text-foreground transition-colors",
                              isActiveSort ? "text-sage-600" : "text-muted-foreground"
                            )}
                          >
                            {col.header}
                            <SortIcon
                              columnId={col.id}
                              sortColumn={sortColumn}
                              sortDirection={sortDirection}
                            />
                          </button>
                        ) : (
                          <span>{col.header}</span>
                        )}

                        {/* Filter button */}
                        {col.filterable && (
                          <button
                            type="button"
                            onClick={() => toggleFilterColumn(col.id)}
                            className={cn(
                              "ml-0.5 rounded p-0.5 transition-colors",
                              hasActiveFilter
                                ? "text-sage-600"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label={`Filter by ${col.header}`}
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        )}

                        {/* Filter dropdown panel */}
                        {col.filterable && openFilterColumn === col.id && (
                          <FilterPanel
                            value={columnFilters[col.id] ?? ""}
                            onChange={(v) => handleColumnFilter(col.id, v)}
                            onClose={() => setOpenFilterColumn(null)}
                          />
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <SkeletonRows columns={columns} count={pagination?.pageSize ?? 5} />
              ) : data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState message={emptyMessage} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-border/60 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-sage-50",
                      !onRowClick && "hover:bg-sage-50/60"
                    )}
                  >
                    {columns.map((col, colIdx) => {
                      const value = col.accessorKey
                        ? getCellValue(row, col.accessorKey)
                        : undefined

                      return (
                        <TableCell
                          key={col.id}
                          style={col.width ? { width: col.width } : undefined}
                          className={cn(
                            "text-sm",
                            colIdx === 0 &&
                              "sticky left-0 z-10 bg-background font-medium"
                          )}
                        >
                          {col.cell ? col.cell(value, row) : String(value ?? "")}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {showingFrom}–{showingTo} of {pagination.total} results
          </span>

          <div className="flex items-center gap-1">
            {/* Previous */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getPageRange(pagination.page, totalPages).map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => pagination.onPageChange(item as number)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                    pagination.page === item
                      ? "bg-sage-500 text-white"
                      : "hover:bg-muted text-foreground"
                  )}
                  aria-current={pagination.page === item ? "page" : undefined}
                >
                  {item}
                </button>
              )
            )}

            {/* Next */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
