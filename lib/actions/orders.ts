'use server'

import { z } from 'zod'
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

// ─── Create Prosthetics Order ──────────────────────────────────────────────

export async function createProstheticsOrder(
  input: z.infer<typeof createProstheticsOrderSchema>,
): Promise<ActionResult<{ orderId: string; reference: string }>> {
  try {
    const validated = createProstheticsOrderSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // const order = await db.order.create({ data: { ... } })
    console.log('createProstheticsOrder validated input:', validated)

    return {
      success: true,
      data: {
        orderId: `ord_${Date.now()}`,
        reference: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      },
    }
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

    // TODO: Replace with Prisma DB call when database is connected
    console.log('createAlignerOrder validated input:', validated)

    return {
      success: true,
      data: {
        orderId: `ord_${Date.now()}`,
        reference: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      },
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to create order' }
  }
}

// ─── Update Order Status ───────────────────────────────────────────────────

export async function updateOrderStatus(
  input: z.infer<typeof updateOrderStatusSchema>,
): Promise<ActionResult<{ orderId: string; status: OrderStatus }>> {
  try {
    const validated = updateOrderStatusSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // Enforce state machine transitions here
    console.log('updateOrderStatus validated input:', validated)

    return {
      success: true,
      data: { orderId: validated.orderId, status: validated.status },
    }
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

    // TODO: Replace with Prisma DB call when database is connected
    // Sets status → REVISION_REQUESTED and stores revision note
    console.log('requestRevision validated input:', validated)

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

    // TODO: Replace with Prisma DB call when database is connected
    // Sets status → COMPLETE and releases escrow
    console.log('approveOrder validated input:', validated)

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

    // TODO: Replace with Prisma DB call when database is connected
    // Stores simulation URL, sets status → REVIEW
    console.log('submitSimulation validated input:', validated)

    return { success: true, data: { orderId: validated.orderId, version: 1 } }
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
    // TODO: Replace with Prisma DB call when database is connected
    // const orders = await db.order.findMany({ where: { clientOrgId: orgId }, ... })
    console.log('getClientOrders for orgId:', orgId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// ─── Get Orders (Provider) ─────────────────────────────────────────────────

export async function getProviderOrders(orgId: string): Promise<ActionResult<OrderSummary[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getProviderOrders for orgId:', orgId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// ─── Get Order By ID ───────────────────────────────────────────────────────

export async function getOrderById(orderId: string): Promise<ActionResult<OrderSummary | null>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getOrderById:', orderId)

    return { success: true, data: null }
  } catch {
    return { success: false, error: 'Failed to fetch order' }
  }
}
