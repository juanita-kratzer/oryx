import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SectionList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FONT_REGISTRY,
  FONT_CATEGORIES,
  getFontsByCategory,
  isFontLoaded,
} from "../fonts";
import type { FontCategory, FontEntry } from "../fonts";
import { BRAND } from "../constants/colors";

type Props = {
  currentFont: string;
  onSelect: (fontName: string) => void;
  onDismiss: () => void;
  maxHeight?: number;
};

export function FontPickerSheet({ currentFont, onSelect, onDismiss, maxHeight }: Props) {
  const insets = useSafeAreaInsets();
  const resolvedHeight = maxHeight || 400;

  const sections = FONT_CATEGORIES.map((cat) => ({
    title: cat,
    data: getFontsByCategory(cat),
  })).filter((s) => s.data.length > 0);

  return (
    <View style={[styles.panel, { height: resolvedHeight }]}>
      <View style={styles.panelHandle} />
      <View style={styles.header}>
        <Text style={styles.title}>Choose Font</Text>
        <Pressable onPress={onDismiss}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.name}
        style={styles.list}
        contentContainerStyle={{
          paddingBottom: Math.max(32, insets.bottom + 16),
        }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const loaded = isFontLoaded(item.name);
          const isActive = currentFont === item.name;
          return (
            <Pressable
              style={[styles.fontRow, isActive && styles.fontRowActive]}
              onPress={() => {
                onSelect(item.name);
                onDismiss();
              }}
            >
              <Text
                style={[
                  styles.fontName,
                  isActive && styles.fontNameActive,
                  !loaded && item.name !== "System" && styles.fontNameUnloaded,
                ]}
              >
                {item.displayName}
              </Text>
              {!loaded && item.name !== "System" && (
                <Text style={styles.unavailable}>unavailable</Text>
              )}
              {isActive && <Text style={styles.check}>✓</Text>}
            </Pressable>
          );
        }}
      />
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
  list: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#F9FAFB",
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  fontRowActive: {
    backgroundColor: "#EFF6FF",
  },
  fontName: {
    fontSize: 15,
    color: BRAND.text,
    flex: 1,
  },
  fontNameActive: {
    fontWeight: "600",
    color: BRAND.accent,
  },
  fontNameUnloaded: {
    color: BRAND.textSecondary,
  },
  unavailable: {
    fontSize: 10,
    color: BRAND.textSecondary,
    marginRight: 8,
  },
  check: {
    fontSize: 16,
    color: BRAND.accent,
    fontWeight: "700",
  },
});
