// ─── Roles ────────────────────────────────────────────────────────────────────

export type Role = 'client' | 'provider' | 'admin'

// ─── Organization ─────────────────────────────────────────────────────────────

export interface OrgFlags {
  is_practice: boolean
  can_design: boolean
  is_super_admin: boolean
}

// ─── Role Context ─────────────────────────────────────────────────────────────

/** Shape of the RoleProvider context value. */
export interface RoleContextValue {
  role: Role
  orgId: string
  userId: string
  orgName: string
  orgFlags: OrgFlags
  /** Dev-only: switch to a different dummy profile */
  setProfileIndex: (index: number) => void
  /** All available dummy profiles (dev mode only) */
  profiles: DummyProfile[]
}

// ─── Dummy data types ─────────────────────────────────────────────────────────

export interface DummyProfile {
  role: Role
  orgId: string
  userId: string
  orgName: string
  displayName: string
  orgFlags: OrgFlags
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'REVISION_REQUESTED'
  | 'COMPLETE'
  | 'DISPUTED'
  | 'RESOLVED'

export type CategoryType = 'prosthetics' | 'aligner'

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
  // lucide icon component type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<{ className?: string }>
}

// ─── File Upload ───────────────────────────────────────────────────────────────

export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'complete' | 'error'
  progress?: number       // 0–100, relevant when status='uploading'
  section?: string        // section label the file belongs to
  errorMessage?: string   // shown on error rows
}

export interface UploadSection {
  label: string           // e.g. "Intraoral Scans"
  acceptedFormats: string[]
  required: boolean
  description?: string
  maxFiles?: number
}

// ─── Design Parameters ────────────────────────────────────────────────────────

/** Prosthetics-specific design parameters captured during order creation. */
export interface DesignParameters {
  /** Distance between preparation margin and restoration edge, e.g. "0.05mm" */
  marginSettings: string
  /** Cement gap between preparation and restoration, e.g. "0.03mm" */
  spacerThickness: string
  /** Minimum wall thickness of the restoration, e.g. "0.5mm" */
  minimumThickness: string
  /** Proximal contact force: "Light" | "Medium" | "Heavy" */
  contactStrength: string
  /** Occlusal contact level: "Light Contact" | "Medium Contact" | "Heavy Contact" */
  occlusionType: string
  /** Free-text notes for the design provider */
  specialInstructions: string
}

// ─── Aligner Config ───────────────────────────────────────────────────────────

export type ArchSelection = 'upper' | 'lower' | 'both'
export type ComplexityTier = 'simple' | 'moderate' | 'complex'

export interface AlignerConfig {
  archSelection: ArchSelection
  /** Slugs from the TREATMENT_GOALS constant, e.g. ["crowding", "deep_bite"] */
  treatmentGoals: string[]
  additionalGoals: string
  complexityTier: ComplexityTier
  clinicalConstraints: {
    /** FDI-notation teeth not to be moved, e.g. "17, 27" */
    teethNotToMove: string
    /** FDI-notation teeth to be extracted, e.g. "14, 24" */
    plannedExtractions: string
    otherConstraints: string
  }
  designPreferences: {
    includeAttachmentDesign: boolean
    includeIPRProtocol: boolean
    /** null means "no limit" */
    maxStagesPreferred: number | null
  }
}

// ─── Order Timeline ───────────────────────────────────────────────────────────

export interface TimelineEvent {
  /** Machine-readable step key, e.g. "order_placed" */
  status: string
  /** Human-readable label shown in the timeline */
  label: string
  /** Set when the step has been reached; null/undefined if still in the future */
  timestamp?: Date
  /** True when this is the step currently being worked on */
  isActive: boolean
  /** True when this step has been fully completed */
  isCompleted: boolean
  /** Optional detail text rendered below the label */
  description?: string
}

// ─── Simulation Viewer ────────────────────────────────────────────────────────

export interface SimulationVersion {
  url: string
  submittedAt: Date
  version: number
}

export interface TreatmentSummary {
  totalStages: number
  estimatedDuration: string
  iprRequired: boolean
  upperArchStages?: number
  lowerArchStages?: number
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ProviderInfo {
  id: string
  name: string
  logo?: string           // URL; falls back to initials if absent
  rating: number          // 1–5
  reviewCount: number
  completedDesigns: number
  turnaroundDays: number  // e.g. 3 → displayed as "3 days"
  software: string[]      // e.g. ["exocad", "3Shape"] or ["SureSmile", "Archform"]
  price: number
  currency: string        // e.g. "EUR", "USD"
  location: string
}
