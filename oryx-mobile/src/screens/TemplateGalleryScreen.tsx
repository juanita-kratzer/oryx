import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TEMPLATE_GALLERY_SECTIONS } from "../data/templateGallery";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TemplateGallery">;

export function TemplateGalleryScreen({ navigation }: Props) {
  const sections = TEMPLATE_GALLERY_SECTIONS.map((section) => ({
    title: section.title,
    subtitle: section.subtitle,
    data: section.templates,
  }));

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Template</Text>
            <Text style={styles.subtitle}>
              Pick a design, then make it yours
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.subtitle ? (
              <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            ) : null}
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                isFirst && styles.rowFirst,
                isLast && styles.rowLast,
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
          );
        }}
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
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: BRAND.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
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
    marginBottom: 16,
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
