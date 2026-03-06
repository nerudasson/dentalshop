// ─── Types ────────────────────────────────────────────────────────────────────

export type ProviderStatus = "active" | "pending" | "suspended"
export type ProviderCapability = "prosthetics" | "aligner" | "both"

export interface AdminProviderProduct {
  id: string
  name: string
  category: string
  price: number
  currency: string
  turnaroundDays: number
}

export interface AdminProvider {
  id: string
  name: string
  contactName: string
  email: string
  location: string
  country: string
  status: ProviderStatus
  capabilities: ProviderCapability
  /** Software tools used for design */
  software: string[]
  productsCount: number
  ordersCount: number
  completedOrdersCount: number
  averageRating: number
  reviewCount: number
  joinedDate: Date
  /** Date of status change (approval/suspension) */
  statusChangedAt?: Date
  suspensionReason?: string
  /** Short bio / studio description */
  bio: string
  /** Portfolio preview: 3-5 recent completed order categories */
  portfolioCategories: string[]
  products: AdminProviderProduct[]
}

// ─── Dummy data (10 providers) ────────────────────────────────────────────────

export const ADMIN_PROVIDERS: AdminProvider[] = [
  // 1. Active · Prosthetics
  {
    id: "prov_001",
    name: "ClearCAD Studio",
    contactName: "Dr. Hans Müller",
    email: "info@clearcad.de",
    location: "Berlin, Germany",
    country: "DE",
    status: "active",
    capabilities: "prosthetics",
    software: ["exocad", "3Shape"],
    productsCount: 12,
    ordersCount: 87,
    completedOrdersCount: 82,
    averageRating: 4.8,
    reviewCount: 74,
    joinedDate: new Date("2025-01-15"),
    statusChangedAt: new Date("2025-01-20"),
    bio:
      "Berlin-based digital prosthetics studio specialising in crowns, bridges, and implant abutments. Over 10 years of CAD/CAM experience using exocad and 3Shape.",
    portfolioCategories: ["Crowns", "Bridges", "Implant Abutments", "Veneers"],
    products: [
      { id: "p1", name: "Single Crown (Posterior)", category: "Crowns", price: 85, currency: "EUR", turnaroundDays: 2 },
      { id: "p2", name: "3-Unit Bridge", category: "Bridges", price: 130, currency: "EUR", turnaroundDays: 3 },
      { id: "p3", name: "Implant Abutment", category: "Implant Abutments", price: 95, currency: "EUR", turnaroundDays: 2 },
    ],
  },

  // 2. Active · Aligner
  {
    id: "prov_002",
    name: "ClearSmile Studio",
    contactName: "Dr. Anna Weber",
    email: "ops@clearsmile.de",
    location: "Munich, Germany",
    country: "DE",
    status: "active",
    capabilities: "aligner",
    software: ["SureSmile", "Archform", "uLab"],
    productsCount: 6,
    ordersCount: 63,
    completedOrdersCount: 60,
    averageRating: 4.9,
    reviewCount: 58,
    joinedDate: new Date("2025-02-10"),
    statusChangedAt: new Date("2025-02-15"),
    bio:
      "Munich-based aligner design studio. Certified in SureSmile, Archform, and uLab. Specialises in complex orthodontic cases including severe crowding and multiplane corrections.",
    portfolioCategories: ["Aligner Design"],
    products: [
      { id: "p4", name: "Simple Aligner Case (Upper Only)", category: "Aligner Design", price: 240, currency: "EUR", turnaroundDays: 5 },
      { id: "p5", name: "Moderate Aligner Case (Both Arches)", category: "Aligner Design", price: 420, currency: "EUR", turnaroundDays: 7 },
      { id: "p6", name: "Complex Aligner Case (Both Arches)", category: "Aligner Design", price: 480, currency: "EUR", turnaroundDays: 10 },
    ],
  },

  // 3. Active · Both
  {
    id: "prov_003",
    name: "ArcForm Berlin",
    contactName: "Tomasz Kowalski",
    email: "studio@arcform.de",
    location: "Berlin, Germany",
    country: "DE",
    status: "active",
    capabilities: "both",
    software: ["exocad", "Archform", "OnyxCeph"],
    productsCount: 9,
    ordersCount: 45,
    completedOrdersCount: 43,
    averageRating: 4.7,
    reviewCount: 39,
    joinedDate: new Date("2025-03-05"),
    statusChangedAt: new Date("2025-03-10"),
    bio:
      "Full-service digital dental design studio offering both prosthetics CAD and aligner treatment planning. Uses exocad for restorative work and Archform/OnyxCeph for orthodontic cases.",
    portfolioCategories: ["Crowns", "Bridges", "Aligner Design", "Partial Frameworks"],
    products: [
      { id: "p7", name: "Single Crown", category: "Crowns", price: 80, currency: "EUR", turnaroundDays: 2 },
      { id: "p8", name: "Aligner Case (Simple)", category: "Aligner Design", price: 220, currency: "EUR", turnaroundDays: 5 },
      { id: "p9", name: "Partial Framework", category: "Partial Frameworks", price: 160, currency: "EUR", turnaroundDays: 4 },
    ],
  },

  // 4. Active · Prosthetics
  {
    id: "prov_004",
    name: "NovaDental Warsaw",
    contactName: "Piotr Nowak",
    email: "orders@novadental.pl",
    location: "Warsaw, Poland",
    country: "PL",
    status: "active",
    capabilities: "prosthetics",
    software: ["exocad", "3Shape"],
    productsCount: 8,
    ordersCount: 52,
    completedOrdersCount: 50,
    averageRating: 4.6,
    reviewCount: 46,
    joinedDate: new Date("2025-01-08"),
    statusChangedAt: new Date("2025-01-12"),
    bio:
      "Warsaw-based prosthetics design lab with extensive experience in full-arch restorations and implant-supported prosthetics. Competitive pricing with fast turnaround.",
    portfolioCategories: ["Crowns", "Bridges", "Implant Abutments"],
    products: [
      { id: "p10", name: "Single Crown", category: "Crowns", price: 75, currency: "EUR", turnaroundDays: 2 },
      { id: "p11", name: "4-Unit Bridge", category: "Bridges", price: 145, currency: "EUR", turnaroundDays: 3 },
    ],
  },

  // 5. Active · Both
  {
    id: "prov_005",
    name: "DentaDesign Munich",
    contactName: "Dr. Claudia Bauer",
    email: "orders@dentadesign.de",
    location: "Munich, Germany",
    country: "DE",
    status: "active",
    capabilities: "both",
    software: ["exocad", "3Shape", "SureSmile"],
    productsCount: 15,
    ordersCount: 120,
    completedOrdersCount: 115,
    averageRating: 4.8,
    reviewCount: 108,
    joinedDate: new Date("2024-11-20"),
    statusChangedAt: new Date("2024-11-25"),
    bio:
      "Premium Munich-based studio with the widest service catalogue on the platform. Handles everything from single-tooth restorations to full-arch aligner planning. SLA-guaranteed 3-day turnaround.",
    portfolioCategories: ["Crowns", "Bridges", "Veneers", "Aligner Design", "Implant Abutments"],
    products: [
      { id: "p12", name: "Veneer (Anterior)", category: "Veneers", price: 90, currency: "EUR", turnaroundDays: 2 },
      { id: "p13", name: "Crown (Posterior)", category: "Crowns", price: 82, currency: "EUR", turnaroundDays: 2 },
      { id: "p14", name: "Full-Arch Aligner", category: "Aligner Design", price: 460, currency: "EUR", turnaroundDays: 8 },
    ],
  },

  // 6. Pending · Prosthetics
  {
    id: "prov_006",
    name: "SmileForge Bucharest",
    contactName: "Andrei Ionescu",
    email: "hello@smileforge.ro",
    location: "Bucharest, Romania",
    country: "RO",
    status: "pending",
    capabilities: "prosthetics",
    software: ["exocad"],
    productsCount: 0,
    ordersCount: 0,
    completedOrdersCount: 0,
    averageRating: 0,
    reviewCount: 0,
    joinedDate: new Date("2026-03-01"),
    bio:
      "Recently established dental design studio in Bucharest. Certified exocad operator with 5 years of in-house lab experience seeking to expand digitally.",
    portfolioCategories: ["Crowns", "Bridges"],
    products: [],
  },

  // 7. Pending · Aligner
  {
    id: "prov_007",
    name: "OrthoCAD Prague",
    contactName: "Dr. Martin Novák",
    email: "studio@orthocad.cz",
    location: "Prague, Czech Republic",
    country: "CZ",
    status: "pending",
    capabilities: "aligner",
    software: ["Archform", "OnyxCeph"],
    productsCount: 0,
    ordersCount: 0,
    completedOrdersCount: 0,
    averageRating: 0,
    reviewCount: 0,
    joinedDate: new Date("2026-02-18"),
    bio:
      "Orthodontic design specialist based in Prague with 8 years of clinical orthodontics experience. Transitioning to a fully digital workflow using Archform and OnyxCeph.",
    portfolioCategories: ["Aligner Design"],
    products: [],
  },

  // 8. Pending · Both
  {
    id: "prov_008",
    name: "DentalArt Ljubljana",
    contactName: "Maja Kovač",
    email: "info@dentalart.si",
    location: "Ljubljana, Slovenia",
    country: "SI",
    status: "pending",
    capabilities: "both",
    software: ["exocad", "SureSmile"],
    productsCount: 0,
    ordersCount: 0,
    completedOrdersCount: 0,
    averageRating: 0,
    reviewCount: 0,
    joinedDate: new Date("2026-03-04"),
    bio:
      "Full-service digital studio in Ljubljana covering restorative and orthodontic design. Dual-certified in exocad and SureSmile. Looking to grow internationally via the SAGA platform.",
    portfolioCategories: ["Crowns", "Aligner Design"],
    products: [],
  },

  // 9. Suspended · Prosthetics
  {
    id: "prov_009",
    name: "PrecisionDental Gdansk",
    contactName: "Krzysztof Wiśniewski",
    email: "contact@precisiondental.pl",
    location: "Gdańsk, Poland",
    country: "PL",
    status: "suspended",
    capabilities: "prosthetics",
    software: ["exocad"],
    productsCount: 5,
    ordersCount: 23,
    completedOrdersCount: 18,
    averageRating: 3.2,
    reviewCount: 20,
    joinedDate: new Date("2025-06-12"),
    statusChangedAt: new Date("2026-01-28"),
    suspensionReason:
      "Multiple SLA violations: 3 orders exceeded the 5-day turnaround guarantee and one design was delivered to the wrong client. Suspension pending corrective action review.",
    bio:
      "Prosthetics design studio based in Gdańsk. Focuses on posteriors and implant cases using exocad.",
    portfolioCategories: ["Crowns", "Implant Abutments"],
    products: [
      { id: "p15", name: "Single Crown", category: "Crowns", price: 65, currency: "EUR", turnaroundDays: 3 },
    ],
  },

  // 10. Active · Aligner
  {
    id: "prov_010",
    name: "AlignTech Studio Vienna",
    contactName: "Dr. Sabine Gruber",
    email: "cases@aligntech.at",
    location: "Vienna, Austria",
    country: "AT",
    status: "active",
    capabilities: "aligner",
    software: ["uLab", "Archform"],
    productsCount: 4,
    ordersCount: 31,
    completedOrdersCount: 29,
    averageRating: 4.5,
    reviewCount: 27,
    joinedDate: new Date("2025-09-03"),
    statusChangedAt: new Date("2025-09-08"),
    bio:
      "Vienna-based aligner studio using uLab and Archform. Focused on moderate-to-complex cases with personalised treatment planning. Fluent in English, German, and French.",
    portfolioCategories: ["Aligner Design"],
    products: [
      { id: "p16", name: "Aligner Case (Upper Only)", category: "Aligner Design", price: 230, currency: "EUR", turnaroundDays: 6 },
      { id: "p17", name: "Aligner Case (Both Arches, Complex)", category: "Aligner Design", price: 470, currency: "EUR", turnaroundDays: 10 },
    ],
  },
]
