import { z } from 'zod'

// ─── Create Review ─────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .max(1000, 'Review comment cannot exceed 1000 characters')
    .optional(),
  reviewerOrgId: z.string().min(1, 'Reviewer org ID is required'),
})

// ─── Respond to Review ─────────────────────────────────────────────────────

export const respondToReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  response: z
    .string()
    .min(1, 'Response cannot be empty')
    .max(1000, 'Response cannot exceed 1000 characters'),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>
