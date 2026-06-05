import React, { useEffect, useState } from "react";
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
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";

let Purchases: typeof import("react-native-purchases").default | null = null;
try {
  Purchases = require("react-native-purchases").default;
} catch (e) {
  console.warn("RevenueCat module failed to load:", e);
}
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchCard, markCardPaid, getPassDownloadUrl } from "../lib/firestore";
import { getAuth } from "../lib/firebase";
import { BRAND } from "../constants/colors";
import type { RootStackParamList, Card } from "../types";

const PRODUCT_ID = "com.oryx.per.card.consumable";

type Props = NativeStackScreenProps<RootStackParamList, "CardDelivery">;

export function CardDeliveryScreen({ route, navigation }: Props) {
  const { cardId } = route.params;
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCard(cardId)
      .then(setCard)
      .catch(() => Alert.alert("Error", "Could not load card"))
      .finally(() => setLoading(false));
  }, [cardId]);

  const handlePurchase = async () => {
    if (!card || purchasing) return;
    setPurchasing(true);

    try {
      if (!Purchases) {
        throw new Error("In-app purchases are not available right now.");
      }
      const products = await Purchases.getProducts([PRODUCT_ID]);
      if (products.length === 0) {
        throw new Error("Product not available. Please try again later.");
      }

      const { customerInfo } = await Purchases.purchaseStoreProduct(products[0]);

      const transaction = customerInfo.nonSubscriptionTransactions?.find(
        (t) => t.productIdentifier === PRODUCT_ID
      );
      const transactionId =
        transaction?.transactionIdentifier ??
        customerInfo.originalAppUserId ??
        `rc_${Date.now()}`;

      const updated = await markCardPaid(card.id, transactionId);
      setCard(updated);
    } catch (e: any) {
      if (e.userCancelled) return;
      Alert.alert(
        "Purchase Failed",
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleAddToWallet = async () => {
    if (!card || card.status !== "PAID") return;
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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    );
  }

  const isDraft = card.status === "DRAFT";
  const landingUrl = `${process.env.EXPO_PUBLIC_APP_URL || "https://oryx.app"}/c/${card.slug}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Card preview */}
      <View style={[styles.previewCard, { backgroundColor: card.backgroundColor || "#1a1a2e" }]}>
        <Text style={styles.previewName}>{card.name || card.business || "Your Card"}</Text>
        {card.business && card.name && (
          <Text style={styles.previewBusiness}>{card.business}</Text>
        )}
        <Text style={styles.previewTemplate}>{card.template.name}</Text>
      </View>

      {isDraft ? (
        <>
          <Text style={styles.sectionTitle}>Complete Your Purchase</Text>
          <Text style={styles.sectionDesc}>
            Pay once to activate your card. Add it to Apple Wallet, share via NFC,
            and edit anytime at no extra cost.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.purchaseButton,
              pressed && styles.pressed,
              purchasing && styles.disabled,
            ]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.purchaseButtonText}>Purchase — $4.99</Text>
            )}
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Your card is ready!</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.walletButton, pressed && styles.pressed, downloading && styles.disabled]}
            onPress={handleAddToWallet}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.walletButtonText}>Add to Apple Wallet</Text>
            )}
          </Pressable>

          <View style={styles.nfcSection}>
            <Text style={styles.sectionTitle}>Link to NFC Tag</Text>
            <Text style={styles.sectionDesc}>
              Write this URL to any NFC tag. When someone taps it, they&apos;ll see your card.
            </Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} selectable>{landingUrl}</Text>
            </View>
            <Pressable
              style={styles.copyButton}
              onPress={() => {
                Share.share({ message: landingUrl });
              }}
            >
              <Text style={styles.copyButtonText}>Share Link</Text>
            </Pressable>
          </View>
        </>
      )}

      <Pressable
        style={styles.doneButton}
        onPress={() => navigation.navigate("Main")}
      >
        <Text style={styles.doneButtonText}>Go to My Cards</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 48 },
  previewCard: {
    borderRadius: 16,
    padding: 28,
    marginBottom: 24,
    minHeight: 120,
    justifyContent: "flex-end",
  },
  previewName: { fontSize: 24, fontWeight: "700", color: "#fff" },
  previewBusiness: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  previewTemplate: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: BRAND.text, marginBottom: 8 },
  sectionDesc: { fontSize: 15, color: BRAND.textSecondary, lineHeight: 22, marginBottom: 16 },
  purchaseButton: {
    backgroundColor: BRAND.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  purchaseButtonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  successBanner: {
    backgroundColor: "#d1fae5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  successText: { color: "#065f46", fontWeight: "600", fontSize: 16, textAlign: "center" },
  walletButton: {
    backgroundColor: BRAND.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  walletButtonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  nfcSection: { marginBottom: 24 },
  urlBox: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  urlText: { fontSize: 14, color: BRAND.accent, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  copyButton: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  copyButtonText: { color: BRAND.text, fontWeight: "600", fontSize: 15 },
  doneButton: { paddingVertical: 14, alignItems: "center", marginTop: 8 },
  doneButtonText: { color: BRAND.accent, fontWeight: "600", fontSize: 16 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  errorText: { color: BRAND.error, fontSize: 16 },
});
