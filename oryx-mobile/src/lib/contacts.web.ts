export const CONTACTS_UNAVAILABLE_MESSAGE =
  "Saving to Contacts is unavailable in this build. Reinstall the app from Xcode or run `npx expo run:ios` to rebuild with Contacts support.";

export type ContactRecord = {
  givenName?: string;
  familyName?: string;
  phones?: { label: string; number: string }[];
  emails?: { label: string; address: string }[];
  jobTitle?: string;
  company?: string;
};

export function isContactsAvailable() {
  return true;
}

export const Contact = {
  async create(_contact: ContactRecord) {
    return { id: "web-preview-contact" };
  },
};

export async function requestPermissionsAsync() {
  return { status: "granted" as const };
}

export async function presentContactPickerAsync() {
  return { type: "cancel" as const };
}

export async function addContactAsync(_contact: ContactRecord) {
  return { id: "web-preview-contact" };
}
