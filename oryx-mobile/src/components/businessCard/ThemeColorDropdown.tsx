import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "../../constants/colors";

type ColorOption = { label: string; value: string };

type Props = {
  label?: string;
  options: ColorOption[];
  value: string;
  onChange: (value: string) => void;
};

export function ThemeColorDropdown({
  label = "Wallet colour",
  options,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected =
    options.find((o) => o.value.toLowerCase() === value.toLowerCase()) ??
    options[0];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setOpen(true)}
      >
        <View style={[styles.swatch, { backgroundColor: selected.value }]} />
        <Text style={styles.triggerText}>{selected.label}</Text>
        <Ionicons name="chevron-down" size={18} color={BRAND.textSecondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose colour</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={BRAND.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active =
                  item.value.toLowerCase() === value.toLowerCase();
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      active && styles.optionActive,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <View
                      style={[styles.optionSwatch, { backgroundColor: item.value }]}
                    />
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    {active ? (
                      <Ionicons name="checkmark" size={20} color={BRAND.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  triggerPressed: {
    opacity: 0.9,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: BRAND.text,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BRAND.border,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: BRAND.text,
  },
  list: {
    maxHeight: 420,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BRAND.border,
  },
  optionActive: {
    backgroundColor: "#f9fafb",
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: BRAND.text,
  },
});
