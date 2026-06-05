/**
 * Build a vCard 3.0 string from card fields.
 * Escapes special characters (\, ;, ,, newline) per RFC 2426.
 */

type CardFields = {
  name: string | null;
  business: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

function escapeVcardValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildVcard(card: CardFields): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  const name = (card.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/);
    const given = parts[0] ?? "";
    const family = parts.slice(1).join(" ") || "";
    lines.push(`FN:${escapeVcardValue(name)}`);
    lines.push(`N:${escapeVcardValue(family)};${escapeVcardValue(given)};;;`);
  }

  if ((card.phone || "").trim()) {
    lines.push(`TEL;TYPE=CELL:${(card.phone || "").trim()}`);
  }
  if ((card.email || "").trim()) {
    lines.push(`EMAIL:${(card.email || "").trim()}`);
  }
  if ((card.website || "").trim()) {
    lines.push(`URL:${(card.website || "").trim()}`);
  }
  if ((card.business || "").trim()) {
    lines.push(`ORG:${escapeVcardValue((card.business || "").trim())}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}
