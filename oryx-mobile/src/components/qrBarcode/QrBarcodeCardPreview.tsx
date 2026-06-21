import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { ScannableCodeDisplay } from "./ScannableCodeDisplay";
import { BRAND } from "../../constants/colors";
import { AMBTN_DEFAULT_THEME_COLOR } from "../../constants/ambtnThemeColors";
import type { DisplayCodeKind } from "../../lib/barcodeUtils";

export type QrBarcodePreviewData = {
  cardName: string;
  organisation: string;
  membershipNumber: string;
  barcodeValue: string;
  expiryDate: string;
  notes: string;
  logoUri: string | null;
  backgroundColor: string;
  displayKind: DisplayCodeKind;
  scannedType?: string | null;
};

type Props = {
  data: QrBarcodePreviewData;
  caption?: string;
};

function isLightColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return true;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

export function QrBarcodeCardPreview({ data, caption = "Your card" }: Props) {
  const bg = data.backgroundColor || AMBTN_DEFAULT_THEME_COLOR;
  const onBg = isLightColor(bg) ? BRAND.text : "#ffffff";
  const onBgMuted = isLightColor(bg) ? BRAND.textSecondary : "rgba(255,255,255,0.78)";

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{caption}</Text>
      <View style={[styles.card, { backgroundColor: bg }]}>
        <View style={styles.header}>
          {data.logoUri ? (
            <Image source={{ uri: data.logoUri }} style={styles.logo} />
          ) : (
            <View style={[styles.logoPlaceholder, { borderColor: `${onBg}44` }]}>
              <Text style={{ color: onBgMuted, fontSize: 12 }}>Logo</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={[styles.cardName, { color: onBg }]} numberOfLines={2}>
              {data.cardName || "Card name"}
            </Text>
            {data.organisation ? (
              <Text style={[styles.org, { color: onBgMuted }]} numberOfLines={1}>
                {data.organisation}
              </Text>
            ) : null}
          </View>
        </View>

        {data.membershipNumber ? (
          <Text style={[styles.memberNo, { color: onBgMuted }]}>
            Member #{data.membershipNumber}
          </Text>
        ) : null}

        {data.expiryDate ? (
          <Text style={[styles.expiry, { color: onBgMuted }]}>
            Expires {data.expiryDate}
          </Text>
        ) : null}

        <View style={styles.codeArea}>
          {data.barcodeValue.trim() ? (
            <ScannableCodeDisplay
              value={data.barcodeValue}
              displayKind={data.displayKind}
              scannedType={data.scannedType}
            />
          ) : (
            <View style={styles.codePlaceholder}>
              <Text style={styles.codePlaceholderText}>Add or scan a code</Text>
            </View>
          )}
        </View>

        {data.notes ? (
          <Text style={[styles.notes, { color: onBgMuted }]} numberOfLines={3}>
            {data.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  headerText: {
    flex: 1,
  },
  cardName: {
    fontSize: 22,
    fontWeight: "800",
  },
  org: {
    fontSize: 15,
    marginTop: 2,
  },
  memberNo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  expiry: {
    fontSize: 13,
    marginBottom: 12,
  },
  codeArea: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  codePlaceholder: {
    width: "100%",
    minHeight: 120,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  codePlaceholderText: {
    color: BRAND.textSecondary,
    fontSize: 14,
  },
  notes: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
});
