import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  fetchScannedContacts,
  type ScannedContact,
} from "../lib/exchanges";
import {
  fetchBusinessCardExchanges,
  type BusinessCardExchangeLead,
} from "../lib/exchangesApi";
import { useTheme } from "../contexts/ThemeContext";
import type { BrandColors } from "../constants/colors";
import type { MainTabParamList, RootStackParamList } from "../types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Contacts">,
  NativeStackNavigationProp<RootStackParamList>
>;

type ContactSection = {
  key: "scanned" | "exchange";
  title: string;
  emptyText: string;
  data: ScannedContact[] | BusinessCardExchangeLead[];
};

function createStyles(colors: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 56,
      paddingBottom: 12,
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    scanAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scanActionText: { fontSize: 15, fontWeight: "600", color: colors.text },
    list: { paddingHorizontal: 16, paddingBottom: 100 },
    listEmpty: { flexGrow: 1 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 10,
      marginTop: 4,
    },
    sectionEmpty: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 20,
      paddingVertical: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    cardPressed: { opacity: 0.9 },
    cardRow: { flexDirection: "row", alignItems: "flex-start" },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarExchange: {
      backgroundColor: "#0d9488",
    },
    avatarText: { color: colors.onPrimary, fontWeight: "700", fontSize: 18 },
    cardInfo: { flex: 1, marginLeft: 12 },
    cardName: { fontSize: 16, fontWeight: "600", color: colors.text },
    cardCompany: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    cardDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
    cardDate: { fontSize: 12, color: colors.textSecondary },
  });
}

export function ScannedContactsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [scannedContacts, setScannedContacts] = useState<ScannedContact[]>([]);
  const [exchangeContacts, setExchangeContacts] = useState<
    BusinessCardExchangeLead[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [scanned, exchanges] = await Promise.all([
        fetchScannedContacts(),
        fetchBusinessCardExchanges(),
      ]);
      setScannedContacts(scanned);
      setExchangeContacts(exchanges);
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

  const sections: ContactSection[] = [
    {
      key: "scanned",
      title: "From business cards & manual entry",
      emptyText: "Scan a business card to save contacts here.",
      data: scannedContacts,
    },
    {
      key: "exchange",
      title: "Smart exchanged contacts",
      emptyText:
        "When someone shares their details back via Smart Exchange, they'll appear here.",
      data: exchangeContacts,
    },
  ];

  const isEmpty = !loading && scannedContacts.length === 0 && exchangeContacts.length === 0;

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) =>
          "fullName" in item
            ? `scanned-${item.id}`
            : `exchange-${item.id}`
        }
        contentContainerStyle={[
          styles.list,
          isEmpty && styles.listEmpty,
        ]}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Contacts</Text>
            </View>
            <Pressable
              style={styles.scanAction}
              onPress={() => navigation.navigate("ScanCard")}
            >
              <Ionicons name="camera-outline" size={22} color={colors.text} />
              <Text style={styles.scanActionText}>Scan business card</Text>
            </Pressable>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderSectionFooter={({ section }) => {
          if (section.data.length > 0) return null;
          if (loading) return null;
          return (
            <Text style={styles.sectionEmpty}>{section.emptyText}</Text>
          );
        }}
        renderItem={({ item, section }) => {
          if (section.key === "scanned") {
            const contact = item as ScannedContact;
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(contact.fullName || "?")[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>
                      {contact.fullName || "Unknown"}
                    </Text>
                    {contact.company || contact.jobTitle ? (
                      <Text style={styles.cardCompany}>
                        {[contact.jobTitle, contact.company]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    ) : null}
                    {contact.email ? (
                      <Text style={styles.cardDetail}>{contact.email}</Text>
                    ) : null}
                    {contact.phone ? (
                      <Text style={styles.cardDetail}>{contact.phone}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.cardDate}>
                    {formatDate(contact.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }

          const lead = item as BusinessCardExchangeLead;
          const cardName =
            lead.card.business || lead.card.name || lead.card.slug;

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() =>
                navigation.navigate("ExchangeDetail", { lead })
              }
            >
              <View style={styles.cardRow}>
                <View style={[styles.avatar, styles.avatarExchange]}>
                  <Ionicons name="swap-horizontal" size={20} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{lead.name}</Text>
                  <Text style={styles.cardCompany}>
                    {lead.company || lead.jobTitle || cardName}
                  </Text>
                  {lead.email ? (
                    <Text style={styles.cardDetail}>{lead.email}</Text>
                  ) : null}
                  {lead.phone ? (
                    <Text style={styles.cardDetail}>{lead.phone}</Text>
                  ) : null}
                </View>
                <Text style={styles.cardDate}>
                  {formatDate(lead.createdAt)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
