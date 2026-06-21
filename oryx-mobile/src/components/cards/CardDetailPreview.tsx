import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { AppleWalletPreview } from "../businessCard/AppleWalletPreview";
import { QrBarcodeCardPreview } from "../qrBarcode/QrBarcodeCardPreview";
import { CardRenderer } from "../../engine/CardRenderer";
import { TEMPLATE_REGISTRY } from "../../templates";
import { QR_BARCODE_CARD_TEMPLATE_ID } from "../../constants/cardTemplates";
import { inferDisplayCodeKind } from "../../lib/barcodeUtils";
import { AMBTN_DEFAULT_THEME_COLOR } from "../../constants/ambtnThemeColors";
import { getCardQrPayload } from "../../lib/cardLinks";
import { BRAND } from "../../constants/colors";
import type { Card } from "../../types";

function isLightColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

type Props = {
  card: Card;
};

export function CardDetailPreview({ card }: Props) {
  const { width } = useWindowDimensions();
  const previewWidth = Math.min(width - 40, 360);

  if (card.templateId === "business") {
    const publicUrl = card.qrUrl ?? getCardQrPayload(card.slug);

    return (
      <AppleWalletPreview
        caption="Your card"
        publicUrl={publicUrl}
        data={{
          businessName: card.business ?? "",
          yourName: card.name ?? "",
          jobTitle: card.fieldValues?.jobTitle ?? "",
          mobile: card.phone ?? "",
          email: card.email ?? "",
          website: card.website ?? "",
          logoUri: card.logoUrl,
          backgroundColor: card.backgroundColor ?? AMBTN_DEFAULT_THEME_COLOR,
        }}
      />
    );
  }

  if (card.templateId === QR_BARCODE_CARD_TEMPLATE_ID) {
    const barcodeValue = card.fieldValues?.barcodeValue ?? "";
    const displayKind =
      (card.fieldValues?.displayKind as "qr" | "barcode") ||
      inferDisplayCodeKind(barcodeValue);

    return (
      <QrBarcodeCardPreview
        data={{
          cardName: card.name ?? "",
          organisation: card.business ?? "",
          membershipNumber: card.fieldValues?.membershipNumber ?? "",
          barcodeValue,
          expiryDate: card.fieldValues?.expiryDate ?? "",
          notes: card.fieldValues?.notes ?? "",
          logoUri: card.logoUrl,
          backgroundColor: card.backgroundColor ?? AMBTN_DEFAULT_THEME_COLOR,
          displayKind,
          scannedType: card.fieldValues?.scannedType ?? null,
        }}
      />
    );
  }

  const template = TEMPLATE_REGISTRY.find((t) => t.id === card.templateId);
  if (template) {
    return (
      <View style={styles.templatePreview}>
        <Text style={styles.caption}>Your card</Text>
        <CardRenderer document={template.factory()} width={previewWidth} />
      </View>
    );
  }

  const bg = card.backgroundColor || "#1a1a2e";
  const onBg = isLightColor(bg) ? BRAND.text : "#fff";
  const onBgMuted = isLightColor(bg) ? BRAND.textSecondary : "rgba(255,255,255,0.75)";

  return (
    <View style={styles.fallback}>
      <Text style={styles.caption}>Your card</Text>
      <View style={[styles.fallbackCard, { backgroundColor: bg }]}>
        <Text style={[styles.fallbackName, { color: onBg }]}>
          {card.name || card.business || "Your Card"}
        </Text>
        {card.business && card.name ? (
          <Text style={[styles.fallbackMeta, { color: onBgMuted }]}>{card.business}</Text>
        ) : null}
        <Text style={[styles.fallbackMeta, { color: onBgMuted }]}>{card.template.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  templatePreview: {
    alignItems: "center",
    marginBottom: 8,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  fallback: {
    marginBottom: 16,
  },
  fallbackCard: {
    borderRadius: 16,
    padding: 28,
    minHeight: 120,
    justifyContent: "flex-end",
  },
  fallbackName: {
    fontSize: 24,
    fontWeight: "700",
  },
  fallbackMeta: {
    fontSize: 15,
    marginTop: 4,
  },
});
