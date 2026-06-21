import type { Contact as ExpoContact } from "expo-contacts";

export type ContactRecord = {
  givenName?: string;
  familyName?: string;
  phones?: { label: string; number: string }[];
  emails?: { label: string; address: string }[];
  jobTitle?: string;
  company?: string;
  note?: string;
};

export const CONTACTS_UNAVAILABLE_MESSAGE =
  "Saving to Contacts is unavailable in this build. Reinstall the app from Xcode or run `npx expo run:ios` to rebuild with Contacts support.";

type ContactsModule = typeof import("expo-contacts");

let contactsModule: ContactsModule | null | undefined;

function loadContactsModule(): ContactsModule | null {
  if (contactsModule !== undefined) {
    return contactsModule;
  }

  try {
    // Lazy load so a missing native module does not crash at import time.
    contactsModule = require("expo-contacts") as ContactsModule;
    return contactsModule;
  } catch {
    contactsModule = null;
    return null;
  }
}

export function isContactsAvailable(): boolean {
  return loadContactsModule() !== null;
}

export const Contact = {
  async create(contact: ContactRecord) {
    const mod = loadContactsModule();
    if (!mod) {
      throw new Error(CONTACTS_UNAVAILABLE_MESSAGE);
    }

    const id = await mod.addContactAsync(contact as ExpoContact);
    return { id };
  },
};

export async function requestPermissionsAsync() {
  const mod = loadContactsModule();
  if (!mod) {
    return {
      status: "denied" as const,
      granted: false,
      canAskAgain: false,
      expires: "never" as const,
    };
  }

  return mod.requestPermissionsAsync();
}

export async function presentContactPickerAsync() {
  const mod = loadContactsModule();
  if (!mod) {
    return null;
  }

  return mod.presentContactPickerAsync();
}

export async function addContactAsync(contact: ContactRecord) {
  const mod = loadContactsModule();
  if (!mod) {
    throw new Error(CONTACTS_UNAVAILABLE_MESSAGE);
  }

  return mod.addContactAsync(contact as ExpoContact);
}
