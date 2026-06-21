import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { EditorScreen } from "../editor/EditorScreen";
import { BusinessCardCreateScreen } from "../screens/BusinessCardCreateScreen";
import { QrBarcodeCardCreateScreen } from "../screens/QrBarcodeCardCreateScreen";
import { QR_BARCODE_CARD_TEMPLATE_ID } from "../constants/cardTemplates";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

export function CardEditorRouter(props: Props) {
  const { templateId } = props.route.params;

  if (templateId === "business") {
    return <BusinessCardCreateScreen {...props} />;
  }

  if (templateId === QR_BARCODE_CARD_TEMPLATE_ID) {
    return <QrBarcodeCardCreateScreen {...props} />;
  }

  return <EditorScreen {...props} />;
}
