export const QR_BARCODE_CARD_TEMPLATE_ID = "QR_BARCODE_CARD";

export const QR_BARCODE_POSTGRES_SLUG = "qr-barcode-card";

export function isQrBarcodeCardTemplate(templateId: string | null | undefined): boolean {
  if (!templateId) return false;
  return (
    templateId === QR_BARCODE_CARD_TEMPLATE_ID ||
    templateId === QR_BARCODE_POSTGRES_SLUG
  );
}

export function isPrivateCardTemplate(templateId: string | null | undefined): boolean {
  return isQrBarcodeCardTemplate(templateId);
}
