import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND } from "../../constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (data: { value: string; type: string }) => void;
};

export function BarcodeScanModal({ visible, onClose, onScan }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setScanned(false);
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission?.granted, permission?.canAskAgain, requestPermission]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Scan code</Text>
          <View style={styles.closeBtn} />
        </View>

        {!permission?.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>
              Camera access is needed to scan QR codes and barcodes from your
              existing membership cards.
            </Text>
            <Pressable style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Allow camera</Text>
            </Pressable>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "code128",
                "code39",
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "pdf417",
                "aztec",
              ],
            }}
            onBarcodeScanned={
              scanned
                ? undefined
                : ({ data, type }) => {
                    setScanned(true);
                    onScan({ value: data, type });
                    onClose();
                  }
            }
          />
        )}

        <View style={[styles.hintBar, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.hint}>
            Point at a QR code or barcode on a loyalty card, gym pass, library
            card, or student ID.
          </Text>
          <Text style={styles.securityNote}>
            Oryx stores the code you provide. It does not clone NFC access cards
            or encrypted credentials.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  camera: {
    flex: 1,
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  permissionBtn: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  hintBar: {
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 8,
  },
  hint: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  securityNote: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
