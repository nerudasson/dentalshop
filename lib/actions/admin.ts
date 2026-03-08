'use server'

import { db } from '@/lib/db'
import type { OrderStatus } from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface AdminMetrics {
  totalOrders: number
  ordersThisMonth: number
  ordersChangePercent: number
  activeOrders: number
  completedOrders: number
  totalProviders: number
  activeProviders: number
  totalGmv: number
  gmvThisMonth: number
  gmvChangePercent: number
  totalRevenue: number
  revenueThisMonth: number
  revenueChangePercent: number
  avgOrderValue: number
  disputeRate: number
  currency: string
}

export interface AdminOrderSummary {
  id: string
  reference: string
  category: string
  categoryType: 'prosthetics' | 'aligner'
  status: OrderStatus
  clientOrgName: string
  providerOrgName: string
  totalAmount: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminProviderSummary {
  orgId: string
  name: string
  location: string
  isActive: boolean
  rating: number
  reviewCount: number
  completedOrders: number
  totalEarnings: number
  commissionRate: number
  joinedAt: Date
}

// ─── Get Admin Metrics ─────────────────────────────────────────────────────

export async function getAdminMetrics(): Promise<ActionResult<AdminMetrics>> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      activeOrders,
      completedOrders,
      disputedOrders,
      totalProviders,
      activeProviders,
      gmvAggregate,
      gmvThisMonthAggregate,
      gmvLastMonthAggregate,
      revenueAggregate,
      revenueThisMonthAggregate,
      revenueLastMonthAggregate,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      db.order.count({ where: { status: { in: ['PAID', 'IN_PROGRESS', 'REVIEW', 'REVISION_REQUESTED'] } } }),
      db.order.count({ where: { status: 'COMPLETE' } }),
      db.order.count({ where: { status: 'DISPUTED' } }),
      db.organization.count({ where: { canDesign: true } }),
      db.organization.count({ where: { canDesign: true, isActive: true } }),
      db.transaction.aggregate({ where: { type: 'client_payment' }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'client_payment', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'client_payment', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'platform_fee' }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'platform_fee', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'platform_fee', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
    ])

    const totalGmv = gmvAggregate._sum.amount ?? 0
    const gmvThisMonth = gmvThisMonthAggregate._sum.amount ?? 0
    const gmvLastMonth = gmvLastMonthAggregate._sum.amount ?? 0
    const totalRevenue = revenueAggregate._sum.amount ?? 0
    const revenueThisMonth = revenueThisMonthAggregate._sum.amount ?? 0
    const revenueLastMonth = revenueLastMonthAggregate._sum.amount ?? 0

    const pctChange = (current: number, previous: number) =>
      previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100)

    return {
      success: true,
      data: {
        totalOrders,
        ordersThisMonth,
        ordersChangePercent: pctChange(ordersThisMonth, ordersLastMonth),
        activeOrders,
        completedOrders,
        totalProviders,
        activeProviders,
        totalGmv,
        gmvThisMonth,
        gmvChangePercent: pctChange(gmvThisMonth, gmvLastMonth),
        totalRevenue,
        revenueThisMonth,
        revenueChangePercent: pctChange(revenueThisMonth, revenueLastMonth),
        avgOrderValue: totalOrders > 0 ? totalGmv / totalOrders : 0,
        disputeRate: totalOrders > 0 ? (disputedOrders / totalOrders) * 100 : 0,
        currency: 'EUR',
      },
    }
  } catch {
    return { success: false, error: 'Failed to fetch admin metrics' }
  }
}

// ─── Get Admin Orders ──────────────────────────────────────────────────────

export async function getAdminOrders(filters?: {
  status?: OrderStatus
  categoryType?: 'prosthetics' | 'aligner'
  clientOrgId?: string
  providerOrgId?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<{ orders: AdminOrderSummary[]; total: number }>> {
  try {
    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 20

    const where = {
      ...(filters?.status       && { status:      filters.status }),
      ...(filters?.categoryType && { categoryType: filters.categoryType }),
      ...(filters?.clientOrgId  && { clientOrgId:  filters.clientOrgId }),
      ...(filters?.providerOrgId && { providerOrgId: filters.providerOrgId }),
      ...(filters?.search && {
        OR: [
          { reference:    { contains: filters.search, mode: 'insensitive' as const } },
          { clientOrg:   { name: { contains: filters.search, mode: 'insensitive' as const } } },
          { providerOrg: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include:  { clientOrg: true, providerOrg: true, transactions: true, orderItems: { take: 1, orderBy: { createdAt: 'asc' } } },
        orderBy:  { createdAt: 'desc' },
        skip:     (page - 1) * pageSize,
        take:     pageSize,
      }),
      db.order.count({ where }),
    ])

    type DbAdminOrder = (typeof orders)[0]
    const summaries: AdminOrderSummary[] = orders.map((o: DbAdminOrder) => ({
      id:             o.id,
      reference:      o.reference,
      category:       o.orderItems[0]?.category ?? '',
      categoryType:   o.categoryType as 'prosthetics' | 'aligner',
      status:         o.status as OrderStatus,
      clientOrgName:  o.clientOrg.name,
      providerOrgName: o.providerOrg?.name ?? 'Unassigned',
      totalAmount:    o.transactions.find((t: {type: string; amount: number}) => t.type === 'client_payment')?.amount ?? 0,
      currency:       'EUR',
      createdAt:      o.createdAt,
      updatedAt:      o.updatedAt,
    }))

    return { success: true, data: { orders: summaries, total } }
  } catch {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// ─── Get Admin Providers ───────────────────────────────────────────────────

export async function getAdminProvidersAction(filters?: {
  isActive?: boolean
  search?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<{ providers: AdminProviderSummary[]; total: number }>> {
  try {
    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 20

    const where = {
      canDesign: true,
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && { name: { contains: filters.search, mode: 'insensitive' as const } }),
    }

    const [providers, total] = await Promise.all([
      db.organization.findMany({
        where,
        include: {
          feeOverrides: { where: { feeType: 'provider_commission', isActive: true } },
          providerOrders: {
            where:  { status: 'COMPLETE' },
            select: { id: true },
          },
          receivedReviews: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
      }),
      db.organization.count({ where }),
    ])

    type DbProvider = (typeof providers)[0]
    const summaries: AdminProviderSummary[] = providers.map((p: DbProvider) => ({
      orgId:          p.id,
      name:           p.name,
      location:       p.location ?? '',
      isActive:       p.isActive,
      rating:         p.averageRating,
      reviewCount:    p.reviewCount,
      completedOrders: p.providerOrders.length,
      totalEarnings:  0, // populated via transaction aggregation if needed
      commissionRate: p.feeOverrides[0]?.rate ?? 0.125,
      joinedAt:       p.createdAt,
    }))

    return { success: true, data: { providers: summaries, total } }
  } catch {
    return { success: false, error: 'Failed to fetch providers' }
  }
}

// ─── Resolve Dispute ──────────────────────────────────────────────────────

export async function resolveDispute(
  orderId: string,
  resolution: 'release_to_provider' | 'refund_to_client',
  note: string,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    await db.order.update({
      where: { id: orderId },
      data:  { status: 'RESOLVED' },
    })

    // TODO: trigger Stripe refund or transfer based on resolution
    console.log('resolveDispute:', { orderId, resolution, note })

    return { success: true, data: { orderId } }
  } catch {
    return { success: false, error: 'Failed to resolve dispute' }
  }
}
