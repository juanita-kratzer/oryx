import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  Switch,
  Modal,
} from "react-native";
import { FileSystem } from "../lib/fileSystem";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { fetchCard, markCardPaid, getPassDownloadUrl, updateCard, deleteCard } from "../lib/firestore";
import { getAuth } from "../lib/firebase";
import { SmartExchangeSection } from "../components/cards/SmartExchangeSection";
import { CardDetailPreview } from "../components/cards/CardDetailPreview";
import { getCardPublicUrl } from "../lib/cardLinks";
import { syncCardToApi, deleteCardFromApi } from "../lib/cardSync";
import { notifyCardsChanged } from "../lib/cardsEvents";
import { BRAND } from "../constants/colors";
import type { RootStackParamList, Card } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardDelivery">;

export function CardDeliveryScreen({ route, navigation }: Props) {
  const { cardId } = route.params;
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updatingExchange, setUpdatingExchange] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const deletedRef = useRef(false);

  useEffect(() => {
    deletedRef.current = false;
  }, [cardId]);

  const loadCard = useCallback(async () => {
    if (deletedRef.current) return;
    try {
      let loaded = await fetchCard(cardId);
      if (deletedRef.current) return;
      if (!loaded.nfcUrl) {
        loaded = await updateCard(loaded.id, {});
      }
      if (deletedRef.current) return;
      // Build/testing: no IAP — activate legacy draft cards automatically
      if (loaded.status === "DRAFT") {
        loaded = await markCardPaid(loaded.id, "build_test");
      }
      if (deletedRef.current) return;
      setCard(loaded);
      if (!deletedRef.current) {
        syncCardToApi(loaded).catch(() => {});
      }
    } catch {
      if (!deletedRef.current) {
        Alert.alert("Error", "Could not load card");
      }
    } finally {
      if (!deletedRef.current) {
        setLoading(false);
      }
    }
  }, [cardId]);

  const goToCards = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Cards" } }],
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (deletedRef.current) return;
      setLoading(true);
      loadCard();
    }, [loadCard])
  );

  const handleAddToWallet = async () => {
    if (!card) return;
    setDownloading(true);

    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const token = await currentUser.getIdToken();

      const url = getPassDownloadUrl(card.id);
      const localPath = `${FileSystem.cacheDirectory}${card.slug}.pkpass`;

      const download = await FileSystem.downloadAsync(url, localPath, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (download.status !== 200) throw new Error("Download failed");

      const canOpen = await Linking.canOpenURL(localPath);
      if (canOpen) {
        await Linking.openURL(localPath);
      } else {
        await Share.share({ url: localPath });
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not download pass");
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleSmartExchange = async (enabled: boolean) => {
    if (!card || updatingExchange) return;
    setUpdatingExchange(true);
    try {
      const updated = await updateCard(card.id, { allowSmartExchange: enabled });
      setCard(updated);
      await syncCardToApi(updated);
    } catch {
      Alert.alert("Error", "Could not update Smart Exchange setting.");
    } finally {
      setUpdatingExchange(false);
    }
  };

  const performDelete = async () => {
    if (deleting) return;
    const id = route.params.cardId;
    setDeleting(true);
    deletedRef.current = true;
    setDeleteConfirmVisible(false);
    goToCards();
    try {
      await deleteCard(id);
      await deleteCardFromApi(id);
      notifyCardsChanged();
    } catch (e) {
      deletedRef.current = false;
      notifyCardsChanged();
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not delete card"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!card || deleting) return;
    setDeleteConfirmVisible(true);
  };

  const modal = (
    <Modal
      visible={deleteConfirmVisible}
      transparent
      animationType="fade"
      onRequestClose={() => !deleting && setDeleteConfirmVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this card?
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalBtn, pressed && styles.pressed]}
              onPress={() => setDeleteConfirmVisible(false)}
              disabled={deleting}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalBtn,
                styles.modalDeleteBtn,
                pressed && styles.pressed,
                deleting && styles.disabled,
              ]}
              onPress={performDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalDeleteText}>Delete</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={BRAND.primary} />
        </View>
        {modal}
      </>
    );
  }

  if (!card) {
    return (
      <>
        <View style={[styles.container, styles.center]}>
          <Text style={styles.errorText}>Card not found</Text>
        </View>
        {modal}
      </>
    );
  }

  const isBusinessCard = card.templateId === "business";
  const shareUrl = card.publicUrl ?? getCardPublicUrl(card.slug);
  const displayName = card.name || card.business || "Your Card";

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CardDetailPreview card={card} />

      <Pressable
        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        onPress={() =>
          navigation.navigate("CardEditor", {
            templateId: card.templateId,
            cardId: card.id,
          })
        }
      >
        <Text style={styles.editButtonText}>Edit card</Text>
      </Pressable>

      {isBusinessCard ? (
        <>
          <SmartExchangeSection
            displayName={displayName}
            publicUrl={shareUrl}
            onAddToWallet={handleAddToWallet}
            walletLoading={downloading}
          />
          <View style={styles.settingsCard}>
            <Text style={styles.settingsHint}>
              Present your card on your phone. They open your link, save your details, and can
              share theirs back if you allow Smart Exchange.
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Allow Smart Exchange</Text>
              </View>
              <Switch
                value={card.allowSmartExchange}
                onValueChange={handleToggleSmartExchange}
                disabled={updatingExchange}
                trackColor={{ false: BRAND.border, true: BRAND.text }}
                thumbColor="#ffffff"
                ios_backgroundColor={BRAND.border}
              />
            </View>
          </View>
        </>
      ) : (
        <SmartExchangeSection
          displayName={displayName}
          publicUrl={shareUrl}
          onAddToWallet={handleAddToWallet}
          walletLoading={downloading}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
          deleting && styles.disabled,
        ]}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color={BRAND.error} size="small" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete card</Text>
        )}
      </Pressable>
    </ScrollView>
    {modal}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 48 },
  editButton: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: BRAND.card,
  },
  editButtonText: { color: BRAND.text, fontWeight: "600", fontSize: 16 },
  settingsHint: {
    fontSize: 14,
    color: BRAND.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 16,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: "600", color: BRAND.text },
  deleteButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: BRAND.error,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    backgroundColor: BRAND.card,
  },
  deleteButtonText: {
    color: BRAND.error,
    fontWeight: "700",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: BRAND.card,
    borderRadius: 16,
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: BRAND.text,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND.text,
  },
  modalDeleteBtn: {
    backgroundColor: BRAND.error,
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  errorText: { color: BRAND.error, fontSize: 16 },
});
