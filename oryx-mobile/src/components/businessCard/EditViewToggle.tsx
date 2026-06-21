import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BRAND } from "../../constants/colors";

export type EditorMode = "edit" | "view";

type Props = {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
};

export function EditViewToggle({ mode, onChange }: Props) {
  return (
    <View style={styles.track}>
      <Pressable
        style={[styles.segment, mode === "edit" && styles.segmentActive]}
        onPress={() => onChange("edit")}
      >
        <Text style={[styles.segmentText, mode === "edit" && styles.segmentTextActive]}>
          Edit
        </Text>
      </Pressable>
      <Pressable
        style={[styles.segment, mode === "view" && styles.segmentActive]}
        onPress={() => onChange("view")}
      >
        <Text style={[styles.segmentText, mode === "view" && styles.segmentTextActive]}>
          View
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 3,
    alignSelf: "center",
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: BRAND.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND.textSecondary,
  },
  segmentTextActive: {
    color: BRAND.text,
  },
});
