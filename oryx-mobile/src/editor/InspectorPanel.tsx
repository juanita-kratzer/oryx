import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "../lib/imagePicker";
import type { CardElement } from "../types/card";
import type { EditorAction } from "../types/editor";
import { BRAND } from "../constants/colors";

type Props = {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
  maxHeight?: number;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800"] as const;
const ALIGNMENTS = ["left", "center", "right"] as const;

function TextInspector({
  element,
  dispatch,
}: {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const text = element.text!;

  return (
    <>
      <Section title="Text Content">
        <TextInput
          style={styles.input}
          value={text.content}
          onChangeText={(v) =>
            dispatch({ type: "UPDATE_TEXT", elementId: element.id, content: v })
          }
          placeholder={text.placeholder}
          placeholderTextColor={BRAND.textSecondary}
          multiline
        />
      </Section>

      <Section title="Typography">
        <Row label="Size">
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  elementId: element.id,
                  updates: {
                    text: { ...text, fontSize: Math.max(8, text.fontSize - 1) },
                  },
                })
              }
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{text.fontSize}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  elementId: element.id,
                  updates: {
                    text: {
                      ...text,
                      fontSize: Math.min(200, text.fontSize + 1),
                    },
                  },
                })
              }
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
        </Row>

        <Row label="Weight">
          <View style={styles.chipRow}>
            {FONT_WEIGHTS.map((w) => (
              <Pressable
                key={w}
                style={[
                  styles.chip,
                  text.fontWeight === w && styles.chipActive,
                ]}
                onPress={() =>
                  dispatch({
                    type: "UPDATE_ELEMENT",
                    elementId: element.id,
                    updates: { text: { ...text, fontWeight: w } },
                  })
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    text.fontWeight === w && styles.chipTextActive,
                  ]}
                >
                  {w}
                </Text>
              </Pressable>
            ))}
          </View>
        </Row>

        <Row label="Align">
          <View style={styles.chipRow}>
            {ALIGNMENTS.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.chip,
                  text.textAlign === a && styles.chipActive,
                ]}
                onPress={() =>
                  dispatch({
                    type: "UPDATE_ELEMENT",
                    elementId: element.id,
                    updates: { text: { ...text, textAlign: a } },
                  })
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    text.textAlign === a && styles.chipTextActive,
                  ]}
                >
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Row>

        <Row label="Spacing">
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  elementId: element.id,
                  updates: {
                    text: {
                      ...text,
                      letterSpacing: Math.max(0, text.letterSpacing - 0.5),
                    },
                  },
                })
              }
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>
              {text.letterSpacing.toFixed(1)}
            </Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() =>
                dispatch({
                  type: "UPDATE_ELEMENT",
                  elementId: element.id,
                  updates: {
                    text: {
                      ...text,
                      letterSpacing: Math.min(20, text.letterSpacing + 0.5),
                    },
                  },
                })
              }
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
        </Row>
      </Section>

      <Section title="Color">
        <TextInput
          style={styles.hexInput}
          value={text.color}
          onChangeText={(v) => {
            if (/^#[0-9a-fA-F]{0,8}$/.test(v)) {
              dispatch({
                type: "UPDATE_ELEMENT",
                elementId: element.id,
                updates: { text: { ...text, color: v } },
              });
            }
          }}
          placeholder="#000000"
          placeholderTextColor={BRAND.textSecondary}
          autoCapitalize="none"
        />
      </Section>
    </>
  );
}

async function pickImageForElement(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 2],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

function ImageInspector({
  element,
  dispatch,
}: {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const img = element.image!;
  const hasImage = !!img.uri;

  const handleChooseImage = async () => {
    const uri = await pickImageForElement();
    if (!uri) return;
    dispatch({
      type: "UPDATE_ELEMENT",
      elementId: element.id,
      updates: { image: { ...img, uri } },
    });
  };

  return (
    <Section title="Image">
      <Pressable style={styles.inspectorActionBtn} onPress={handleChooseImage}>
        <Text style={styles.inspectorActionBtnText}>
          {hasImage ? "Replace Image" : "Choose Image"}
        </Text>
      </Pressable>
      {hasImage && (
        <Pressable
          style={[styles.inspectorActionBtn, styles.inspectorActionBtnDanger]}
          onPress={() =>
            dispatch({
              type: "UPDATE_ELEMENT",
              elementId: element.id,
              updates: { image: { ...img, uri: null } },
            })
          }
        >
          <Text
            style={[
              styles.inspectorActionBtnText,
              styles.inspectorActionBtnDangerText,
            ]}
          >
            Remove Image
          </Text>
        </Pressable>
      )}
    </Section>
  );
}

function QRInspector({
  element,
  dispatch,
}: {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const qr = element.qr!;
  return (
    <Section title="QR Code">
      <TextInput
        style={styles.input}
        value={qr.value}
        onChangeText={(v) =>
          dispatch({
            type: "UPDATE_ELEMENT",
            elementId: element.id,
            updates: { qr: { ...qr, value: v } },
          })
        }
        placeholder="Enter URL or text"
        placeholderTextColor={BRAND.textSecondary}
      />
    </Section>
  );
}

function NFCInspector({
  element,
  dispatch,
}: {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const nfc = element.nfc!;
  return (
    <>
      <Section title="NFC URL or Data">
        <TextInput
          style={styles.input}
          value={nfc.value || ""}
          onChangeText={(v) =>
            dispatch({
              type: "UPDATE_ELEMENT",
              elementId: element.id,
              updates: { nfc: { ...nfc, value: v } },
            })
          }
          placeholder="https://example.com or payload data"
          placeholderTextColor={BRAND.textSecondary}
          autoCapitalize="none"
          keyboardType="url"
        />
      </Section>
      <Section title="NFC Label Text">
        <TextInput
          style={styles.input}
          value={nfc.label}
          onChangeText={(v) =>
            dispatch({
              type: "UPDATE_ELEMENT",
              elementId: element.id,
              updates: { nfc: { ...nfc, label: v } },
            })
          }
          placeholder="NFC"
          placeholderTextColor={BRAND.textSecondary}
        />
      </Section>
    </>
  );
}

function StampInspector({
  element,
  dispatch,
}: {
  element: CardElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const stamps = element.stampRow!;
  return (
    <Section title="Stamps">
      <Row label="Filled">
        <View style={styles.chipRow}>
          {Array.from({ length: stamps.total + 1 }, (_, i) => (
            <Pressable
              key={i}
              style={[styles.chip, stamps.filled === i && styles.chipActive]}
              onPress={() =>
                dispatch({
                  type: "SET_STAMP_FILLED",
                  elementId: element.id,
                  filled: i,
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  stamps.filled === i && styles.chipTextActive,
                ]}
              >
                {i}
              </Text>
            </Pressable>
          ))}
        </View>
      </Row>
    </Section>
  );
}

export function InspectorPanel({ element, dispatch, maxHeight }: Props) {
  const insets = useSafeAreaInsets();
  const resolvedHeight = maxHeight || 400;

  return (
    <View style={[styles.panel, { height: resolvedHeight }]}>
      <View style={styles.panelHandle} />
      <ScrollView
        style={styles.panelScroll}
        contentContainerStyle={[
          styles.panelContent,
          { paddingBottom: Math.max(32, insets.bottom + 16) },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Text style={styles.panelTitle}>
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} —{" "}
          {element.id}
        </Text>

        {element.type === "text" && element.text && (
          <TextInspector element={element} dispatch={dispatch} />
        )}
        {element.type === "image" && element.image && (
          <ImageInspector element={element} dispatch={dispatch} />
        )}
        {element.type === "qr" && element.qr && (
          <QRInspector element={element} dispatch={dispatch} />
        )}
        {element.type === "nfc" && element.nfc && (
          <NFCInspector element={element} dispatch={dispatch} />
        )}
        {element.type === "stampRow" && element.stampRow && (
          <StampInspector element={element} dispatch={dispatch} />
        )}

        <Section title="Position">
          <Row label="X">
            <Text style={styles.valueText}>{Math.round(element.x)}</Text>
          </Row>
          <Row label="Y">
            <Text style={styles.valueText}>{Math.round(element.y)}</Text>
          </Row>
          <Row label="W">
            <Text style={styles.valueText}>{Math.round(element.width)}</Text>
          </Row>
          <Row label="H">
            <Text style={styles.valueText}>{Math.round(element.height)}</Text>
          </Row>
        </Section>

        <Section title="Visibility">
          <Pressable
            style={styles.toggleBtn}
            onPress={() =>
              dispatch({
                type: "TOGGLE_VISIBILITY",
                elementId: element.id,
              })
            }
          >
            <Text style={styles.toggleBtnText}>
              {element.visible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  panelScroll: {
    flexShrink: 1,
  },
  panelContent: {
    padding: 16,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: BRAND.text,
    width: 60,
  },
  rowValue: {
    flex: 1,
    alignItems: "flex-end",
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    color: BRAND.text,
    minHeight: 40,
  },
  hexInput: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    color: BRAND.text,
    width: 120,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: BRAND.text,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND.text,
    minWidth: 40,
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  chipActive: {
    backgroundColor: BRAND.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.text,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  valueText: {
    fontSize: 13,
    fontWeight: "500",
    color: BRAND.textSecondary,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  toggleBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.text,
  },
  inspectorActionBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  inspectorActionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inspectorActionBtnDanger: {
    backgroundColor: "#FEE2E2",
  },
  inspectorActionBtnDangerText: {
    color: "#DC2626",
  },
});
