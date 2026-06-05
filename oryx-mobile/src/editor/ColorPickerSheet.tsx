import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND } from "../constants/colors";

type Props = {
  title: string;
  currentColor: string;
  onSelect: (color: string) => void;
  onDismiss: () => void;
  maxHeight?: number;
};

const RAINBOW_PALETTE = [
  // Row 1: grayscale
  "#FFFFFF", "#F5F5F5", "#E5E5E5", "#D4D4D4", "#A3A3A3",
  "#737373", "#525252", "#404040", "#262626", "#000000",
  // Row 2: warm
  "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171",
  "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
  // Row 3: orange/amber
  "#FFF7ED", "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C",
  "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12",
  // Row 4: yellow
  "#FEFCE8", "#FEF9C3", "#FEF08A", "#FDE047", "#FACC15",
  "#EAB308", "#CA8A04", "#A16207", "#854D0E", "#713F12",
  // Row 5: green
  "#F0FDF4", "#DCFCE7", "#BBF7D0", "#86EFAC", "#4ADE80",
  "#22C55E", "#16A34A", "#15803D", "#166534", "#14532D",
  // Row 6: blue
  "#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA",
  "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A",
  // Row 7: purple
  "#F5F3FF", "#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA",
  "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95",
  // Row 8: pink
  "#FDF2F8", "#FCE7F3", "#FBCFE8", "#F9A8D4", "#F472B6",
  "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843",
];

export function ColorPickerSheet({
  title,
  currentColor,
  onSelect,
  onDismiss,
  maxHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const resolvedHeight = maxHeight || 400;
  const [hexInput, setHexInput] = useState(currentColor);

  const applyHex = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      onSelect(hexInput);
    }
  };

  return (
    <View style={[styles.panel, { height: resolvedHeight }]}>
      <View style={styles.panelHandle} />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onDismiss}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(32, insets.bottom + 16) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.preview}>
          <View
            style={[styles.previewSwatch, { backgroundColor: currentColor }]}
          />
          <Text style={styles.previewHex}>{currentColor}</Text>
        </View>

        <View style={styles.colorGrid}>
          {RAINBOW_PALETTE.map((c, i) => (
            <Pressable
              key={`${c}-${i}`}
              style={[
                styles.swatch,
                { backgroundColor: c },
                c === "#FFFFFF" && styles.swatchLight,
                currentColor === c && styles.swatchSelected,
              ]}
              onPress={() => {
                onSelect(c);
                setHexInput(c);
              }}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Hex Value</Text>
        <View style={styles.hexRow}>
          <TextInput
            style={styles.hexInput}
            value={hexInput}
            onChangeText={setHexInput}
            placeholder="#000000"
            placeholderTextColor={BRAND.textSecondary}
            autoCapitalize="none"
            maxLength={7}
          />
          <Pressable style={styles.hexApply} onPress={applyHex}>
            <Text style={styles.hexApplyText}>Apply</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND.text,
  },
  doneText: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND.accent,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  previewSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewHex: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 16,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  swatchLight: {
    borderColor: "#E5E7EB",
  },
  swatchSelected: {
    borderColor: "#2563EB",
    borderWidth: 2.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  hexRow: {
    flexDirection: "row",
    gap: 8,
  },
  hexInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    color: BRAND.text,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  hexApply: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BRAND.primary,
    justifyContent: "center",
  },
  hexApplyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
