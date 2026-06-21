import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "../lib/imagePicker";
import type { CardElement } from "../types/card";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../types/card";
import type { EditorAction } from "../types/editor";
import { BRAND } from "../constants/colors";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  dispatch: React.Dispatch<EditorAction>;
  onDismiss: () => void;
};

type ElementPreset = {
  label: string;
  icon: IoniconName;
  create: (imageUri?: string) => CardElement;
  requiresImagePicker?: boolean;
};

const cx = CANVAS_WIDTH / 2;

const PRESETS: ElementPreset[] = [
  {
    label: "Text",
    icon: "text-outline",
    create: () => ({
      id: "",
      type: "text",
      x: cx - 200,
      y: CANVAS_HEIGHT / 2 - 25,
      width: 400,
      height: 50,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      text: {
        content: "",
        placeholder: "Your Text Here",
        fontFamily: "System",
        fontSize: 24,
        fontWeight: "400",
        color: "#000000",
        textAlign: "center",
        letterSpacing: 0,
        maxLines: 0,
        autoScale: false,
        opacity: 1,
      },
    }),
  },
  {
    label: "Image",
    icon: "image-outline",
    requiresImagePicker: true,
    create: (imageUri?: string) => ({
      id: "",
      type: "image",
      x: cx - 150,
      y: CANVAS_HEIGHT / 2 - 100,
      width: 300,
      height: 200,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      image: {
        uri: imageUri || null,
        placeholderText: "YOUR\nIMAGE\nHERE",
        borderRadius: 12,
        objectFit: "cover",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderStyle: "solid",
      },
    }),
  },
  {
    label: "QR Code",
    icon: "qr-code-outline",
    create: () => ({
      id: "",
      type: "qr",
      x: cx - 80,
      y: CANVAS_HEIGHT / 2 - 80,
      width: 160,
      height: 160,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      qr: {
        value: "https://oryx.app",
        size: 160,
        color: "#000000",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E5E5",
      },
    }),
  },
  {
    label: "NFC",
    icon: "hardware-chip-outline",
    create: () => ({
      id: "",
      type: "nfc",
      x: cx - 100,
      y: CANVAS_HEIGHT / 2 - 50,
      width: 200,
      height: 100,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      nfc: {
        label: "NFC",
        value: "",
        style: "dashed",
        iconColor: "#000000",
        textColor: "#CFCFCF",
        borderColor: "#D9D9D9",
      },
    }),
  },
  {
    label: "Divider",
    icon: "remove-outline",
    create: () => ({
      id: "",
      type: "divider",
      x: 60,
      y: CANVAS_HEIGHT / 2,
      width: CANVAS_WIDTH - 120,
      height: 1,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      shape: {
        shapeType: "line",
        fill: "",
        stroke: "#D9D9D9",
        strokeWidth: 1,
        strokeDasharray: "",
        borderRadius: 0,
      },
    }),
  },
  {
    label: "Shape",
    icon: "square-outline",
    create: () => ({
      id: "",
      type: "shape",
      x: cx - 60,
      y: CANVAS_HEIGHT / 2 - 60,
      width: 120,
      height: 120,
      zIndex: 100,
      locked: false,
      visible: true,
      rotation: 0,
      shape: {
        shapeType: "rect",
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 1.5,
        strokeDasharray: "",
        borderRadius: 8,
      },
    }),
  },
];

async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 2],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

export function AddElementPanel({ dispatch, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  const handlePresetPress = async (preset: ElementPreset) => {
    if (preset.requiresImagePicker) {
      const uri = await pickImage();
      if (!uri) return;
      dispatch({ type: "ADD_ELEMENT", element: preset.create(uri) });
    } else {
      dispatch({ type: "ADD_ELEMENT", element: preset.create() });
    }
    onDismiss();
  };

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
      <View style={styles.panelHandle} />
      <Text style={styles.title}>Add Element</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetRow}
      >
        {PRESETS.map((p) => (
          <Pressable
            key={p.label}
            style={({ pressed }) => [
              styles.presetCard,
              pressed && styles.presetCardPressed,
            ]}
            onPress={() => handlePresetPress(p)}
          >
            <Ionicons name={p.icon} size={24} color={BRAND.text} style={styles.presetIcon} />
            <Text style={styles.presetLabel}>{p.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  presetRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  presetCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  presetCardPressed: {
    backgroundColor: "#E5E7EB",
  },
  presetIcon: {
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND.text,
  },
});
