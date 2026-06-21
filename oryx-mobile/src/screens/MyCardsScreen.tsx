import React, { useCallback, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchMyCards } from "../lib/firestore";
import { subscribeCardsChanged } from "../lib/cardsEvents";
import { useTheme } from "../contexts/ThemeContext";
import type { BrandColors } from "../constants/colors";
import type { MainTabParamList, RootStackParamList, Card } from "../types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Cards">,
  NativeStackNavigationProp<RootStackParamList>
>;

function createStyles(colors: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: 16, paddingBottom: 100 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    newButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    newButtonText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    emptyText: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 8,
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    emptyButtonText: { color: colors.onPrimary, fontWeight: "600", fontSize: 16 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    cardPressed: { opacity: 0.9 },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardBody: {
      flex: 1,
      padding: 16,
      gap: 4,
    },
    cardIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    cardHeading: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    cardBusiness: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    cardPerson: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cardPlaceholder: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
  });
}

export function MyCardsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyCards();
      setCards(data);
    } catch {
      // silently fail — empty list is fine
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    return subscribeCardsChanged(() => {
      load();
    });
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Cards</Text>
              <Pressable
                style={styles.newButton}
                onPress={() => navigation.navigate("TemplateGallery")}
              >
                <Text style={styles.newButtonText}>+ New Card</Text>
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No cards yet</Text>
              <Text style={styles.emptyText}>Create your first digital card</Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => navigation.navigate("TemplateGallery")}
              >
                <Text style={styles.emptyButtonText}>Browse Templates</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isBusinessCard = item.templateId === "business";
          const heading = isBusinessCard ? "Business card" : item.template.name;
          const businessName = item.business?.trim();
          const personName = item.name?.trim();

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate("CardDelivery", { cardId: item.id })}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardHeading}>{heading}</Text>
                  {businessName ? (
                    <Text style={styles.cardBusiness} numberOfLines={1}>
                      {businessName}
                    </Text>
                  ) : null}
                  {personName ? (
                    <Text style={styles.cardPerson} numberOfLines={1}>
                      {personName}
                    </Text>
                  ) : null}
                  {!businessName && !personName ? (
                    <Text style={styles.cardPlaceholder}>Untitled</Text>
                  ) : null}
                </View>
                {isBusinessCard ? (
                  <View style={styles.cardIconWrap}>
                    <Ionicons name="briefcase-outline" size={28} color={colors.primary} />
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
