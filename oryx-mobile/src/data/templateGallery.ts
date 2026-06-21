import { QR_BARCODE_CARD_TEMPLATE_ID } from "../constants/cardTemplates";

export type GalleryTemplate = {
  id: string;
  name: string;
  description: string;
};

export type GallerySection = {
  title: string;
  subtitle?: string;
  templates: GalleryTemplate[];
};

export const TEMPLATE_GALLERY_SECTIONS: GallerySection[] = [
  {
    title: "Business",
    templates: [
      {
        id: "business",
        name: "Business Card",
        description:
          "Minimal Apple-style business card with logo, name, and contact details",
      },
    ],
  },
  {
    title: "Memberships & Rewards",
    subtitle:
      "Gym Membership · Flybuys · Woolworths Everyday Rewards · Library Card · Student ID · Airline Loyalty Program",
    templates: [
      {
        id: QR_BARCODE_CARD_TEMPLATE_ID,
        name: "QR / Barcode Card",
        description:
          "Store loyalty cards, gym memberships, rewards cards, student cards, library cards, and other scannable memberships.",
      },
    ],
  },
];

export const ALL_GALLERY_TEMPLATES: GalleryTemplate[] =
  TEMPLATE_GALLERY_SECTIONS.flatMap((section) => section.templates);
