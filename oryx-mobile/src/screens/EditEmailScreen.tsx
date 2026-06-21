import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { sendVerificationCode, verifyEmailCode } from "../lib/authApi";
import { updateAccountEmail } from "../lib/accountAuth";
import { accountFormStyles as styles } from "../styles/accountFormStyles";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EditEmail">;
type Step = "details" | "verify";

export function EditEmailScreen({ navigation }: Props) {
  const { user } = useAuth();
  const currentEmail = user?.email?.trim().toLowerCase() ?? "";

  const [step, setStep] = useState<Step>("details");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailsMatch =
    newEmail.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const canSendCode =
    newEmail.trim().length > 0 &&
    confirmEmail.trim().length > 0 &&
    currentPassword.length > 0 &&
    emailsMatch &&
    newEmail.trim().toLowerCase() !== currentEmail;

  const handleSendCode = async () => {
    setError(null);
    setInfo(null);

    if (!emailsMatch) {
      setError("Email addresses do not match");
      return;
    }
    if (newEmail.trim().toLowerCase() === currentEmail) {
      setError("Enter a different email address");
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }

    setLoading(true);
    try {
      const { maskedEmail: masked } = await sendVerificationCode(
        newEmail.trim(),
        "change-email"
      );
      setMaskedEmail(masked);
      setCode("");
      setStep("verify");
      setResendCountdown(60);
      setInfo(
        "Enter the 6-digit code we sent to your new email. Check spam if you don't see it within a minute."
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { maskedEmail: masked } = await sendVerificationCode(
        newEmail.trim(),
        "change-email"
      );
      setMaskedEmail(masked);
      setResendCountdown(60);
      setInfo("A new code was sent. Check your inbox and spam folder.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    setError(null);
    setInfo(null);

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    setLoading(true);
    try {
      await verifyEmailCode(newEmail.trim(), code.trim());
      await updateAccountEmail(newEmail.trim(), currentPassword);
      Alert.alert("Email updated", "Your sign-in email has been changed.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not update email";
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
        <Text style={styles.subtitle}>
          {step === "details"
            ? `Current email: ${currentEmail || "—"}. We'll send a verification code to your new address.`
            : "Confirm your new email to finish the change."}
        </Text>

        {step === "details" ? (
          <>
            <Text style={styles.label}>New Email</Text>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Confirm New Email</Text>
            <TextInput
              style={[
                styles.input,
                confirmEmail.length > 0 && !emailsMatch && styles.inputError,
              ]}
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              placeholder="Re-enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Your current password"
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
                {maskedEmail || newEmail.trim().toLowerCase()}
              </Text>
              <Text style={styles.spamHint}>
                If you don&apos;t see the email within a minute, check your spam
                or junk folder (from contact@kratzerco.app).
              </Text>
            </View>

            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={(value) =>
                setCode(value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
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
              onPress={handleVerifyAndUpdate}
              disabled={code.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify & Update Email</Text>
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
                <Text style={styles.linkBold}>Change email address</Text>
              </Text>
            </Pressable>
          </>
        )}

        {info && <Text style={styles.info}>{info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
