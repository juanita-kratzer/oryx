import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BusinessCardCreateScreen } from "../screens/BusinessCardCreateScreen";
import { QrBarcodeCardCreateScreen } from "../screens/QrBarcodeCardCreateScreen";
import { QR_BARCODE_CARD_TEMPLATE_ID } from "../constants/cardTemplates";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

function UnsupportedCardEditor({ navigation }: Props) {
  return (
    <View style={styles.unsupported}>
      <Text style={styles.title}>This card type can't be edited here</Text>
      <Text style={styles.body}>
        Only Business Cards and QR / Barcode Cards can be created and edited in the
        app right now.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go back</Text>
      </Pressable>
    </View>
  );
}

export function CardEditorRouter(props: Props) {
  const { templateId } = props.route.params;

  if (templateId === "business") {
    return <BusinessCardCreateScreen {...props} />;
  }

  if (templateId === QR_BARCODE_CARD_TEMPLATE_ID) {
    return <QrBarcodeCardCreateScreen {...props} />;
  }

  return <UnsupportedCardEditor {...props} />;
}

const styles = StyleSheet.create({
  unsupported: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    backgroundColor: BRAND.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND.text,
    textAlign: "center",
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: {
    color: BRAND.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
