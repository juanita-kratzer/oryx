import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "../../constants/colors";

type Props = {
  displayName: string;
  publicUrl: string;
  onAddToWallet?: () => void;
  walletLoading?: boolean;
};

export function SmartExchangeSection({
  displayName,
  publicUrl,
  onAddToWallet,
  walletLoading = false,
}: Props) {
  const shareMessage = `Here's my digital business card — ${displayName}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${shareMessage}\n${publicUrl}`,
        url: Platform.OS === "ios" ? publicUrl : undefined,
        title: displayName,
      });
    } catch {
      // user dismissed
    }
  };

  return (
    <View style={styles.section}>
      {onAddToWallet ? (
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.btnPressed,
            walletLoading && styles.btnDisabled,
          ]}
          onPress={onAddToWallet}
          disabled={walletLoading}
        >
          {walletLoading ? (
            <ActivityIndicator color={BRAND.primary} size="small" />
          ) : (
            <>
              <Ionicons name="wallet-outline" size={20} color={BRAND.primary} />
              <Text style={styles.secondaryBtnText}>Add to Apple Wallet</Text>
            </>
          )}
        </Pressable>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
        onPress={handleShare}
      >
        <Ionicons name="share-outline" size={20} color={BRAND.primary} />
        <Text style={styles.secondaryBtnText}>Share card</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: BRAND.background,
  },
  secondaryBtnText: {
    color: BRAND.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
