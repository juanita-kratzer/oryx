import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import type { EditorAction } from "../types/editor";
import type { CardDocument } from "../types/card";

type Props = {
  selectedElementId: string | null;
  document: CardDocument;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: React.Dispatch<EditorAction>;
};

function ToolButton({
  label,
  onPress,
  disabled,
  destructive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.btnText,
          disabled && styles.btnTextDisabled,
          destructive && !disabled && styles.btnTextDestructive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EditorToolbar({
  selectedElementId,
  document: doc,
  canUndo,
  canRedo,
  dispatch,
}: Props) {
  const selected = selectedElementId
    ? doc.elements.find((e) => e.id === selectedElementId)
    : null;

  return (
    <View style={styles.toolbar}>
      <View style={styles.group}>
        <ToolButton
          label="Undo"
          onPress={() => dispatch({ type: "UNDO" })}
          disabled={!canUndo}
        />
        <ToolButton
          label="Redo"
          onPress={() => dispatch({ type: "REDO" })}
          disabled={!canRedo}
        />
      </View>
      <View style={styles.group}>
        <ToolButton
          label="Duplicate"
          onPress={() =>
            selectedElementId &&
            dispatch({ type: "DUPLICATE_ELEMENT", elementId: selectedElementId })
          }
          disabled={!selected}
        />
        <ToolButton
          label="Delete"
          onPress={() =>
            selectedElementId &&
            dispatch({ type: "DELETE_ELEMENT", elementId: selectedElementId })
          }
          disabled={!selected}
          destructive
        />
      </View>
      <View style={styles.group}>
        <ToolButton
          label="↑"
          onPress={() =>
            selectedElementId &&
            dispatch({
              type: "MOVE_LAYER",
              elementId: selectedElementId,
              direction: "up",
            })
          }
          disabled={!selected}
        />
        <ToolButton
          label="↓"
          onPress={() =>
            selectedElementId &&
            dispatch({
              type: "MOVE_LAYER",
              elementId: selectedElementId,
              direction: "down",
            })
          }
          disabled={!selected}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  group: {
    flexDirection: "row",
    gap: 6,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  btnPressed: {
    backgroundColor: "#E5E7EB",
  },
  btnDisabled: {
    backgroundColor: "#F9FAFB",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  btnTextDisabled: {
    color: "#D1D5DB",
  },
  btnTextDestructive: {
    color: "#DC2626",
  },
});
