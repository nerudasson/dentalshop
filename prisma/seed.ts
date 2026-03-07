import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, OrderStatus, CategoryType, TransactionType, FeeType, FileSection } from "@prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.message.deleteMany()
  await prisma.review.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.fileAttachment.deleteMany()
  await prisma.workStep.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.feeConfiguration.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // ─── Organizations ─────────────────────────────────────────────────────────

  const smithDental = await prisma.organization.create({
    data: {
      id: "org_clinic_01",
      name: "Smith Dental Clinic",
      slug: "smith-dental",
      isPractice: true,
      canDesign: false,
      location: "Munich, Germany",
      contactEmail: "office@smithdental.de",
    },
  })

  const alpineLab = await prisma.organization.create({
    data: {
      id: "org_clinic_02",
      name: "Alpine Dental Lab",
      slug: "alpine-lab",
      isPractice: true,
      canDesign: false,
      location: "Zurich, Switzerland",
      contactEmail: "info@alpinelab.ch",
    },
  })

  const clearCAD = await prisma.organization.create({
    data: {
      id: "org_design_01",
      name: "ClearCAD Studio",
      slug: "clearcad",
      isPractice: false,
      canDesign: true,
      location: "Berlin, Germany",
      contactEmail: "studio@clearcad.de",
    },
  })

  const clearSmile = await prisma.organization.create({
    data: {
      id: "org_design_02",
      name: "ClearSmile Design",
      slug: "clearsmile",
      isPractice: false,
      canDesign: true,
      location: "Vienna, Austria",
      contactEmail: "hello@clearsmile.at",
    },
  })

  const platformOrg = await prisma.organization.create({
    data: {
      id: "org_platform",
      name: "SAGA.DENTAL Platform",
      slug: "saga-dental",
      isPractice: false,
      canDesign: false,
      isSuperAdmin: true,
    },
  })

  // ─── Users ─────────────────────────────────────────────────────────────────

  const drSmith = await prisma.user.create({
    data: {
      id: "user_dr_smith",
      clerkId: "clerk_dr_smith",
      email: "dr.smith@smithdental.de",
      name: "Dr. A. Smith",
      organizationId: smithDental.id,
    },
  })

  const drMueller = await prisma.user.create({
    data: {
      id: "user_dr_mueller",
      clerkId: "clerk_dr_mueller",
      email: "mueller@alpinelab.ch",
      name: "Dr. K. Müller",
      organizationId: alpineLab.id,
    },
  })

  const designLead = await prisma.user.create({
    data: {
      id: "user_design_lead",
      clerkId: "clerk_design_lead",
      email: "m.chen@clearcad.de",
      name: "M. Chen",
      organizationId: clearCAD.id,
    },
  })

  const designLead2 = await prisma.user.create({
    data: {
      id: "user_design_lead_2",
      clerkId: "clerk_design_lead_2",
      email: "l.novak@clearsmile.at",
      name: "L. Novak",
      organizationId: clearSmile.id,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      id: "user_admin_01",
      clerkId: "clerk_admin_01",
      email: "admin@saga.dental",
      name: "Platform Admin",
      organizationId: platformOrg.id,
    },
  })

  // ─── Products ──────────────────────────────────────────────────────────────

  await prisma.product.createMany({
    data: [
      {
        organizationId: clearCAD.id,
        name: "Crown Design",
        category: "Crowns",
        categoryType: CategoryType.PROSTHETICS,
        description: "Single-unit crown CAD design",
        basePrice: 89,
        turnaroundDays: 3,
        software: ["exocad", "3Shape"],
      },
      {
        organizationId: clearCAD.id,
        name: "Bridge Design",
        category: "Bridges",
        categoryType: CategoryType.PROSTHETICS,
        description: "Multi-unit bridge framework design",
        basePrice: 129,
        turnaroundDays: 4,
        software: ["exocad"],
      },
      {
        organizationId: clearCAD.id,
        name: "Aligner Treatment Planning",
        category: "Aligner Design",
        categoryType: CategoryType.ALIGNER,
        description: "Full digital aligner treatment planning",
        basePrice: 199,
        turnaroundDays: 5,
        software: ["SureSmile", "Archform"],
      },
      {
        organizationId: clearSmile.id,
        name: "Crown Design Premium",
        category: "Crowns",
        categoryType: CategoryType.PROSTHETICS,
        description: "Premium crown design with detailed anatomy",
        basePrice: 109,
        turnaroundDays: 2,
        software: ["3Shape"],
      },
      {
        organizationId: clearSmile.id,
        name: "Aligner Design Complete",
        category: "Aligner Design",
        categoryType: CategoryType.ALIGNER,
        description: "Complete aligner treatment planning with simulation",
        basePrice: 249,
        turnaroundDays: 7,
        software: ["OnyxCeph", "uLab"],
      },
    ],
  })

  // ─── Fee Configurations ────────────────────────────────────────────────────

  await prisma.feeConfiguration.createMany({
    data: [
      // Global defaults
      { feeType: FeeType.CLIENT_FEE, percentage: 5.0, serviceType: null, organizationId: null },
      { feeType: FeeType.PROVIDER_COMMISSION, percentage: 12.5, serviceType: null, organizationId: null },
      // Aligner-specific override (slightly higher commission)
      { feeType: FeeType.PROVIDER_COMMISSION, percentage: 15.0, serviceType: "aligner", organizationId: null },
    ],
  })

  // ─── Orders ────────────────────────────────────────────────────────────────

  // Order 1: Prosthetics — COMPLETE
  const order1 = await prisma.order.create({
    data: {
      id: "ord_001",
      reference: "ORD-2024-00138",
      status: OrderStatus.COMPLETE,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: smithDental.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-11-15T09:30:00Z"),
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      category: "Crowns",
      teeth: [11, 12],
      basePrice: 89,
      quantity: 1,
      designParams: {
        marginSettings: "0.05",
        spacerThickness: "0.03",
        minimumThickness: "0.5",
        contactStrength: "Medium",
        occlusionType: "Medium Contact",
        specialInstructions: "",
      },
    },
  })

  // Order 2: Prosthetics — REVIEW (main demo order)
  const order2 = await prisma.order.create({
    data: {
      id: "ord_002",
      reference: "ORD-2024-00142",
      status: OrderStatus.REVIEW,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: smithDental.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-12-01T10:00:00Z"),
    },
  })

  const orderItem2 = await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      category: "Crowns",
      teeth: [21, 22, 23],
      basePrice: 89,
      quantity: 1,
      designParams: {
        marginSettings: "0.05",
        spacerThickness: "0.03",
        minimumThickness: "0.5",
        contactStrength: "Medium",
        occlusionType: "Medium Contact",
        specialInstructions: "Patient has mild bruxism — reinforce occlusal.",
      },
    },
  })

  await prisma.workStep.create({
    data: {
      orderItemId: orderItem2.id,
      stepType: "design",
      sequence: 1,
      status: "IN_PROGRESS",
      assignedOrgId: clearCAD.id,
    },
  })

  // Order 3: Prosthetics — IN_PROGRESS
  const order3 = await prisma.order.create({
    data: {
      id: "ord_003",
      reference: "ORD-2024-00145",
      status: OrderStatus.IN_PROGRESS,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: smithDental.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-12-05T14:00:00Z"),
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      category: "Bridges",
      teeth: [14, 15, 16],
      basePrice: 129,
      quantity: 1,
      designParams: {
        marginSettings: "0.04",
        spacerThickness: "0.03",
        minimumThickness: "0.6",
        contactStrength: "Heavy",
        occlusionType: "Heavy Contact",
        specialInstructions: "",
      },
    },
  })

  // Order 4: Prosthetics — PAID (waiting for provider)
  await prisma.order.create({
    data: {
      id: "ord_004",
      reference: "ORD-2024-00148",
      status: OrderStatus.PAID,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: alpineLab.id,
      providerOrgId: clearSmile.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-12-10T08:00:00Z"),
      items: {
        create: {
          category: "Veneers",
          teeth: [11, 12, 13, 21, 22, 23],
          basePrice: 89,
          quantity: 1,
        },
      },
    },
  })

  // Order 5: Prosthetics — PENDING_PAYMENT
  await prisma.order.create({
    data: {
      id: "ord_005",
      reference: "ORD-2024-00150",
      status: OrderStatus.PENDING_PAYMENT,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: alpineLab.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-12-12T11:00:00Z"),
      items: {
        create: {
          category: "Implant Abutments",
          teeth: [36],
          basePrice: 89,
          quantity: 1,
        },
      },
    },
  })

  // Order 6: Aligner — REVIEW
  const order6 = await prisma.order.create({
    data: {
      id: "ord_006",
      reference: "ORD-2024-00151",
      status: OrderStatus.REVIEW,
      categoryType: CategoryType.ALIGNER,
      clientOrgId: smithDental.id,
      providerOrgId: clearSmile.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 15.0,
      createdAt: new Date("2024-12-08T09:00:00Z"),
      items: {
        create: {
          category: "Aligner Design",
          teeth: [],
          basePrice: 249,
          quantity: 1,
          alignerConfig: {
            archSelection: "both",
            treatmentGoals: ["crowding", "spacing"],
            additionalGoals: "",
            complexityTier: "moderate",
            clinicalConstraints: {
              teethNotToMove: "17, 27",
              plannedExtractions: "",
              otherConstraints: "",
            },
            designPreferences: {
              includeAttachmentDesign: true,
              includeIPRProtocol: true,
              maxStagesPreferred: null,
            },
          },
        },
      },
    },
  })

  // Order 7: Aligner — IN_PROGRESS
  await prisma.order.create({
    data: {
      id: "ord_007",
      reference: "ORD-2024-00153",
      status: OrderStatus.IN_PROGRESS,
      categoryType: CategoryType.ALIGNER,
      clientOrgId: alpineLab.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 15.0,
      createdAt: new Date("2024-12-11T16:00:00Z"),
      items: {
        create: {
          category: "Aligner Design",
          teeth: [],
          basePrice: 199,
          quantity: 1,
          alignerConfig: {
            archSelection: "upper",
            treatmentGoals: ["deep_bite"],
            additionalGoals: "Correct overjet",
            complexityTier: "simple",
            clinicalConstraints: {
              teethNotToMove: "",
              plannedExtractions: "",
              otherConstraints: "",
            },
            designPreferences: {
              includeAttachmentDesign: false,
              includeIPRProtocol: true,
              maxStagesPreferred: 14,
            },
          },
        },
      },
    },
  })

  // Order 8: Prosthetics — REVISION_REQUESTED
  await prisma.order.create({
    data: {
      id: "ord_008",
      reference: "ORD-2024-00140",
      status: OrderStatus.REVISION_REQUESTED,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: smithDental.id,
      providerOrgId: clearSmile.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-11-28T13:00:00Z"),
      items: {
        create: {
          category: "Inlays/Onlays",
          teeth: [15, 16],
          basePrice: 89,
          quantity: 1,
        },
      },
    },
  })

  // Order 9: Prosthetics — DISPUTED
  await prisma.order.create({
    data: {
      id: "ord_009",
      reference: "ORD-2024-00135",
      status: OrderStatus.DISPUTED,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: alpineLab.id,
      providerOrgId: clearCAD.id,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-11-10T10:00:00Z"),
      items: {
        create: {
          category: "Crowns",
          teeth: [46],
          basePrice: 89,
          quantity: 1,
        },
      },
    },
  })

  // Order 10: Prosthetics — DRAFT
  await prisma.order.create({
    data: {
      id: "ord_010",
      reference: "ORD-2024-00155",
      status: OrderStatus.DRAFT,
      categoryType: CategoryType.PROSTHETICS,
      clientOrgId: smithDental.id,
      providerOrgId: null,
      lockedClientFeePercent: 5.0,
      lockedProviderCommissionPercent: 12.5,
      createdAt: new Date("2024-12-14T09:00:00Z"),
      items: {
        create: {
          category: "Crowns",
          teeth: [11],
          basePrice: 89,
          quantity: 1,
        },
      },
    },
  })

  // ─── Transactions (for completed order) ────────────────────────────────────

  await prisma.transaction.createMany({
    data: [
      {
        orderId: order1.id,
        type: TransactionType.CLIENT_PAYMENT,
        amount: 93.45, // 89 * 1.05
        currency: "EUR",
        status: "COMPLETED",
      },
      {
        orderId: order1.id,
        type: TransactionType.PERFORMER_PAYOUT,
        amount: 77.88, // 89 * 0.875
        currency: "EUR",
        status: "COMPLETED",
      },
      {
        orderId: order1.id,
        type: TransactionType.PLATFORM_FEE,
        amount: 15.57, // 93.45 - 77.88
        currency: "EUR",
        status: "COMPLETED",
      },
    ],
  })

  // ─── File Attachments (for review order) ───────────────────────────────────

  await prisma.fileAttachment.createMany({
    data: [
      {
        orderId: order2.id,
        fileName: "upper_arch_scan.stl",
        fileKey: `${smithDental.id}/${order2.id}/scans/upper_arch_scan.stl`,
        fileSize: 15_400_000,
        mimeType: "model/stl",
        section: FileSection.SCAN,
        uploadedByUserId: drSmith.id,
      },
      {
        orderId: order2.id,
        fileName: "lower_arch_scan.stl",
        fileKey: `${smithDental.id}/${order2.id}/scans/lower_arch_scan.stl`,
        fileSize: 14_800_000,
        mimeType: "model/stl",
        section: FileSection.SCAN,
        uploadedByUserId: drSmith.id,
      },
      {
        orderId: order2.id,
        fileName: "crown_21_22_23_design.stl",
        fileKey: `${clearCAD.id}/${order2.id}/designs/crown_21_22_23_design.stl`,
        fileSize: 8_200_000,
        mimeType: "model/stl",
        section: FileSection.DESIGN,
        uploadedByUserId: designLead.id,
      },
    ],
  })

  // ─── Messages ──────────────────────────────────────────────────────────────

  await prisma.message.createMany({
    data: [
      {
        orderId: order2.id,
        content: "Scans uploaded. Please note the mild bruxism — would appreciate reinforced occlusal surfaces.",
        senderName: "Dr. A. Smith",
        senderRole: "client",
        senderUserId: drSmith.id,
        createdAt: new Date("2024-12-01T10:05:00Z"),
      },
      {
        orderId: order2.id,
        content: "Received, thank you. I'll add extra thickness to the occlusal. Expect first design within 48h.",
        senderName: "M. Chen",
        senderRole: "provider",
        senderUserId: designLead.id,
        createdAt: new Date("2024-12-01T11:30:00Z"),
      },
      {
        orderId: order2.id,
        content: "Design submitted for review. I've reinforced the occlusal as discussed. Please check the contacts.",
        senderName: "M. Chen",
        senderRole: "provider",
        senderUserId: designLead.id,
        createdAt: new Date("2024-12-03T14:00:00Z"),
      },
    ],
  })

  // ─── Reviews ───────────────────────────────────────────────────────────────

  await prisma.review.create({
    data: {
      orderId: order1.id,
      rating: 5,
      comment: "Excellent work. Fast turnaround and perfect fit on the first try.",
      reviewerOrgId: smithDental.id,
      providerOrgId: clearCAD.id,
      response: "Thank you, Dr. Smith! Always a pleasure working with your scans.",
      respondedAt: new Date("2024-11-18T10:00:00Z"),
      createdAt: new Date("2024-11-17T09:00:00Z"),
    },
  })

  console.log("✅ Seed complete!")
  console.log(`   Organizations: 5`)
  console.log(`   Users: 5`)
  console.log(`   Products: 5`)
  console.log(`   Orders: 10`)
  console.log(`   Fee Configs: 3`)
  console.log(`   Transactions: 3`)
  console.log(`   Files: 3`)
  console.log(`   Messages: 3`)
  console.log(`   Reviews: 1`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
