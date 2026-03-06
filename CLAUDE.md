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
- [x] OrderStatusBadge (`/components/ui/order-status-badge`)
- [x] CategorySelector (`/components/domain/category-selector`)
- [x] ToothChart (`/components/domain/tooth-chart`)
- [x] FileUpload (`/components/domain/file-upload`)
- [x] FileDownloadList (`/components/domain/file-download-list`)
- [x] PriceSummary (`/components/domain/price-summary`)
- [x] ProviderCard (`/components/domain/provider-card`)
- [x] MessageThread (`/components/domain/message-thread`)
- [x] EscrowBanner (`/components/domain/escrow-banner`)
- [x] DesignParamsForm (`/components/domain/design-params-form`)
- [x] OrderTimeline (`/components/domain/order-timeline`)

#### Tier 2 — Aligner-Specific Components
- [x] AlignerConfigForm (`/components/domain/aligner-config-form`)
- [x] SimulationViewer (`/components/domain/simulation-viewer`)
- [x] StagedFileDownload (`/components/domain/staged-file-download`)

#### Tier 3 — Pages (Client flow — prosthetics)
- [ ] Client dashboard
- [x] New order wizard (prosthetics)
- [x] Order detail / client workspace
- [ ] Reviews

#### Tier 3 — Pages (Client flow — aligner)
- [x] New order wizard (aligner)
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
| OrderStatusBadge | `order-status-badge.tsx` | Maps `OrderStatus` to a colored outline Badge; all 9 statuses covered |

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

- **CategorySelector** — `/components/domain/category-selector.tsx`
  Client component. Grid of clickable category cards for order creation step 1.
  - MVP categories: Crowns, Bridges, Inlays/Onlays, Implant Abutments, Partial Frameworks, Veneers, Aligner Design
  - Aligner Design card shows "Separate wizard" badge to indicate it routes differently
  - Selected card: sage500 border + ring + sage50 background; icon box switches to sage500 fill
  - Controlled: `value: string | null` + `onChange: (category: string) => void`

- **ToothChart** — `/components/domain/tooth-chart.tsx`
  Client component. Interactive FDI notation tooth chart for selecting teeth to treat.
  - Full adult permanent dentition (32 teeth), displayed patient-perspective (R on left, L on right)
  - Quadrant layout: Upper Right (Q1: 18→11) | Upper Left (Q2: 21→28) / Lower Right (Q4: 48→41) | Lower Left (Q3: 31→38)
  - Tooth button height varies by type: molars taller than incisors for anatomical hint
  - Selected: sage500 fill; hover: sage50; arch separator + midline divider lines
  - Overflow-x-auto wrapper for mobile compatibility
  - Summary bar below chart: "N teeth selected: 11, 12, 21" + "Clear" link
  - Props: `selectedTeeth: number[]`, `onTeethChange: (teeth: number[]) => void`, `category?: string`

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

### Tier 2 (Aligner-Specific)

- **AlignerConfigForm** — `/components/domain/aligner-config-form.tsx`
  Client component. Aligner-specific configuration form used in aligner order creation step 2. Combines arch selection, treatment goals, complexity tier, clinical constraints, and design preferences in a single controlled form.
  - **Section 1 — Arch Selection:** live SVG top-down arch diagram (updates on selection) + 3 radio cards (Upper Only / Lower Only / Both Arches), each with its own mini arch diagram; pricing hint below
  - **Section 2 — Treatment Goals:** 6 icon+label multi-select checkbox pills (Crowding, Spacing, Deep Bite, Open Bite, Crossbite, Midline); free-text additional goals textarea
  - **Section 3 — Complexity Tier:** 3 radio cards (Simple ≤14 / Moderate 15–25 / Complex 26+) with description and price-rate badge
  - **Section 4 — Clinical Constraints:** two-column inputs for teeth-not-to-move and planned extractions (FDI notation helpers), full-width other constraints textarea
  - **Section 5 — Design Preferences:** toggle switches for attachment design and IPR protocol; optional max-stages number input with "Clear (no limit)" action
  - Sections styled with warm-50 background + widest tracking section headers
  - `AlignerConfig`, `ArchSelection`, `ComplexityTier` types live in `lib/types/index.ts`
  - Demo: `/app/(dashboard)/client/demo-aligner-config/page.tsx`

- **SimulationViewer** — `/components/domain/simulation-viewer.tsx`
  Client component. Aligner-track-only component for sharing treatment simulation links. Two named exports covering provider and client workflows.
  - **`ProviderSimulationViewer`** — form for providers to paste, validate, preview, and submit simulation URLs
    - URL input with link icon + "Validate Link" button (debounce-friendly via `onValidate` callback)
    - `ValidationStatusBadge`: idle (grey pill), validating (spinner), valid (green check), invalid (red X + error text)
    - Iframe preview at 300px height shown only when `validationStatus === 'valid'`
    - Collapsible version history list; clicking a version loads its URL into the input
    - "Submit for Client Review" (sage500, lg) disabled until status is `'valid'`
    - Props: `onSubmit`, `onValidate`, `currentUrl?`, `validationStatus`, `versionHistory?`
  - **`ClientSimulationViewer`** — viewer for clients to review the submitted simulation
    - Large iframe with min 500px height + loading/error overlays
    - Embed / link-only toggle; error overlay includes "Switch to link-only view" escape hatch
    - Prominent "Open in new tab" button (sage500) always visible
    - `TreatmentSummaryPanel` sidebar: total stages, arch breakdown, estimated duration, IPR required (teal yes / warning orange no)
    - Version history dropdown showing all past submissions with v1/v2 labels and dates
    - Link-only mode renders a clean "open in browser" card instead of the iframe
    - Props: `simulationUrl`, `mode?` ('embed'|'link', default 'embed'), `treatmentSummary?`, `versionHistory?`
  - `SimulationVersion` and `TreatmentSummary` types live in `lib/types/index.ts`
  - Default export: `ClientSimulationViewer`
  - Demo: `/app/(dashboard)/client/demo-simulation-viewer/page.tsx`

- **StagedFileDownload** — `/components/domain/staged-file-download.tsx`
  Client component. Structured aligner deliverables viewer replacing a flat file list for orders with 50+ STL files. Groups files by arch and stage.
  - **Top bar:** "Download All as ZIP" button (sage500 filled) showing total file count + total size
  - **Folder structure preview:** collapsible tree (monospace) showing the exact ZIP folder layout — `/Upper_Arch/`, `/Lower_Arch/`, `/Supporting_Documents/` — with first 3 filenames per section and a "+N more" overflow indicator
  - **Upper Arch section:** collapsible (default open) with folder icon, "N stages" count, per-file rows (STL icon, name, size, sage outline DL button), "Download Upper Arch" section button
  - **Lower Arch section:** same structure; hidden entirely when `lowerArchFiles` is empty (upper-only cases)
  - **Supporting Documents section:** collapsible; each doc shows document icon, name, type label (`DOC_TYPE_LABELS`), size, and sage outline Download button
  - Sections omitted when their array is empty
  - `StageFile`, `SupportingDoc`, `SupportingDocType`, `AlignerDeliverables` types live in `lib/types/index.ts`
  - Demo: `/app/(dashboard)/client/demo-staged-file-download/page.tsx` — Scenario A: 22+22 bilateral; Scenario B: 14-stage upper-only

- **FileDownloadList** — `/components/domain/file-download-list.tsx`
  Server component. Flat list of downloadable files with individual download buttons and an optional "Download All as ZIP" header bar.
  - File rows: FileText icon, file name (truncated), formatted file size, outline download button (`<a download>`)
  - Header bar: shown when `showDownloadAll` is true and `files.length > 1`; displays total count + total size + "Download All as ZIP" button
  - Empty state: dashed-border card with configurable `emptyMessage` text
  - Exports: `FileDownloadList` (default), `FileDownloadListProps`, `DownloadableFile`

- **MessageThread** — `/components/domain/message-thread.tsx`
  Client component. Conversational thread between client and provider with a compose area.
  - Messages aligned by role: own messages on the right (sage-500 bubble), other's on the left (warm-100 bubble)
  - Avatar with role-colored initials fallback; sender name + formatted timestamp above each bubble
  - Compose textarea: Enter to send, Shift+Enter for newline; send button disabled when empty
  - Auto-scrolls to newest message on send; empty state prompt when no messages
  - `currentRole` prop determines which side is "own"; `currentUserName` sets the outgoing sender name
  - Exports: `MessageThread` (default), `MessageThreadProps`, `ThreadMessage`

### Tier 3 (Pages)

Routing skeleton is in place. Most pages are placeholder Server Components with a title + "coming soon" card.

| Route | File |
|-------|------|
| `/client/dashboard` | `app/(dashboard)/client/dashboard/page.tsx` |
| `/client/orders` | `app/(dashboard)/client/orders/page.tsx` |
| `/client/orders/new` | `app/(dashboard)/client/orders/new/page.tsx` — **Full 6-step prosthetics order wizard** |
| `/client/orders/new/aligner` | `app/(dashboard)/client/orders/new/aligner/page.tsx` — **Full 6-step aligner order wizard** |
| `/client/orders/[id]` | `app/(dashboard)/client/orders/[id]/page.tsx` — **Prosthetics order detail page** |
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

#### New Order Wizard — `/client/orders/new`

Client component. 6-step prosthetics order creation wizard composing all Tier 2 domain components.

- **Step 1 — Category:** `CategorySelector` grid; Aligner Design shows "coming soon" alert and blocks progression
- **Step 2 — Teeth:** `ToothChart` (FDI notation); shows `category — Select Teeth` header; requires ≥1 tooth selected
- **Step 3 — Provider:** `ProviderList` with 6 dummy prosthetics providers (exocad/3Shape software); selected provider shown in summary banner; requires selection to proceed
- **Step 4 — Upload & Requirements:** `FileUpload` (accepts .stl/.ply/.obj) + `DesignParamsForm` with pre-loaded defaults; requires ≥1 valid file + valid params
- **Step 5 — Review & Pay:** order summary (category, teeth, provider, file count), `PriceSummary` (base price + additional teeth + 5% service fee + 19% VAT), `EscrowBanner` variant="payment"; "Place Order" CTA
- **Step 6 — Confirmation:** replaces wizard entirely; animated success ring, dummy order reference `ORD-2024-00142`, `OrderStatusBadge` (PENDING_PAYMENT), next-steps list, "View Orders" + "Back to Dashboard" buttons
- Wizard state (category, teeth, providerId, files, designParams) persists across all steps; back navigation restores state
- `isNextDisabled` enforced per step; completed step dots are clickable (jump back)
- Aligner Design category shows a link to `/client/orders/new/aligner?from=redirect`
- All dummy data — no backend calls

#### Aligner Order Wizard — `/client/orders/new/aligner`

Client component. 6-step aligner order creation wizard reusing shared Tier 2 components.

- **Step 1 — Category:** `CategorySelector` pre-selected to "Aligner Design"; warns and links to prosthetics wizard if another category is selected
- **Step 2 — Configuration:** `AlignerConfigForm` — all 5 sections (arch, goals, complexity, constraints, preferences); requires ≥1 treatment goal selected
- **Step 3 — Provider:** `ProviderList` with 4 dummy aligner providers (SureSmile, Archform, OnyxCeph, uLab); price shown as "per arch" via `priceLabel` prop; requires selection
- **Step 4 — Patient Files:** `FileUpload` in multi-section mode — Intraoral Scans (.stl/.ply/.obj, required) + Clinical Photos (.jpg/.png, required) + Supplementary Files (.jpg/.png/.dcm/.pdf, optional); requires both required sections filled
- **Step 5 — Review & Pay:** aligner order summary (arch, complexity, goals, provider, files), `PriceSummary` with per-arch line items + complexity premium + 5% service fee + 19% VAT (applied on designPrice + serviceFee), `EscrowBanner`
- **Step 6 — Confirmation:** same `WizardConfirmationScreen` shared with prosthetics, with aligner-specific pills and next-steps text ("Your provider will review patient files and begin treatment planning…")
- Arrives at step 1 (skip category) when `?from=redirect` URL param is present (set by prosthetics wizard link)
- Shared components in `_components/wizard-shared.tsx`: `ProviderSummaryBanner`, `WizardConfirmationScreen`
- All dummy data — no backend calls

**Shared between both wizards (`_components/wizard-shared.tsx`):**
- `ProviderSummaryBanner` — selected-provider summary strip with name, location, turnaround, and optional `/arch` price suffix
- `WizardConfirmationScreen` — animated success ring, order ref, `OrderStatusBadge`, configurable info pills and next-steps list, "View Orders" + "Back to Dashboard" CTAs

#### Client Order Detail — `/client/orders/[id]`

Client component. Full prosthetics order detail page. Dummy data shows an order in `REVIEW` status so all sections are visible.

- **Breadcrumb:** Dashboard → Orders → ORD-2024-00142
- **Header:** order reference, `OrderStatusBadge`, provider name + date placed
- **Two-column layout:** main content (full width on mobile) + 320px sidebar (stacks on mobile)

**Status-dependent section visibility:**
- All statuses: Order Info always visible
- `PAID`: status callout ("Waiting for provider to start"), no thread
- `IN_PROGRESS`: status callout + message thread
- `REVIEW`: full page — all sections visible including review decision panel
- `COMPLETE`: design deliverables + interactive rating prompt (no review decision)

**Main content sections:**
1. **Order Info** — category, tooth FDI badges, design parameters summary (`DesignParamsSummary`), uploaded scan `FileDownloadList`
2. **Design Deliverables** — design `FileDownloadList` (visible from `REVIEW` onward)
3. **Review Decision** — instruction callout, "Approve Design" (sage500) / "Request Revision" (outline) buttons; revision expands a textarea; on submit shows confirmation banner; `RevisionHistory` lists prior revisions as orange cards (visible only when `status === 'REVIEW'`)
4. **Rate Your Provider** — `InteractiveStarRating` (8-star hover scale), optional comment textarea, submit collapses to a confirmation (visible only when `status === 'COMPLETE'`)
5. **Messages** — `MessageThread` with dummy messages between practice and ClearCAD Studio

**Sidebar:**
- `PriceSummary` — crown design + additional teeth line items, service fee, VAT, total
- `EscrowBanner` — variant derived from status (`in_escrow` for active, `released` for complete)
- `OrderTimeline` — prosthetics variant via `getProstheticsTimeline(status)`
- Provider card — avatar initials, name, location, `StarRating`, software `Badge` pills
- All dummy data — no backend calls

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
