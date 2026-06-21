import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Contact, requestPermissionsAsync } from "../lib/contacts";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  fetchExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  ExchangeRequest,
} from "../lib/exchanges";
import type { BusinessCardExchangeLead } from "../lib/exchangesApi";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ExchangeDetail">;

export function ExchangeDetailScreen({ route, navigation }: Props) {
  const { requestId, lead: routeLead } = route.params;
  const [request, setRequest] = useState<ExchangeRequest | null>(null);
  const [loading, setLoading] = useState(!routeLead);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (routeLead || !requestId) return;

    (async () => {
      try {
        const data = await fetchExchangeRequest(requestId);
        setRequest(data);
      } catch {
        Alert.alert("Error", "Could not load exchange request.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId, routeLead, navigation]);

  const saveLeadToContacts = async (lead: BusinessCardExchangeLead) => {
    const { status } = await requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Contacts permission is needed to save this contact."
      );
      return;
    }

    const nameParts = (lead.name || "").trim().split(/\s+/);
    const givenName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
    const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    await Contact.create({
      givenName,
      familyName,
      ...(lead.phone ? { phones: [{ label: "mobile", number: lead.phone }] } : {}),
      ...(lead.email ? { emails: [{ label: "work", address: lead.email }] } : {}),
      ...(lead.jobTitle ? { jobTitle: lead.jobTitle } : {}),
      ...(lead.company ? { company: lead.company } : {}),
      ...(lead.notes ? { note: lead.notes } : {}),
    });

    Alert.alert("Contact Saved", `${lead.name} has been added to your contacts.`);
  };

  const handleAccept = async () => {
    if (!request) return;
    setProcessing(true);
    try {
      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Contacts permission is needed to save this contact."
        );
        setProcessing(false);
        return;
      }

      const nameParts = (request.recipientName || "").trim().split(/\s+/);
      const givenName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
      const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      await Contact.create({
        givenName,
        familyName,
        ...(request.recipientPhone
          ? { phones: [{ label: "mobile", number: request.recipientPhone }] }
          : {}),
        ...(request.recipientEmail
          ? { emails: [{ label: "work", address: request.recipientEmail }] }
          : {}),
        ...(request.recipientJobTitle
          ? { jobTitle: request.recipientJobTitle }
          : {}),
        ...(request.recipientCompany
          ? { company: request.recipientCompany }
          : {}),
      });

      await acceptExchangeRequest(request.id);

      Alert.alert(
        "Contact Saved",
        `${request.recipientName} has been added to your contacts.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to save contact."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    Alert.alert("Reject Request", "Are you sure you want to reject this exchange request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setProcessing(true);
          try {
            await rejectExchangeRequest(request.id);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Failed to reject request.");
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  if (routeLead) {
    const cardName =
      routeLead.card.business || routeLead.card.name || routeLead.card.slug;
    const fields = [
      { label: "Name", value: routeLead.name },
      { label: "Phone", value: routeLead.phone },
      { label: "Email", value: routeLead.email },
      { label: "Job Title", value: routeLead.jobTitle },
      { label: "Company", value: routeLead.company },
      { label: "Card", value: cardName },
      { label: "Notes", value: routeLead.notes },
    ];

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(routeLead.name || "?")[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{routeLead.name}</Text>
            {routeLead.company ? (
              <Text style={styles.company}>{routeLead.company}</Text>
            ) : null}
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>PUBLIC LANDING</Text>
            </View>
          </View>

          <View style={styles.fieldsCard}>
            {fields.map(
              (f) =>
                f.value ? (
                  <View key={f.label} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <Text style={styles.fieldValue}>{f.value}</Text>
                  </View>
                ) : null
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.acceptBtn,
              pressed && styles.btnPressed,
              processing && styles.btnDisabled,
            ]}
            onPress={async () => {
              setProcessing(true);
              try {
                await saveLeadToContacts(routeLead);
              } finally {
                setProcessing(false);
              }
            }}
            disabled={processing}
          >
            <Text style={styles.acceptText}>
              {processing ? "Saving..." : "Save to Contacts"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (!request) return null;

  const fields = [
    { label: "Name", value: request.recipientName },
    { label: "Phone", value: request.recipientPhone },
    { label: "Email", value: request.recipientEmail },
    { label: "Job Title", value: request.recipientJobTitle },
    { label: "Company", value: request.recipientCompany },
    { label: "Date of Birth", value: request.recipientDob },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(request.recipientName || "?")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{request.recipientName || "Unknown"}</Text>
          {request.recipientCompany ? (
            <Text style={styles.company}>{request.recipientCompany}</Text>
          ) : null}
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>
              via {request.source.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.fieldsCard}>
          {fields.map(
            (f) =>
              f.value ? (
                <View key={f.label} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <Text style={styles.fieldValue}>{f.value}</Text>
                </View>
              ) : null
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.acceptBtn,
              pressed && styles.btnPressed,
              processing && styles.btnDisabled,
            ]}
            onPress={handleAccept}
            disabled={processing}
          >
            <Text style={styles.acceptText}>
              {processing ? "Saving..." : "Accept & Save to Contacts"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.rejectBtn,
              pressed && styles.btnPressed,
              processing && styles.btnDisabled,
            ]}
            onPress={handleReject}
            disabled={processing}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingBottom: 48 },
  header: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BRAND.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 28 },
  name: { fontSize: 22, fontWeight: "700", color: BRAND.text },
  company: { fontSize: 15, color: BRAND.textSecondary, marginTop: 4 },
  sourceBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EEF2FF",
  },
  sourceText: { fontSize: 11, fontWeight: "600", color: "#4338CA" },
  fieldsCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 28,
  },
  fieldRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: { fontSize: 16, color: BRAND.text },
  actions: { gap: 12 },
  acceptBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.5 },
  acceptText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  rejectText: { color: "#DC2626", fontWeight: "600", fontSize: 16 },
});
