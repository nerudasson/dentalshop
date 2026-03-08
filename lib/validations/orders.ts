import { z } from 'zod'

// ─── Design Parameters ─────────────────────────────────────────────────────

const designParametersSchema = z.object({
  marginSettings: z
    .string()
    .regex(/^\d*\.?\d+$/, 'Must be a positive number')
    .refine((v) => {
      const n = parseFloat(v)
      return n >= 0.01 && n <= 0.5
    }, 'Margin must be between 0.01mm and 0.5mm'),
  spacerThickness: z
    .string()
    .regex(/^\d*\.?\d+$/, 'Must be a positive number')
    .refine((v) => {
      const n = parseFloat(v)
      return n >= 0.01 && n <= 0.3
    }, 'Spacer thickness must be between 0.01mm and 0.3mm'),
  minimumThickness: z
    .string()
    .regex(/^\d*\.?\d+$/, 'Must be a positive number')
    .refine((v) => {
      const n = parseFloat(v)
      return n >= 0.3 && n <= 3.0
    }, 'Minimum thickness must be between 0.3mm and 3.0mm'),
  contactStrength: z.enum(['Light', 'Medium', 'Heavy']),
  occlusionType: z.enum(['Light Contact', 'Medium Contact', 'Heavy Contact']),
  specialInstructions: z.string().max(2000, 'Special instructions cannot exceed 2000 characters'),
})

// ─── Aligner Config ────────────────────────────────────────────────────────

const alignerConfigSchema = z.object({
  archSelection: z.enum(['upper', 'lower', 'both']),
  treatmentGoals: z
    .array(z.string().min(1))
    .min(1, 'At least one treatment goal is required'),
  additionalGoals: z.string().max(1000, 'Additional goals cannot exceed 1000 characters'),
  complexityTier: z.enum(['simple', 'moderate', 'complex']),
  clinicalConstraints: z.object({
    teethNotToMove: z.string().max(200, 'Field cannot exceed 200 characters'),
    plannedExtractions: z.string().max(200, 'Field cannot exceed 200 characters'),
    otherConstraints: z.string().max(1000, 'Field cannot exceed 1000 characters'),
  }),
  designPreferences: z.object({
    includeAttachmentDesign: z.boolean(),
    includeIPRProtocol: z.boolean(),
    /** null means "no limit" */
    maxStagesPreferred: z
      .number()
      .int('Must be a whole number')
      .positive('Must be a positive number')
      .nullable(),
  }),
})

// ─── Create Prosthetics Order ──────────────────────────────────────────────

export const createProstheticsOrderSchema = z.object({
  category: z.enum([
    'crowns',
    'bridges',
    'inlays_onlays',
    'implant_abutments',
    'partial_frameworks',
    'veneers',
  ]),
  selectedTeeth: z
    .array(
      z
        .number()
        .int('Tooth number must be an integer')
        .refine(
          (n) =>
            (n >= 11 && n <= 18) ||
            (n >= 21 && n <= 28) ||
            (n >= 31 && n <= 38) ||
            (n >= 41 && n <= 48),
          'Tooth number must be valid FDI notation (11–18, 21–28, 31–38, 41–48)',
        ),
    )
    .min(1, 'At least one tooth must be selected'),
  providerId: z.string().min(1, 'A provider must be selected'),
  uploadedFileIds: z
    .array(z.string().min(1))
    .min(1, 'At least one scan file must be uploaded'),
  designParams: designParametersSchema,
})

// ─── Create Aligner Order ──────────────────────────────────────────────────

export const createAlignerOrderSchema = z.object({
  category: z.literal('aligner'),
  alignerConfig: alignerConfigSchema,
  providerId: z.string().min(1, 'A provider must be selected'),
  uploadedFileSections: z.object({
    intraoralScans: z
      .array(z.string().min(1))
      .min(1, 'At least one intraoral scan file is required'),
    clinicalPhotos: z
      .array(z.string().min(1))
      .min(1, 'At least one clinical photo is required'),
    supplementaryFiles: z.array(z.string().min(1)),
  }),
})

// ─── Update Order Status ───────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum([
    'DRAFT',
    'PENDING_PAYMENT',
    'PAID',
    'IN_PROGRESS',
    'REVIEW',
    'REVISION_REQUESTED',
    'COMPLETE',
    'DISPUTED',
    'RESOLVED',
  ]),
  note: z
    .string()
    .max(2000, 'Note cannot exceed 2000 characters')
    .optional(),
})

// ─── Request Revision ──────────────────────────────────────────────────────

export const requestRevisionSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  revisionNote: z
    .string()
    .min(10, 'Please provide a description of the requested changes (min 10 characters)')
    .max(2000, 'Revision note cannot exceed 2000 characters'),
})

// ─── Approve Order ─────────────────────────────────────────────────────────

export const approveOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
})

// ─── Submit Simulation URL ─────────────────────────────────────────────────

export const submitSimulationSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  simulationUrl: z
    .string()
    .url('Must be a valid URL')
    .min(1, 'Simulation URL is required'),
})

// ─── Types ─────────────────────────────────────────────────────────────────

export type CreateProstheticsOrderInput = z.infer<typeof createProstheticsOrderSchema>
export type CreateAlignerOrderInput = z.infer<typeof createAlignerOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>
export type ApproveOrderInput = z.infer<typeof approveOrderSchema>
export type SubmitSimulationInput = z.infer<typeof submitSimulationSchema>
