import type { TemplateDefinition } from "@/lib/templates";

export type CardStatus = "DRAFT" | "PAID";

export type ApplePassMeta = {
  fileUrl?: string;
  version?: number;
  generatedAt?: string;
};

export type CardRecord = {
  id: string;
  ownerId: string;
  slug: string;
  templateId: string;
  status: CardStatus;
  name?: string | null;
  business?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  fieldValues?: Record<string, string> | null;
  logoUrl?: string | null;
  backgroundColor?: string | null;
  purchaseId?: string | null;
  allowSmartExchange?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  passes?: {
    apple?: ApplePassMeta;
  };
  template?: {
    slug: string;
    name: string;
    category: string;
  };
};

export type CardWithTemplate = CardRecord & { template: TemplateDefinition };

export type BusinessCardExchangeRecord = {
  id: string;
  ownerId: string;
  cardId: string;
  cardSlug: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  consentGiven: boolean;
  source: string;
  createdAt: string;
  card?: {
    id: string;
    slug: string;
    name: string | null;
    business: string | null;
  };
};
