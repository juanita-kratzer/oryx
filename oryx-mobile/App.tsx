import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  type Theme as NavTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { SignInScreen } from "./src/screens/SignInScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { MainTabNavigator } from "./src/navigation/MainTabNavigator";
import { TemplateGalleryScreen } from "./src/screens/TemplateGalleryScreen";
import { CardEditorRouter } from "./src/navigation/CardEditorRouter";
import { CardDeliveryScreen } from "./src/screens/CardDeliveryScreen";
import { ExchangeListScreen } from "./src/screens/ExchangeListScreen";
import { ExchangeDetailScreen } from "./src/screens/ExchangeDetailScreen";
import { ScanCardScreen } from "./src/screens/ScanCardScreen";
import { ReviewScannedContactScreen } from "./src/screens/ReviewScannedContactScreen";
import { EditEmailScreen } from "./src/screens/EditEmailScreen";
import { EditPasswordScreen } from "./src/screens/EditPasswordScreen";
import type { RootStackParamList } from "./src/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function buildNavTheme(isDark: boolean, colors: ReturnType<typeof useTheme>["colors"]): NavTheme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="TemplateGallery"
            component={TemplateGalleryScreen}
            options={{
              headerShown: true,
              title: "Templates",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="CardEditor"
            component={CardEditorRouter}
            options={{
              headerShown: true,
              title: "Create Card",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="CardDelivery"
            component={CardDeliveryScreen}
            options={{
              headerShown: true,
              title: "Card",
              headerBackTitle: "Cards",
            }}
          />
          <Stack.Screen
            name="SmartExchanges"
            component={ExchangeListScreen}
            options={{
              headerShown: true,
              title: "Smart Exchanges",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="ExchangeDetail"
            component={ExchangeDetailScreen}
            options={{
              headerShown: true,
              title: "Exchange Request",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="ScanCard"
            component={ScanCardScreen}
            options={{
              headerShown: true,
              title: "Scan business card",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="ReviewScannedContact"
            component={ReviewScannedContactScreen}
            options={{
              headerShown: true,
              title: "Review Contact",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="EditEmail"
            component={EditEmailScreen}
            options={{
              headerShown: true,
              title: "Change Email",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="EditPassword"
            component={EditPasswordScreen}
            options={{
              headerShown: true,
              title: "Change Password",
              headerBackTitle: "Back",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ animationTypeForReplace: "pop" }}
          />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function ThemedApp() {
  const { isDark, colors } = useTheme();
  const navTheme = buildNavTheme(isDark, colors);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <View style={styles.app}>
            <AuthProvider>
              <ThemedApp />
            </AuthProvider>
          </View>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
