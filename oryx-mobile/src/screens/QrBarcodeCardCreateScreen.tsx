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
import { ThemeColorDropdown } from "../components/businessCard/ThemeColorDropdown";
import { BarcodeScanModal } from "../components/qrBarcode/BarcodeScanModal";
import { QrBarcodeCardPreview } from "../components/qrBarcode/QrBarcodeCardPreview";
import {
  AMBTN_DEFAULT_THEME_COLOR,
  AMBTN_THEME_COLORS,
} from "../constants/ambtnThemeColors";
import { QR_BARCODE_CARD_TEMPLATE_ID } from "../constants/cardTemplates";
import { createCard, updateCard, fetchCard } from "../lib/firestore";
import { uploadLogo } from "../lib/storage";
import { syncCardToApi } from "../lib/cardSync";
import { notifyCardsChanged } from "../lib/cardsEvents";
import {
  inferDisplayCodeKind,
  mapScannerTypeToDisplayKind,
  mapScannerTypeToWalletFormat,
} from "../lib/barcodeUtils";
import {
  WALLET_BARCODE_FORMAT_OPTIONS,
  type WalletBarcodeFormat,
  normalizeWalletBarcodeFormat,
} from "../lib/walletBarcodeFormats";
import type { DisplayCodeKind } from "../lib/barcodeUtils";
import { generateCardSlug } from "../lib/cardLinks";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

export function QrBarcodeCardCreateScreen({ route, navigation }: Props) {
  const { cardId: editCardId } = route.params;
  const isEditing = Boolean(editCardId);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<EditorMode>("edit");
  const [saving, setSaving] = useState(false);
  const [loadingCard, setLoadingCard] = useState(isEditing);
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const saveStartedRef = useRef(false);

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState(AMBTN_DEFAULT_THEME_COLOR);
  const [cardName, setCardName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [displayKind, setDisplayKind] = useState<DisplayCodeKind>("barcode");
  const [displayOverride, setDisplayOverride] = useState(false);
  const [walletFormat, setWalletFormat] = useState<WalletBarcodeFormat>("PKBarcodeFormatQR");
  const [scannedType, setScannedType] = useState<string | null>(null);
  const [cardSlug] = useState(() => generateCardSlug());

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit membership card" : "QR / Barcode Card",
    });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (!editCardId) return;
    let cancelled = false;
    fetchCard(editCardId)
      .then((card) => {
        if (cancelled) return;
        setCardName(card.name ?? "");
        setOrganisation(card.business ?? "");
        setBarcodeValue(card.fieldValues?.barcodeValue ?? "");
        setMembershipNumber(card.fieldValues?.membershipNumber ?? "");
        setNotes(card.fieldValues?.notes ?? "");
        setExpiryDate(card.fieldValues?.expiryDate ?? "");
        setBackgroundColor(card.backgroundColor ?? AMBTN_DEFAULT_THEME_COLOR);
        setScannedType(card.fieldValues?.scannedType ?? null);
        setDisplayKind(
          (card.fieldValues?.displayKind as DisplayCodeKind) ||
            inferDisplayCodeKind(card.fieldValues?.barcodeValue ?? "")
        );
        setDisplayOverride(card.fieldValues?.displayOverride === "true");
        setWalletFormat(
          normalizeWalletBarcodeFormat(card.fieldValues?.walletBarcodeFormat)
        );
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

  useEffect(() => {
    if (displayOverride || !barcodeValue.trim()) return;
    setDisplayKind(inferDisplayCodeKind(barcodeValue));
  }, [barcodeValue, displayOverride]);

  const previewData = {
    cardName,
    organisation,
    membershipNumber,
    barcodeValue,
    expiryDate,
    notes,
    logoUri,
    backgroundColor,
    displayKind,
    scannedType,
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

  const handleScan = ({ value, type }: { value: string; type: string }) => {
    setBarcodeValue(value);
    setScannedType(type);
    if (!displayOverride) {
      setDisplayKind(mapScannerTypeToDisplayKind(type));
    }
    setWalletFormat(mapScannerTypeToWalletFormat(type));
    if (!membershipNumber.trim() && /^\d{6,}$/.test(value.trim())) {
      setMembershipNumber(value.trim());
    }
  };

  const buildFieldValues = (): Record<string, string> => {
    const raw = {
      cardKind: QR_BARCODE_CARD_TEMPLATE_ID,
      barcodeValue: barcodeValue.trim(),
      membershipNumber: membershipNumber.trim(),
      notes: notes.trim(),
      expiryDate: expiryDate.trim(),
      displayKind,
      displayOverride: displayOverride ? "true" : "false",
      walletBarcodeFormat: walletFormat,
      scannedType: scannedType || "",
    };
    return Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v.length > 0)
    );
  };

  const handleSave = async () => {
    if (saveStartedRef.current || saving) return;
    if (!isEditing && createdCardId) return;

    if (!cardName.trim()) {
      Alert.alert("Card name required", "Enter a name for this card.");
      setMode("edit");
      return;
    }
    if (!barcodeValue.trim()) {
      Alert.alert("Code required", "Enter or scan a barcode or QR value.");
      setMode("edit");
      return;
    }

    saveStartedRef.current = true;
    setSaving(true);
    try {
      const fieldValues = buildFieldValues();
      let card: Awaited<ReturnType<typeof createCard>>;

      if (isEditing && editCardId) {
        card = await updateCard(editCardId, {
          name: cardName.trim(),
          business: organisation.trim() || undefined,
          fieldValues,
          backgroundColor,
        });
      } else {
        card = await createCard({
          templateId: QR_BARCODE_CARD_TEMPLATE_ID,
          slug: cardSlug,
          name: cardName.trim(),
          business: organisation.trim() || undefined,
          fieldValues,
          backgroundColor,
          allowSmartExchange: false,
        });
        setCreatedCardId(card.id);
      }

      const isLocalLogo =
        logoUri && !logoUri.startsWith("http://") && !logoUri.startsWith("https://");
      if (isLocalLogo) {
        const uploaded = await uploadLogo(card.id, logoUri);
        card = await updateCard(card.id, { logoUrl: uploaded.url });
      } else if (!logoUri) {
        card = await updateCard(card.id, { logoUrl: null });
      }

      await syncCardToApi(card);
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
        e instanceof Error ? e.message : "Failed to save card"
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
        >
          <Text style={styles.intro}>
            Store a loyalty card, gym membership, or other scannable code you
            already own. Oryx does not clone NFC access cards or encrypted tags.
          </Text>

          <Text style={styles.sectionLabel}>Logo (optional)</Text>
          <View style={styles.photoRow}>
            <Pressable
              style={styles.photoCircle}
              onPress={() =>
                Alert.alert("Add logo", undefined, [
                  { text: "Photo Library", onPress: () => pickPhoto(false) },
                  { text: "Take Photo", onPress: () => pickPhoto(true) },
                  { text: "Cancel", style: "cancel" },
                ])
              }
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.photoImage} />
              ) : (
                <Ionicons name="image-outline" size={28} color={BRAND.textSecondary} />
              )}
            </Pressable>
            <View style={styles.photoMeta}>
              <Text style={styles.photoTitle}>Organisation logo</Text>
              {logoUri ? (
                <Pressable onPress={() => setLogoUri(null)}>
                  <Text style={styles.removePhoto}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <ThemeColorDropdown
            options={AMBTN_THEME_COLORS}
            value={backgroundColor}
            onChange={setBackgroundColor}
          />

          <Field
            label="Card name *"
            value={cardName}
            onChange={setCardName}
            placeholder="Gym Membership"
          />
          <Field
            label="Organisation name"
            value={organisation}
            onChange={setOrganisation}
            placeholder="FitClub"
          />

          <Text style={styles.sectionLabel}>Barcode or QR value *</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={barcodeValue}
            onChangeText={setBarcodeValue}
            placeholder="Paste membership number, barcode, or QR payload"
            placeholderTextColor={BRAND.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />
          <Pressable
            style={({ pressed }) => [styles.scanBtn, pressed && styles.pressed]}
            onPress={() => setScanVisible(true)}
          >
            <Ionicons name="scan-outline" size={20} color={BRAND.text} />
            <Text style={styles.scanBtnText}>Scan existing code</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>Display as</Text>
          <View style={styles.segmentRow}>
            <SegmentButton
              label="Barcode"
              active={displayKind === "barcode"}
              onPress={() => {
                setDisplayOverride(true);
                setDisplayKind("barcode");
              }}
            />
            <SegmentButton
              label="QR code"
              active={displayKind === "qr"}
              onPress={() => {
                setDisplayOverride(true);
                setDisplayKind("qr");
              }}
            />
          </View>

          <Text style={styles.sectionLabel}>Apple Wallet barcode format</Text>
          <View style={styles.formatList}>
            {WALLET_BARCODE_FORMAT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.formatRow,
                  walletFormat === option.value && styles.formatRowActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setWalletFormat(option.value)}
              >
                <Text
                  style={[
                    styles.formatLabel,
                    walletFormat === option.value && styles.formatLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="Membership number"
            value={membershipNumber}
            onChange={setMembershipNumber}
            placeholder="1234567890"
          />
          <Field
            label="Expiry date"
            value={expiryDate}
            onChange={setExpiryDate}
            placeholder="31 Dec 2026"
          />
          <Field
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Optional notes"
            multiline
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.viewContent}
          showsVerticalScrollIndicator={false}
        >
          <QrBarcodeCardPreview data={previewData} />
          <Text style={styles.viewHint}>
            This card stays private to your account. Add it to Apple Wallet to
            scan at the gym, store, or library.
          </Text>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.pressed,
            saving && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || (!isEditing && createdCardId !== null)}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? "Save changes" : "Save card"}
            </Text>
          )}
        </Pressable>
      </View>

      <BarcodeScanModal
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onScan={handleScan}
      />
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={BRAND.textSecondary}
        autoCapitalize="sentences"
        autoCorrect={false}
        multiline={multiline}
      />
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  centered: { justifyContent: "center", alignItems: "center" },
  toggleRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  scroll: { flex: 1 },
  editContent: { padding: 20, paddingBottom: 24 },
  viewContent: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  intro: {
    fontSize: 14,
    color: BRAND.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  photoCircle: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: { width: 72, height: 72 },
  photoMeta: { flex: 1 },
  photoTitle: { fontSize: 15, fontWeight: "600", color: BRAND.text },
  removePhoto: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.error,
    marginTop: 6,
  },
  field: { marginBottom: 16 },
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
  codeInput: { minHeight: 88, textAlignVertical: "top" },
  multilineInput: { minHeight: 88, textAlignVertical: "top" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    marginTop: -4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  scanBtnText: { fontSize: 15, fontWeight: "600", color: BRAND.text },
  segmentRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: "center",
    backgroundColor: BRAND.card,
  },
  segmentBtnActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  segmentText: { fontSize: 14, fontWeight: "600", color: BRAND.text },
  segmentTextActive: { color: "#fff" },
  formatList: { gap: 8, marginBottom: 20 },
  formatRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
  },
  formatRowActive: {
    borderColor: BRAND.primary,
    backgroundColor: "#f3f4f6",
  },
  formatLabel: { fontSize: 15, color: BRAND.text },
  formatLabelActive: { fontWeight: "700" },
  viewHint: {
    fontSize: 14,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
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
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  pressed: { opacity: 0.85 },
});
