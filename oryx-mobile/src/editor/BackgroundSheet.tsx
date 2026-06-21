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
import * as ImagePicker from "../lib/imagePicker";
import type { BackgroundConfig } from "../types/card";
import type { EditorAction } from "../types/editor";
import { BRAND } from "../constants/colors";

type Props = {
  background: BackgroundConfig;
  dispatch: React.Dispatch<EditorAction>;
  onDismiss: () => void;
  maxHeight?: number;
};

const PRESET_COLORS = [
  "#FFFFFF", "#F5F5F4", "#FAFAF9", "#FEF2F2", "#FFF7ED", "#FEFCE8",
  "#F0FDF4", "#ECFEFF", "#EFF6FF", "#F5F3FF", "#FDF2F8",
  "#000000", "#1A1A2E", "#16213E", "#0F3460", "#1E293B",
  "#0C0A09", "#18181B", "#1C1917", "#171717",
  "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#0284C7",
  "#7C3AED", "#DB2777", "#059669",
  "#D4D4D8", "#A1A1AA", "#78716C", "#57534E",
];

export function BackgroundSheet({ background, dispatch, onDismiss, maxHeight }: Props) {
  const insets = useSafeAreaInsets();
  const resolvedHeight = maxHeight || 440;
  const [hexInput, setHexInput] = useState(background.color);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      dispatch({ type: "SET_BG_IMAGE", uri: result.assets[0].uri });
    }
  };

  const applyHex = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      dispatch({ type: "SET_BG_COLOR", color: hexInput });
    }
  };

  return (
    <View style={[styles.panel, { height: resolvedHeight }]}>
      <View style={styles.panelHandle} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(32, insets.bottom + 16) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Background</Text>

        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeBtn,
              background.mode === "color" && styles.modeBtnActive,
            ]}
            onPress={() =>
              dispatch({ type: "SET_BG_COLOR", color: background.color })
            }
          >
            <Text
              style={[
                styles.modeBtnText,
                background.mode === "color" && styles.modeBtnTextActive,
              ]}
            >
              Solid Colour
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeBtn,
              background.mode === "image" && styles.modeBtnActive,
            ]}
            onPress={pickImage}
          >
            <Text
              style={[
                styles.modeBtnText,
                background.mode === "image" && styles.modeBtnTextActive,
              ]}
            >
              Image
            </Text>
          </Pressable>
        </View>

        {background.mode === "color" && (
          <>
            <Text style={styles.sectionLabel}>Colour</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    c === "#FFFFFF" && styles.swatchLight,
                    background.color === c && styles.swatchSelected,
                  ]}
                  onPress={() => dispatch({ type: "SET_BG_COLOR", color: c })}
                />
              ))}
            </View>
            <Text style={styles.sectionLabel}>Hex</Text>
            <View style={styles.hexRow}>
              <TextInput
                style={styles.hexInput}
                value={hexInput}
                onChangeText={setHexInput}
                placeholder="#FFFFFF"
                placeholderTextColor={BRAND.textSecondary}
                autoCapitalize="none"
                maxLength={7}
              />
              <Pressable style={styles.hexApply} onPress={applyHex}>
                <Text style={styles.hexApplyText}>Apply</Text>
              </Pressable>
            </View>
          </>
        )}

        {background.mode === "image" && (
          <>
            <Pressable style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadBtnText}>
                {background.imageUri ? "Change Image" : "Choose Image"}
              </Text>
            </Pressable>

            <Text style={styles.sectionLabel}>Overlay Opacity</Text>
            <View style={styles.overlayRow}>
              {[0, 0.15, 0.3, 0.5, 0.7].map((v) => (
                <Pressable
                  key={v}
                  style={[
                    styles.overlayBtn,
                    background.overlayOpacity === v && styles.overlayBtnActive,
                  ]}
                  onPress={() =>
                    dispatch({ type: "SET_OVERLAY_OPACITY", opacity: v })
                  }
                >
                  <Text
                    style={[
                      styles.overlayBtnText,
                      background.overlayOpacity === v &&
                        styles.overlayBtnTextActive,
                    ]}
                  >
                    {Math.round(v * 100)}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Pressable style={styles.doneBtn} onPress={onDismiss}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: BRAND.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
  },
  modeBtnTextActive: {
    color: "#FFFFFF",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchLight: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  swatchSelected: {
    borderColor: "#2563EB",
    borderWidth: 2.5,
  },
  hexRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
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
  uploadBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
  },
  overlayRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  overlayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  overlayBtnActive: {
    backgroundColor: BRAND.primary,
  },
  overlayBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.text,
  },
  overlayBtnTextActive: {
    color: "#FFFFFF",
  },
  doneBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
