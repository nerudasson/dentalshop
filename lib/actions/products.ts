'use server'

import { z } from 'zod'
import { createProductSchema, updateProductSchema } from '@/lib/validations/products'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ProductSummary {
  id: string
  name: string
  description: string
  categoryType: 'prosthetics' | 'aligner'
  subcategory?: string
  price: number
  currency: string
  turnaroundDays: number
  software: string[]
  isActive: boolean
  providerOrgId: string
  createdAt: Date
  updatedAt: Date
}

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// ─── Create Product ────────────────────────────────────────────────────────

export async function createProduct(
  providerOrgId: string,
  input: z.infer<typeof createProductSchema>,
): Promise<ActionResult<{ productId: string }>> {
  try {
    const validated = createProductSchema.parse(input)

    // TODO: Replace with Prisma DB call when database is connected
    console.log('createProduct for org:', providerOrgId, 'validated:', validated)

    return { success: true, data: { productId: `prod_${Date.now()}` } }
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

    // TODO: Replace with Prisma DB call when database is connected
    console.log('updateProduct validated:', validated)

    return { success: true, data: { productId: validated.productId } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? 'Validation failed' }
    }
    return { success: false, error: 'Failed to update product' }
  }
}

// ─── Get Products ──────────────────────────────────────────────────────────

export async function getProviderProducts(
  providerOrgId: string,
): Promise<ActionResult<ProductSummary[]>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getProviderProducts for org:', providerOrgId)

    return { success: true, data: [] }
  } catch {
    return { success: false, error: 'Failed to fetch products' }
  }
}

// ─── Get Product By ID ─────────────────────────────────────────────────────

export async function getProductById(
  productId: string,
): Promise<ActionResult<ProductSummary | null>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    console.log('getProductById:', productId)

    return { success: true, data: null }
  } catch {
    return { success: false, error: 'Failed to fetch product' }
  }
}

// ─── Delete Product ────────────────────────────────────────────────────────

export async function deleteProduct(
  productId: string,
): Promise<ActionResult<{ productId: string }>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // Soft delete: set isActive = false
    console.log('deleteProduct:', productId)

    return { success: true, data: { productId } }
  } catch {
    return { success: false, error: 'Failed to delete product' }
  }
}
