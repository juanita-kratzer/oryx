import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { BRAND } from "../../constants/colors";

type Props = {
  url: string;
  size?: number;
  label?: string;
};

export function CardQrCode({ url, size = 140, label = "Scan to open card" }: Props) {
  if (!url) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.qrBox}>
        <QRCode value={url} size={size} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  qrBox: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.textSecondary,
  },
});
