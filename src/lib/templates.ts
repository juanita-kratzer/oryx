import {
  MOBILE_TEMPLATE_SLUG_MAP,
  QR_BARCODE_TEMPLATE_SLUG,
} from "@/lib/cardTemplates";

export type TemplateCategory =
  | "BUSINESS"
  | "MEMBERSHIP"
  | "GIFT"
  | "CONTACT"
  | "BOOKING";

export type TemplateDefinition = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  passType: string;
  defaultBgColor: string;
  editableFields: unknown;
  passLayout: unknown;
  colorOptions?: unknown;
  sortOrder: number;
  active: boolean;
  premium: boolean;
  thumbnailUrl?: string | null;
  previewImageUrl?: string | null;
};

const RAW_TEMPLATES: Omit<TemplateDefinition, "id" | "active" | "premium">[] = [
  {
    slug: "elegant-business",
    name: "Elegant Business",
    description: "Clean, professional business card with soft gradient background",
    category: "BUSINESS",
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
      headerFields: [{ key: "title", fieldPath: "fieldValues.title", label: "" }],
      primaryFields: [{ key: "name", fieldPath: "name", label: "Name" }],
      secondaryFields: [{ key: "business", fieldPath: "business", label: "" }],
      auxiliaryFields: [
        { key: "phone", fieldPath: "phone", label: "Phone" },
        { key: "email", fieldPath: "email", label: "Email" },
      ],
      backFields: [{ key: "website", fieldPath: "website", label: "Website" }],
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
    slug: QR_BARCODE_TEMPLATE_SLUG,
    name: "QR / Barcode Card",
    description:
      "Store loyalty cards, gym memberships, rewards cards, student cards, library cards, and other scannable memberships.",
    category: "MEMBERSHIP",
    passType: "storeCard",
    defaultBgColor: "#ffffff",
    editableFields: [
      { key: "name", label: "Card Name", placeholder: "Gym Membership", required: true, maxLength: 60 },
      { key: "barcodeValue", label: "Barcode or QR Value", placeholder: "Scan or paste code", required: true, maxLength: 500 },
      { key: "business", label: "Organisation Name", placeholder: "FitClub", maxLength: 50 },
      { key: "membershipNumber", label: "Membership Number", placeholder: "1234567890", maxLength: 40 },
      { key: "expiryDate", label: "Expiry Date", placeholder: "31 Dec 2026", maxLength: 30 },
      { key: "notes", label: "Notes", placeholder: "Optional notes", maxLength: 200 },
    ],
    passLayout: {
      headerFields: [{ key: "org", fieldPath: "business", label: "" }],
      primaryFields: [{ key: "cardName", fieldPath: "name", label: "" }],
      secondaryFields: [
        { key: "memberNo", fieldPath: "fieldValues.membershipNumber", label: "Member #" },
        { key: "expires", fieldPath: "fieldValues.expiryDate", label: "Expires" },
      ],
      auxiliaryFields: [],
      backFields: [{ key: "notes", fieldPath: "fieldValues.notes", label: "Notes" }],
    },
    colorOptions: [
      { label: "White", value: "#ffffff" },
      { label: "Sand", value: "#f5ebe0" },
      { label: "Slate", value: "#1e293b" },
      { label: "Forest", value: "#14532d" },
      { label: "Onyx", value: "#111827" },
    ],
    sortOrder: 8,
  },
];

export const TEMPLATES: TemplateDefinition[] = RAW_TEMPLATES.map((t) => ({
  ...t,
  id: t.slug,
  active: true,
  premium: false,
}));

export function listActiveTemplates(): TemplateDefinition[] {
  return TEMPLATES.filter((t) => t.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getTemplateBySlug(slug: string): TemplateDefinition | null {
  return TEMPLATES.find((t) => t.slug === slug && t.active) ?? null;
}

export function getTemplateById(id: string): TemplateDefinition | null {
  return getTemplateBySlug(id) ?? TEMPLATES.find((t) => t.id === id && t.active) ?? null;
}

export function resolveTemplateForMobile(mobileTemplateId?: string): TemplateDefinition | null {
  const slug = mobileTemplateId ? MOBILE_TEMPLATE_SLUG_MAP[mobileTemplateId] : undefined;
  if (slug) {
    const bySlug = getTemplateBySlug(slug);
    if (bySlug) return bySlug;
  }
  if (mobileTemplateId === "business" || !mobileTemplateId) {
    return getTemplateBySlug("elegant-business");
  }
  return listActiveTemplates()[0] ?? null;
}
