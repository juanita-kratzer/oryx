import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TEMPLATE_REGISTRY, TemplateInfo } from "../templates";
import { CardRenderer } from "../engine/CardRenderer";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TemplateGallery">;

function TemplateCard({
  info,
  cardWidth,
  onPress,
}: {
  info: TemplateInfo;
  cardWidth: number;
  onPress: () => void;
}) {
  const doc = useMemo(() => info.factory(), [info]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardPreview}>
        <CardRenderer document={doc} width={cardWidth - 2} />
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.cardName}>{info.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {info.description}
        </Text>
      </View>
    </Pressable>
  );
}

export function TemplateGalleryScreen({ navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const gap = 12;
  const padding = 16;
  const cardWidth = (screenWidth - padding * 2 - gap) / 2;

  return (
    <View style={styles.container}>
      <FlatList
        data={TEMPLATE_REGISTRY}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Template</Text>
            <Text style={styles.subtitle}>
              Pick a design, then make it yours
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TemplateCard
            info={item}
            cardWidth={cardWidth}
            onPress={() =>
              navigation.navigate("CardEditor", { templateId: item.id })
            }
          />
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
  list: { padding: 16 },
  row: { gap: 12 },
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  cardPreview: {
    overflow: "hidden",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  cardMeta: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND.text,
  },
  cardDescription: {
    fontSize: 11,
    color: BRAND.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
});
