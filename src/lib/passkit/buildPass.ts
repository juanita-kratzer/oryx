/**
 * Build a .pkpass buffer for a card using its template layout.
 * Reads field mapping from template.passLayout to populate the pass.
 */

import { PKPass } from "passkit-generator";
import { getPassKitCertificates, getPassKitIds } from "./signer";
import { normalizePassBackgroundColor } from "./backgroundColor";
import { getCardWalletUrl } from "@/lib/cardLinks";
import type { Card, Template } from "@prisma/client";

type CardWithTemplate = Card & { template: Template };

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Oryx-Cards/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Resolve a field path like "name", "business", or "fieldValues.title"
 * against the card record.
 */
function resolveFieldValue(card: Card, fieldPath: string): string | null {
  if (fieldPath.startsWith("fieldValues.")) {
    const key = fieldPath.slice("fieldValues.".length);
    const fv = card.fieldValues as Record<string, string> | null;
    return fv?.[key] ?? null;
  }
  const val = (card as Record<string, unknown>)[fieldPath];
  return typeof val === "string" ? val : null;
}

type PassFieldDef = { key: string; fieldPath: string; label: string };
type PassLayout = {
  headerFields?: PassFieldDef[];
  primaryFields?: PassFieldDef[];
  secondaryFields?: PassFieldDef[];
  auxiliaryFields?: PassFieldDef[];
  backFields?: PassFieldDef[];
};

function populateFields(
  passFieldArray: PKPass["primaryFields"],
  defs: PassFieldDef[],
  card: Card
) {
  if (!passFieldArray) return;
  for (const def of defs) {
    const value = resolveFieldValue(card, def.fieldPath);
    if (value) {
      passFieldArray.push({ key: def.key, value, label: def.label });
    }
  }
}

export async function buildPass(card: CardWithTemplate): Promise<Buffer> {
  const { template } = card;
  const certs = getPassKitCertificates();
  const ids = getPassKitIds();
  const landingUrl = getCardWalletUrl(card);
  const layout = template.passLayout as PassLayout;

  const buffers: Record<string, Buffer> = {};

  if (card.logoUrl) {
    try {
      const buf = await fetchImageBuffer(card.logoUrl);
      buffers["icon.png"] = buf;
      buffers["logo.png"] = buf;
    } catch (e) {
      console.warn("PassKit: could not fetch logo", e);
    }
  }

  const pass = new PKPass(
    buffers,
    {
      wwdr: certs.wwdr,
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      serialNumber: card.id,
      description: `${card.name || card.business || "Card"}`,
      organizationName: ids.organizationName,
      teamIdentifier: ids.teamIdentifier,
      passTypeIdentifier: ids.passTypeIdentifier,
      logoText: (card.business || card.name || "Card").slice(0, 50),
      backgroundColor: normalizePassBackgroundColor(card.backgroundColor),
    }
  );

  pass.type = template.passType as "generic" | "storeCard" | "eventTicket" | "boardingPass" | "coupon";

  if (layout.headerFields) populateFields(pass.headerFields, layout.headerFields, card);
  if (layout.primaryFields) populateFields(pass.primaryFields, layout.primaryFields, card);
  if (layout.secondaryFields) populateFields(pass.secondaryFields, layout.secondaryFields, card);
  if (layout.auxiliaryFields) populateFields(pass.auxiliaryFields, layout.auxiliaryFields, card);
  if (layout.backFields) populateFields(pass.backFields, layout.backFields, card);

  pass.setBarcodes(landingUrl);

  const nfcPublicKey = process.env.NFC_PUBLIC_KEY;
  if (nfcPublicKey) {
    pass.setNFC({
      message: landingUrl,
      encryptionPublicKey: nfcPublicKey,
    });
  }

  return pass.getAsBuffer();
}
