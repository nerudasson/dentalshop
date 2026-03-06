# SAGA.DENTAL — MVP Project Context

## What This Project Is

A digital design services marketplace for dental prosthetics. Dentists and labs upload scan files, design providers create CAD designs, files are delivered digitally. No physical logistics in MVP — purely digital fulfillment.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma (PostgreSQL) · Stripe Connect · Clerk Auth · S3/R2 for file storage

**Monorepo:** Single Next.js app with role-based routing. No separate frontend/backend repos.

---

## Current Build Status

> **As of 2026-03-05 — Shell complete.** Next.js initialized, brand design system configured,
> Tier 1 shell components built, full routing skeleton in place. All dummy data, no auth/backend yet.

### What exists
- `CLAUDE.md` — this specification
- `README.md` — placeholder
- Next.js 14 project with TypeScript, Tailwind, App Router
- Brand design system (CSS variables + Tailwind tokens)
- Tier 1 shell: AppShell, RoleProvider, WizardLayout
- Full routing skeleton: 2 auth pages + 14 dashboard placeholder pages
- `lib/types/index.ts` — shared TypeScript types
- `components/ui/` — Button, Badge, Input, Avatar, Separator, DropdownMenu, Select, Sidebar

### What does NOT exist yet
- No Prisma schema or database setup
- No third-party integrations (Clerk, Stripe, S3/R2)
- No Tier 2 domain components (DataTable, ToothChart, FileUpload, etc.)
- No real page content (all placeholder shells)

### Build progress tracker

Update this section as items are completed:

#### Infrastructure
- [x] Next.js 14 initialized with TypeScript + Tailwind + App Router
- [x] shadcn/ui configured (manual component setup — see `components/ui/`)
- [ ] Prisma configured with PostgreSQL
- [ ] Clerk Auth integrated
- [ ] Stripe Connect configured
- [ ] S3/R2 file storage configured
- [ ] Transactional email configured

#### Tier 1 — Shell
- [x] AppShell (`/components/layout/app-shell`)
- [x] RoleProvider (`/components/providers/role-provider`)
- [x] WizardLayout (`/components/layout/wizard-layout`)

#### Tier 2 — Shared Domain Components
- [ ] DataTable (`/components/ui/data-table`)
- [x] StarRating (`/components/ui/star-rating`)
- [ ] OrderStatusBadge (`/components/ui/order-status-badge`)
- [ ] CategorySelector (`/components/domain/category-selector`)
- [ ] ToothChart (`/components/domain/tooth-chart`)
- [x] FileUpload (`/components/domain/file-upload`)
- [ ] FileDownloadList (`/components/domain/file-download-list`)
- [x] PriceSummary (`/components/domain/price-summary`)
- [x] ProviderCard (`/components/domain/provider-card`)
- [ ] MessageThread (`/components/domain/message-thread`)
- [x] EscrowBanner (`/components/domain/escrow-banner`)
- [x] DesignParamsForm (`/components/domain/design-params-form`)
- [x] OrderTimeline (`/components/domain/order-timeline`)

#### Tier 2 — Aligner-Specific Components
- [ ] AlignerConfigForm (`/components/domain/aligner-config-form`)
- [ ] SimulationViewer (`/components/domain/simulation-viewer`)
- [ ] StagedFileDownload (`/components/domain/staged-file-download`)

#### Tier 3 — Pages (Client flow — prosthetics)
- [ ] Client dashboard
- [ ] New order wizard (prosthetics)
- [ ] Order detail / client workspace
- [ ] Reviews

#### Tier 3 — Pages (Client flow — aligner)
- [ ] New order wizard (aligner)
- [ ] Order detail / client workspace (aligner)

#### Tier 3 — Pages (Provider flow)
- [ ] Provider dashboard
- [ ] Order queue
- [ ] Products listing
- [ ] Provider workspace (prosthetics)
- [ ] Provider workspace (aligner)
- [ ] Reviews

#### Tier 3 — Pages (Admin flow)
- [ ] Admin dashboard
- [ ] Orders management
- [ ] Providers management
- [ ] Fee configuration
- [ ] Metrics overview

#### Backend
- [ ] Prisma schema (`/prisma/schema.prisma`)
- [ ] Prisma migrations
- [ ] Server Actions (`/lib/actions/*`)
- [ ] Zod validation schemas (`/lib/validations/*`)
- [ ] Replace all dummy data with real DB queries

---

## Project Initialization (First-Time Setup)

When starting from scratch, run in this order:

```bash
# 1. Initialize Next.js 14 with TypeScript, Tailwind, App Router, no src/ dir
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 2. Install core dependencies
npm install prisma @prisma/client @clerk/nextjs stripe zod react-query
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install -D @types/node

# 3. Initialize shadcn/ui
npx shadcn-ui@latest init

# 4. Initialize Prisma
npx prisma init

# 5. Add common shadcn components
npx shadcn-ui@latest add button card input label select textarea badge table
npx shadcn-ui@latest add dialog sheet tabs tooltip progress avatar separator
```

**Required environment variables** (create `.env.local`):
```
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=
```

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
  /(auth)           — Clerk auth pages (sign-in, sign-up)
  /(dashboard)      — Authenticated routes (layout.tsx wraps all)
    /client         — Client (dentist/lab) pages
    /provider       — Design provider pages
    /admin          — Super admin pages
  /api              — Webhook endpoints only
    /webhooks
      /stripe       — Stripe webhook handler

/components
  /layout           — AppShell, WizardLayout, page wrappers
  /providers        — React context providers (RoleProvider, etc.)
  /ui               — Generic UI primitives (shadcn/ui + custom)
  /domain           — Business-specific reusable components

/lib
  /db               — Prisma client singleton, queries, and helpers
  /actions          — Server Actions grouped by domain
    orders.ts
    providers.ts
    fees.ts
  /validations      — Zod schemas
  /utils            — Pure utility functions
  /types            — Shared TypeScript types (interfaces, enums)

/prisma
  schema.prisma     — Full future-proofed schema (MVP uses subset)
  /migrations       — Generated by prisma migrate
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

### RoleProvider contract

```tsx
// /components/providers/role-provider.tsx
interface RoleContextValue {
  role: 'client' | 'provider' | 'admin'
  orgId: string
  userId: string
  orgFlags: {
    is_practice: boolean
    can_design: boolean
    is_super_admin: boolean
  }
}
```

In MVP, this context can be seeded with mock data for development. Replace with real Clerk `useOrganization` + custom metadata when connecting auth.

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

### Order status state machine

```
DRAFT → PENDING_PAYMENT → PAID → IN_PROGRESS → REVIEW → COMPLETE
                                                        ↓
                                                    REVISION_REQUESTED → IN_PROGRESS
                                                        ↓
                                                      DISPUTED → RESOLVED
```

---

## Component Reference

**IMPORTANT:** As components are built, move them from the tracker above to this section. Only list components here once they are complete and tested.

### Tier 1 (Shell)

- **AppShell** — `/components/layout/app-shell.tsx`
  Client component. Wraps the app with `SidebarProvider`, `AppSidebar`, and `TopBar`.
  - Sidebar: dark sage800 background, role-aware nav links (changes per `useRole().role`), logo, org footer
  - TopBar: `SidebarTrigger`, search input (placeholder), notification bell with badge, user `DropdownMenu`, role quick-action button
  - Mobile: sidebar hides, `SidebarTrigger` shows hamburger
  - Tablet/desktop: sidebar collapses/expands via toggle

- **RoleProvider** — `/components/providers/role-provider.tsx`
  Client component. Provides `RoleContextValue` via React context.
  - Three dummy profiles: `client` (Smith Dental), `provider` (ClearCAD Studio), `admin` (Platform)
  - `useRole()` hook — throws if used outside provider
  - `DevRoleSwitcher` — fixed bottom-right overlay in `NODE_ENV=development` to toggle between profiles

- **WizardLayout** — `/components/layout/wizard-layout.tsx`
  Server component. Multi-step form wrapper with step indicator row and card content area.
  Props: `steps: string[]`, `currentStep: number`, `title: string`

### Shared UI Primitives (in `/components/ui/`)

| Component | File | Notes |
|-----------|------|-------|
| Button | `button.tsx` | Variants: default, destructive, outline, secondary, ghost, link |
| Badge | `badge.tsx` | Variants: default, secondary, destructive, outline |
| Input | `input.tsx` | Standard text input |
| Avatar | `avatar.tsx` | AvatarImage + AvatarFallback |
| Separator | `separator.tsx` | Horizontal/vertical rule |
| DropdownMenu | `dropdown-menu.tsx` | Radix DropdownMenu with all sub-parts |
| Select | `select.tsx` | Radix Select with all sub-parts |
| Sidebar | `sidebar.tsx` | Custom sidebar system: SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader/Content/Footer/Group/Menu |

### Tier 2 — Shared Domain Components

- **FileUpload** — `/components/domain/file-upload.tsx`
  Client component. Drag-and-drop file upload zone with format/size validation, per-file progress bars, and optional multi-section mode.
  - **Single-zone mode:** one drop zone + file list; validates against `acceptedFormats` and `maxFileSize`
  - **Multi-section mode:** enabled via `sections` prop; each section has its own formats, label, required flag, and file limit — used in the aligner order wizard
  - Controlled: `files: FileInfo[]` owned by parent; component calls `onFilesChange` when files are added or removed
  - `showProgress`: renders a per-file progress bar when `file.status === 'uploading'`; real upload wired later
  - Exports: `FileUpload` (default), `FileUploadProps`; types `FileInfo` + `UploadSection` live in `lib/types/index.ts`
  - Demo: `/app/(dashboard)/client/demo-file-upload/page.tsx`

- **StarRating** — `/components/ui/star-rating.tsx`
  Server-safe display component. Renders 1–5 stars with decimal support via SVG gradient for partial fills.
  Props: `rating: number`, `max?: number` (default 5), `className?`, `starClassName?`

- **ProviderCard** — `/components/domain/provider-card.tsx`
  Client component. Card for a single design provider used in order creation step 3.
  - Shows logo/avatar (initials fallback), name, location, star rating, review count, turnaround, software pills, completed designs, and price
  - `isSelected` state: sage500 border + sage50 background + checkmark on button
  - Optional `badges` prop for pills like "Top Rated", "Aligner Specialist"
  - `showPrice` (default true) controls price display
  - Exports: `ProviderCard` (default), `ProviderCardProps`; `ProviderInfo` type lives in `lib/types/index.ts`

- **ProviderList** — `/components/domain/provider-list.tsx`
  Client component. Wraps multiple `ProviderCard` instances with sort + filter controls.
  - Sort by: best rated, lowest price, fastest turnaround
  - Filter by: software (pill toggle), max turnaround days (select)
  - Shows "N providers found" count; empty state with "Clear filters" link
  - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
  - Demo: `/app/(dashboard)/client/demo-provider-card/page.tsx`

- **PriceSummary** — `/components/domain/price-summary.tsx`
  Server component. Cascading price breakdown panel used at checkout and in order summaries.
  - Line items with optional `isSubItem` indentation for add-on detail rows
  - Dotted separator before subtotal; bold double-separator before total
  - `serviceFee` and `vat` lines display percentage inline: "Service Fee (5%)"
  - All amounts formatted to 2 decimal places via `toFixed(2)` with configurable `currency` symbol (default `€`)
  - Exports: `PriceSummary` (default), `PriceSummaryProps`, `PriceLineItem`

- **EscrowBanner** — `/components/domain/escrow-banner.tsx`
  Server component. Contextual buyer-protection banner with three variants.
  - `payment`: teal50/teal500 border-left, ShieldCheck icon, "Your payment is protected" heading, numbered how-it-works steps
  - `in_escrow`: teal50/teal500 border-left, Lock icon, "Payment held securely", progress bar showing elapsed days vs 7-day auto-release window; accepts `escrowDaysRemaining`
  - `released`: sage50/sage500 border-left, CheckCircle2 icon, "Payment released to provider"
  - Demo: `/app/(dashboard)/client/demo-price-summary/page.tsx`

- **DesignParamsForm** — `/components/domain/design-params-form.tsx`
  Client component. Prosthetics-specific design parameters form used in order creation step 5 and client settings (saving defaults). Not used for aligner orders.
  - Fields: margin settings, spacer thickness, minimum thickness (all mm number inputs with unit suffix), contact strength select (Light/Medium/Heavy), occlusion type select (Light/Medium/Heavy Contact), special instructions textarea
  - Desktop 2-col grid: margin+spacer in row 1, thickness+contact in row 2; single column on mobile
  - Validation on blur: mm fields checked for positive values within dental range (margin: 0.01–0.5, spacer: 0.01–0.3, thickness: 0.3–3.0); inline error replaces helper text
  - `defaults` prop: shows "Using your saved defaults" badge (sage50) when current values match; shows "Reset to defaults" link when values differ
  - `showSaveAsDefault`: shows a checkbox at the bottom that triggers `onSaveAsDefault(values)` when checked
  - `disabled`: disables all fields for read-only order detail views
  - `DesignParameters` type lives in `lib/types/index.ts`
  - Demo: `/app/(dashboard)/client/demo-design-params/page.tsx`

- **OrderTimeline** — `/components/domain/order-timeline.tsx`
  Server component. Vertical milestone timeline used in client order detail (both tracks) and admin order detail.
  - Completed steps: sage500 filled circle with checkmark + warm700 text + timestamp
  - Active step: pulsing sage400 ping + sage500 inner dot + bold warm800 text
  - Future steps: warm300 empty ring + warm500 muted text
  - Connector line: sage500 for completed portions, warm200 for future
  - Each step shows: label, optional description, timestamp (when completed)
  - `TimelineEvent` type lives in `lib/types/index.ts`
  - Factory functions co-located in same file:
    - `getProstheticsTimeline(currentStatus: OrderStatus)` — 6 steps: Order Placed → In Progress → Design Submitted → In Review → Approved → Completed
    - `getAlignerTimeline(currentStatus: OrderStatus)` — 9 steps: Order Placed → Files Uploaded → Lab Review → Treatment Planning → Simulation Submitted → Treatment Plan Review → Plan Approved → Deliverables Uploaded → Completed
  - Both factories accept any `OrderStatus` and return the correct isCompleted/isActive flags per step
  - Demo: `/app/(dashboard)/client/demo-order-timeline/page.tsx`

### Tier 2 (Aligner-Specific) — NONE BUILT YET

### Tier 3 (Pages)

Routing skeleton is in place. All pages are placeholder Server Components with a title + "coming soon" card.

| Route | File |
|-------|------|
| `/client/dashboard` | `app/(dashboard)/client/dashboard/page.tsx` |
| `/client/orders` | `app/(dashboard)/client/orders/page.tsx` |
| `/client/reviews` | `app/(dashboard)/client/reviews/page.tsx` |
| `/client/settings` | `app/(dashboard)/client/settings/page.tsx` |
| `/provider/dashboard` | `app/(dashboard)/provider/dashboard/page.tsx` |
| `/provider/queue` | `app/(dashboard)/provider/queue/page.tsx` |
| `/provider/products` | `app/(dashboard)/provider/products/page.tsx` |
| `/provider/reviews` | `app/(dashboard)/provider/reviews/page.tsx` |
| `/provider/settings` | `app/(dashboard)/provider/settings/page.tsx` |
| `/admin/dashboard` | `app/(dashboard)/admin/dashboard/page.tsx` |
| `/admin/orders` | `app/(dashboard)/admin/orders/page.tsx` |
| `/admin/providers` | `app/(dashboard)/admin/providers/page.tsx` |
| `/admin/fees` | `app/(dashboard)/admin/fees/page.tsx` |
| `/admin/metrics` | `app/(dashboard)/admin/metrics/page.tsx` |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` |

---

## MVP Pricing Model

Dual-sided fee (Airbnb-style):
- **Client service fee:** ~5% added on top of design price (visible at checkout)
- **Provider commission:** ~12–15% deducted from payout
- **Effective take rate:** ~17–20%

All percentages are admin-configurable. Cascade priority: org override > service type > global default. Fees are locked at order creation — never changed retroactively.

```ts
// Fee calculation example
const clientTotal = designPrice * (1 + clientFeeRate)      // e.g. 1.05
const providerPayout = designPrice * (1 - providerCommissionRate)  // e.g. 0.875
const platformFee = clientTotal - providerPayout
```

---

## What Is NOT in MVP

Do NOT build any of these:

- Cost estimation / quoting flow (Phase 2)
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

### Naming
- **Components:** PascalCase (`OrderStatusBadge`)
- **Functions/variables:** camelCase (`calculateProviderPayout`)
- **Files:** kebab-case (`order-status-badge.tsx`)
- **Prisma models:** PascalCase singular (`OrderItem`)
- **DB columns:** snake_case (`selling_org_id`)
- **Zod schemas:** camelCase suffixed with `Schema` (`createOrderSchema`)
- **Server Actions:** verb + noun (`createOrder`, `updateWorkStep`)

### Component structure
```tsx
// Always: one component per file, named default export, typed props interface
interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  // ...
}
```

### Server Actions
```ts
// /lib/actions/orders.ts
'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createOrderSchema } from '@/lib/validations/orders'

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  const validated = createOrderSchema.parse(input)
  // ...
}
```

### State management rules
- **Global/shared state:** React context
- **Server state (data fetching):** React Query (`@tanstack/react-query`)
- **Local UI state:** `useState` or `useReducer`
- **Form state:** React Hook Form + Zod resolver
- **Never:** Redux, Zustand, Jotai, or other external state libraries

### Error handling
Always handle all three states in every data-fetching component:
```tsx
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data || data.length === 0) return <EmptyState />
return <ActualContent data={data} />
```

### Dummy data
Build all UI with realistic dummy data before connecting backend:
```ts
// Co-locate dummy data near the component using it
const DUMMY_ORDERS: Order[] = [
  { id: 'ord_001', status: 'IN_PROGRESS', ... },
]
```

### Responsive
- Mobile-first, minimum 375px width
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Test at 375px (mobile), 768px (tablet), 1280px (desktop)

---

## Build Order (Reference)

Always build prosthetics track first, then add aligner variant.

1. **Infrastructure** — Initialize Next.js, install deps, configure shadcn/ui
2. **Shell** — AppShell → RoleProvider → WizardLayout
3. **Tier 2 shared** — DataTable → StarRating → OrderStatusBadge → CategorySelector → ToothChart → FileUpload → FileDownloadList → PriceSummary → ProviderCard → MessageThread → EscrowBanner → DesignParamsForm → OrderTimeline
4. **Tier 2 aligner** — AlignerConfigForm → SimulationViewer → StagedFileDownload
5. **Client pages (prosthetics)** — Dashboard → New order wizard → Order detail
6. **Provider pages (prosthetics)** — Dashboard → Order queue → Workspace
7. **Admin pages** — Dashboard → Orders → Providers → Fee config
8. **Client/Provider pages (aligner)** — Mirror prosthetics pages with aligner variants
9. **Backend** — Prisma schema → Server Actions → replace dummy data
10. **Auth & integrations** — Clerk → Stripe Connect → File storage → Emails

---

## AI Assistant Guidelines

When making changes to this codebase:

1. **Check this file first** — understand current build status before writing any code
2. **Never rebuild existing components** — if a component is listed as complete above, read it before touching it
3. **Update the build tracker** — mark items complete in "Build progress tracker" as they're finished
4. **Move completed components** — once a component is built, add it to "Component Reference" with its path and a brief description
5. **Dummy data default** — if backend isn't connected yet, use dummy data; never skip the UI to wait for backend
6. **One track at a time** — complete prosthetics flow before starting aligner flow
7. **No premature abstraction** — don't create shared utilities for single-use operations
8. **No `any`** — TypeScript strict mode; if you don't know the type, investigate and define it
9. **Preserve the state machine** — order status transitions must follow the defined state machine exactly
10. **Fee immutability** — fees are locked at order creation; never write code that retroactively modifies fee records
