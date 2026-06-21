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
import { fetchExchangeRequests, ExchangeRequest } from "../lib/exchanges";
import {
  fetchBusinessCardExchanges,
  type BusinessCardExchangeLead,
} from "../lib/exchangesApi";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ListItem =
  | { kind: "lead"; data: BusinessCardExchangeLead }
  | { kind: "request"; data: ExchangeRequest };

export function ExchangeListScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [leads, requests] = await Promise.all([
        fetchBusinessCardExchanges(),
        fetchExchangeRequests(),
      ]);

      const leadItems: ListItem[] = leads.map((data) => ({ kind: "lead", data }));
      const requestItems: ListItem[] = requests.map((data) => ({
        kind: "request",
        data,
      }));

      setItems([...leadItems, ...requestItems]);
    } catch {
      // empty state is fine
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

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.kind === "lead" ? `lead-${item.data.id}` : `req-${item.data.id}`
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={BRAND.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No exchanges yet</Text>
              <Text style={styles.emptyText}>
                When someone scans your Business Card QR code and shares their
                details, they&apos;ll appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (item.kind === "lead") {
            const lead = item.data;
            const cardName =
              lead.card.business || lead.card.name || lead.card.slug;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("ExchangeDetail", { lead })
                }
              >
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(lead.name || "?")[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{lead.name}</Text>
                    <Text style={styles.cardCompany}>
                      {lead.company || lead.jobTitle || cardName}
                    </Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardDate}>
                      {formatDate(lead.createdAt)}
                    </Text>
                    <View style={[styles.badge, styles.badgeLead]}>
                      <Text style={[styles.badgeText, styles.badgeLeadText]}>
                        Lead
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }

          const request = item.data;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate("ExchangeDetail", {
                  requestId: request.id,
                })
              }
            >
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(request.recipientName || "?")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>
                    {request.recipientName || "Unknown"}
                  </Text>
                  <Text style={styles.cardCompany}>
                    {request.recipientCompany || request.recipientJobTitle || ""}
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardDate}>
                    {formatDate(request.createdAt)}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Pending</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: BRAND.text },
  emptyText: {
    fontSize: 15,
    color: BRAND.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
  },
  cardPressed: { opacity: 0.9 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 16, fontWeight: "600", color: BRAND.text },
  cardCompany: { fontSize: 13, color: BRAND.textSecondary, marginTop: 2 },
  cardMeta: { alignItems: "flex-end" },
  cardDate: { fontSize: 12, color: BRAND.textSecondary },
  badge: {
    marginTop: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#92400e" },
  badgeLead: { backgroundColor: "#d1fae5" },
  badgeLeadText: { color: "#065f46" },
});
