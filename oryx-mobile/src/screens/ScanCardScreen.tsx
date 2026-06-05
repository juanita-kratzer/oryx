import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MlkitOcr from "react-native-mlkit-ocr";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { parseBusinessCardText } from "../lib/cardParser";
import { BRAND } from "../constants/colors";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ScanCardScreen() {
  const navigation = useNavigation<Nav>();
  const [processing, setProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to scan business cards."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    processImage(uri);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to select a business card image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    processImage(uri);
  };

  const processImage = async (uri: string) => {
    setProcessing(true);
    try {
      const ocrResult = await MlkitOcr.detectFromUri(uri);
      const lines = ocrResult.map((block: any) => block.text);

      if (lines.length === 0) {
        Alert.alert(
          "No Text Detected",
          "Could not read any text from this image. Please try again with a clearer photo."
        );
        setProcessing(false);
        return;
      }

      const parsed = parseBusinessCardText(lines);
      navigation.navigate("ReviewScannedContact", { parsed, imageUri: uri });
    } catch (e) {
      Alert.alert(
        "Scan Failed",
        "An error occurred while scanning. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {imageUri && processing ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Scanning card...</Text>
            </View>
          </View>
        ) : (
          <View style={styles.promptContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📇</Text>
            </View>
            <Text style={styles.title}>Scan a Business Card</Text>
            <Text style={styles.subtitle}>
              Take a photo or select an image of a business card to extract
              contact information.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
              processing && styles.btnDisabled,
            ]}
            onPress={takePhoto}
            disabled={processing}
          >
            <Text style={styles.primaryBtnText}>Take Photo</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
              processing && styles.btnDisabled,
            ]}
            onPress={pickFromLibrary}
            disabled={processing}
          >
            <Text style={styles.secondaryBtnText}>Choose from Library</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  promptContainer: { alignItems: "center", marginBottom: 48 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconText: { fontSize: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    aspectRatio: 1.6,
    borderRadius: 16,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  processingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 12,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtn: {
    backgroundColor: BRAND.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  btnPressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtnText: { color: BRAND.text, fontWeight: "600", fontSize: 16 },
});
