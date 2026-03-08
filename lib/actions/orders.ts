'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import {
  createProstheticsOrderSchema,
  createAlignerOrderSchema,
  updateOrderStatusSchema,
  requestRevisionSchema,
  approveOrderSchema,
  submitSimulationSchema,
} from '@/lib/validations/orders'
import type { OrderStatus } from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OrderSummary {
  category: string
  id: string
  reference: string
  categoryType: 'prosthetics' | 'aligner'
  status: OrderStatus
  providerName: string
  providerOrgId: string
  clientOrgId: string
  totalAmount: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateOrderRef(): string {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 99999)).padStart(5, '0')
  return `ORD-${year}-${num}`
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:               ['PENDING_PAYMENT'],
  PENDING_PAYMENT:     ['PAID'],
  PAID:                ['IN_PROGRESS'],
  IN_PROGRESS:         ['REVIEW'],
  REVIEW:              ['COMPLETE', 'REVISION_REQUESTED', 'DISPUTED'],
  REVISION_REQUESTED:  ['IN_PROGRESS'],
  COMPLETE:            [],
  DISPUTED:            ['RESOLVED'],
  RESOLVED:            [],
}

// ─── Create Prosthetics Order ──────────────────────────────────────────────

export async function createProstheticsOrder(
  input: z.infer<typeof createProstheticsOrderSchema>,
): Promise<ActionResult<{ orderId: string; reference: string }>> {
  try {
    const validated = createProstheticsOrderSchema.parse(input)

    const CLIENT_FEE_RATE = 0.05
    const PROVIDER_COMMISSION_RATE = 0.125

    const reference = generateOrderRef()

    const order = await db.order.create({
      data: {
        reference,
        clientOrgId:           validated.clientOrgId,
        providerOrgId:         validated.providerId,
        categoryType:          'prosthetics',
        status:                'PENDING_PAYMENT',
        clientFeeRate:         CLIENT_FEE_RATE,
        providerCommissionRate: PROVIDER_COMMISSION_RATE,
        orderItems: {
          create: {
            category:       validated.category,
            selectedTeeth:  validated.selectedTeeth,
            designParams:   validated.designParams,
            basePrice:      validated.basePrice,
            extraTeethPrice: validated.extraTeethPrice ?? 0,
          },
        },
      },
    })

    return { success: true, data: { orderId: order.id, reference: order.reference } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to create order' }
  }
}

// ─── Create Aligner Order ──────────────────────────────────────────────────

export async function createAlignerOrder(
  input: z.infer<typeof createAlignerOrderSchema>,
): Promise<ActionResult<{ orderId: string; reference: string }>> {
  try {
    const validated = createAlignerOrderSchema.parse(input)

    const CLIENT_FEE_RATE = 0.05
    const PROVIDER_COMMISSION_RATE = 0.125

    const reference = generateOrderRef()

    const order = await db.order.create({
      data: {
        reference,
        clientOrgId:           validated.clientOrgId,
        providerOrgId:         validated.providerId,
        categoryType:          'aligner',
        status:                'PENDING_PAYMENT',
        clientFeeRate:         CLIENT_FEE_RATE,
        providerCommissionRate: PROVIDER_COMMISSION_RATE,
        orderItems: {
          create: {
            category:      'aligner_design',
            selectedTeeth: [],
            alignerConfig: validated.alignerConfig,
            basePrice:     validated.basePrice,
          },
        },
      },
    })

    return { success: true, data: { orderId: order.id, reference: order.reference } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to create aligner order' }
  }
}

// ─── Update Order Status ───────────────────────────────────────────────────

export async function updateOrderStatus(
  input: z.infer<typeof updateOrderStatusSchema>,
): Promise<ActionResult<{ orderId: string; status: OrderStatus }>> {
  try {
    const validated = updateOrderStatusSchema.parse(input)

    const existing = await db.order.findUniqueOrThrow({ where: { id: validated.orderId } })
    const allowed = VALID_TRANSITIONS[existing.status as OrderStatus] ?? []

    if (!allowed.includes(validated.status)) {
      return {
        success: false,
        error: `Invalid transition from ${existing.status} to ${validated.status}`,
      }
    }

    const updated = await db.order.update({
      where: { id: validated.orderId },
      data:  { status: validated.status },
    })

    return { success: true, data: { orderId: updated.id, status: updated.status as OrderStatus } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to update order status' }
  }
}

// ─── Request Revision ──────────────────────────────────────────────────────

export async function requestRevision(
  input: z.infer<typeof requestRevisionSchema>,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const validated = requestRevisionSchema.parse(input)

    await db.$transaction([
      db.order.update({
        where: { id: validated.orderId },
        data:  { status: 'REVISION_REQUESTED' },
      }),
      db.revisionRequest.create({
        data: {
          orderId:          validated.orderId,
          requestedByOrgId: validated.requestedByOrgId,
          reason:           validated.reason,
        },
      }),
    ])

    return { success: true, data: { orderId: validated.orderId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to request revision' }
  }
}

// ─── Approve Order ─────────────────────────────────────────────────────────

export async function approveOrder(
  input: z.infer<typeof approveOrderSchema>,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const validated = approveOrderSchema.parse(input)

    await db.order.update({
      where: { id: validated.orderId },
      data:  { status: 'COMPLETE' },
    })

    return { success: true, data: { orderId: validated.orderId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to approve order' }
  }
}

// ─── Submit Simulation ─────────────────────────────────────────────────────

export async function submitSimulation(
  input: z.infer<typeof submitSimulationSchema>,
): Promise<ActionResult<{ orderId: string; version: number }>> {
  try {
    const validated = submitSimulationSchema.parse(input)

    const orderItem = await db.orderItem.findFirst({
      where: { orderId: validated.orderId },
      orderBy: { createdAt: 'asc' },
    })

    if (!orderItem) return { success: false, error: 'Order item not found' }

    const prevCount = await db.simulationVersion.count({
      where: { orderItemId: orderItem.id },
    })
    const version = prevCount + 1

    await db.$transaction([
      db.simulationVersion.create({
        data: {
          orderItemId:      orderItem.id,
          url:              validated.simulationUrl,
          version,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          treatmentSummary: (validated.treatmentSummary as any) ?? undefined,
        },
      }),
      db.order.update({
        where: { id: validated.orderId },
        data:  { status: 'REVIEW' },
      }),
    ])

    return { success: true, data: { orderId: validated.orderId, version } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to submit simulation' }
  }
}

// ─── Get Orders (Client) ───────────────────────────────────────────────────

export async function getClientOrders(orgId: string): Promise<ActionResult<OrderSummary[]>> {
  try {
    const orders = await db.order.findMany({
      where:   { clientOrgId: orgId },
      include: { providerOrg: true, transactions: true, orderItems: { take: 1, orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    type DbOrder = (typeof orders)[0]
    const summaries: OrderSummary[] = orders.map((o: DbOrder) => ({
      id:           o.id,
      reference:    o.reference,
      category:     o.orderItems[0]?.category ?? '',
      categoryType: o.categoryType as 'prosthetics' | 'aligner',
      status:       o.status as OrderStatus,
      providerName: o.providerOrg?.name ?? 'Unassigned',
      providerOrgId: o.providerOrgId ?? '',
      clientOrgId:  o.clientOrgId,
      totalAmount:  o.transactions.find((t: {type: string; amount: number}) => t.type === 'client_payment')?.amount ?? 0,
      currency:     'EUR',
      createdAt:    o.createdAt,
      updatedAt:    o.updatedAt,
    }))

    return { success: true, data: summaries }
  } catch {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// ─── Get Orders (Provider) ─────────────────────────────────────────────────

export async function getProviderOrders(orgId: string): Promise<ActionResult<OrderSummary[]>> {
  try {
    const orders = await db.order.findMany({
      where:   { providerOrgId: orgId },
      include: { clientOrg: true, transactions: true, orderItems: { take: 1, orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    type DbOrder2 = (typeof orders)[0]
    const summaries: OrderSummary[] = orders.map((o: DbOrder2) => ({
      id:           o.id,
      reference:    o.reference,
      category:     o.orderItems[0]?.category ?? '',
      categoryType: o.categoryType as 'prosthetics' | 'aligner',
      status:       o.status as OrderStatus,
      providerName: orgId,
      providerOrgId: orgId,
      clientOrgId:  o.clientOrg.id,
      totalAmount:  o.transactions.find((t: {type: string; amount: number}) => t.type === 'client_payment')?.amount ?? 0,
      currency:     'EUR',
      createdAt:    o.createdAt,
      updatedAt:    o.updatedAt,
    }))

    return { success: true, data: summaries }
  } catch {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// ─── Get Order By ID ───────────────────────────────────────────────────────

export async function getOrderById(orderId: string): Promise<ActionResult<OrderSummary | null>> {
  try {
    const o = await db.order.findUnique({
      where:   { id: orderId },
      include: { providerOrg: true, clientOrg: true, transactions: true, orderItems: { take: 1, orderBy: { createdAt: 'asc' } } },
    })

    if (!o) return { success: true, data: null }

    return {
      success: true,
      data: {
        id:           o.id,
        reference:    o.reference,
        category:     o.orderItems[0]?.category ?? '',
        categoryType: o.categoryType as 'prosthetics' | 'aligner',
        status:       o.status as OrderStatus,
        providerName: o.providerOrg?.name ?? 'Unassigned',
        providerOrgId: o.providerOrgId ?? '',
        clientOrgId:  o.clientOrgId,
        totalAmount:  o.transactions.find((t: {type: string; amount: number}) => t.type === 'client_payment')?.amount ?? 0,
        currency:     'EUR',
        createdAt:    o.createdAt,
        updatedAt:    o.updatedAt,
      },
    }
  } catch {
    return { success: false, error: 'Failed to fetch order' }
  }
}
