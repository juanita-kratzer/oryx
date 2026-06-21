export type BrandColors = {
  primary: string;
  primaryLight: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  onPrimary: string;
};

export const LIGHT_BRAND: BrandColors = {
  primary: "#111827",
  primaryLight: "#374151",
  accent: "#2563eb",
  background: "#f9fafb",
  card: "#ffffff",
  text: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  error: "#dc2626",
  success: "#059669",
  onPrimary: "#ffffff",
};

export const DARK_BRAND: BrandColors = {
  primary: "#f9fafb",
  primaryLight: "#e5e7eb",
  accent: "#60a5fa",
  background: "#111827",
  card: "#1f2937",
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  border: "#374151",
  error: "#f87171",
  success: "#34d399",
  onPrimary: "#111827",
};

/** Default static palette (light). Prefer `useTheme().colors` in screens. */
export const BRAND = LIGHT_BRAND;

export type ColorMode = "light" | "dark";

export function getBrandColors(mode: ColorMode): BrandColors {
  return mode === "dark" ? DARK_BRAND : LIGHT_BRAND;
}
