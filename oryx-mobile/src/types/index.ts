import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ParsedContact } from "../lib/cardParser";

export type { ParsedContact };

export type Template = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  previewImageUrl: string | null;
  editableFields: EditableField[];
  colorOptions: ColorOption[] | null;
  defaultBgColor: string;
  premium: boolean;
};

export type EditableField = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
};

export type ColorOption = {
  label: string;
  value: string;
};

export type Card = {
  id: string;
  slug: string;
  templateId: string;
  status: "DRAFT" | "PAID";
  name: string | null;
  business: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  fieldValues: Record<string, string> | null;
  logoUrl: string | null;
  backgroundColor: string | null;
  purchaseId: string | null;
  allowSmartExchange: boolean;
  publicUrl?: string | null;
  nfcUrl?: string | null;
  qrUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    slug: string;
    name: string;
    category: string;
    thumbnailUrl?: string | null;
  };
  passes?: { id: string; fileUrl: string; platform: string }[];
};

export type MainTabParamList = {
  Contacts: undefined;
  Cards: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TemplateGallery: undefined;
  CardEditor: { templateId: string; cardId?: string };
  CardDelivery: { cardId: string };
  EditCard: { cardId: string };
  SmartExchanges: undefined;
  ExchangeDetail: {
    requestId?: string;
    lead?: import("../lib/exchangesApi").BusinessCardExchangeLead;
  };
  ScanCard: undefined;
  ReviewScannedContact: { parsed: ParsedContact; imageUri: string };
  EditEmail: undefined;
  EditPassword: undefined;
};
