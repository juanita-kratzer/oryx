import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { BarcodeSvg } from "./BarcodeSvg";
import type { DisplayCodeKind } from "../../lib/barcodeUtils";
import { mapScannerTypeToJsBarcodeFormat } from "../../lib/barcodeUtils";

type Props = {
  value: string;
  displayKind: DisplayCodeKind;
  scannedType?: string | null;
  width?: number;
};

export function ScannableCodeDisplay({
  value,
  displayKind,
  scannedType,
  width = 280,
}: Props) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (displayKind === "qr") {
    return (
      <View style={styles.qrWrap}>
        <QRCode value={trimmed} size={Math.min(width, 220)} />
      </View>
    );
  }

  const format = scannedType
    ? mapScannerTypeToJsBarcodeFormat(scannedType)
    : "CODE128";

  return (
    <BarcodeSvg
      value={trimmed}
      format={format === "QR" ? "CODE128" : format}
      width={width}
      height={110}
    />
  );
}

const styles = StyleSheet.create({
  qrWrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});
