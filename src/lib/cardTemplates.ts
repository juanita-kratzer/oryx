/** Mobile Firestore template id for QR / barcode membership cards. */
export const QR_BARCODE_CARD_TEMPLATE_ID = "QR_BARCODE_CARD";

export const QR_BARCODE_TEMPLATE_SLUG = "qr-barcode-card";

/** @deprecated use QR_BARCODE_TEMPLATE_SLUG */
export const QR_BARCODE_POSTGRES_SLUG = QR_BARCODE_TEMPLATE_SLUG;

export const MOBILE_TEMPLATE_SLUG_MAP: Record<string, string> = {
  business: "elegant-business",
  [QR_BARCODE_CARD_TEMPLATE_ID]: QR_BARCODE_TEMPLATE_SLUG,
};

export function isQrBarcodeCardTemplate(
  templateIdOrSlug: string | null | undefined
): boolean {
  if (!templateIdOrSlug) return false;
  return (
    templateIdOrSlug === QR_BARCODE_CARD_TEMPLATE_ID ||
    templateIdOrSlug === QR_BARCODE_TEMPLATE_SLUG
  );
}

export function isPrivateCardTemplate(
  templateIdOrSlug: string | null | undefined
): boolean {
  return isQrBarcodeCardTemplate(templateIdOrSlug);
}
