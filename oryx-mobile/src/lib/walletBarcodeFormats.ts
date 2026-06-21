export type WalletBarcodeFormat =
  | "PKBarcodeFormatQR"
  | "PKBarcodeFormatPDF417"
  | "PKBarcodeFormatAztec"
  | "PKBarcodeFormatCode128";

export const WALLET_BARCODE_FORMAT_OPTIONS: {
  value: WalletBarcodeFormat;
  label: string;
}[] = [
  { value: "PKBarcodeFormatQR", label: "QR Code" },
  { value: "PKBarcodeFormatCode128", label: "Code 128" },
  { value: "PKBarcodeFormatPDF417", label: "PDF417" },
  { value: "PKBarcodeFormatAztec", label: "Aztec" },
];

export function normalizeWalletBarcodeFormat(
  value: string | null | undefined
): WalletBarcodeFormat {
  const allowed = WALLET_BARCODE_FORMAT_OPTIONS.map((o) => o.value);
  if (value && allowed.includes(value as WalletBarcodeFormat)) {
    return value as WalletBarcodeFormat;
  }
  return "PKBarcodeFormatQR";
}
