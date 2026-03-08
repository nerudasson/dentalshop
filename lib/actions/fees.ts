'use server'

import { z } from 'zod'
import { updateFeeSchema } from '@/lib/validations/fees'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FeeConfiguration {
  id: string
  feeType: 'client_fee' | 'provider_commission'
  rate: number
  orgId: string | null
  serviceType: 'prosthetics' | 'aligner' | null
  note?: string
  updatedAt: Date
  updatedBy: string
}

export interface OrderFeeCalculation {
  designPrice: number
  clientServiceFee: number
  clientServiceFeeRate: number
  clientTotal: number
  providerCommission: number
  providerCommissionRate: number
  providerPayout: number
  platformFee: number
  vatAmount: number
  vatRate: number
  grandTotal: number
  currency: string
}

// ─── Update Fee Configuration ──────────────────────────────────────────────

export async function updateFee(
  input: z.infer<typeof updateFeeSchema>,
): Promise<ActionResult<{ configId: string }>> {
  try {
    const validated = updateFeeSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // Fee priority: org override > service type > global default
    console.log('updateFee validated:', validated)

    return { success: true, data: { configId: `fee_${Date.now()}` } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to update fee configuration' }
  }
}

// ─── Get Fee Configuration ─────────────────────────────────────────────────

export async function getFeeConfiguration(params?: {
  orgId?: string
  serviceType?: 'prosthetics' | 'aligner'
}): Promise<ActionResult<FeeConfiguration[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // Returns configs in cascade priority: org override → service type → global
    console.log('getFeeConfiguration params:', params)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch fee configuration' }
  }
}

// ─── Calculate Order Fees ──────────────────────────────────────────────────

/**
 * Calculates all fees for a given design price.
 * Fees are locked at order creation — never changed retroactively.
 */
export async function calculateOrderFees(params: {
  designPrice: number
  currency: string
  categoryType: 'prosthetics' | 'aligner'
  clientOrgId?: string
  providerOrgId?: string
}): Promise<ActionResult<OrderFeeCalculation>> {
  try {
    // TODO: Replace with Prisma DB call to fetch actual configured rates
    // For now, use default MVP rates from CLAUDE.md
    const CLIENT_FEE_RATE = 0.05   // 5% client service fee
    const PROVIDER_COMMISSION_RATE = 0.125  // 12.5% provider commission
    const VAT_RATE = 0.19           // 19% VAT (applied to designPrice + serviceFee)

    const { designPrice, currency } = params

    const clientServiceFee = designPrice * CLIENT_FEE_RATE
    const clientSubtotal = designPrice + clientServiceFee
    const vatAmount = clientSubtotal * VAT_RATE
    const clientTotal = clientSubtotal + vatAmount
    const providerCommission = designPrice * PROVIDER_COMMISSION_RATE
    const providerPayout = designPrice - providerCommission
    const platformFee = clientTotal - providerPayout

    return {
      success: true,
      data: {
        designPrice,
        clientServiceFee,
        clientServiceFeeRate: CLIENT_FEE_RATE,
        clientTotal,
        providerCommission,
        providerCommissionRate: PROVIDER_COMMISSION_RATE,
        providerPayout,
        platformFee,
        vatAmount,
        vatRate: VAT_RATE,
        grandTotal: clientTotal,
        currency,
      },
    }
  } catch {
    return { success: false, error: 'Failed to calculate fees' }
  }
}
