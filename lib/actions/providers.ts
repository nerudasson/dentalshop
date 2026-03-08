'use server'

import { db } from '@/lib/db'
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
    const providers = await db.organization.findMany({
      where: {
        canDesign: true,
        isActive:  true,
        ...(filters?.maxTurnaroundDays && {
          turnaroundDays: { lte: filters.maxTurnaroundDays },
        }),
        ...(filters?.software?.length && {
          software: { hasSome: filters.software },
        }),
      },
      orderBy: { averageRating: 'desc' },
    })

    type DbProvider = (typeof providers)[0]
    const result: ProviderInfo[] = providers.map((p: DbProvider) => ({
      id:              p.id,
      name:            p.name,
      logo:            p.logoUrl ?? undefined,
      rating:          p.averageRating,
      reviewCount:     p.reviewCount,
      completedDesigns: p.completedDesigns,
      turnaroundDays:  p.turnaroundDays,
      software:        p.software,
      price:           0, // product-level, use products query for real price
      currency:        'EUR',
      location:        p.location ?? '',
    }))

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'Failed to fetch providers' }
  }
}

// ─── Get Provider By ID ────────────────────────────────────────────────────

export async function getProviderById(
  providerId: string,
): Promise<ActionResult<ProviderProfile | null>> {
  try {
    const p = await db.organization.findUnique({
      where:   { id: providerId },
      include: { feeOverrides: { where: { feeType: 'provider_commission', isActive: true } } },
    })
    type DbOrg = NonNullable<typeof p>

    if (!p) return { success: true, data: null }

    return {
      success: true,
      data: {
        orgId:           p.id,
        id:              p.id,
        name:            p.name,
        logo:            p.logoUrl ?? undefined,
        rating:          p.averageRating,
        reviewCount:     p.reviewCount,
        completedDesigns: p.completedDesigns,
        turnaroundDays:  p.turnaroundDays,
        software:        p.software,
        price:           0,
        currency:        'EUR',
        location:        p.location ?? '',
        isActive:        p.isActive,
        bio:             p.bio ?? undefined,
        website:         p.website ?? undefined,
        commissionRate:  p.feeOverrides[0]?.rate ?? 0.125,
        totalEarnings:   0,
      },
    }
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
    await db.organization.update({
      where: { id: orgId },
      data:  {
        ...(input.bio            !== undefined && { bio: input.bio }),
        ...(input.website        !== undefined && { website: input.website }),
        ...(input.location       !== undefined && { location: input.location }),
        ...(input.software       !== undefined && { software: input.software }),
        ...(input.turnaroundDays !== undefined && { turnaroundDays: input.turnaroundDays }),
      },
    })

    return { success: true, data: { orgId } }
  } catch {
    return { success: false, error: 'Failed to update provider profile' }
  }
}

// ─── Get All Providers (Admin) ─────────────────────────────────────────────

export async function getAdminProviders(): Promise<ActionResult<ProviderProfile[]>> {
  try {
    const providers = await db.organization.findMany({
      where:   { canDesign: true },
      include: { feeOverrides: { where: { feeType: 'provider_commission', isActive: true } } },
      orderBy: { createdAt: 'desc' },
    })

    type DbProviderAdmin = (typeof providers)[0]
    const result: ProviderProfile[] = providers.map((p: DbProviderAdmin) => ({
      orgId:           p.id,
      id:              p.id,
      name:            p.name,
      logo:            p.logoUrl ?? undefined,
      rating:          p.averageRating,
      reviewCount:     p.reviewCount,
      completedDesigns: p.completedDesigns,
      turnaroundDays:  p.turnaroundDays,
      software:        p.software,
      price:           0,
      currency:        'EUR',
      location:        p.location ?? '',
      isActive:        p.isActive,
      bio:             p.bio ?? undefined,
      website:         p.website ?? undefined,
      commissionRate:  p.feeOverrides[0]?.rate ?? 0.125,
      totalEarnings:   0,
    }))

    return { success: true, data: result }
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
    await db.organization.update({
      where: { id: orgId },
      data:  { isActive },
    })

    return { success: true, data: { orgId } }
  } catch {
    return { success: false, error: 'Failed to update provider status' }
  }
}
