'use server'

import type { ProviderInfo } from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ProviderProfile extends ProviderInfo {
  orgId: string
  isActive: boolean
  bio?: string
  website?: string
  commissionRate: number
  totalEarnings: number
}

export interface UpdateProviderProfileInput {
  bio?: string
  website?: string
  location?: string
  software?: string[]
  turnaroundDays?: number
}

// ─── Get Providers (Marketplace) ──────────────────────────────────────────

export async function getProviders(filters?: {
  categoryType?: 'prosthetics' | 'aligner'
  software?: string[]
  maxTurnaroundDays?: number
}): Promise<ActionResult<ProviderInfo[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // const providers = await db.organization.findMany({
    //   where: { can_design: true, isActive: true },
    //   ...
    // })
    console.log('getProviders with filters:', filters)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch providers' }
  }
}

// ─── Get Provider By ID ────────────────────────────────────────────────────

export async function getProviderById(
  providerId: string,
): Promise<ActionResult<ProviderProfile | null>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getProviderById:', providerId)

    return { success: true, data: null }
  } catch {
    return { success: false, error: 'Failed to fetch provider' }
  }
}

// ─── Update Provider Profile ───────────────────────────────────────────────

export async function updateProviderProfile(
  orgId: string,
  input: UpdateProviderProfileInput,
): Promise<ActionResult<{ orgId: string }>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // Validate that the acting user belongs to orgId (auth check)
    console.log('updateProviderProfile for org:', orgId, 'input:', input)

    return { success: true, data: { orgId } }
  } catch {
    return { success: false, error: 'Failed to update provider profile' }
  }
}

// ─── Get All Providers (Admin) ─────────────────────────────────────────────

export async function getAdminProviders(): Promise<ActionResult<ProviderProfile[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // Admin-only: returns all providers including inactive
    console.log('getAdminProviders')

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch providers' }
  }
}

// ─── Update Provider Status (Admin) ───────────────────────────────────────

export async function updateProviderStatus(
  orgId: string,
  isActive: boolean,
): Promise<ActionResult<{ orgId: string }>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('updateProviderStatus for org:', orgId, 'isActive:', isActive)

    return { success: true, data: { orgId } }
  } catch {
    return { success: false, error: 'Failed to update provider status' }
  }
}
