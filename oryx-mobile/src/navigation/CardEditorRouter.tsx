import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { EditorScreen } from "../editor/EditorScreen";
import { BusinessCardCreateScreen } from "../screens/BusinessCardCreateScreen";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

export function CardEditorRouter(props: Props) {
  const { templateId } = props.route.params;

  if (templateId === "business") {
    return <BusinessCardCreateScreen {...props} />;
  }

  return <EditorScreen {...props} />;
}
