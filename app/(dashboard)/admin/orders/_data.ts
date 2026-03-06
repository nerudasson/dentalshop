import type { OrderStatus, DesignParameters } from "@/lib/types"
import type { DownloadableFile } from "@/components/domain/file-download-list"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminMessage {
  id: string
  senderRole: "client" | "provider"
  senderName: string
  content: string
  sentAt: Date
}

export interface AdminInternalNote {
  id: string
  author: string
  content: string
  createdAt: Date
}

export interface AdminPricing {
  designPrice: number
  additionalItems: number
  additionalItemsLabel: string
  subtotal: number
  clientFeePercent: number
  clientFeeAmount: number
  vatPercent: number
  vatAmount: number
  total: number
  providerPayout: number
  platformFee: number
  stripeChargeId: string
  stripePayoutId: string
}

export interface AdminOrder {
  // ── List-view fields ────────────────────────────────────────────────────────
  id: string
  orderType: "prosthetics" | "aligner"
  category: string
  client: string
  clientEmail: string
  provider: string
  providerEmail: string
  status: OrderStatus
  dateCreated: Date
  total: number
  platformFee: number

  // ── Detail: financial ───────────────────────────────────────────────────────
  pricing: AdminPricing

  // ── Detail: prosthetics-specific ────────────────────────────────────────────
  selectedTeeth?: number[]
  designParams?: DesignParameters
  scanFiles?: DownloadableFile[]
  designFiles?: DownloadableFile[]
  revisions?: Array<{ id: string; requestedAt: Date; notes: string }>

  // ── Detail: aligner-specific ────────────────────────────────────────────────
  archSelection?: string
  complexityTier?: string
  treatmentGoals?: string[]
  simulationUrl?: string

  // ── Communication ───────────────────────────────────────────────────────────
  messages: AdminMessage[]

  // ── Admin ───────────────────────────────────────────────────────────────────
  internalNotes: AdminInternalNote[]
}

// ─── Dummy orders (22 total) ──────────────────────────────────────────────────

export const ADMIN_ORDERS: AdminOrder[] = [
  // ── 1. Prosthetics · REVIEW ─────────────────────────────────────────────────
  {
    id: "ORD-2026-00200",
    orderType: "prosthetics",
    category: "Crowns",
    client: "Smith Dental Practice",
    clientEmail: "orders@smithdental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "REVIEW",
    dateCreated: new Date("2026-02-28"),
    total: 143.69,
    platformFee: 13.12,
    pricing: {
      designPrice: 85.0,
      additionalItems: 30.0,
      additionalItemsLabel: "Additional teeth (×2 @ €15)",
      subtotal: 115.0,
      clientFeePercent: 5,
      clientFeeAmount: 5.75,
      vatPercent: 19,
      vatAmount: 22.94,
      total: 143.69,
      providerPayout: 97.75,
      platformFee: 13.12,
      stripeChargeId: "ch_3QpA1B2eF7kLmN8P",
      stripePayoutId: "po_1QpA1B2eF7kLmN8P",
    },
    selectedTeeth: [14, 15, 24],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions:
        "Please ensure tight contacts on mesial side of tooth 14. Patient has a slightly deep bite.",
    },
    scanFiles: [
      { id: "sf1", name: "upper_arch_scan.stl", fileSize: 4_210_000, url: "#" },
      { id: "sf2", name: "lower_arch_scan.stl", fileSize: 3_870_000, url: "#" },
      { id: "sf3", name: "bite_registration.stl", fileSize: 1_540_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "crown_14_final.stl", fileSize: 1_190_000, url: "#" },
      { id: "df2", name: "crown_15_final.stl", fileSize: 1_090_000, url: "#" },
      { id: "df3", name: "crown_24_final.stl", fileSize: 970_000, url: "#" },
    ],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearCAD Studio",
        content:
          "Hi! I've reviewed your scan files. Everything looks good — will start the design shortly.",
        sentAt: new Date("2026-02-28T11:45:00"),
      },
      {
        id: "m2",
        senderRole: "client",
        senderName: "Smith Dental",
        content:
          "Great, please pay close attention to the mesial contact on tooth 14. The patient has a tight bite.",
        sentAt: new Date("2026-02-28T12:10:00"),
      },
      {
        id: "m3",
        senderRole: "provider",
        senderName: "ClearCAD Studio",
        content:
          "Noted! Design files are uploaded for your review. All three crowns are ready — let me know if any adjustments are needed.",
        sentAt: new Date("2026-03-02T09:30:00"),
      },
    ],
    internalNotes: [
      {
        id: "note1",
        author: "admin@saga.dental",
        content:
          "Smith Dental is a high-value account. Ensure timely resolution if any dispute arises.",
        createdAt: new Date("2026-03-01T10:00:00"),
      },
    ],
  },

  // ── 2. Aligner · IN_PROGRESS ────────────────────────────────────────────────
  {
    id: "ORD-2026-00199",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Bright Smiles Orthodontics",
    clientEmail: "cases@brightsmiles.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "IN_PROGRESS",
    dateCreated: new Date("2026-02-25"),
    total: 630.0,
    platformFee: 57.5,
    pricing: {
      designPrice: 420.0,
      additionalItems: 84.0,
      additionalItemsLabel: "Complexity premium (Moderate)",
      subtotal: 504.0,
      clientFeePercent: 5,
      clientFeeAmount: 25.2,
      vatPercent: 19,
      vatAmount: 100.8,
      total: 630.0,
      providerPayout: 428.4,
      platformFee: 57.5,
      stripeChargeId: "ch_3RqB2C3dG8lMnO9Q",
      stripePayoutId: "po_1RqB2C3dG8lMnO9Q",
    },
    archSelection: "Both Arches",
    complexityTier: "Moderate",
    treatmentGoals: ["Crowding", "Deep Bite"],
    simulationUrl: "https://example.com/sim/ORD-2026-00199",
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearSmile Studio",
        content:
          "We've received all patient records and are starting the treatment planning process.",
        sentAt: new Date("2026-02-25T14:00:00"),
      },
      {
        id: "m2",
        senderRole: "client",
        senderName: "Bright Smiles Ortho",
        content:
          "Thank you. Please prioritise the crowding correction in the upper arch — the patient is particularly concerned about this.",
        sentAt: new Date("2026-02-25T15:30:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 3. Prosthetics · COMPLETE ───────────────────────────────────────────────
  {
    id: "ORD-2026-00198",
    orderType: "prosthetics",
    category: "Bridges",
    client: "Valley Dental Lab",
    clientEmail: "lab@valleydental.com",
    provider: "NovaDental Warsaw",
    providerEmail: "orders@novadental.pl",
    status: "COMPLETE",
    dateCreated: new Date("2026-02-20"),
    total: 220.5,
    platformFee: 20.13,
    pricing: {
      designPrice: 130.0,
      additionalItems: 40.0,
      additionalItemsLabel: "Pontic unit (×2 @ €20)",
      subtotal: 170.0,
      clientFeePercent: 5,
      clientFeeAmount: 8.5,
      vatPercent: 19,
      vatAmount: 42.0,
      total: 220.5,
      providerPayout: 144.5,
      platformFee: 20.13,
      stripeChargeId: "ch_3SrC3D4eH9mNpR0S",
      stripePayoutId: "po_1SrC3D4eH9mNpR0S",
    },
    selectedTeeth: [25, 26, 27],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.04mm",
      minimumThickness: "0.6mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "upper_arch.stl", fileSize: 3_800_000, url: "#" },
      { id: "sf2", name: "antagonist.stl", fileSize: 2_900_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "bridge_25_27_final.stl", fileSize: 2_140_000, url: "#" },
    ],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "NovaDental Warsaw",
        content: "Bridge design completed and uploaded. Please review.",
        sentAt: new Date("2026-02-22T08:00:00"),
      },
      {
        id: "m2",
        senderRole: "client",
        senderName: "Valley Dental Lab",
        content: "Looks great! Approved.",
        sentAt: new Date("2026-02-22T10:30:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 4. Aligner · REVIEW ─────────────────────────────────────────────────────
  {
    id: "ORD-2026-00197",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Sunrise Orthodontics",
    clientEmail: "info@sunriseortho.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "REVIEW",
    dateCreated: new Date("2026-02-18"),
    total: 367.5,
    platformFee: 33.54,
    pricing: {
      designPrice: 240.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 240.0,
      clientFeePercent: 5,
      clientFeeAmount: 12.0,
      vatPercent: 19,
      vatAmount: 115.5,
      total: 367.5,
      providerPayout: 204.0,
      platformFee: 33.54,
      stripeChargeId: "ch_3TsD4E5fI0nOpS1T",
      stripePayoutId: "po_1TsD4E5fI0nOpS1T",
    },
    archSelection: "Upper Only",
    complexityTier: "Simple",
    treatmentGoals: ["Crowding", "Spacing"],
    simulationUrl: "https://example.com/sim/ORD-2026-00197",
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearSmile Studio",
        content: "Treatment simulation is ready for your review.",
        sentAt: new Date("2026-02-20T16:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 5. Prosthetics · IN_PROGRESS ────────────────────────────────────────────
  {
    id: "ORD-2026-00196",
    orderType: "prosthetics",
    category: "Veneers",
    client: "Central Dental Group",
    clientEmail: "reception@centraldental.com",
    provider: "DentaDesign Munich",
    providerEmail: "orders@dentadesign.de",
    status: "IN_PROGRESS",
    dateCreated: new Date("2026-02-15"),
    total: 189.0,
    platformFee: 17.25,
    pricing: {
      designPrice: 120.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 120.0,
      clientFeePercent: 5,
      clientFeeAmount: 6.0,
      vatPercent: 19,
      vatAmount: 63.0,
      total: 189.0,
      providerPayout: 102.0,
      platformFee: 17.25,
      stripeChargeId: "ch_3UtE5F6gJ1oQrT2U",
      stripePayoutId: "po_1UtE5F6gJ1oQrT2U",
    },
    selectedTeeth: [11, 12, 13, 21, 22, 23],
    designParams: {
      marginSettings: "0.04mm",
      spacerThickness: "0.02mm",
      minimumThickness: "0.4mm",
      contactStrength: "Light",
      occlusionType: "Light Contact",
      specialInstructions: "Patient requests natural-looking translucency.",
    },
    scanFiles: [
      { id: "sf1", name: "upper_full_arch.stl", fileSize: 5_100_000, url: "#" },
    ],
    designFiles: [],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "DentaDesign Munich",
        content: "Files received. Starting veneer design — estimated 3 days.",
        sentAt: new Date("2026-02-15T09:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 6. Prosthetics · PAID ───────────────────────────────────────────────────
  {
    id: "ORD-2026-00195",
    orderType: "prosthetics",
    category: "Crowns",
    client: "Smith Dental Practice",
    clientEmail: "orders@smithdental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "PAID",
    dateCreated: new Date("2026-02-14"),
    total: 168.0,
    platformFee: 15.33,
    pricing: {
      designPrice: 85.0,
      additionalItems: 30.0,
      additionalItemsLabel: "Additional teeth (×2 @ €15)",
      subtotal: 115.0,
      clientFeePercent: 5,
      clientFeeAmount: 5.75,
      vatPercent: 19,
      vatAmount: 47.25,
      total: 168.0,
      providerPayout: 97.75,
      platformFee: 15.33,
      stripeChargeId: "ch_3VuF6G7hK2pRsU3V",
      stripePayoutId: "",
    },
    selectedTeeth: [36, 37, 46],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "lower_arch_scan.stl", fileSize: 4_010_000, url: "#" },
    ],
    designFiles: [],
    revisions: [],
    messages: [],
    internalNotes: [],
  },

  // ── 7. Aligner · COMPLETE ───────────────────────────────────────────────────
  {
    id: "ORD-2026-00194",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Metro Orthodontics",
    clientEmail: "cases@metroortho.com",
    provider: "ArcForm Berlin",
    providerEmail: "studio@arcform.de",
    status: "COMPLETE",
    dateCreated: new Date("2026-02-10"),
    total: 735.0,
    platformFee: 67.09,
    pricing: {
      designPrice: 480.0,
      additionalItems: 120.0,
      additionalItemsLabel: "Complexity premium (Complex)",
      subtotal: 600.0,
      clientFeePercent: 5,
      clientFeeAmount: 30.0,
      vatPercent: 19,
      vatAmount: 105.0,
      total: 735.0,
      providerPayout: 510.0,
      platformFee: 67.09,
      stripeChargeId: "ch_3WvG7H8iL3qStV4W",
      stripePayoutId: "po_1WvG7H8iL3qStV4W",
    },
    archSelection: "Both Arches",
    complexityTier: "Complex",
    treatmentGoals: ["Crowding", "Open Bite", "Crossbite"],
    simulationUrl: "https://example.com/sim/ORD-2026-00194",
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ArcForm Berlin",
        content: "All 34 stage STLs have been uploaded. Order complete.",
        sentAt: new Date("2026-02-28T17:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 8. Prosthetics · REVISION_REQUESTED ─────────────────────────────────────
  {
    id: "ORD-2026-00193",
    orderType: "prosthetics",
    category: "Inlays / Onlays",
    client: "Valley Dental Lab",
    clientEmail: "lab@valleydental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "REVISION_REQUESTED",
    dateCreated: new Date("2026-02-08"),
    total: 105.0,
    platformFee: 9.58,
    pricing: {
      designPrice: 70.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 70.0,
      clientFeePercent: 5,
      clientFeeAmount: 3.5,
      vatPercent: 19,
      vatAmount: 31.5,
      total: 105.0,
      providerPayout: 59.5,
      platformFee: 9.58,
      stripeChargeId: "ch_3XwH8I9jM4rTuW5X",
      stripePayoutId: "",
    },
    selectedTeeth: [16],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "upper_right_scan.stl", fileSize: 2_100_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "onlay_16_v1.stl", fileSize: 890_000, url: "#" },
    ],
    revisions: [
      {
        id: "rev1",
        requestedAt: new Date("2026-02-12T09:00:00"),
        notes:
          "Proximal contact is too tight on the distal side. Please reduce by approximately 0.1mm and recheck occlusal clearance.",
      },
    ],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearCAD Studio",
        content: "Onlay design uploaded for review.",
        sentAt: new Date("2026-02-11T14:30:00"),
      },
      {
        id: "m2",
        senderRole: "client",
        senderName: "Valley Dental Lab",
        content:
          "The distal contact is too tight. Can you reduce it slightly?",
        sentAt: new Date("2026-02-12T09:00:00"),
      },
      {
        id: "m3",
        senderRole: "provider",
        senderName: "ClearCAD Studio",
        content: "Understood, will adjust and re-upload shortly.",
        sentAt: new Date("2026-02-12T09:45:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 9. Prosthetics · COMPLETE ───────────────────────────────────────────────
  {
    id: "ORD-2026-00192",
    orderType: "prosthetics",
    category: "Implant Abutments",
    client: "Harbor Dental Clinic",
    clientEmail: "admin@harbordental.com",
    provider: "DentaDesign Munich",
    providerEmail: "orders@dentadesign.de",
    status: "COMPLETE",
    dateCreated: new Date("2026-02-05"),
    total: 155.75,
    platformFee: 14.22,
    pricing: {
      designPrice: 95.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 95.0,
      clientFeePercent: 5,
      clientFeeAmount: 4.75,
      vatPercent: 19,
      vatAmount: 56.0,
      total: 155.75,
      providerPayout: 80.75,
      platformFee: 14.22,
      stripeChargeId: "ch_3YxI9J0kN5sTvX6Y",
      stripePayoutId: "po_1YxI9J0kN5sTvX6Y",
    },
    selectedTeeth: [46],
    designParams: {
      marginSettings: "0.06mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.7mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "Implant system: Nobel Active RP 4.3mm.",
    },
    scanFiles: [
      { id: "sf1", name: "implant_scan.stl", fileSize: 3_200_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "abutment_46_final.stl", fileSize: 720_000, url: "#" },
    ],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "DentaDesign Munich",
        content: "Abutment designed and uploaded. Please confirm implant system compatibility.",
        sentAt: new Date("2026-02-07T11:00:00"),
      },
      {
        id: "m2",
        senderRole: "client",
        senderName: "Harbor Dental Clinic",
        content: "Confirmed, compatible. Approving.",
        sentAt: new Date("2026-02-07T14:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 10. Aligner · DISPUTED ──────────────────────────────────────────────────
  {
    id: "ORD-2026-00191",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Bright Smiles Orthodontics",
    clientEmail: "cases@brightsmiles.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "DISPUTED",
    dateCreated: new Date("2026-01-30"),
    total: 304.5,
    platformFee: 27.79,
    pricing: {
      designPrice: 240.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 240.0,
      clientFeePercent: 5,
      clientFeeAmount: 12.0,
      vatPercent: 19,
      vatAmount: 52.5,
      total: 304.5,
      providerPayout: 204.0,
      platformFee: 27.79,
      stripeChargeId: "ch_3ZyJ0K1lO6tUwY7Z",
      stripePayoutId: "",
    },
    archSelection: "Lower Only",
    complexityTier: "Moderate",
    treatmentGoals: ["Spacing", "Midline"],
    simulationUrl: "",
    messages: [
      {
        id: "m1",
        senderRole: "client",
        senderName: "Bright Smiles Ortho",
        content:
          "The simulation does not match the treatment goals we agreed on. The lower midline correction is completely absent.",
        sentAt: new Date("2026-02-04T10:00:00"),
      },
      {
        id: "m2",
        senderRole: "provider",
        senderName: "ClearSmile Studio",
        content:
          "We designed to the specifications provided. Midline correction requires additional complexity tier — it was not included.",
        sentAt: new Date("2026-02-04T11:30:00"),
      },
    ],
    internalNotes: [
      {
        id: "note1",
        author: "admin@saga.dental",
        content:
          "Client claims midline correction was verbally agreed. Provider disputes. Need to review original order form and messages.",
        createdAt: new Date("2026-02-05T09:00:00"),
      },
      {
        id: "note2",
        author: "support@saga.dental",
        content: "Escalated to senior support. Awaiting decision on partial refund.",
        createdAt: new Date("2026-02-06T14:00:00"),
      },
    ],
  },

  // ── 11. Prosthetics · IN_PROGRESS ───────────────────────────────────────────
  {
    id: "ORD-2026-00190",
    orderType: "prosthetics",
    category: "Partial Frameworks",
    client: "Central Dental Group",
    clientEmail: "reception@centraldental.com",
    provider: "NovaDental Warsaw",
    providerEmail: "orders@novadental.pl",
    status: "IN_PROGRESS",
    dateCreated: new Date("2026-01-28"),
    total: 245.0,
    platformFee: 22.37,
    pricing: {
      designPrice: 160.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 160.0,
      clientFeePercent: 5,
      clientFeeAmount: 8.0,
      vatPercent: 19,
      vatAmount: 77.0,
      total: 245.0,
      providerPayout: 136.0,
      platformFee: 22.37,
      stripeChargeId: "ch_4AzK1L2mP7uVxZ8A",
      stripePayoutId: "",
    },
    selectedTeeth: [34, 35, 44, 45],
    designParams: {
      marginSettings: "0.06mm",
      spacerThickness: "0.04mm",
      minimumThickness: "0.8mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "Kennedy Class II modification. Please ensure adequate connector width.",
    },
    scanFiles: [
      { id: "sf1", name: "full_arch_lower.stl", fileSize: 4_600_000, url: "#" },
    ],
    designFiles: [],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "NovaDental Warsaw",
        content: "Files received. Starting partial framework design.",
        sentAt: new Date("2026-01-28T12:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 12. Prosthetics · REVIEW ────────────────────────────────────────────────
  {
    id: "ORD-2026-00189",
    orderType: "prosthetics",
    category: "Bridges",
    client: "Smith Dental Practice",
    clientEmail: "orders@smithdental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "REVIEW",
    dateCreated: new Date("2026-01-25"),
    total: 330.75,
    platformFee: 30.19,
    pricing: {
      designPrice: 130.0,
      additionalItems: 80.0,
      additionalItemsLabel: "Additional units (×4 @ €20)",
      subtotal: 210.0,
      clientFeePercent: 5,
      clientFeeAmount: 10.5,
      vatPercent: 19,
      vatAmount: 110.25,
      total: 330.75,
      providerPayout: 178.5,
      platformFee: 30.19,
      stripeChargeId: "ch_4BaL2M3nQ8vWyA9B",
      stripePayoutId: "",
    },
    selectedTeeth: [13, 14, 15, 16, 17],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.04mm",
      minimumThickness: "0.6mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions: "Long-span bridge — please confirm connector dimensions before finalising.",
    },
    scanFiles: [
      { id: "sf1", name: "upper_right_scan.stl", fileSize: 3_700_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "bridge_13_17_v1.stl", fileSize: 3_100_000, url: "#" },
    ],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearCAD Studio",
        content: "Long-span bridge ready for review. Please check connector dimensions.",
        sentAt: new Date("2026-01-29T15:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 13. Aligner · COMPLETE ──────────────────────────────────────────────────
  {
    id: "ORD-2026-00188",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Sunrise Orthodontics",
    clientEmail: "info@sunriseortho.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "COMPLETE",
    dateCreated: new Date("2026-01-20"),
    total: 892.5,
    platformFee: 81.47,
    pricing: {
      designPrice: 480.0,
      additionalItems: 144.0,
      additionalItemsLabel: "Complexity premium (Complex)",
      subtotal: 624.0,
      clientFeePercent: 5,
      clientFeeAmount: 31.2,
      vatPercent: 19,
      vatAmount: 237.3,
      total: 892.5,
      providerPayout: 530.4,
      platformFee: 81.47,
      stripeChargeId: "ch_4CbM3N4oR9wXzB0C",
      stripePayoutId: "po_1CbM3N4oR9wXzB0C",
    },
    archSelection: "Both Arches",
    complexityTier: "Complex",
    treatmentGoals: ["Crowding", "Crossbite", "Midline"],
    simulationUrl: "https://example.com/sim/ORD-2026-00188",
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ClearSmile Studio",
        content: "All deliverables uploaded. 38 upper + 32 lower stage STLs ready.",
        sentAt: new Date("2026-02-10T13:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 14. Prosthetics · PAID ──────────────────────────────────────────────────
  {
    id: "ORD-2026-00187",
    orderType: "prosthetics",
    category: "Crowns",
    client: "Valley Dental Lab",
    clientEmail: "lab@valleydental.com",
    provider: "DentaDesign Munich",
    providerEmail: "orders@dentadesign.de",
    status: "PAID",
    dateCreated: new Date("2026-01-18"),
    total: 130.5,
    platformFee: 11.91,
    pricing: {
      designPrice: 85.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 85.0,
      clientFeePercent: 5,
      clientFeeAmount: 4.25,
      vatPercent: 19,
      vatAmount: 41.25,
      total: 130.5,
      providerPayout: 72.25,
      platformFee: 11.91,
      stripeChargeId: "ch_4DcN4O5pS0xYaC1D",
      stripePayoutId: "",
    },
    selectedTeeth: [26],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions: "",
    },
    scanFiles: [],
    designFiles: [],
    revisions: [],
    messages: [],
    internalNotes: [],
  },

  // ── 15. Prosthetics · COMPLETE ──────────────────────────────────────────────
  {
    id: "ORD-2026-00186",
    orderType: "prosthetics",
    category: "Veneers",
    client: "Harbor Dental Clinic",
    clientEmail: "admin@harbordental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "COMPLETE",
    dateCreated: new Date("2026-01-15"),
    total: 262.5,
    platformFee: 23.97,
    pricing: {
      designPrice: 120.0,
      additionalItems: 60.0,
      additionalItemsLabel: "Additional veneers (×4 @ €15)",
      subtotal: 180.0,
      clientFeePercent: 5,
      clientFeeAmount: 9.0,
      vatPercent: 19,
      vatAmount: 73.5,
      total: 262.5,
      providerPayout: 153.0,
      platformFee: 23.97,
      stripeChargeId: "ch_4EdO5P6qT1yZbD2E",
      stripePayoutId: "po_1EdO5P6qT1yZbD2E",
    },
    selectedTeeth: [11, 12, 13, 21, 22, 23],
    designParams: {
      marginSettings: "0.04mm",
      spacerThickness: "0.02mm",
      minimumThickness: "0.4mm",
      contactStrength: "Light",
      occlusionType: "Light Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "upper_arch.stl", fileSize: 4_900_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "veneers_anterior_final.stl", fileSize: 2_800_000, url: "#" },
    ],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "client",
        senderName: "Harbor Dental Clinic",
        content: "Beautiful result, approved.",
        sentAt: new Date("2026-01-18T10:00:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 16. Aligner · IN_PROGRESS ───────────────────────────────────────────────
  {
    id: "ORD-2026-00185",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Metro Orthodontics",
    clientEmail: "cases@metroortho.com",
    provider: "ArcForm Berlin",
    providerEmail: "studio@arcform.de",
    status: "IN_PROGRESS",
    dateCreated: new Date("2026-01-12"),
    total: 420.0,
    platformFee: 38.33,
    pricing: {
      designPrice: 240.0,
      additionalItems: 48.0,
      additionalItemsLabel: "Complexity premium (Moderate)",
      subtotal: 288.0,
      clientFeePercent: 5,
      clientFeeAmount: 14.4,
      vatPercent: 19,
      vatAmount: 117.6,
      total: 420.0,
      providerPayout: 244.8,
      platformFee: 38.33,
      stripeChargeId: "ch_4FeP6Q7rU2zAcE3F",
      stripePayoutId: "",
    },
    archSelection: "Upper Only",
    complexityTier: "Moderate",
    treatmentGoals: ["Crowding", "Deep Bite"],
    simulationUrl: "",
    messages: [
      {
        id: "m1",
        senderRole: "provider",
        senderName: "ArcForm Berlin",
        content: "Records reviewed. Beginning treatment planning.",
        sentAt: new Date("2026-01-13T08:30:00"),
      },
    ],
    internalNotes: [],
  },

  // ── 17. Prosthetics · COMPLETE ──────────────────────────────────────────────
  {
    id: "ORD-2026-00184",
    orderType: "prosthetics",
    category: "Crowns",
    client: "Central Dental Group",
    clientEmail: "reception@centraldental.com",
    provider: "NovaDental Warsaw",
    providerEmail: "orders@novadental.pl",
    status: "COMPLETE",
    dateCreated: new Date("2026-01-08"),
    total: 143.69,
    platformFee: 13.12,
    pricing: {
      designPrice: 85.0,
      additionalItems: 30.0,
      additionalItemsLabel: "Additional teeth (×2 @ €15)",
      subtotal: 115.0,
      clientFeePercent: 5,
      clientFeeAmount: 5.75,
      vatPercent: 19,
      vatAmount: 22.94,
      total: 143.69,
      providerPayout: 97.75,
      platformFee: 13.12,
      stripeChargeId: "ch_4GfQ7R8sV3aBdF4G",
      stripePayoutId: "po_1GfQ7R8sV3aBdF4G",
    },
    selectedTeeth: [36, 46, 47],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Medium",
      occlusionType: "Medium Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "lower_arch.stl", fileSize: 3_500_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "crowns_final.stl", fileSize: 1_800_000, url: "#" },
    ],
    revisions: [],
    messages: [],
    internalNotes: [],
  },

  // ── 18. Prosthetics · RESOLVED ──────────────────────────────────────────────
  {
    id: "ORD-2026-00183",
    orderType: "prosthetics",
    category: "Crowns",
    client: "Smith Dental Practice",
    clientEmail: "orders@smithdental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "RESOLVED",
    dateCreated: new Date("2026-01-05"),
    total: 168.0,
    platformFee: 0.0,
    pricing: {
      designPrice: 85.0,
      additionalItems: 30.0,
      additionalItemsLabel: "Additional teeth (×2 @ €15)",
      subtotal: 115.0,
      clientFeePercent: 5,
      clientFeeAmount: 5.75,
      vatPercent: 19,
      vatAmount: 47.25,
      total: 168.0,
      providerPayout: 0.0,
      platformFee: 0.0,
      stripeChargeId: "ch_4HgR8S9tW4bCeG5H",
      stripePayoutId: "",
    },
    selectedTeeth: [16, 17],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.5mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "",
    },
    scanFiles: [],
    designFiles: [],
    revisions: [],
    messages: [
      {
        id: "m1",
        senderRole: "client",
        senderName: "Smith Dental Practice",
        content: "Design files are completely wrong — wrong teeth entirely.",
        sentAt: new Date("2026-01-10T09:00:00"),
      },
    ],
    internalNotes: [
      {
        id: "note1",
        author: "admin@saga.dental",
        content: "Full refund issued. Provider penalised under SLA clause 4.2. Order resolved.",
        createdAt: new Date("2026-01-12T11:00:00"),
      },
    ],
  },

  // ── 19. Aligner · COMPLETE ──────────────────────────────────────────────────
  {
    id: "ORD-2025-00182",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Bright Smiles Orthodontics",
    clientEmail: "cases@brightsmiles.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "COMPLETE",
    dateCreated: new Date("2025-12-28"),
    total: 682.5,
    platformFee: 62.29,
    pricing: {
      designPrice: 480.0,
      additionalItems: 72.0,
      additionalItemsLabel: "Complexity premium (Moderate)",
      subtotal: 552.0,
      clientFeePercent: 5,
      clientFeeAmount: 27.6,
      vatPercent: 19,
      vatAmount: 102.9,
      total: 682.5,
      providerPayout: 469.2,
      platformFee: 62.29,
      stripeChargeId: "ch_4IhS9T0uX5cDfH6I",
      stripePayoutId: "po_1IhS9T0uX5cDfH6I",
    },
    archSelection: "Both Arches",
    complexityTier: "Moderate",
    treatmentGoals: ["Crowding", "Spacing"],
    simulationUrl: "https://example.com/sim/ORD-2025-00182",
    messages: [],
    internalNotes: [],
  },

  // ── 20. Prosthetics · COMPLETE ──────────────────────────────────────────────
  {
    id: "ORD-2025-00181",
    orderType: "prosthetics",
    category: "Bridges",
    client: "Valley Dental Lab",
    clientEmail: "lab@valleydental.com",
    provider: "DentaDesign Munich",
    providerEmail: "orders@dentadesign.de",
    status: "COMPLETE",
    dateCreated: new Date("2025-12-20"),
    total: 198.0,
    platformFee: 18.07,
    pricing: {
      designPrice: 130.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 130.0,
      clientFeePercent: 5,
      clientFeeAmount: 6.5,
      vatPercent: 19,
      vatAmount: 61.5,
      total: 198.0,
      providerPayout: 110.5,
      platformFee: 18.07,
      stripeChargeId: "ch_4JiT0U1vY6dEgI7J",
      stripePayoutId: "po_1JiT0U1vY6dEgI7J",
    },
    selectedTeeth: [44, 45, 46],
    designParams: {
      marginSettings: "0.05mm",
      spacerThickness: "0.04mm",
      minimumThickness: "0.6mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "",
    },
    scanFiles: [
      { id: "sf1", name: "lower_right.stl", fileSize: 2_800_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "bridge_44_46_final.stl", fileSize: 1_900_000, url: "#" },
    ],
    revisions: [],
    messages: [],
    internalNotes: [],
  },

  // ── 21. Prosthetics · COMPLETE ──────────────────────────────────────────────
  {
    id: "ORD-2025-00180",
    orderType: "prosthetics",
    category: "Implant Abutments",
    client: "Harbor Dental Clinic",
    clientEmail: "admin@harbordental.com",
    provider: "ClearCAD Studio",
    providerEmail: "info@clearcad.de",
    status: "COMPLETE",
    dateCreated: new Date("2025-12-15"),
    total: 130.5,
    platformFee: 11.91,
    pricing: {
      designPrice: 95.0,
      additionalItems: 0.0,
      additionalItemsLabel: "—",
      subtotal: 95.0,
      clientFeePercent: 5,
      clientFeeAmount: 4.75,
      vatPercent: 19,
      vatAmount: 30.75,
      total: 130.5,
      providerPayout: 80.75,
      platformFee: 11.91,
      stripeChargeId: "ch_4KjU1V2wZ7eFhJ8K",
      stripePayoutId: "po_1KjU1V2wZ7eFhJ8K",
    },
    selectedTeeth: [36],
    designParams: {
      marginSettings: "0.06mm",
      spacerThickness: "0.03mm",
      minimumThickness: "0.7mm",
      contactStrength: "Heavy",
      occlusionType: "Heavy Contact",
      specialInstructions: "Straumann BL 4.1mm implant.",
    },
    scanFiles: [
      { id: "sf1", name: "implant_36.stl", fileSize: 2_100_000, url: "#" },
    ],
    designFiles: [
      { id: "df1", name: "abutment_36_final.stl", fileSize: 650_000, url: "#" },
    ],
    revisions: [],
    messages: [],
    internalNotes: [],
  },

  // ── 22. Aligner · COMPLETE ──────────────────────────────────────────────────
  {
    id: "ORD-2025-00179",
    orderType: "aligner",
    category: "Aligner Design",
    client: "Metro Orthodontics",
    clientEmail: "cases@metroortho.com",
    provider: "ClearSmile Studio",
    providerEmail: "ops@clearsmile.de",
    status: "COMPLETE",
    dateCreated: new Date("2025-12-10"),
    total: 945.0,
    platformFee: 86.25,
    pricing: {
      designPrice: 480.0,
      additionalItems: 192.0,
      additionalItemsLabel: "Complexity premium (Complex)",
      subtotal: 672.0,
      clientFeePercent: 5,
      clientFeeAmount: 33.6,
      vatPercent: 19,
      vatAmount: 239.4,
      total: 945.0,
      providerPayout: 571.2,
      platformFee: 86.25,
      stripeChargeId: "ch_4LkV2W3xA8fGiK9L",
      stripePayoutId: "po_1LkV2W3xA8fGiK9L",
    },
    archSelection: "Both Arches",
    complexityTier: "Complex",
    treatmentGoals: ["Crowding", "Open Bite", "Midline", "Crossbite"],
    simulationUrl: "https://example.com/sim/ORD-2025-00179",
    messages: [],
    internalNotes: [],
  },
]
