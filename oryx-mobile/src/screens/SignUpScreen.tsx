import React, { useState, useEffect } from "react";
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
import { sendVerificationCode, verifyEmailCode } from "../lib/authApi";
import { formatFirebaseAuthError } from "../lib/firebaseAuthErrors";
import { GoogleSignInButton, AuthDivider } from "../components/GoogleSignInButton";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;
type Step = "details" | "verify";

export function SignUpScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailsMatch =
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const canSendCode =
    email.trim().length > 0 &&
    confirmEmail.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    emailsMatch &&
    passwordsMatch &&
    password.length >= 6;

  const handleSendCode = async () => {
    setError(null);
    setInfo(null);

    if (!emailsMatch) {
      setError("Email addresses do not match");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { maskedEmail: masked } = await sendVerificationCode(email.trim());
      setMaskedEmail(masked);
      setCode("");
      setStep("verify");
      setResendCountdown(60);
      setInfo(
        "Enter the 6-digit code we emailed you. If you don't see it within a minute, check your spam or junk folder."
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { maskedEmail: masked } = await sendVerificationCode(email.trim());
      setMaskedEmail(masked);
      setResendCountdown(60);
      setInfo("A new code was sent. Check your inbox and spam folder.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not resend code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignUp = async () => {
    setError(null);
    setInfo(null);

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    setLoading(true);
    try {
      await verifyEmailCode(email.trim(), code.trim());
      await getAuth().createUserWithEmailAndPassword(email.trim(), password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign up failed";
      setError(formatFirebaseAuthError(e) || msg);
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
          {step === "details"
            ? "Sign up to create your digital cards"
            : "Confirm your email to finish signing up"}
        </Text>

        {step === "details" ? (
          <>
            <GoogleSignInButton
              disabled={loading}
              onError={(message) => setError(message)}
            />

            <AuthDivider />

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
                confirmEmail.length > 0 && !emailsMatch && styles.inputError,
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
                  !passwordsMatch &&
                  styles.inputError,
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={BRAND.textSecondary}
              secureTextEntry
              editable={!loading}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                (!canSendCode || loading) && styles.disabled,
              ]}
              onPress={handleSendCode}
              disabled={!canSendCode || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Enter the 6-digit code we emailed to:
              </Text>
              <Text style={styles.noticeEmail}>
                {maskedEmail || email.trim().toLowerCase()}
              </Text>
              <Text style={styles.spamHint}>
                You must enter the correct code to continue. If you don&apos;t
                see the email within a minute, check your spam or junk folder
                (from contact@kratzerco.app).
              </Text>
            </View>

            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={BRAND.textSecondary}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                (code.length !== 6 || loading) && styles.disabled,
              ]}
              onPress={handleVerifyAndSignUp}
              disabled={code.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify & Create Account</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleResendCode}
              disabled={loading || resendCountdown > 0}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                {resendCountdown > 0
                  ? `Resend code in ${resendCountdown}s`
                  : "Didn't get it? Resend code"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setStep("details");
                setError(null);
                setInfo(null);
              }}
              disabled={loading}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkBold}>Change email</Text>
              </Text>
            </Pressable>
          </>
        )}

        {info && <Text style={styles.info}>{info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

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
  notice: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 15,
    color: BRAND.text,
    lineHeight: 22,
  },
  noticeEmail: {
    fontWeight: "600",
  },
  spamHint: {
    fontSize: 13,
    color: BRAND.textSecondary,
    lineHeight: 20,
    marginTop: 10,
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
  codeInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
  },
  inputError: { borderColor: BRAND.error },
  info: {
    color: BRAND.accent,
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  error: {
    color: BRAND.error,
    fontSize: 14,
    marginTop: 16,
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
