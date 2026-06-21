import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { BrandColors } from "../constants/colors";
import type { MainTabParamList, RootStackParamList } from "../types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Account">,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Placeholder until card credits purchase flow is built. */
const CARD_CREDITS_PLACEHOLDER = 0;

function createStyles(colors: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingTop: 56, paddingBottom: 100 },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 20,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      alignItems: "center",
      marginBottom: 24,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: { color: colors.onPrimary, fontSize: 26, fontWeight: "700" },
    email: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    hint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowPressed: { opacity: 0.85 },
    rowLabel: { fontSize: 16, color: colors.text, fontWeight: "500" },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    rowChevron: { fontSize: 22, color: colors.textSecondary },
    signOutButton: {
      alignItems: "center",
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.error,
    },
  });
}

export function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const { user, loading, signOut } = useAuth();
  const { colors, isDark, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Account</Text>

      <View style={styles.profileCard}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.email?.[0] ?? "O").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.email}>{user?.email ?? "Signed in"}</Text>
            <Text style={styles.hint}>
              Your cards and contacts are saved to this account.
            </Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowLast,
            pressed && styles.rowPressed,
          ]}
          onPress={() => {}}
        >
          <Text style={styles.rowLabel}>Card Credits</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{CARD_CREDITS_PLACEHOLDER}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Light mode</Text>
          <Switch
            value={!isDark}
            onValueChange={(enabled) => setMode(enabled ? "light" : "dark")}
            trackColor={{ false: colors.border, true: colors.text }}
            thumbColor="#ffffff"
            ios_backgroundColor={colors.border}
          />
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Switch
            value={isDark}
            onValueChange={(enabled) => setMode(enabled ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.text }}
            thumbColor="#ffffff"
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => navigation.navigate("EditEmail")}
        >
          <Text style={styles.rowLabel}>Change Email</Text>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowLast,
            pressed && styles.rowPressed,
          ]}
          onPress={() => navigation.navigate("EditPassword")}
        >
          <Text style={styles.rowLabel}>Change Password</Text>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && styles.rowPressed]}
        onPress={signOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}
