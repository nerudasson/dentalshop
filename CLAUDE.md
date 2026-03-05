# SAGA.DENTAL — MVP Project Context

## What This Project Is

A digital design services marketplace for dental prosthetics. Dentists and labs upload scan files, design providers create CAD designs, files are delivered digitally. No physical logistics in MVP — purely digital fulfillment.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma (PostgreSQL) · Stripe Connect · Clerk Auth · S3/R2 for file storage

**Monorepo:** Single Next.js app with role-based routing. No separate frontend/backend repos.

---

## Architecture Rules

- **App Router only** — use `/app` directory, not `/pages`
- **Server Components by default** — only add `"use client"` when you need interactivity
- **TypeScript strict mode** — no `any` types, no `@ts-ignore`
- **Tailwind + shadcn/ui** — no custom CSS files, no styled-components, no CSS modules
- **Prisma for all DB access** — no raw SQL unless absolutely necessary
- **Zod for validation** — all form inputs and API payloads validated with Zod schemas
- **Server Actions for mutations** — use Next.js Server Actions, not API routes, for form submissions
- **API routes for webhooks only** — Stripe webhooks, external integrations

---

## File Structure Convention

```
/app
  /(auth)           — Clerk auth pages
  /(dashboard)      — Authenticated routes
    /client         — Client (dentist/lab) pages
    /provider       — Design provider pages  
    /admin          — Super admin pages
  /api              — Webhook endpoints only

/components
  /layout           — AppShell, WizardLayout, page wrappers
  /providers        — React context providers (RoleProvider, etc.)
  /ui               — Generic UI primitives (shadcn/ui + custom)
  /domain           — Business-specific reusable components

/lib
  /db               — Prisma client, queries, and helpers
  /actions          — Server Actions grouped by domain
  /validations      — Zod schemas
  /utils            — Pure utility functions
  /types            — Shared TypeScript types

/prisma
  schema.prisma     — Full future-proofed schema (MVP only uses subset)
```

---

## User Roles

Three roles, driven by organization capabilities:

| Role | Org Flags | Sidebar Items |
|------|-----------|---------------|
| **Client** (Dentist/Lab) | `is_practice` | Dashboard, Orders, Reviews, Settings |
| **Provider** (Design Center) | `can_design` | Dashboard, Order Queue, Products, Reviews, Settings |
| **Admin** (Platform) | super_admin flag | Dashboard, Orders, Providers, Fee Config, Metrics |

Use `RoleProvider` context to determine which UI to show. Never hardcode role checks — always read from context.

---

## Data Model — Key Points

The schema is future-proofed for production/outsourcing but MVP only uses a subset:

- **organizations** — only `can_design` and `is_practice` flags active in MVP
- **orders** — `selling_org_id` always NULL (direct marketplace, no resellers)
- **order_items** — one item per order in most cases
- **work_steps** — exactly ONE per order_item, always `step_type = "design"`, `sequence = 1`
- **transactions** — three records per order: `client_payment`, `performer_payout`, `platform_fee`
- **routing_rules** — table exists but zero rows (no auto-routing in MVP)
- **fee_configurations** — one global default for client fee, one for provider commission

**Important:** The order system supports two tracks — `prosthetics` and `aligner`. The `categoryType: 'prosthetics' | 'aligner'` flag propagates through the wizard, order detail, and workspace views.

---

## Existing Components — DO NOT REBUILD

### Tier 1 (Shell)
- AppShell: /components/layout/app-shell — main layout with role-aware sidebar
- RoleProvider: /components/providers/role-provider — mocks current user/org context
- WizardLayout: /components/layout/wizard-layout — multi-step form wrapper (dynamic steps)

### Tier 2 (Shared Domain Components)
- ToothChart: /components/domain/tooth-chart — interactive dental tooth selection (prosthetics)
- FileUpload: /components/domain/file-upload — drag-and-drop with format validation + sections
- FileDownloadList: /components/domain/file-download-list — flat file list with download actions
- PriceSummary: /components/domain/price-summary — order price breakdown panel
- ProviderCard: /components/domain/provider-card — provider comparison card (both tracks)
- StarRating: /components/ui/star-rating — interactive and display rating
- OrderStatusBadge: /components/ui/order-status-badge — color-coded status pill (both tracks)
- MessageThread: /components/domain/message-thread — per-order messaging
- CategorySelector: /components/domain/category-selector — product category grid (includes aligner)
- DataTable: /components/ui/data-table — sortable, filterable, paginated table
- EscrowBanner: /components/domain/escrow-banner — buyer protection messaging
- DesignParamsForm: /components/domain/design-params-form — dental design parameters (prosthetics)
- OrderTimeline: /components/domain/order-timeline — vertical progress tracker (both variants)

### Tier 2 (Aligner-Specific Components)
- AlignerConfigForm: /components/domain/aligner-config-form — arch, goals, complexity, constraints
- SimulationViewer: /components/domain/simulation-viewer — URL input (provider) + iframe embed (client)
- StagedFileDownload: /components/domain/staged-file-download — structured aligner deliverables

### Tier 3 (Pages)
<!-- Update as pages are built -->

---

## MVP Pricing Model

Dual-sided fee (Airbnb-style):
- **Client service fee:** ~5% added on top of design price (visible at checkout)
- **Provider commission:** ~12–15% deducted from payout
- **Effective take rate:** ~17–20%

All percentages are admin-configurable. Cascade priority: org override > service type > global default. Fees are locked at order creation — never changed retroactively.

---

## What Is NOT in MVP

Do NOT build any of these:
- Cost Estimation / quoting flow (Phase 2)
- Physical production or shipping (Phase 2)
- Connection/invitation system (Phase 2)
- QR mobile upload or scanner integration (Phase 3)
- In-app notification center (Phase 2) — MVP uses transactional emails only
- In-browser CAD/design tools (Phase 4)
- Outsourcing/routing automation (Phase 3)
- Admin moderation dashboard (Phase 2)
- Revenue analytics (Phase 2)

---

## Coding Conventions

- **Naming:** PascalCase for components, camelCase for functions/variables, kebab-case for file names
- **Component files:** One component per file, default export, file name matches component name
- **Props:** Always define a TypeScript interface, never use inline types
- **State management:** React context for global state, React Query for server state, useState/useReducer for local
- **Error handling:** Always handle loading/error/empty states in UI components
- **Dummy data first:** Build all UI with realistic dummy data before connecting backend
- **Responsive:** Mobile-first, test at 375px minimum width

---

## Build Order (Reference)

1. Shell: App Shell + Role Provider + Wizard Layout
2. Shared Tier 2 components (Data Table → Star Rating → Category Selector → Tooth Chart → ...)
3. Aligner-specific Tier 2 components
4. Pages: Client flow (prosthetics first, then aligner) → Provider flow → Admin
5. Backend: Prisma schema → API routes → replace dummy data
6. Auth & Integrations: Clerk → Stripe Connect → File storage → Emails

Always build prosthetics track first, then add aligner variant.
