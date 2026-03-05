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
