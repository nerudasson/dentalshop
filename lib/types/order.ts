// ─── Order Status ─────────────────────────────────────────────────────────────
//
// UI-facing order status type (snake_case). Covers both prosthetics and aligner
// tracks. This is separate from the DB-layer OrderStatus in lib/types/index.ts
// which uses SCREAMING_SNAKE_CASE.

export type OrderStatus =
  // Shared statuses
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  // Prosthetics-specific
  | 'in_review'
  | 'revision_requested'
  // Aligner-specific
  | 'treatment_planning'
  | 'simulation_submitted'
  | 'modifications_requested'
  | 'treatment_plan_approved'
  | 'deliverables_uploaded'
