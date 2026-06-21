export namespace FirebaseAuthTypes {
  export interface AuthCredential {
    email: string;
    password: string;
    providerId: string;
  }

  export interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
    getIdToken(): Promise<string>;
    reauthenticateWithCredential(credential: AuthCredential): Promise<void>;
    updateEmail(email: string): Promise<void>;
    updatePassword(password: string): Promise<void>;
  }
}

const AUTH_STORAGE_KEY = "oryx-web-auth";
const CREDENTIALS_STORAGE_KEY = "oryx-web-credentials";

type AuthListener = (user: FirebaseAuthTypes.User | null) => void;

const listeners = new Set<AuthListener>();

function uidForEmail(email: string) {
  return `web-${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function loadStoredUser(): FirebaseAuthTypes.User | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      uid: string;
      email: string | null;
      displayName?: string | null;
    };
    return createUser(parsed.email ?? "", parsed.uid);
  } catch {
    return null;
  }
}

function loadCredentials(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCredentials(credentials: Record<string, string>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
}

function getStoredPassword(email: string): string | undefined {
  return loadCredentials()[normalizeEmail(email)];
}

function setStoredPassword(email: string, password: string) {
  const credentials = loadCredentials();
  credentials[normalizeEmail(email)] = password;
  saveCredentials(credentials);
}

function removeStoredPassword(email: string) {
  const credentials = loadCredentials();
  delete credentials[normalizeEmail(email)];
  saveCredentials(credentials);
}

function authError(code: string, message: string) {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

function createUser(email: string, uid?: string): FirebaseAuthTypes.User {
  const normalized = normalizeEmail(email);

  return {
    uid: uid ?? uidForEmail(normalized),
    email: normalized,
    displayName: null,
    async getIdToken() {
      return "web-preview-token";
    },
    async reauthenticateWithCredential(credential) {
      if (currentUser?.email !== normalizeEmail(credential.email)) {
        throw authError("auth/user-mismatch", "Email does not match signed-in user.");
      }
      const stored = getStoredPassword(credential.email);
      if (!stored || stored !== credential.password) {
        throw authError("auth/wrong-password", "Incorrect password.");
      }
    },
    async updateEmail(newEmail) {
      const nextEmail = normalizeEmail(newEmail);
      const password = getStoredPassword(normalized);
      if (!password) {
        throw authError(
          "auth/requires-recent-login",
          "Sign in again before changing your email."
        );
      }
      removeStoredPassword(normalized);
      setStoredPassword(nextEmail, password);
      setUser(createUser(nextEmail));
    },
    async updatePassword(newPassword) {
      if (!newPassword || newPassword.length < 6) {
        throw authError(
          "auth/weak-password",
          "Password must be at least 6 characters."
        );
      }
      setStoredPassword(normalized, newPassword);
    },
  };
}

function persistUser(user: FirebaseAuthTypes.User | null) {
  if (typeof localStorage === "undefined") return;
  if (user) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? null,
      })
    );
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

let currentUser: FirebaseAuthTypes.User | null = loadStoredUser();

function notify() {
  for (const listener of listeners) {
    listener(currentUser);
  }
}

function setUser(user: FirebaseAuthTypes.User | null) {
  currentUser = user;
  persistUser(user);
  notify();
}

const authApi = {
  get currentUser() {
    return currentUser;
  },
  onAuthStateChanged(listener: AuthListener) {
    listener(currentUser);
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async signInWithEmailAndPassword(email: string, password: string) {
    const normalized = normalizeEmail(email);
    const stored = getStoredPassword(normalized);
    if (!stored || stored !== password) {
      throw authError("auth/wrong-password", "Incorrect email or password.");
    }
    const user = createUser(normalized);
    setUser(user);
    return { user };
  },
  async createUserWithEmailAndPassword(email: string, password: string) {
    const normalized = normalizeEmail(email);
    if (getStoredPassword(normalized)) {
      throw authError("auth/email-already-in-use", "Email already in use.");
    }
    setStoredPassword(normalized, password);
    const user = createUser(normalized);
    setUser(user);
    return { user };
  },
  async signOut() {
    setUser(null);
  },
};

export const auth = () => authApi;
export const firestore = {
  FieldValue: {
    serverTimestamp: () => new Date(),
  },
};

export function getAuth() {
  return authApi;
}

export function getFirestore() {
  throw new Error("Use firestore.web data layer on web preview");
}

export function getStorage() {
  return {
    ref: (path: string) => ({
      putFile: async (uri: string) => {},
      getDownloadURL: async () => uriFromPath(path),
      delete: async () => {},
    }),
  };
}

function uriFromPath(path: string) {
  return `https://placeholder.oryx.dev/${encodeURIComponent(path)}`;
}
