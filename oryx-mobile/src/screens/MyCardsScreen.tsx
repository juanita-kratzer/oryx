import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchMyCards } from "../lib/firestore";
import { useAuth } from "../contexts/AuthContext";
import { BRAND } from "../constants/colors";
import type { RootStackParamList, Card } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyCardsScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
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
            <View style={styles.quickActions}>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("ScanCard")}
              >
                <Text style={styles.quickActionIcon}>📷</Text>
                <Text style={styles.quickActionText}>Scan Card</Text>
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("SmartExchanges")}
              >
                <Text style={styles.quickActionIcon}>🔄</Text>
                <Text style={styles.quickActionText}>Exchanges</Text>
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("ScannedContacts")}
              >
                <Text style={styles.quickActionIcon}>👤</Text>
                <Text style={styles.quickActionText}>Contacts</Text>
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
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
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              item.status === "PAID"
                ? navigation.navigate("CardDelivery", { cardId: item.id })
                : navigation.navigate("CardDelivery", { cardId: item.id })
            }
          >
            <View style={[styles.cardStrip, { backgroundColor: item.backgroundColor || "#1a1a2e" }]}>
              <Text style={styles.cardName}>{item.name || item.business || "Untitled"}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardTemplate}>{item.template.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "PAID" ? styles.statusPaid : styles.statusDraft,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "PAID" ? styles.statusTextPaid : styles.statusTextDraft,
                  ]}
                >
                  {item.status === "PAID" ? "Active" : "Draft"}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          cards.length > 0 ? (
            <Pressable style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  list: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "800", color: BRAND.text },
  newButton: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: BRAND.text },
  emptyText: { fontSize: 15, color: BRAND.textSecondary, marginTop: 8, marginBottom: 24 },
  emptyButton: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9 },
  cardStrip: { padding: 20, minHeight: 80, justifyContent: "flex-end" },
  cardName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  cardTemplate: { fontSize: 13, color: BRAND.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusPaid: { backgroundColor: "#d1fae5" },
  statusDraft: { backgroundColor: "#fef3c7" },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusTextPaid: { color: "#065f46" },
  statusTextDraft: { color: "#92400e" },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  quickActionIcon: { fontSize: 22, marginBottom: 4 },
  quickActionText: { fontSize: 12, fontWeight: "600", color: BRAND.text },
  signOutButton: { marginTop: 32, alignItems: "center", paddingVertical: 14 },
  signOutText: { color: BRAND.textSecondary, fontSize: 15 },
});
