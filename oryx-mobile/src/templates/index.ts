import type { CardDocument } from "../types/card";
import { createBusinessCard } from "./businessCard";
import { createEventTicket } from "./eventTicket";
import { createCoupon } from "./coupon";
import { createGiftCard } from "./giftCard";
import { createLoyaltyCard } from "./loyaltyCard";
import { createGenericCard } from "./genericCard";

export type TemplateInfo = {
  id: string;
  name: string;
  description: string;
  factory: () => CardDocument;
};

export const TEMPLATE_REGISTRY: TemplateInfo[] = [
  {
    id: "business",
    name: "Business Card",
    description: "Minimal Apple-style business card with logo, name, and contact details",
    factory: createBusinessCard,
  },
  {
    id: "eventTicket",
    name: "Event Ticket",
    description: "Polished event ticket with venue details, seating info, and QR code",
    factory: createEventTicket,
  },
  {
    id: "coupon",
    name: "Coupon",
    description: "Clean discount coupon with hero value and NFC redemption",
    factory: createCoupon,
  },
  {
    id: "giftCard",
    name: "Gift Card",
    description: "Elegant gift card with balance display and QR code",
    factory: createGiftCard,
  },
  {
    id: "loyaltyCard",
    name: "Loyalty Card",
    description: "Stamp-based loyalty card with progress tracking and rewards",
    factory: createLoyaltyCard,
  },
  {
    id: "generic",
    name: "Generic Card",
    description: "Versatile card with image, QR code, and NFC support",
    factory: createGenericCard,
  },
];

export function getTemplateFactory(templateId: string): (() => CardDocument) | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === templateId)?.factory;
}
