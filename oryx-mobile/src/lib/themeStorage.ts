import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { ColorMode } from "../constants/colors";

const STORAGE_KEY = "oryx-color-mode";

export async function loadColorMode(): Promise<ColorMode> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage === "undefined") return "light";
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" ? "dark" : "light";
    }
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return value === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export async function saveColorMode(mode: ColorMode): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, mode);
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // preference not persisted
  }
}
