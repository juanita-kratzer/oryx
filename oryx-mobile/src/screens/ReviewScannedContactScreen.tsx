import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Contact, requestPermissionsAsync, isContactsAvailable, CONTACTS_UNAVAILABLE_MESSAGE } from "../lib/contacts";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { saveScannedContact } from "../lib/exchanges";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ReviewScannedContact">;

export function ReviewScannedContactScreen({ route, navigation }: Props) {
  const { parsed, imageUri } = route.params;

  const [fullName, setFullName] = useState(parsed.fullName);
  const [phone, setPhone] = useState(parsed.phone);
  const [email, setEmail] = useState(parsed.email);
  const [jobTitle, setJobTitle] = useState(parsed.jobTitle);
  const [company, setCompany] = useState(parsed.company);
  const [website, setWebsite] = useState(parsed.website);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Name Required", "Please enter a name for this contact.");
      return;
    }

    setSaving(true);
    try {
      if (!isContactsAvailable()) {
        Alert.alert("Contacts Unavailable", CONTACTS_UNAVAILABLE_MESSAGE);
        return;
      }

      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Contacts permission is needed to save this contact."
        );
        setSaving(false);
        return;
      }

      const nameParts = fullName.trim().split(/\s+/);
      const givenName =
        nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
      const familyName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      await Contact.create({
        givenName,
        familyName,
        ...(phone
          ? { phones: [{ label: "mobile", number: phone }] }
          : {}),
        ...(email ? { emails: [{ label: "work", address: email }] } : {}),
        ...(jobTitle ? { jobTitle } : {}),
        ...(company ? { company } : {}),
      });

      await saveScannedContact({
        fullName: fullName.trim(),
        phone,
        email,
        jobTitle,
        company,
        website,
        sourceImageUri: imageUri,
      });

      Alert.alert(
        "Contact Saved",
        `${fullName.trim()} has been saved to your Contacts and Oryx.`,
        [{ text: "OK", onPress: () => navigation.popToTop() }]
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to save contact."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Review Contact</Text>
        <Text style={styles.subheader}>
          Verify and correct the scanned information below.
        </Text>

        <View style={styles.fieldsCard}>
          <Field label="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field label="Job Title" value={jobTitle} onChangeText={setJobTitle} />
          <Field label="Company" value={company} onChangeText={setCompany} />
          <Field label="Website" value={website} onChangeText={setWebsite} keyboardType="url" />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.btnPressed,
            saving && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save to Contacts & Oryx"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 24, paddingBottom: 48 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 6,
  },
  subheader: {
    fontSize: 15,
    color: BRAND.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  fieldsCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 24,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BRAND.text,
  },
  saveBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
