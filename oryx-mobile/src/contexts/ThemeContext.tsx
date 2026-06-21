import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type BrandColors,
  type ColorMode,
  getBrandColors,
} from "../constants/colors";
import { loadColorMode, saveColorMode } from "../lib/themeStorage";

type ThemeContextType = {
  mode: ColorMode;
  colors: BrandColors;
  isDark: boolean;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadColorMode().then((stored) => {
      setModeState(stored);
      setReady(true);
    });
  }, []);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    saveColorMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: ColorMode = current === "dark" ? "light" : "dark";
      saveColorMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: getBrandColors(mode),
      isDark: mode === "dark",
      setMode,
      toggleMode,
      ready,
    }),
    [mode, setMode, toggleMode, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
