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
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ExchangeListScreen() {
  const navigation = useNavigation<Nav>();
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchExchangeRequests();
      setRequests(data);
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
        data={requests}
        keyExtractor={(item) => item.id}
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
              <Text style={styles.emptyTitle}>No exchange requests</Text>
              <Text style={styles.emptyText}>
                When someone scans your Business Card QR code and shares their
                details, they'll appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate("ExchangeDetail", { requestId: item.id })
            }
          >
            <View style={styles.cardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.recipientName || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {item.recipientName || "Unknown"}
                </Text>
                <Text style={styles.cardCompany}>
                  {item.recipientCompany || item.recipientJobTitle || ""}
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>
                  {formatDate(item.createdAt)}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
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
});
