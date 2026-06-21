import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "../../constants/colors";
import { CardQrCode } from "../cards/CardQrCode";

export type BusinessCardPreviewData = {
  businessName: string;
  yourName: string;
  jobTitle: string;
  mobile: string;
  email: string;
  website: string;
  logoUri: string | null;
  backgroundColor: string;
};

type Props = {
  data: BusinessCardPreviewData;
  publicUrl?: string;
  showCaption?: boolean;
  caption?: string;
  showFooter?: boolean;
};

function display(value: string, placeholder: string) {
  const trimmed = value.trim();
  return trimmed || placeholder;
}

function isPlaceholder(value: string) {
  return !value.trim();
}

export function AppleWalletPreview({
  data,
  publicUrl,
  showCaption = true,
  caption = "Apple Wallet preview",
  showFooter = true,
}: Props) {
  const headerBg = data.backgroundColor;
  const onHeader = isLightColor(headerBg) ? BRAND.text : "#ffffff";

  const business = display(data.businessName, "Business Name");
  const name = display(data.yourName, "Your Name");
  const title = display(data.jobTitle, "Job Title");
  const mobile = display(data.mobile, "Mobile");
  const email = display(data.email, "Email");
  const website = display(data.website, "Website");

  return (
    <View style={styles.wrapper}>
      {showCaption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={styles.pass}>
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          {data.logoUri ? (
            <Image source={{ uri: data.logoUri }} style={styles.logo} />
          ) : (
            <View style={[styles.logoPlaceholder, { borderColor: `${onHeader}55` }]}>
              <Ionicons name="person" size={20} color={onHeader} />
            </View>
          )}
          <Text
            style={[styles.headerTitle, { color: onHeader }]}
            numberOfLines={1}
          >
            {business}
          </Text>
        </View>

        <View style={styles.body}>
          <Text
            style={[
              styles.primary,
              isPlaceholder(data.yourName) && styles.placeholder,
            ]}
            numberOfLines={2}
          >
            {name}
          </Text>
          <Text
            style={[
              styles.secondary,
              isPlaceholder(data.jobTitle) && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.divider} />

          <PreviewRow
            icon="call-outline"
            value={mobile}
            muted={isPlaceholder(data.mobile)}
          />
          <PreviewRow
            icon="mail-outline"
            value={email}
            muted={isPlaceholder(data.email)}
          />
          <PreviewRow
            icon="globe-outline"
            value={website}
            muted={isPlaceholder(data.website)}
          />
        </View>

        {showFooter ? (
          <View style={styles.footer}>
            {publicUrl ? (
              <CardQrCode url={publicUrl} size={100} />
            ) : (
              <>
                <View style={styles.barcode}>
                  <View style={styles.barcodeLines} />
                </View>
                <Text style={styles.footerHint}>Your card link appears on your pass</Text>
              </>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PreviewRow({
  icon,
  value,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  muted: boolean;
}) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={16}
        color={muted ? BRAND.textSecondary : BRAND.text}
        style={styles.rowIcon}
      />
      <Text
        style={[styles.rowText, muted && styles.placeholder]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function isLightColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: 8,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  pass: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },
  primary: {
    fontSize: 28,
    fontWeight: "700",
    color: BRAND.text,
    letterSpacing: -0.3,
  },
  secondary: {
    fontSize: 17,
    color: BRAND.textSecondary,
    marginTop: 4,
  },
  placeholder: {
    color: "#c4c4c4",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BRAND.border,
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowIcon: {
    width: 22,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: BRAND.text,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 16,
    paddingTop: 4,
  },
  barcode: {
    width: 120,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.35,
  },
  barcodeLines: {
    width: "100%",
    height: 24,
    borderWidth: 1,
    borderColor: BRAND.text,
    borderRadius: 2,
    backgroundColor: "#f3f4f6",
  },
  footerHint: {
    fontSize: 11,
    color: BRAND.textSecondary,
    marginTop: 6,
  },
});
