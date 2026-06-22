import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "../lib/imagePicker";
import { EditViewToggle, type EditorMode } from "../components/businessCard/EditViewToggle";
import { AppleWalletPreview } from "../components/businessCard/AppleWalletPreview";
import { ThemeColorDropdown } from "../components/businessCard/ThemeColorDropdown";
import {
  AMBTN_DEFAULT_THEME_COLOR,
  AMBTN_THEME_COLORS,
} from "../constants/ambtnThemeColors";
import { createCard, updateCard, fetchCard } from "../lib/firestore";
import { generateCardSlug, getCardQrPayload } from "../lib/cardLinks";
import { finishCardSaveInBackground } from "../lib/finishCardSave";
import { notifyCardsChanged } from "../lib/cardsEvents";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

export function BusinessCardCreateScreen({ route, navigation }: Props) {
  const { cardId: editCardId } = route.params;
  const isEditing = Boolean(editCardId);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<EditorMode>("edit");
  const [saving, setSaving] = useState(false);
  const [loadingCard, setLoadingCard] = useState(isEditing);
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);
  const saveStartedRef = useRef(false);

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState(AMBTN_DEFAULT_THEME_COLOR);
  const [businessName, setBusinessName] = useState("");
  const [yourName, setYourName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [cardSlug, setCardSlug] = useState(() => generateCardSlug());

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Card" : "Create Card",
    });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (!editCardId) return;
    let cancelled = false;
    fetchCard(editCardId)
      .then((card) => {
        if (cancelled) return;
        setCardSlug(card.slug);
        setBackgroundColor(card.backgroundColor ?? AMBTN_DEFAULT_THEME_COLOR);
        setBusinessName(card.business ?? "");
        setYourName(card.name ?? "");
        setJobTitle(card.fieldValues?.jobTitle ?? "");
        setMobile(card.phone ?? "");
        setEmail(card.email ?? "");
        setWebsite(card.website ?? "");
        if (card.logoUrl) setLogoUri(card.logoUrl);
      })
      .catch(() => Alert.alert("Error", "Could not load card"))
      .finally(() => {
        if (!cancelled) setLoadingCard(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editCardId]);

  const qrUrl = getCardQrPayload(cardSlug);

  const previewData = {
    businessName,
    yourName,
    jobTitle,
    mobile,
    email,
    website,
    logoUri,
    backgroundColor,
  };

  const pickPhoto = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow camera access to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
      }
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to choose an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (saveStartedRef.current || saving) return;
    if (!isEditing && createdCardId) return;

    if (!yourName.trim() && !businessName.trim()) {
      Alert.alert("Add your details", "Enter at least your name or business name.");
      setMode("edit");
      return;
    }

    saveStartedRef.current = true;
    setSaving(true);
    try {
      let card: Awaited<ReturnType<typeof createCard>>;

      if (isEditing && editCardId) {
        card = await updateCard(editCardId, {
          name: yourName.trim() || undefined,
          business: businessName.trim() || undefined,
          phone: mobile.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          fieldValues: jobTitle.trim() ? { jobTitle: jobTitle.trim() } : undefined,
          backgroundColor,
        });
      } else {
        card = await createCard({
          templateId: "business",
          slug: cardSlug,
          name: yourName.trim() || undefined,
          business: businessName.trim() || undefined,
          phone: mobile.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          fieldValues: jobTitle.trim() ? { jobTitle: jobTitle.trim() } : undefined,
          backgroundColor,
        });
        setCreatedCardId(card.id);
      }

      const publishFields = {
        yourName,
        mobile,
        email,
        jobTitle,
        businessName,
        website,
        backgroundColor,
      };

      finishCardSaveInBackground(card, {
        logoUri,
        businessCard: publishFields,
      });

      notifyCardsChanged();

      if (isEditing) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 1,
          routes: [
            { name: "MainTabs", params: { screen: "Cards" } },
            { name: "CardDelivery", params: { cardId: card.id } },
          ],
        });
      }
    } catch (e) {
      saveStartedRef.current = false;
      if (!isEditing) setCreatedCardId(null);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to create card"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingCard) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.toggleRow}>
        <EditViewToggle mode={mode} onChange={setMode} />
      </View>

      {mode === "edit" ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.editContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Headshot / logo</Text>
          <View style={styles.photoRow}>
            <Pressable
              style={styles.photoCircle}
              onPress={() =>
                Alert.alert("Add photo", "Choose a headshot or logo for your card.", [
                  { text: "Photo Library", onPress: () => pickPhoto(false) },
                  { text: "Take Photo", onPress: () => pickPhoto(true) },
                  { text: "Cancel", style: "cancel" },
                ])
              }
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.photoImage} />
              ) : (
                <Ionicons name="camera-outline" size={28} color={BRAND.textSecondary} />
              )}
            </Pressable>
            <View style={styles.photoMeta}>
              <Text style={styles.photoTitle}>Tap to add image</Text>
              <Text style={styles.photoHint}>
                Square photos work best. Shown on your Wallet pass header.
              </Text>
              {logoUri ? (
                <Pressable onPress={() => setLogoUri(null)}>
                  <Text style={styles.removePhoto}>Remove photo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <ThemeColorDropdown
            options={AMBTN_THEME_COLORS}
            value={backgroundColor}
            onChange={setBackgroundColor}
          />

          <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="Acme Inc." />
          <Field label="Your name" value={yourName} onChange={setYourName} placeholder="Jane Smith" />
          <Field label="Job title" value={jobTitle} onChange={setJobTitle} placeholder="Marketing Director" />
          <Field
            label="Mobile"
            value={mobile}
            onChange={setMobile}
            placeholder="+61 400 000 000"
            keyboardType="phone-pad"
          />
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="jane@acme.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Website"
            value={website}
            onChange={setWebsite}
            placeholder="www.acme.com"
            autoCapitalize="none"
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.viewContent}
          showsVerticalScrollIndicator={false}
        >
          <AppleWalletPreview data={previewData} publicUrl={qrUrl} />
          <Text style={styles.viewHint}>
            {isEditing
              ? "Preview your pass. Tap Save to update your card."
              : "This is how your pass will look in Apple Wallet. Your card will appear in My Cards after you tap Get My Card."}
          </Text>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            saving && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || (!isEditing && createdCardId !== null)}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? "Save changes" : "Get My Card"}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={BRAND.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "words"}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  toggleRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  scroll: {
    flex: 1,
  },
  editContent: {
    padding: 20,
    paddingBottom: 24,
  },
  viewContent: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: {
    width: 88,
    height: 88,
  },
  photoMeta: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND.text,
  },
  photoHint: {
    fontSize: 13,
    color: BRAND.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  removePhoto: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.error,
    marginTop: 8,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: BRAND.card,
    color: BRAND.text,
  },
  viewHint: {
    fontSize: 14,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 24,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  saveBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
