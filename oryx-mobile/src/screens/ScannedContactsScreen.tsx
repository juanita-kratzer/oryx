import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchScannedContacts, ScannedContact } from "../lib/exchanges";
import { BRAND } from "../constants/colors";

export function ScannedContactsScreen() {
  const [contacts, setContacts] = useState<ScannedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchScannedContacts();
      setContacts(data);
    } catch {
      // empty state
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
        data={contacts}
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
              <Text style={styles.emptyTitle}>No scanned contacts</Text>
              <Text style={styles.emptyText}>
                Scan a business card to save contacts here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.fullName || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {item.fullName || "Unknown"}
                </Text>
                {item.company || item.jobTitle ? (
                  <Text style={styles.cardCompany}>
                    {[item.jobTitle, item.company]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                ) : null}
                {item.email ? (
                  <Text style={styles.cardDetail}>{item.email}</Text>
                ) : null}
                {item.phone ? (
                  <Text style={styles.cardDetail}>{item.phone}</Text>
                ) : null}
              </View>
              <Text style={styles.cardDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
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
  },
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
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
  cardDetail: { fontSize: 13, color: BRAND.textSecondary, marginTop: 1 },
  cardDate: { fontSize: 12, color: BRAND.textSecondary },
});
