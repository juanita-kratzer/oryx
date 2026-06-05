import React, { useCallback, useMemo, useReducer, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createCard } from "../lib/firestore";
import { getTemplateFactory, TEMPLATE_REGISTRY } from "../templates";
import { CardRenderer } from "../engine/CardRenderer";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";
import type { CardDocument, CardElement } from "../types/card";

type Props = NativeStackScreenProps<RootStackParamList, "CardEditor">;

type DocAction =
  | { type: "SET_TEXT"; elementId: string; content: string }
  | { type: "SET_BG_COLOR"; color: string }
  | { type: "SET_STAMP_FILLED"; elementId: string; filled: number };

function docReducer(state: CardDocument, action: DocAction): CardDocument {
  switch (action.type) {
    case "SET_TEXT":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.elementId && el.text
            ? { ...el, text: { ...el.text, content: action.content } }
            : el
        ),
      };
    case "SET_BG_COLOR":
      return {
        ...state,
        background: { ...state.background, color: action.color, mode: "color" },
      };
    case "SET_STAMP_FILLED":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.elementId && el.stampRow
            ? {
                ...el,
                stampRow: { ...el.stampRow, filled: action.filled },
              }
            : el
        ),
      };
    default:
      return state;
  }
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#1A1A2E",
  "#16213E",
  "#0F3460",
  "#533483",
  "#E94560",
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#EC4899",
  "#F5F5F4",
  "#D4D4D8",
  "#78716C",
];

function EditableFields({
  doc,
  dispatch,
}: {
  doc: CardDocument;
  dispatch: React.Dispatch<DocAction>;
}) {
  const editableTextElements = doc.elements.filter(
    (el) => el.type === "text" && !el.locked && el.visible && el.text
  );

  const stampElements = doc.elements.filter(
    (el) => el.type === "stampRow" && el.stampRow
  );

  return (
    <>
      {editableTextElements.map((el) => (
        <View key={el.id} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            {el.text!.placeholder || el.id}
          </Text>
          <TextInput
            style={styles.input}
            value={el.text!.content}
            onChangeText={(text) =>
              dispatch({ type: "SET_TEXT", elementId: el.id, content: text })
            }
            placeholder={el.text!.placeholder}
            placeholderTextColor={BRAND.textSecondary}
          />
        </View>
      ))}
      {stampElements.map((el) => (
        <View key={el.id} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Stamps Filled ({el.stampRow!.filled} / {el.stampRow!.total})
          </Text>
          <View style={styles.stampControls}>
            {Array.from({ length: el.stampRow!.total + 1 }, (_, i) => (
              <Pressable
                key={i}
                style={[
                  styles.stampBtn,
                  el.stampRow!.filled === i && styles.stampBtnActive,
                ]}
                onPress={() =>
                  dispatch({
                    type: "SET_STAMP_FILLED",
                    elementId: el.id,
                    filled: i,
                  })
                }
              >
                <Text
                  style={[
                    styles.stampBtnText,
                    el.stampRow!.filled === i && styles.stampBtnTextActive,
                  ]}
                >
                  {i}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export function CardEditorScreen({ route, navigation }: Props) {
  const { templateId } = route.params;
  const factory = getTemplateFactory(templateId);
  const templateInfo = TEMPLATE_REGISTRY.find((t) => t.id === templateId);
  const { width: screenWidth } = useWindowDimensions();

  const initialDoc = useMemo(() => {
    if (!factory) return null;
    return factory();
  }, [factory]);

  const [doc, dispatch] = useReducer(docReducer, initialDoc!);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewWidth = Math.min(screenWidth - 40, 360);

  const handleCreate = async () => {
    if (!doc) return;
    setSaving(true);
    setError(null);

    try {
      const fieldValues: Record<string, string> = {};
      let name: string | undefined;
      let business: string | undefined;

      for (const el of doc.elements) {
        if (el.type === "text" && el.text?.content) {
          if (el.id === "personName" || el.id === "memberName")
            name = el.text.content;
          else if (el.id === "businessName") business = el.text.content;
          else fieldValues[el.id] = el.text.content;
        }
      }

      const card = await createCard({
        templateId: doc.templateId,
        name,
        business,
        fieldValues:
          Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
        backgroundColor: doc.background.color,
      });

      navigation.replace("CardDelivery", { cardId: card.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create card");
    } finally {
      setSaving(false);
    }
  };

  if (!initialDoc || !doc) {
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{templateInfo?.name || "Card Editor"}</Text>
        {templateInfo?.description && (
          <Text style={styles.subtitle}>{templateInfo.description}</Text>
        )}

        <View style={styles.previewContainer}>
          <CardRenderer document={doc} width={previewWidth} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <EditableFields doc={doc} dispatch={dispatch} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Colour</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorRow}
          >
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  c === "#FFFFFF" && styles.colorSwatchLight,
                  doc.background.color === c && styles.colorSelected,
                ]}
                onPress={() => dispatch({ type: "SET_BG_COLOR", color: c })}
              />
            ))}
          </ScrollView>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Get My Card</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "800", color: BRAND.text },
  subtitle: {
    fontSize: 14,
    color: BRAND.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 12,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.textSecondary,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: BRAND.card,
    color: BRAND.text,
  },
  stampControls: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  stampBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND.card,
  },
  stampBtnActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  stampBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND.text,
  },
  stampBtnTextActive: {
    color: "#FFFFFF",
  },
  colorRow: { marginTop: 4 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchLight: {
    borderColor: BRAND.border,
    borderWidth: 1,
  },
  colorSelected: {
    borderColor: BRAND.accent,
    borderWidth: 3,
  },
  errorText: {
    color: BRAND.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: BRAND.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
