require("dotenv").config();

const appleTeamId = process.env.APPLE_TEAM_ID || "D4H4BX9XXY";

export default {
  expo: {
    name: "Oryx",
    slug: "oryx-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    scheme: "oryx",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.oryxjuanita.app",
      appleTeamId,
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        LSApplicationCategoryType: "public.app-category.business",
        ITSAppUsesNonExemptEncryption: false,
        NSContactsUsageDescription: "Oryx needs access to your contacts to save business card information.",
        NSCameraUsageDescription: "Oryx needs camera access to scan business cards.",
        NFCReaderUsageDescription:
          "Oryx writes your card link to NFC tags so people can tap your tag to open your card.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.oryxjuanita.app",
    },
    web: {
      bundler: "metro",
      output: "single",
    },
    plugins: [
      "expo-secure-store",
      "expo-image-picker",
      "expo-font",
      [
        "expo-contacts",
        {
          contactsPermission: "Allow Oryx to access your contacts to save scanned business card information.",
        },
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      "./plugins/withXcodeSettings",
      "./plugins/withFmtFix",
      "./plugins/withFirebase",
      "react-native-nfc-manager",
    ],
    extra: {
      revenuecatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
      appUrl: process.env.EXPO_PUBLIC_APP_URL,
    },
  },
};
