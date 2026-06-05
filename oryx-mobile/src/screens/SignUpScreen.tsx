import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getAuth } from "../lib/firebase";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    email.trim().length > 0 &&
    confirmEmail.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase() &&
    password === confirmPassword;

  const handleSignUp = async () => {
    setError(null);

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError("Email addresses do not match");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await getAuth().createUserWithEmailAndPassword(email.trim(), password);
    } catch (e: any) {
      const msg = e?.message || "Sign up failed";
      setError(msg.replace(/\[.*?\]\s*/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up to create your digital cards
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={BRAND.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Confirm Email</Text>
        <TextInput
          style={[
            styles.input,
            confirmEmail.length > 0 &&
              email.trim().toLowerCase() !==
                confirmEmail.trim().toLowerCase() &&
              styles.inputError,
          ]}
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          placeholder="Re-enter your email"
          placeholderTextColor={BRAND.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Choose a password"
          placeholderTextColor={BRAND.textSecondary}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={[
            styles.input,
            confirmPassword.length > 0 &&
              password !== confirmPassword &&
              styles.inputError,
          ]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          placeholderTextColor={BRAND.textSecondary}
          secureTextEntry
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            (!canSubmit || loading) && styles.disabled,
          ]}
          onPress={handleSignUp}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SignIn")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { padding: 24, paddingTop: 80 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: BRAND.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: BRAND.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  label: { fontSize: 14, fontWeight: "600", color: BRAND.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: BRAND.card,
    marginBottom: 16,
    color: BRAND.text,
  },
  inputError: { borderColor: BRAND.error },
  error: {
    color: BRAND.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: BRAND.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: BRAND.textSecondary, fontSize: 14 },
  linkBold: { color: BRAND.accent, fontWeight: "600" },
});
