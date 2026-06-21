import auth from "@react-native-firebase/auth";
import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GOOGLE_IOS_CLIENT_ID } from "../constants/googleAuth";

let configured = false;

export function isGoogleSignInAvailable(): boolean {
  return true;
}

export function configureGoogleSignIn(): void {
  if (configured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    ...(webClientId ? { webClientId } : {}),
  });

  configured = true;
}

export async function signInWithGoogle(): Promise<void> {
  configureGoogleSignIn();

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
  }

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    return;
  }

  let idToken = response.data.idToken;
  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
  }

  if (!idToken) {
    throw new Error(
      "Google Sign-In did not return an ID token. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Firebase Console → Authentication → Google → Web client ID)."
    );
  }

  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
}

export function formatGoogleSignInError(error: unknown): string {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return "";
      case statusCodes.IN_PROGRESS:
        return "Sign in is already in progress.";
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return "Google Play Services is not available on this device.";
      default:
        break;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Google Sign-In failed.";
}
