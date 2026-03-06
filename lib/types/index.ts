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

// ─── Message Thread ───────────────────────────────────────────────────────────

export interface MessageAttachment {
  name: string
  size: number   // bytes
  url: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: 'client' | 'provider'
  senderAvatar?: string
  createdAt: Date
  attachments?: MessageAttachment[]
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
