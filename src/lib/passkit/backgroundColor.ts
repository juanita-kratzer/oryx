/**
 * Validate and normalize card backgroundColor to Apple Wallet–compatible format.
 * Apple accepts rgb(r,g,b) and optionally hex. We normalize to rgb(r,g,b).
 */

const NAMED_COLORS: Record<string, string> = {
  white: "rgb(255, 255, 255)",
  black: "rgb(0, 0, 0)",
  red: "rgb(255, 0, 0)",
  green: "rgb(0, 128, 0)",
  blue: "rgb(0, 0, 255)",
  yellow: "rgb(255, 255, 0)",
  gray: "rgb(128, 128, 128)",
  grey: "rgb(128, 128, 128)",
  silver: "rgb(192, 192, 192)",
  maroon: "rgb(128, 0, 0)",
  olive: "rgb(128, 128, 0)",
  lime: "rgb(0, 255, 0)",
  aqua: "rgb(0, 255, 255)",
  teal: "rgb(0, 128, 128)",
  navy: "rgb(0, 0, 128)",
  fuchsia: "rgb(255, 0, 255)",
  purple: "rgb(128, 0, 128)",
  orange: "rgb(255, 165, 0)",
};

function hexToRgb(hex: string): string | null {
  const m = hex.replace(/^#/, "").match(/^([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/);
  if (!m) return null;
  return `rgb(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)})`;
}

function parseRgb(s: string): string | null {
  const m = s.match(/^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i);
  if (!m) return null;
  const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
  const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
  const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
  return `rgb(${r}, ${g}, ${b})`;
}

const DEFAULT = "rgb(255, 255, 255)";

/**
 * Returns Apple-compatible rgb(r, g, b) or default if invalid.
 */
export function normalizePassBackgroundColor(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return DEFAULT;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT;

  const lower = trimmed.toLowerCase();
  if (NAMED_COLORS[lower]) return NAMED_COLORS[lower];

  const rgb = parseRgb(trimmed);
  if (rgb) return rgb;

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    const rgbFromHex = hexToRgb(trimmed);
    if (rgbFromHex) return rgbFromHex;
  }

  return DEFAULT;
}
