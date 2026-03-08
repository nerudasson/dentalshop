import { z } from 'zod'

// ─── Create Product ────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters'),
  categoryType: z.enum(['prosthetics', 'aligner']),
  /** Subcategory for prosthetics, e.g. "crowns", "bridges" */
  subcategory: z
    .string()
    .max(100, 'Subcategory cannot exceed 100 characters')
    .optional(),
  price: z
    .number()
    .positive('Price must be greater than zero'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code (e.g. EUR, USD)'),
  turnaroundDays: z
    .number()
    .int('Turnaround days must be a whole number')
    .min(1, 'Turnaround must be at least 1 day')
    .max(90, 'Turnaround cannot exceed 90 days'),
  software: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one software must be listed')
    .max(10, 'Cannot list more than 10 software tools'),
  isActive: z.boolean().default(true),
})

// ─── Update Product ────────────────────────────────────────────────────────

export const updateProductSchema = createProductSchema.partial().extend({
  productId: z.string().min(1, 'Product ID is required'),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
