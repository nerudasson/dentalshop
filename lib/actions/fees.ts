'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
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

    let config
    if (validated.configId) {
      config = await db.feeConfiguration.update({
        where: { id: validated.configId },
        data:  { rate: validated.rate, isActive: true },
      })
    } else {
      config = await db.feeConfiguration.create({
        data: {
          scope:       validated.scope ?? 'global',
          orgId:       validated.orgId ?? null,
          serviceType: validated.serviceType ?? null,
          feeType:     validated.feeType,
          rate:        validated.rate,
        },
      })
    }

    return { success: true, data: { configId: config.id } }
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
    const configs = await db.feeConfiguration.findMany({
      where:   { isActive: true },
      orderBy: [{ scope: 'asc' }, { updatedAt: 'desc' }],
    })

    // Apply cascade: org override > service_type > global
    type DbFeeConfig = (typeof configs)[0]
    const filtered = configs.filter((c: DbFeeConfig) => {
      if (c.scope === 'org' && params?.orgId && c.orgId !== params.orgId) return false
      if (c.scope === 'service_type' && params?.serviceType && c.serviceType !== params.serviceType) return false
      return true
    })

    return {
      success: true,
      data: filtered.map((c: (typeof filtered)[0]) => ({
        id:          c.id,
        feeType:     c.feeType as 'client_fee' | 'provider_commission',
        rate:        c.rate,
        orgId:       c.orgId,
        serviceType: c.serviceType as 'prosthetics' | 'aligner' | null,
        updatedAt:   c.updatedAt,
        updatedBy:   'admin',
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch fee configuration' }
  }
}

// ─── Calculate Order Fees ──────────────────────────────────────────────────

export async function calculateOrderFees(params: {
  designPrice: number
  currency: string
  categoryType: 'prosthetics' | 'aligner'
  clientOrgId?: string
  providerOrgId?: string
}): Promise<ActionResult<OrderFeeCalculation>> {
  try {
    // Load configured rates with cascade: org override > service_type > global
    const allConfigs = await db.feeConfiguration.findMany({ where: { isActive: true } })

    type DbFeeConfig2 = (typeof allConfigs)[0]
    const resolve = (feeType: 'client_fee' | 'provider_commission'): number => {
      const orgOverride = allConfigs.find(
        (c: DbFeeConfig2) => c.scope === 'org' && c.feeType === feeType &&
          (c.orgId === params.clientOrgId || c.orgId === params.providerOrgId),
      )
      if (orgOverride) return orgOverride.rate

      const serviceOverride = allConfigs.find(
        (c: DbFeeConfig2) => c.scope === 'service_type' && c.feeType === feeType &&
          c.serviceType === params.categoryType,
      )
      if (serviceOverride) return serviceOverride.rate

      const global = allConfigs.find((c: DbFeeConfig2) => c.scope === 'global' && c.feeType === feeType)
      return global?.rate ?? (feeType === 'client_fee' ? 0.05 : 0.125)
    }

    const CLIENT_FEE_RATE = resolve('client_fee')
    const PROVIDER_COMMISSION_RATE = resolve('provider_commission')
    const VAT_RATE = 0.19

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
