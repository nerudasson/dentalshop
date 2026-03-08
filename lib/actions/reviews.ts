'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
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

    const order = await db.order.findUnique({ where: { id: validated.orderId } })
    if (!order) return { success: false, error: 'Order not found' }
    if (order.status !== 'COMPLETE') return { success: false, error: 'Order is not complete' }

    const review = await db.review.create({
      data: {
        orderId:      validated.orderId,
        reviewerOrgId: validated.reviewerOrgId,
        revieweeOrgId: order.providerOrgId!,
        rating:       validated.rating,
        comment:      validated.comment,
      },
    })

    // Update provider average rating
    const agg = await db.review.aggregate({
      where: { revieweeOrgId: order.providerOrgId! },
      _avg:  { rating: true },
      _count: { rating: true },
    })
    await db.organization.update({
      where: { id: order.providerOrgId! },
      data:  {
        averageRating: agg._avg.rating ?? 0,
        reviewCount:   agg._count.rating,
      },
    })

    return { success: true, data: { reviewId: review.id } }
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

    await db.review.update({
      where: { id: validated.reviewId },
      data:  { response: validated.response, respondedAt: new Date() },
    })

    return { success: true, data: { reviewId: validated.reviewId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to respond to review' }
  }
}

// ─── Get Order Reviews ─────────────────────────────────────────────────────

export async function getOrderReviews(orderId: string): Promise<ActionResult<ReviewSummary[]>> {
  try {
    const reviews = await db.review.findMany({
      where:   { orderId },
      include: { reviewerOrg: true },
    })

    return {
      success: true,
      data: reviews.map((r: (typeof reviews)[0]) => ({
        id:            r.id,
        orderId:       r.orderId,
        rating:        r.rating,
        comment:       r.comment ?? undefined,
        response:      r.response ?? undefined,
        clientName:    r.reviewerOrg.name,
        clientOrgName: r.reviewerOrg.name,
        providerOrgId: r.revieweeOrgId,
        createdAt:     r.createdAt,
        respondedAt:   r.respondedAt ?? undefined,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// ─── Get Provider Reviews ──────────────────────────────────────────────────

export async function getProviderReviews(
  providerOrgId: string,
): Promise<ActionResult<ReviewSummary[]>> {
  try {
    const reviews = await db.review.findMany({
      where:   { revieweeOrgId: providerOrgId },
      include: { reviewerOrg: true },
      orderBy: { createdAt: 'desc' },
    })

    type DbProviderReview = (typeof reviews)[0]
    return {
      success: true,
      data: reviews.map((r: DbProviderReview) => ({
        id:            r.id,
        orderId:       r.orderId,
        rating:        r.rating,
        comment:       r.comment ?? undefined,
        response:      r.response ?? undefined,
        clientName:    r.reviewerOrg.name,
        clientOrgName: r.reviewerOrg.name,
        providerOrgId: r.revieweeOrgId,
        createdAt:     r.createdAt,
        respondedAt:   r.respondedAt ?? undefined,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch provider reviews' }
  }
}

// ─── Get Client Reviews ────────────────────────────────────────────────────

export async function getClientReviews(
  clientOrgId: string,
): Promise<ActionResult<ReviewSummary[]>> {
  try {
    const reviews = await db.review.findMany({
      where:   { reviewerOrgId: clientOrgId },
      include: { reviewerOrg: true },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: reviews.map((r: (typeof reviews)[0]) => ({
        id:            r.id,
        orderId:       r.orderId,
        rating:        r.rating,
        comment:       r.comment ?? undefined,
        response:      r.response ?? undefined,
        clientName:    r.reviewerOrg.name,
        clientOrgName: r.reviewerOrg.name,
        providerOrgId: r.revieweeOrgId,
        createdAt:     r.createdAt,
        respondedAt:   r.respondedAt ?? undefined,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch client reviews' }
  }
}
