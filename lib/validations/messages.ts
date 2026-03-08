import { z } from 'zod'

// ─── Send Message ──────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters'),
  /** IDs of files already uploaded to storage, attached to this message */
  attachmentIds: z
    .array(z.string().min(1))
    .max(10, 'Cannot attach more than 10 files per message')
    .optional(),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type SendMessageInput = z.infer<typeof sendMessageSchema>
