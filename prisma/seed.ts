import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    slug: "elegant-business",
    name: "Elegant Business",
    description: "Clean, professional business card with soft gradient background",
    category: "BUSINESS" as const,
    passType: "generic",
    defaultBgColor: "#f5ebe0",
    editableFields: [
      { key: "name", label: "Your Name", placeholder: "Emma Watson", required: true, maxLength: 40 },
      { key: "title", label: "Title / Role", placeholder: "Entrepreneur", maxLength: 30 },
      { key: "business", label: "Business Name", placeholder: "Your Company", maxLength: 50 },
      { key: "phone", label: "Phone", placeholder: "+1 234 567 8900", maxLength: 20 },
      { key: "email", label: "Email", placeholder: "you@example.com", maxLength: 60 },
      { key: "website", label: "Website", placeholder: "https://example.com", maxLength: 80 },
    ],
    passLayout: {
      headerFields: [
        { key: "title", fieldPath: "fieldValues.title", label: "" },
      ],
      primaryFields: [
        { key: "name", fieldPath: "name", label: "Name" },
      ],
      secondaryFields: [
        { key: "business", fieldPath: "business", label: "" },
      ],
      auxiliaryFields: [
        { key: "phone", fieldPath: "phone", label: "Phone" },
        { key: "email", fieldPath: "email", label: "Email" },
      ],
      backFields: [
        { key: "website", fieldPath: "website", label: "Website" },
      ],
    },
    colorOptions: [
      { label: "Sand", value: "#f5ebe0" },
      { label: "Slate", value: "#2d3436" },
      { label: "Navy", value: "#1a1a2e" },
      { label: "Forest", value: "#2d6a4f" },
      { label: "White", value: "#ffffff" },
    ],
    sortOrder: 1,
  },
  {
    slug: "membership",
    name: "Membership Card",
    description: "Dark, premium-feeling membership or loyalty card",
    category: "MEMBERSHIP" as const,
    passType: "generic",
    defaultBgColor: "#1a1a1a",
    editableFields: [
      { key: "business", label: "Organisation / Club", placeholder: "FITCLUB", required: true, maxLength: 50 },
      { key: "name", label: "Member Name", placeholder: "Nathan Parker", required: true, maxLength: 40 },
      { key: "membershipTier", label: "Membership Tier", placeholder: "Premium Member", maxLength: 30 },
      { key: "memberSince", label: "Member Since", placeholder: "Jan 2023", maxLength: 20 },
      { key: "expiryDate", label: "Expiry Date", placeholder: "31 Dec 2024", maxLength: 20 },
    ],
    passLayout: {
      headerFields: [
        { key: "tier", fieldPath: "fieldValues.membershipTier", label: "" },
      ],
      primaryFields: [
        { key: "name", fieldPath: "name", label: "" },
      ],
      secondaryFields: [
        { key: "expires", fieldPath: "fieldValues.expiryDate", label: "Expires" },
        { key: "since", fieldPath: "fieldValues.memberSince", label: "Member Since" },
      ],
      auxiliaryFields: [],
      backFields: [
        { key: "org", fieldPath: "business", label: "Organisation" },
      ],
    },
    colorOptions: [
      { label: "Black", value: "#1a1a1a" },
      { label: "Dark Navy", value: "#0d1b2a" },
      { label: "Charcoal", value: "#2b2d42" },
      { label: "Deep Purple", value: "#240046" },
      { label: "Dark Green", value: "#1b4332" },
    ],
    sortOrder: 2,
  },
  {
    slug: "gift-card",
    name: "Gift Card",
    description: "Vibrant gift card with balance display and barcode",
    category: "GIFT" as const,
    passType: "storeCard",
    defaultBgColor: "#c850c0",
    editableFields: [
      { key: "business", label: "Brand / Business", placeholder: "PerfumeCo", required: true, maxLength: 50 },
      { key: "balance", label: "Balance / Value", placeholder: "$50", required: true, maxLength: 15 },
      { key: "recipientName", label: "Gift For (Recipient)", placeholder: "Sarah Miller", maxLength: 40 },
      { key: "cardNumber", label: "Card Number", placeholder: "1234 5678 9012", maxLength: 20 },
    ],
    passLayout: {
      headerFields: [],
      primaryFields: [
        { key: "balance", fieldPath: "fieldValues.balance", label: "Balance" },
      ],
      secondaryFields: [
        { key: "recipient", fieldPath: "fieldValues.recipientName", label: "Gift for" },
      ],
      auxiliaryFields: [
        { key: "cardNum", fieldPath: "fieldValues.cardNumber", label: "Card #" },
      ],
      backFields: [
        { key: "brand", fieldPath: "business", label: "Brand" },
      ],
    },
    colorOptions: [
      { label: "Pink Gradient", value: "#c850c0" },
      { label: "Gold", value: "#b8860b" },
      { label: "Royal Blue", value: "#1e3a8a" },
      { label: "Emerald", value: "#047857" },
      { label: "Red", value: "#b91c1c" },
    ],
    sortOrder: 3,
  },
  {
    slug: "digital-contact",
    name: "Digital Contact",
    description: "Clean, modern contact card — your details at a tap",
    category: "CONTACT" as const,
    passType: "generic",
    defaultBgColor: "#ffffff",
    editableFields: [
      { key: "name", label: "Your Name", placeholder: "Alex Johnson", required: true, maxLength: 40 },
      { key: "phone", label: "Phone", placeholder: "+1 (123) 456-7890", maxLength: 20 },
      { key: "email", label: "Email", placeholder: "alex@email.com", maxLength: 60 },
      { key: "socialHandle", label: "Social / Handle", placeholder: "@alexhandle", maxLength: 30 },
      { key: "website", label: "Website", placeholder: "https://example.com", maxLength: 80 },
    ],
    passLayout: {
      headerFields: [],
      primaryFields: [
        { key: "name", fieldPath: "name", label: "" },
      ],
      secondaryFields: [
        { key: "phone", fieldPath: "phone", label: "Phone" },
        { key: "email", fieldPath: "email", label: "Email" },
      ],
      auxiliaryFields: [
        { key: "social", fieldPath: "fieldValues.socialHandle", label: "Social" },
      ],
      backFields: [
        { key: "website", fieldPath: "website", label: "Website" },
      ],
    },
    colorOptions: [
      { label: "White", value: "#ffffff" },
      { label: "Light Grey", value: "#f3f4f6" },
      { label: "Mint", value: "#d1fae5" },
      { label: "Sky", value: "#dbeafe" },
      { label: "Black", value: "#111827" },
    ],
    sortOrder: 4,
  },
  {
    slug: "booking",
    name: "Booking Card",
    description: "Event or venue booking confirmation card",
    category: "BOOKING" as const,
    passType: "eventTicket",
    defaultBgColor: "#1e3a5f",
    editableFields: [
      { key: "business", label: "Venue / Event Name", placeholder: "Beach Resort Booking", required: true, maxLength: 50 },
      { key: "name", label: "Guest Name", placeholder: "Your Name", maxLength: 40 },
      { key: "checkInDate", label: "Check-In / Event Date", placeholder: "Wednesday, June 5", required: true, maxLength: 30 },
      { key: "confirmationCode", label: "Confirmation Code", placeholder: "ABC-12345", maxLength: 20 },
    ],
    passLayout: {
      headerFields: [],
      primaryFields: [
        { key: "event", fieldPath: "business", label: "" },
      ],
      secondaryFields: [
        { key: "checkin", fieldPath: "fieldValues.checkInDate", label: "Check-In" },
      ],
      auxiliaryFields: [
        { key: "guest", fieldPath: "name", label: "Guest" },
        { key: "confirm", fieldPath: "fieldValues.confirmationCode", label: "Confirmation" },
      ],
      backFields: [],
    },
    colorOptions: [
      { label: "Ocean", value: "#1e3a5f" },
      { label: "Sunset", value: "#9a3412" },
      { label: "Tropical", value: "#065f46" },
      { label: "Midnight", value: "#1e1b4b" },
      { label: "Sand", value: "#d4a373" },
    ],
    sortOrder: 5,
  },
];

async function main() {
  console.log("Seeding templates...");

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        passType: t.passType,
        defaultBgColor: t.defaultBgColor,
        editableFields: t.editableFields,
        passLayout: t.passLayout,
        colorOptions: t.colorOptions,
        sortOrder: t.sortOrder,
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        category: t.category,
        passType: t.passType,
        defaultBgColor: t.defaultBgColor,
        editableFields: t.editableFields,
        passLayout: t.passLayout,
        colorOptions: t.colorOptions,
        sortOrder: t.sortOrder,
      },
    });
    console.log(`  ✓ ${t.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
