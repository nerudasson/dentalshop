'use server'

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
    // TODO: Replace with Prisma aggregate queries when database is connected
    console.log('getAdminMetrics')

    return {
      success: true,
      data: {
        totalOrders: 0,
        ordersThisMonth: 0,
        ordersChangePercent: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalProviders: 0,
        activeProviders: 0,
        totalGmv: 0,
        gmvThisMonth: 0,
        gmvChangePercent: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        revenueChangePercent: 0,
        avgOrderValue: 0,
        disputeRate: 0,
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
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getAdminOrders filters:', filters)

    return { success: true, data: { orders: [], total: 0 } }
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
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getAdminProviders filters:', filters)

    return { success: true, data: { providers: [], total: 0 } }
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
    // TODO: Replace with Prisma DB call + Stripe refund/transfer when connected
    // Sets status → RESOLVED and handles payment accordingly
    console.log('resolveDispute:', { orderId, resolution, note })

    return { success: true, data: { orderId } }
  } catch {
    return { success: false, error: 'Failed to resolve dispute' }
  }
}
