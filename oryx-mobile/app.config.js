require("dotenv").config();

const appleTeamId = process.env.APPLE_TEAM_ID || "D4H4BX9XXY";

const googleReversedClientId =
  "com.googleusercontent.apps.761069329191-hulog7mb3kp2f45fvcr2kq718oi1ue0l";

export default {
  expo: {
    name: "Oryx",
    slug: "oryx-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
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
        NSCameraUsageDescription: "Oryx needs camera access to scan business cards and membership barcodes.",
        NSAppTransportSecurity: {
          NSAllowsLocalNetworking: true,
        },
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [googleReversedClientId],
          },
          {
            CFBundleURLSchemes: ["oryx"],
          },
        ],
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
      [
        "expo-camera",
        {
          cameraPermission:
            "Oryx needs camera access to scan QR codes and barcodes on membership cards.",
        },
      ],
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
      "@react-native-google-signin/google-signin",
      "./plugins/withXcodeSettings",
      "./plugins/withFmtFix",
      "./plugins/withFirebase",
    ],
    extra: {
      revenuecatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
      appUrl: process.env.EXPO_PUBLIC_APP_URL,
    },
  },
};
