'use server'

import { z } from 'zod'
import { createReviewSchema, respondToReviewSchema } from '@/lib/validations/reviews'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ReviewSummary {
  id: string
  orderId: string
  rating: number
  comment?: string
  response?: string
  clientName: string
  clientOrgName: string
  providerOrgId: string
  createdAt: Date
  respondedAt?: Date
}

// ─── Create Review ─────────────────────────────────────────────────────────

export async function createReview(
  input: z.infer<typeof createReviewSchema>,
): Promise<ActionResult<{ reviewId: string }>> {
  try {
    const validated = createReviewSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // - Verify the order belongs to the current client org
    // - Verify order status is COMPLETE
    // - Verify no review exists for this order yet
    console.log('createReview validated:', validated)

    return { success: true, data: { reviewId: `rev_${Date.now()}` } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to create review' }
  }
}

// ─── Respond to Review ─────────────────────────────────────────────────────

export async function respondToReview(
  input: z.infer<typeof respondToReviewSchema>,
): Promise<ActionResult<{ reviewId: string }>> {
  try {
    const validated = respondToReviewSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // - Verify the review belongs to the current provider org
    // - Verify no response exists yet
    console.log('respondToReview validated:', validated)

    return { success: true, data: { reviewId: validated.reviewId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to respond to review' }
  }
}

// ─── Get Order Reviews ─────────────────────────────────────────────────────

export async function getOrderReviews(
  orderId: string,
): Promise<ActionResult<ReviewSummary[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getOrderReviews:', orderId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// ─── Get Provider Reviews ──────────────────────────────────────────────────

export async function getProviderReviews(
  providerOrgId: string,
): Promise<ActionResult<ReviewSummary[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getProviderReviews:', providerOrgId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch provider reviews' }
  }
}

// ─── Get Client Reviews ────────────────────────────────────────────────────

export async function getClientReviews(
  clientOrgId: string,
): Promise<ActionResult<ReviewSummary[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getClientReviews:', clientOrgId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch client reviews' }
  }
}
