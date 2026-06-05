import React, { useMemo, useReducer, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getTemplateFactory, TEMPLATE_REGISTRY } from "../templates";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { InspectorPanel } from "./InspectorPanel";
import { AddElementPanel } from "./AddElementPanel";
import { BackgroundSheet } from "./BackgroundSheet";
import { FontPickerSheet } from "./FontPickerSheet";
import { FontPairingSheet } from "./FontPairingSheet";
import { editorReducer, createInitialEditorState } from "./editorReducer";
import { createCard } from "../lib/firestore";
import { publishBusinessCard } from "../lib/exchanges";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

type BottomPanel =
  | "none"
  | "inspector"
  | "addElement"
  | "background"
  | "fontPicker"
  | "fontPairings";

export function EditorScreen({ route, navigation }: Props) {
  const { templateId } = route.params;
  const factory = getTemplateFactory(templateId);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const initialDoc = useMemo(() => (factory ? factory() : null), [factory]);

  const [state, dispatch] = useReducer(
    editorReducer,
    initialDoc!,
    createInitialEditorState
  );

  const [bottomPanel, setBottomPanel] = useState<BottomPanel>("none");
  const [saving, setSaving] = useState(false);

  const canvasWidth = Math.min(screenWidth - 32, 380);

  const selectedElement = state.selectedElementId
    ? state.document.elements.find((e) => e.id === state.selectedElementId)
    : null;

  const wrappedDispatch = useCallback(
    (action: any) => {
      if (action.type === "SELECT_ELEMENT") {
        dispatch({ type: "SELECT_ELEMENT", elementId: action.elementId });
        if (action.openInspector === false) {
          // Visual selection only — don't change panel
        } else if (action.elementId) {
          setBottomPanel("inspector");
        } else {
          setBottomPanel("none");
        }
      } else {
        dispatch(action);
      }
    },
    [dispatch]
  );

  const handleSave = async () => {
    if (!state.document) return;
    setSaving(true);

    try {
      const doc = state.document;
      const fieldValues: Record<string, string> = {};
      let name: string | undefined;
      let business: string | undefined;
      let phone: string | undefined;
      let email: string | undefined;
      let website: string | undefined;

      for (const el of doc.elements) {
        if (el.type === "text" && el.text?.content) {
          if (el.id === "personName" || el.id === "memberName")
            name = el.text.content;
          else if (el.id === "businessName") business = el.text.content;
          else if (el.id === "emailValue") email = el.text.content;
          else if (el.id === "phoneValue") phone = el.text.content;
          else if (el.id === "websiteValue") website = el.text.content;
          else fieldValues[el.id] = el.text.content;
        }
      }

      const card = await createCard({
        templateId: doc.templateId,
        name,
        business,
        phone,
        email,
        website,
        fieldValues:
          Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
        backgroundColor: doc.background.color,
      });

      if (doc.templateId === "business") {
        const exchangeUrl = `https://oryx-wallet-cards.web.app/x/${card.id}`;

        await publishBusinessCard(card.id, {
          fullName: name || "",
          phone: phone || "",
          email: email || "",
          jobTitle: fieldValues["jobTitle"] || "",
          company: business || "",
          website: website || "",
          cardDesign: {
            backgroundColor: doc.background.color,
            logoUrl: null,
          },
        });

        // QR and NFC values are set in publicCards — the card itself stores the exchange URL in Firestore
      }

      navigation.replace("CardDelivery", { cardId: card.id });
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to create card"
      );
    } finally {
      setSaving(false);
    }
  };

  const sheetMaxHeight = Math.round(screenHeight * 0.68);

  if (!initialDoc) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Template not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <EditorToolbar
        selectedElementId={state.selectedElementId}
        document={state.document}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
        dispatch={dispatch}
      />

      <View style={styles.canvasContainer}>
        <EditorCanvas
          document={state.document}
          selectedElementId={state.selectedElementId}
          width={canvasWidth}
          dispatch={wrappedDispatch}
        />
      </View>

      <View style={styles.actionBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionBarContent}
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionChip,
              bottomPanel === "addElement" && styles.actionChipActive,
              pressed && styles.actionChipPressed,
            ]}
            onPress={() =>
              setBottomPanel(
                bottomPanel === "addElement" ? "none" : "addElement"
              )
            }
          >
            <Text
              style={[
                styles.actionChipText,
                bottomPanel === "addElement" && styles.actionChipTextActive,
              ]}
            >
              + Add
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionChip,
              bottomPanel === "background" && styles.actionChipActive,
              pressed && styles.actionChipPressed,
            ]}
            onPress={() =>
              setBottomPanel(
                bottomPanel === "background" ? "none" : "background"
              )
            }
          >
            <Text
              style={[
                styles.actionChipText,
                bottomPanel === "background" && styles.actionChipTextActive,
              ]}
            >
              Background
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionChip,
              bottomPanel === "fontPicker" && styles.actionChipActive,
              pressed && styles.actionChipPressed,
            ]}
            onPress={() =>
              setBottomPanel(
                bottomPanel === "fontPicker" ? "none" : "fontPicker"
              )
            }
          >
            <Text
              style={[
                styles.actionChipText,
                bottomPanel === "fontPicker" && styles.actionChipTextActive,
              ]}
            >
              Fonts
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionChip,
              bottomPanel === "fontPairings" && styles.actionChipActive,
              pressed && styles.actionChipPressed,
            ]}
            onPress={() =>
              setBottomPanel(
                bottomPanel === "fontPairings" ? "none" : "fontPairings"
              )
            }
          >
            <Text
              style={[
                styles.actionChipText,
                bottomPanel === "fontPairings" && styles.actionChipTextActive,
              ]}
            >
              Pairings
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && styles.saveBtnPressed,
          saving && styles.saveBtnDisabled,
          { marginBottom: Math.max(12, insets.bottom) },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Get My Card"}
        </Text>
      </Pressable>

      {bottomPanel !== "none" && (
        <View style={styles.sheetOverlay} pointerEvents="box-none">
          {bottomPanel === "inspector" && selectedElement && (
            <InspectorPanel
              element={selectedElement}
              dispatch={dispatch}
              maxHeight={sheetMaxHeight}
            />
          )}
          {bottomPanel === "addElement" && (
            <AddElementPanel
              dispatch={dispatch}
              onDismiss={() => setBottomPanel("none")}
            />
          )}
          {bottomPanel === "background" && (
            <BackgroundSheet
              background={state.document.background}
              dispatch={dispatch}
              onDismiss={() => setBottomPanel("none")}
              maxHeight={sheetMaxHeight}
            />
          )}
          {bottomPanel === "fontPicker" && (
            <FontPickerSheet
              currentFont={state.document.fonts.heading}
              onSelect={(font) =>
                dispatch({ type: "SET_HEADING_FONT", font })
              }
              onDismiss={() => setBottomPanel("none")}
              maxHeight={sheetMaxHeight}
            />
          )}
          {bottomPanel === "fontPairings" && (
            <FontPairingSheet
              currentHeadingFont={state.document.fonts.heading}
              onApplyPairing={(heading, body) => {
                dispatch({ type: "SET_HEADING_FONT", font: heading });
                dispatch({ type: "SET_BODY_FONT", font: body });
              }}
              onDismiss={() => setBottomPanel("none")}
              maxHeight={sheetMaxHeight}
            />
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  canvasContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  actionBarWrapper: {
    height: 52,
  },
  actionBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  actionChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  actionChipActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  actionChipPressed: {
    opacity: 0.8,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.text,
  },
  actionChipTextActive: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 16,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  sheetOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  errorText: {
    color: BRAND.error,
    fontSize: 14,
  },
});
