'use server'

import { z } from 'zod'
import { sendMessageSchema } from '@/lib/validations/messages'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface MessageRecord {
  id: string
  orderId: string
  senderOrgId: string
  senderName: string
  senderRole: 'client' | 'provider'
  content: string
  attachmentIds: string[]
  createdAt: Date
}

// ─── Send Message ──────────────────────────────────────────────────────────

export async function sendMessage(
  senderOrgId: string,
  senderRole: 'client' | 'provider',
  senderName: string,
  input: z.infer<typeof sendMessageSchema>,
): Promise<ActionResult<MessageRecord>> {
  try {
    const validated = sendMessageSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    // - Verify sender belongs to the order (as client or provider org)
    console.log('sendMessage from:', senderOrgId, 'validated:', validated)

    const message: MessageRecord = {
      id: `msg_${Date.now()}`,
      orderId: validated.orderId,
      senderOrgId,
      senderName,
      senderRole,
      content: validated.content,
      attachmentIds: validated.attachmentIds ?? [],
      createdAt: new Date(),
    }

    return { success: true, data: message }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to send message' }
  }
}

// ─── Get Messages ──────────────────────────────────────────────────────────

export async function getOrderMessages(
  orderId: string,
): Promise<ActionResult<MessageRecord[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // - Verify requesting user belongs to the order
    console.log('getOrderMessages:', orderId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch messages' }
  }
}
