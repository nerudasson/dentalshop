'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createProductSchema, updateProductSchema } from '@/lib/validations/products'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ProductSummary {
  id: string
  providerOrgId: string
  categoryType: 'prosthetics' | 'aligner'
  category: string
  name: string
  description?: string
  basePrice: number
  pricePerTooth: number
  pricePerArch: number
  turnaroundDays: number
  software: string[]
  isActive: boolean
  createdAt: Date
}

// ─── Create Product ────────────────────────────────────────────────────────

export async function createProduct(
  providerOrgId: string,
  input: z.infer<typeof createProductSchema>,
): Promise<ActionResult<{ productId: string }>> {
  try {
    const validated = createProductSchema.parse(input)

    const product = await db.product.create({
      data: {
        providerOrgId,
        categoryType:  validated.categoryType,
        category:      validated.category,
        name:          validated.name,
        description:   validated.description,
        basePrice:     validated.basePrice,
        pricePerTooth: validated.pricePerTooth ?? 0,
        pricePerArch:  validated.pricePerArch ?? 0,
        turnaroundDays: validated.turnaroundDays,
        software:      validated.software ?? [],
      },
    })

    return { success: true, data: { productId: product.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to create product' }
  }
}

// ─── Update Product ────────────────────────────────────────────────────────

export async function updateProduct(
  input: z.infer<typeof updateProductSchema>,
): Promise<ActionResult<{ productId: string }>> {
  try {
    const validated = updateProductSchema.parse(input)
    const { productId, ...data } = validated

    await db.product.update({
      where: { id: productId },
      data:  {
        ...(data.name          !== undefined && { name: data.name }),
        ...(data.description   !== undefined && { description: data.description }),
        ...(data.basePrice     !== undefined && { basePrice: data.basePrice }),
        ...(data.pricePerTooth !== undefined && { pricePerTooth: data.pricePerTooth }),
        ...(data.pricePerArch  !== undefined && { pricePerArch: data.pricePerArch }),
        ...(data.turnaroundDays !== undefined && { turnaroundDays: data.turnaroundDays }),
        ...(data.software      !== undefined && { software: data.software }),
        ...(data.isActive      !== undefined && { isActive: data.isActive }),
      },
    })

    return { success: true, data: { productId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to update product' }
  }
}

// ─── Get Provider Products ─────────────────────────────────────────────────

export async function getProviderProducts(
  providerOrgId: string,
): Promise<ActionResult<ProductSummary[]>> {
  try {
    const products = await db.product.findMany({
      where:   { providerOrgId },
      orderBy: { createdAt: 'desc' },
    })
    type DbProduct = (typeof products)[0]

    return {
      success: true,
      data: products.map((p: DbProduct) => ({
        id:            p.id,
        providerOrgId: p.providerOrgId,
        categoryType:  p.categoryType as 'prosthetics' | 'aligner',
        category:      p.category,
        name:          p.name,
        description:   p.description ?? undefined,
        basePrice:     p.basePrice,
        pricePerTooth: p.pricePerTooth,
        pricePerArch:  p.pricePerArch,
        turnaroundDays: p.turnaroundDays,
        software:      p.software,
        isActive:      p.isActive,
        createdAt:     p.createdAt,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch products' }
  }
}

// ─── Get Product By ID ─────────────────────────────────────────────────────

export async function getProductById(
  productId: string,
): Promise<ActionResult<ProductSummary | null>> {
  try {
    const p = await db.product.findUnique({ where: { id: productId } })

    if (!p) return { success: true, data: null }

    return {
      success: true,
      data: {
        id:            p.id,
        providerOrgId: p.providerOrgId,
        categoryType:  p.categoryType as 'prosthetics' | 'aligner',
        category:      p.category,
        name:          p.name,
        description:   p.description ?? undefined,
        basePrice:     p.basePrice,
        pricePerTooth: p.pricePerTooth,
        pricePerArch:  p.pricePerArch,
        turnaroundDays: p.turnaroundDays,
        software:      p.software,
        isActive:      p.isActive,
        createdAt:     p.createdAt,
      },
    }
  } catch {
    return { success: false, error: 'Failed to fetch product' }
  }
}

// ─── Delete Product ────────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<ActionResult<{ productId: string }>> {
  try {
    await db.product.update({
      where: { id: productId },
      data:  { isActive: false },
    })

    return { success: true, data: { productId } }
  } catch {
    return { success: false, error: 'Failed to delete product' }
  }
}
