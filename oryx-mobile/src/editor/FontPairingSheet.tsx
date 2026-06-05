import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSuggestedPairings, PAIRING_PRESETS } from "../fonts/pairings";
import { getFontEntry } from "../fonts";
import { BRAND } from "../constants/colors";

type Props = {
  currentHeadingFont: string;
  onApplyPairing: (heading: string, body: string) => void;
  onDismiss: () => void;
  maxHeight?: number;
};

export function FontPairingSheet({
  currentHeadingFont,
  onApplyPairing,
  onDismiss,
  maxHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const resolvedHeight = maxHeight || 400;
  const suggestions = getSuggestedPairings(currentHeadingFont);
  const headingEntry = getFontEntry(currentHeadingFont);

  return (
    <View style={[styles.panel, { height: resolvedHeight }]}>
      <View style={styles.panelHandle} />
      <View style={styles.header}>
        <Text style={styles.title}>Font Pairings</Text>
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
        {suggestions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              Pairs well with {headingEntry?.displayName || currentHeadingFont}
            </Text>
            {suggestions.map((body) => {
              const bodyEntry = getFontEntry(body);
              return (
                <Pressable
                  key={body}
                  style={styles.pairingCard}
                  onPress={() => onApplyPairing(currentHeadingFont, body)}
                >
                  <Text style={styles.pairingHeading}>
                    {headingEntry?.displayName || currentHeadingFont}
                  </Text>
                  <Text style={styles.pairingBody}>
                    {bodyEntry?.displayName || body}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}

        <Text style={styles.sectionLabel}>Quick Apply Presets</Text>
        {PAIRING_PRESETS.map((preset) => {
          const hEntry = getFontEntry(preset.heading);
          const bEntry = getFontEntry(preset.body);
          return (
            <Pressable
              key={preset.name}
              style={styles.pairingCard}
              onPress={() => onApplyPairing(preset.heading, preset.body)}
            >
              <Text style={styles.presetName}>{preset.name}</Text>
              <View style={styles.presetFonts}>
                <Text style={styles.presetHeading}>
                  {hEntry?.displayName || preset.heading}
                </Text>
                <Text style={styles.presetPlus}> + </Text>
                <Text style={styles.presetBody}>
                  {bEntry?.displayName || preset.body}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  pairingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pairingHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 2,
  },
  pairingBody: {
    fontSize: 14,
    fontWeight: "400",
    color: BRAND.textSecondary,
  },
  presetName: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 4,
  },
  presetFonts: {
    flexDirection: "row",
    alignItems: "center",
  },
  presetHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
  },
  presetPlus: {
    fontSize: 14,
    color: BRAND.textSecondary,
  },
  presetBody: {
    fontSize: 14,
    fontWeight: "400",
    color: BRAND.textSecondary,
  },
});
