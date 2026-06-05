import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

export { auth, firestore, storage };
export type { FirebaseAuthTypes };

export function getAuth() {
  return auth();
}

export function getFirestore() {
  return firestore();
}

export function getStorage() {
  return storage();
}
