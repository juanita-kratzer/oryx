import { FirebaseAuthTypes, getAuth } from "./firebase.web";

export type AuthCredential = {
  email: string;
  password: string;
  providerId: string;
};

export const EmailAuthProvider = {
  credential(email: string, password: string): AuthCredential {
    return { email: email.trim(), password, providerId: "password" };
  },
};

function getCurrentUser(): FirebaseAuthTypes.User {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("You must be signed in to update your account.");
  }
  return user;
}

export async function reauthenticateWithPassword(
  currentPassword: string
): Promise<void> {
  const user = getCurrentUser();
  const email = user.email;
  if (!email) {
    throw new Error("Your account does not have an email address.");
  }

  const credential = EmailAuthProvider.credential(email, currentPassword);
  await user.reauthenticateWithCredential(credential);
}

export async function updateAccountEmail(
  newEmail: string,
  currentPassword: string
): Promise<void> {
  await reauthenticateWithPassword(currentPassword);
  const user = getCurrentUser();
  await user.updateEmail(newEmail.trim());
}

export async function updateAccountPassword(
  newPassword: string,
  currentPassword: string
): Promise<void> {
  await reauthenticateWithPassword(currentPassword);
  const user = getCurrentUser();
  await user.updatePassword(newPassword);
}
