import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { SignInScreen } from "./src/screens/SignInScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { MyCardsScreen } from "./src/screens/MyCardsScreen";
import { TemplateGalleryScreen } from "./src/screens/TemplateGalleryScreen";
import { EditorScreen } from "./src/editor/EditorScreen";
import { CardDeliveryScreen } from "./src/screens/CardDeliveryScreen";
import { ExchangeListScreen } from "./src/screens/ExchangeListScreen";
import { ExchangeDetailScreen } from "./src/screens/ExchangeDetailScreen";
import { ScanCardScreen } from "./src/screens/ScanCardScreen";
import { ReviewScannedContactScreen } from "./src/screens/ReviewScannedContactScreen";
import { ScannedContactsScreen } from "./src/screens/ScannedContactsScreen";
import { BRAND } from "./src/constants/colors";
import type { RootStackParamList } from "./src/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MyCardsScreen} />
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
            component={EditorScreen}
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
              title: "Your Card",
              headerBackTitle: "Back",
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
              title: "Scan Card",
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
            name="ScannedContacts"
            component={ScannedContactsScreen}
            options={{
              headerShown: true,
              title: "My Contacts",
              headerBackTitle: "Back",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND.background,
  },
});
