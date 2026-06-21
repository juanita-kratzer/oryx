import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BRAND } from "../constants/colors";

export function WebUnsupportedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oryx is an iOS app</Text>
      <Text style={styles.message}>
        You opened the dev server in a browser. That will not work — this app
        uses native iOS modules (camera, Firebase, etc.).
      </Text>
      <Text style={styles.steps}>
        To test:{"\n"}
        1. Open Terminal in oryx-mobile{"\n"}
        2. Run npm run start:dev{"\n"}
        3. Press i to open the iOS Simulator{"\n"}
        4. Or scan the QR code with your iPhone
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: BRAND.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  steps: {
    fontSize: 14,
    color: BRAND.text,
    lineHeight: 22,
    textAlign: "left",
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 16,
    alignSelf: "stretch",
  },
});
