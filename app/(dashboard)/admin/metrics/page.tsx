"use client"

import React, { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Building2,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  Minus,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import StarRating from "@/components/ui/star-rating"

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d" | "12m"

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: number   // positive = up, negative = down, undefined = neutral
  icon: React.ReactNode
  iconBg: string
}

// ─── Dummy data ────────────────────────────────────────────────────────────────

// Revenue over time — weekly for 12 weeks (ending 2026-03-07)
const REVENUE_WEEKLY = [
  { week: "14 Dec", gmv: 8_420, platformFee: 1_476 },
  { week: "21 Dec", gmv: 6_980, platformFee: 1_221 },
  { week: "28 Dec", gmv: 4_230, platformFee: 741 },
  { week: "04 Jan", gmv: 7_110, platformFee: 1_244 },
  { week: "11 Jan", gmv: 9_540, platformFee: 1_670 },
  { week: "18 Jan", gmv: 11_200, platformFee: 1_960 },
  { week: "25 Jan", gmv: 10_830, platformFee: 1_895 },
  { week: "01 Feb", gmv: 12_650, platformFee: 2_214 },
  { week: "08 Feb", gmv: 13_480, platformFee: 2_359 },
  { week: "15 Feb", gmv: 14_100, platformFee: 2_468 },
  { week: "22 Feb", gmv: 15_720, platformFee: 2_751 },
  { week: "01 Mar", gmv: 16_340, platformFee: 2_860 },
]

// Order volume by day for last 30 days
const ORDER_VOLUME_DAILY = [
  { day: "05 Feb", prosthetics: 3, aligner: 1 },
  { day: "06 Feb", prosthetics: 2, aligner: 0 },
  { day: "07 Feb", prosthetics: 4, aligner: 1 },
  { day: "08 Feb", prosthetics: 1, aligner: 2 },
  { day: "09 Feb", prosthetics: 0, aligner: 0 },
  { day: "10 Feb", prosthetics: 3, aligner: 1 },
  { day: "11 Feb", prosthetics: 2, aligner: 1 },
  { day: "12 Feb", prosthetics: 1, aligner: 0 },
  { day: "13 Feb", prosthetics: 3, aligner: 0 },
  { day: "14 Feb", prosthetics: 4, aligner: 1 },
  { day: "15 Feb", prosthetics: 2, aligner: 1 },
  { day: "16 Feb", prosthetics: 1, aligner: 0 },
  { day: "17 Feb", prosthetics: 0, aligner: 0 },
  { day: "18 Feb", prosthetics: 3, aligner: 1 },
  { day: "19 Feb", prosthetics: 2, aligner: 0 },
  { day: "20 Feb", prosthetics: 4, aligner: 2 },
  { day: "21 Feb", prosthetics: 5, aligner: 1 },
  { day: "22 Feb", prosthetics: 2, aligner: 0 },
  { day: "23 Feb", prosthetics: 1, aligner: 1 },
  { day: "24 Feb", prosthetics: 3, aligner: 0 },
  { day: "25 Feb", prosthetics: 4, aligner: 2 },
  { day: "26 Feb", prosthetics: 3, aligner: 1 },
  { day: "27 Feb", prosthetics: 2, aligner: 0 },
  { day: "28 Feb", prosthetics: 5, aligner: 1 },
  { day: "01 Mar", prosthetics: 4, aligner: 2 },
  { day: "02 Mar", prosthetics: 3, aligner: 1 },
  { day: "03 Mar", prosthetics: 2, aligner: 0 },
  { day: "04 Mar", prosthetics: 4, aligner: 1 },
  { day: "05 Mar", prosthetics: 5, aligner: 2 },
  { day: "06 Mar", prosthetics: 3, aligner: 1 },
]

// Order funnel — status breakdown (snapshot)
const ORDER_FUNNEL = [
  { status: "Draft", count: 4, color: "#d1d5db" },
  { status: "Pending Payment", count: 6, color: "#93c5fd" },
  { status: "Paid / Awaiting Start", count: 8, color: "#60a5fa" },
  { status: "In Progress", count: 14, color: "#a78bfa" },
  { status: "In Review", count: 9, color: "#fb923c" },
  { status: "Complete", count: 87, color: "#4a7c59" },
  { status: "Revision Requested", count: 3, color: "#fbbf24" },
  { status: "Disputed", count: 1, color: "#f87171" },
]

// Category mix
const CATEGORY_MIX = [
  { category: "Crowns", count: 38, gmv: 22_800 },
  { category: "Bridges", count: 19, gmv: 19_950 },
  { category: "Implant Abutments", count: 12, gmv: 10_800 },
  { category: "Veneers", count: 9, gmv: 6_300 },
  { category: "Inlays / Onlays", count: 7, gmv: 4_200 },
  { category: "Partial Frameworks", count: 4, gmv: 4_800 },
  { category: "Aligner Design", count: 23, gmv: 28_750 },
]

// Top providers
const TOP_PROVIDERS = [
  {
    id: "prov_1",
    name: "ClearCAD Studio",
    location: "Berlin, DE",
    completedOrders: 34,
    gmv: 28_560,
    avgRating: 4.9,
    disputeRate: 0,
    revisionRate: 8,
  },
  {
    id: "prov_2",
    name: "DentalDesign Pro",
    location: "Vienna, AT",
    completedOrders: 27,
    gmv: 19_980,
    avgRating: 4.7,
    disputeRate: 0,
    revisionRate: 11,
  },
  {
    id: "prov_3",
    name: "ClearSmile Studio",
    location: "Amsterdam, NL",
    completedOrders: 21,
    gmv: 26_250,
    avgRating: 4.8,
    disputeRate: 1,
    revisionRate: 9,
  },
  {
    id: "prov_4",
    name: "OcclusalWorks",
    location: "Zurich, CH",
    completedOrders: 18,
    gmv: 14_400,
    avgRating: 4.5,
    disputeRate: 0,
    revisionRate: 16,
  },
  {
    id: "prov_5",
    name: "ProsthLab GmbH",
    location: "Munich, DE",
    completedOrders: 12,
    gmv: 9_600,
    avgRating: 4.2,
    disputeRate: 1,
    revisionRate: 22,
  },
]

// KPI snapshot (current month vs last month)
const KPI = {
  gmv: { current: 62_840, prev: 51_290 },
  platformRevenue: { current: 10_997, prev: 8_976 },
  orders: { current: 87, prev: 71 },
  activeProviders: { current: 12, prev: 10 },
  activeClients: { current: 38, prev: 31 },
  avgTurnaround: { current: 2.4, prev: 2.7 },   // days
  revisionRate: { current: 12, prev: 14 },        // %
  disputeRate: { current: 0.8, prev: 1.1 },       // %
  takeRate: { current: 17.5, prev: 17.5 },        // %
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctChange(current: number, prev: number): number {
  if (prev === 0) return 0
  return Math.round(((current - prev) / prev) * 100)
}

function formatEur(amount: number): string {
  return `€${amount.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, icon, iconBg }: KpiCardProps) {
  const isUp = trend !== undefined && trend > 0
  const isDown = trend !== undefined && trend < 0
  const isFlat = trend === 0

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {sub && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div className={`shrink-0 rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
          {isUp && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {isDown && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {isFlat && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          <span
            className={`text-xs font-medium ${
              isUp ? "text-green-600" : isDown ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {isUp ? "+" : ""}
            {trend}% vs last month
          </span>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMetricsPage() {
  const [period, setPeriod] = useState<Period>("30d")

  const gmvTrend = pctChange(KPI.gmv.current, KPI.gmv.prev)
  const revTrend = pctChange(KPI.platformRevenue.current, KPI.platformRevenue.prev)
  const orderTrend = pctChange(KPI.orders.current, KPI.orders.prev)
  const providerTrend = pctChange(KPI.activeProviders.current, KPI.activeProviders.prev)
  const clientTrend = pctChange(KPI.activeClients.current, KPI.activeClients.prev)

  const totalOrdersSnapshot = ORDER_FUNNEL.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Metrics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Platform health, GMV, take rate, and operational KPIs.
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : p === "90d" ? "90 days" : "12 months"}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Gross Merchandise Value"
          value={formatEur(KPI.gmv.current)}
          sub="Total order value processed"
          trend={gmvTrend}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <KpiCard
          label="Platform Revenue"
          value={formatEur(KPI.platformRevenue.current)}
          sub={`Take rate: ${KPI.takeRate.current}%`}
          trend={revTrend}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <KpiCard
          label="Completed Orders"
          value={String(KPI.orders.current)}
          sub="This month"
          trend={orderTrend}
          icon={<Package className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-50"
        />
        <KpiCard
          label="Active Providers"
          value={String(KPI.activeProviders.current)}
          sub="With ≥1 order this month"
          trend={providerTrend}
          icon={<Building2 className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-50"
        />
        <KpiCard
          label="Active Clients"
          value={String(KPI.activeClients.current)}
          sub="Placed ≥1 order this month"
          trend={clientTrend}
          icon={<Users className="h-5 w-5 text-teal-600" />}
          iconBg="bg-teal-50"
        />
      </div>

      {/* ── Operational health row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Avg turnaround */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-purple-50 p-1.5">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">Avg Turnaround</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {KPI.avgTurnaround.current}d
          </p>
          <p className={`mt-0.5 flex items-center gap-0.5 text-xs font-medium ${
            KPI.avgTurnaround.current < KPI.avgTurnaround.prev ? "text-green-600" : "text-red-500"
          }`}>
            {KPI.avgTurnaround.current < KPI.avgTurnaround.prev
              ? <TrendingDown className="h-3 w-3" />
              : <TrendingUp className="h-3 w-3" />
            }
            was {KPI.avgTurnaround.prev}d last month
          </p>
        </div>

        {/* Revision rate */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-50 p-1.5">
              <RotateCcw className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xs text-muted-foreground">Revision Rate</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {KPI.revisionRate.current}%
          </p>
          <p className={`mt-0.5 flex items-center gap-0.5 text-xs font-medium ${
            KPI.revisionRate.current < KPI.revisionRate.prev ? "text-green-600" : "text-red-500"
          }`}>
            {KPI.revisionRate.current < KPI.revisionRate.prev
              ? <TrendingDown className="h-3 w-3" />
              : <TrendingUp className="h-3 w-3" />
            }
            was {KPI.revisionRate.prev}% last month
          </p>
        </div>

        {/* Dispute rate */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-red-50 p-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground">Dispute Rate</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {KPI.disputeRate.current}%
          </p>
          <p className={`mt-0.5 flex items-center gap-0.5 text-xs font-medium ${
            KPI.disputeRate.current < KPI.disputeRate.prev ? "text-green-600" : "text-red-500"
          }`}>
            {KPI.disputeRate.current < KPI.disputeRate.prev
              ? <TrendingDown className="h-3 w-3" />
              : <TrendingUp className="h-3 w-3" />
            }
            was {KPI.disputeRate.prev}% last month
          </p>
        </div>

        {/* Completion rate */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-green-50 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">96.2%</p>
          <p className="mt-0.5 flex items-center gap-0.5 text-xs font-medium text-green-600">
            <TrendingUp className="h-3 w-3" />
            up from 94.8% last month
          </p>
        </div>
      </div>

      {/* ── Revenue chart ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader
          title="Revenue Over Time"
          sub="Weekly GMV and platform fee — last 12 weeks"
        />
        <div className="mt-5 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={REVENUE_WEEKLY}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  `€${Number(value).toLocaleString("en")}`,
                ]}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) =>
                  value === "gmv" ? "GMV" : "Platform Fee"
                }
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#4a7c59"
                strokeWidth={2}
                fill="url(#gmvGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="platformFee"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#feeGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Order volume + funnel ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Daily order volume */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <SectionHeader
            title="Order Volume"
            sub="Daily new orders by track — last 30 days"
          />
          <div className="mt-5 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ORDER_VOLUME_DAILY}
                margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                barSize={8}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="prosthetics" name="Prosthetics" fill="#4a7c59" radius={[2, 2, 0, 0]} />
                <Bar dataKey="aligner" name="Aligner" fill="#0d9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order status snapshot */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <SectionHeader
            title="Order Status Snapshot"
            sub={`${totalOrdersSnapshot} total orders on platform`}
          />
          <div className="mt-4 space-y-2">
            {ORDER_FUNNEL.map((row) => {
              const pct = Math.round((row.count / totalOrdersSnapshot) * 100)
              return (
                <div key={row.status}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.status}</span>
                    <span className="font-medium text-foreground">
                      {row.count}
                      <span className="ml-1 text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Category mix ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader
          title="Revenue by Category"
          sub="All-time completed orders"
        />
        <div className="mt-5 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CATEGORY_MIX}
              layout="vertical"
              margin={{ top: 0, right: 32, left: 8, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="category"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                width={130}
              />
              <Tooltip
                formatter={(value) => [`€${Number(value).toLocaleString("en")}`, "GMV"]}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="gmv" name="GMV" radius={[0, 4, 4, 0]}>
                {CATEGORY_MIX.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={entry.category === "Aligner Design" ? "#0d9488" : "#4a7c59"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top providers ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <SectionHeader
            title="Top Providers by GMV"
            sub="All-time completed orders"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Provider", "Location", "Orders", "GMV", "Avg Rating", "Revision Rate", "Disputes"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {TOP_PROVIDERS.map((prov, idx) => (
                <tr
                  key={prov.id}
                  className={`${idx < TOP_PROVIDERS.length - 1 ? "border-b border-border" : ""} hover:bg-muted/20`}
                >
                  <td className="px-5 py-3 font-medium text-foreground">{prov.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{prov.location}</td>
                  <td className="px-5 py-3 text-foreground">{prov.completedOrders}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatEur(prov.gmv)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={prov.avgRating} starClassName="h-3.5 w-3.5" />
                      <span className="text-xs text-muted-foreground">{prov.avgRating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="outline"
                      className={
                        prov.revisionRate <= 10
                          ? "border-green-200 bg-green-50 text-green-700"
                          : prov.revisionRate <= 18
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    >
                      {prov.revisionRate}%
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {prov.disputeRate === 0 ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        None
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {prov.disputeRate}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border sm:hidden">
          {TOP_PROVIDERS.map((prov) => (
            <div key={prov.id} className="px-4 py-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{prov.name}</p>
                  <p className="text-xs text-muted-foreground">{prov.location}</p>
                </div>
                <StarRating rating={prov.avgRating} starClassName="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{prov.completedOrders}</span> orders
                </span>
                <span className="text-muted-foreground">
                  GMV <span className="font-medium text-foreground">{formatEur(prov.gmv)}</span>
                </span>
                <span className="text-muted-foreground">
                  Revisions <span className="font-medium text-foreground">{prov.revisionRate}%</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Data note ────────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground">
        All figures are dummy data. Connect to the database to see live metrics.
      </p>
    </div>
  )
}
