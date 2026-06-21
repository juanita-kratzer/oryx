import type { WalletBarcodeFormat } from "./walletBarcodeFormats";

export type DisplayCodeKind = "qr" | "barcode";

/** Infer on-screen code style from payload. */
export function inferDisplayCodeKind(value: string): DisplayCodeKind {
  const trimmed = value.trim();
  if (!trimmed) return "barcode";
  if (/^https?:\/\//i.test(trimmed)) return "qr";
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return "qr";
  } catch {
    // not a URL
  }
  return "barcode";
}

/** Map expo-camera / scanner type strings to JsBarcode format names. */
export function mapScannerTypeToJsBarcodeFormat(scannerType: string): string {
  const t = scannerType.toLowerCase();
  if (t.includes("ean13")) return "EAN13";
  if (t.includes("ean8")) return "EAN8";
  if (t.includes("upc")) return "UPC";
  if (t.includes("code39")) return "CODE39";
  if (t.includes("code128")) return "CODE128";
  if (t.includes("qr")) return "QR";
  return "CODE128";
}

export function mapScannerTypeToWalletFormat(scannerType: string): WalletBarcodeFormat {
  const t = scannerType.toLowerCase();
  if (t.includes("qr")) return "PKBarcodeFormatQR";
  if (t.includes("pdf417")) return "PKBarcodeFormatPDF417";
  if (t.includes("aztec")) return "PKBarcodeFormatAztec";
  return "PKBarcodeFormatCode128";
}

export function mapScannerTypeToDisplayKind(scannerType: string): DisplayCodeKind {
  const t = scannerType.toLowerCase();
  if (t.includes("qr")) return "qr";
  return "barcode";
}
