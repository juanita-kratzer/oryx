import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BRAND } from "../constants/colors";
import {
  formatGoogleSignInError,
  isGoogleSignInAvailable,
  signInWithGoogle,
} from "../lib/googleSignIn";
import { formatFirebaseAuthError } from "../lib/firebaseAuthErrors";

type Props = {
  disabled?: boolean;
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ disabled, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const googleMsg = formatGoogleSignInError(e);
      const firebaseMsg = formatFirebaseAuthError(e);
      const message = googleMsg || firebaseMsg;
      if (message) {
        onError?.(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isGoogleSignInAvailable()) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={BRAND.text} />
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.webButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.webButtonText}>Continue with Google</Text>
    </Pressable>
  );
}

export function AuthDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  webButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.card,
    alignItems: "center",
    justifyContent: "center",
  },
  webButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND.text,
  },
  loadingWrap: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND.border,
  },
  dividerText: {
    color: BRAND.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
