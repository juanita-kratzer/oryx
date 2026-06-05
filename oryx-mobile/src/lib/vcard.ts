export type VCardContact = {
  fullName: string;
  phone?: string;
  email?: string;
  jobTitle?: string;
  company?: string;
  website?: string;
  dob?: string;
};

export function generateVCard(contact: VCardContact): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(contact.fullName)}`,
  ];

  const nameParts = contact.fullName.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.pop()! : "";
  const firstName = nameParts.join(" ");
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }

  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
  }

  if (contact.jobTitle) {
    lines.push(`TITLE:${escapeVCard(contact.jobTitle)}`);
  }

  if (contact.company) {
    lines.push(`ORG:${escapeVCard(contact.company)}`);
  }

  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }

  if (contact.dob) {
    const cleaned = contact.dob.replace(/[^0-9]/g, "");
    if (cleaned.length === 8) {
      lines.push(`BDAY:${cleaned}`);
    }
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
