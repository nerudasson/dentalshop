'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
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

    const msg = await db.message.create({
      data: {
        orderId:    validated.orderId,
        senderOrgId,
        senderRole,
        senderName,
        content:    validated.content,
      },
    })

    return {
      success: true,
      data: {
        id:           msg.id,
        orderId:      msg.orderId,
        senderOrgId:  msg.senderOrgId,
        senderName:   msg.senderName,
        senderRole:   msg.senderRole as 'client' | 'provider',
        content:      msg.content,
        attachmentIds: [],
        createdAt:    msg.createdAt,
      },
    }
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
    const messages = await db.message.findMany({
      where:   { orderId },
      orderBy: { createdAt: 'asc' },
    })

    type DbMessage = (typeof messages)[0]
    return {
      success: true,
      data: messages.map((m: DbMessage) => ({
        id:           m.id,
        orderId:      m.orderId,
        senderOrgId:  m.senderOrgId,
        senderName:   m.senderName,
        senderRole:   m.senderRole as 'client' | 'provider',
        content:      m.content,
        attachmentIds: [],
        createdAt:    m.createdAt,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch messages' }
  }
}
