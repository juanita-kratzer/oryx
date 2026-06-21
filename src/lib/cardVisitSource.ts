export const CARD_VISIT_SOURCES = ["nfc", "qr", "wallet", "direct"] as const;

export type CardVisitSource = (typeof CARD_VISIT_SOURCES)[number];

export const EXCHANGE_SOURCES = CARD_VISIT_SOURCES;

export type ExchangeSource = CardVisitSource;

export function parseVisitSource(value: string | undefined | null): CardVisitSource {
  if (value === "nfc" || value === "qr" || value === "wallet") return value;
  return "direct";
}

export function parseExchangeSource(value: string | undefined | null): ExchangeSource {
  return parseVisitSource(value);
}

export function ownerFirstName(name: string | null, business: string | null): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const first = trimmed.split(/\s+/)[0];
    return first || trimmed;
  }
  if (business?.trim()) return business.trim();
  return "the card owner";
}
