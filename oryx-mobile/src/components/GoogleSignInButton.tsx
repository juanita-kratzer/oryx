import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  GoogleSigninButton as NativeGoogleSigninButton,
} from "@react-native-google-signin/google-signin";
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
    <NativeGoogleSigninButton
      size={NativeGoogleSigninButton.Size.Wide}
      color={NativeGoogleSigninButton.Color.Light}
      onPress={handlePress}
      disabled={disabled}
      style={styles.nativeButton}
    />
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
  nativeButton: {
    width: "100%",
    height: 48,
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
});
