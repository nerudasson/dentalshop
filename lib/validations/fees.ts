import { z } from 'zod'

// ─── Update Fee Configuration ──────────────────────────────────────────────

export const updateFeeSchema = z.object({
  feeType: z.enum(['client_fee', 'provider_commission']),
  /**
   * Fee rate as a decimal (0–1).
   * e.g. 0.05 = 5% client service fee, 0.125 = 12.5% provider commission.
   */
  rate: z
    .number()
    .min(0, 'Rate cannot be negative')
    .max(0.5, 'Rate cannot exceed 50%'),
  /**
   * Scope of the fee override:
   * - null = global default (all orgs / all service types)
   * - orgId set = org-level override
   */
  orgId: z.string().min(1).nullable().optional(),
  /**
   * Optional service-type scoping, e.g. "prosthetics" or "aligner".
   * When null, applies across all service types.
   */
  serviceType: z.enum(['prosthetics', 'aligner']).nullable().optional(),
  /** Human-readable note for audit trail */
  note: z
    .string()
    .max(500, 'Note cannot exceed 500 characters')
    .optional(),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type UpdateFeeInput = z.infer<typeof updateFeeSchema>
