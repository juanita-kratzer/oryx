export function isGoogleSignInAvailable(): boolean {
  return false;
}

export function configureGoogleSignIn(): void {
  // no-op on web preview
}

export async function signInWithGoogle(): Promise<void> {
  throw new Error(
    "Google Sign-In is available in the iOS app. Use email sign-in in web preview."
  );
}

export function formatGoogleSignInError(error: unknown): string {
  return error instanceof Error ? error.message : "Google Sign-In failed.";
}
