import { z } from 'zod'

// ─── Create Product ────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().max(1000).optional(),
  categoryType: z.enum(['prosthetics', 'aligner']),
  category: z.string().min(1, 'Category is required').max(100),
  basePrice: z.number().positive('Base price must be greater than zero'),
  pricePerTooth: z.number().min(0).optional(),
  pricePerArch: z.number().min(0).optional(),
  turnaroundDays: z.number().int().min(1).max(90),
  software: z.array(z.string().min(1).max(50)).max(10).optional(),
  isActive: z.boolean().default(true),
})

// ─── Update Product ────────────────────────────────────────────────────────

export const updateProductSchema = createProductSchema.partial().extend({
  productId: z.string().min(1, 'Product ID is required'),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
