import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TEMPLATE_REGISTRY } from "../templates";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TemplateGallery">;

export function TemplateGalleryScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={TEMPLATE_REGISTRY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Template</Text>
            <Text style={styles.subtitle}>
              Pick a design, then make it yours
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              index === 0 && styles.rowFirst,
              index === TEMPLATE_REGISTRY.length - 1 && styles.rowLast,
              pressed && styles.rowPressed,
            ]}
            onPress={() =>
              navigation.navigate("CardEditor", { templateId: item.id })
            }
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowDescription}>{item.description}</Text>
            </View>
            <Text style={styles.rowChevron}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  header: { paddingHorizontal: 4, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: BRAND.text },
  subtitle: {
    fontSize: 15,
    color: BRAND.textSecondary,
    marginTop: 4,
  },
  list: { padding: 16, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  rowPressed: { opacity: 0.9 },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: BRAND.text,
  },
  rowDescription: {
    fontSize: 14,
    color: BRAND.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  rowChevron: { fontSize: 22, color: BRAND.textSecondary },
});
