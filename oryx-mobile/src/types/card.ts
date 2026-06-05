export type BackgroundConfig = {
  mode: "color" | "image";
  color: string;
  imageUri: string | null;
  overlayOpacity: number;
};

export type ThemeConfig = {
  primaryTextColor: string;
  secondaryTextColor: string;
  dividerColor: string;
  accentColor: string;
};

export type FontConfig = {
  heading: string;
  body: string;
  accent: string;
};

export type TextProps = {
  content: string;
  placeholder: string;
  fontFamily: string;
  fontSize: number;
  fontWeight:
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  maxLines: number;
  autoScale: boolean;
  opacity: number;
  lineHeight?: number;
};

export type ImageProps = {
  uri: string | null;
  placeholderText: string;
  borderRadius: number;
  objectFit: "cover" | "contain";
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed";
};

export type IconProps = {
  name: string;
  size: number;
  color: string;
  strokeWidth: number;
};

export type QRProps = {
  value: string;
  size: number;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
};

export type NFCProps = {
  label: string;
  value: string;
  style: "dashed" | "solid";
  iconColor: string;
  textColor: string;
  borderColor: string;
};

export type StampRowProps = {
  total: number;
  filled: number;
  filledStyle: "star" | "check" | "dot";
  filledColor: string;
  emptyColor: string;
  size: number;
};

export type ShapeProps = {
  shapeType: "rect" | "circle" | "line" | "dashedLine";
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
  borderRadius: number;
};

export type PerforationProps = {
  color: string;
  dotSize: number;
  gap: number;
  cutoutRadius: number;
};

export type CardElementType =
  | "text"
  | "image"
  | "icon"
  | "qr"
  | "nfc"
  | "divider"
  | "shape"
  | "stampRow"
  | "perforation";

export type CardElement = {
  id: string;
  type: CardElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  rotation: number;

  text?: TextProps;
  image?: ImageProps;
  icon?: IconProps;
  qr?: QRProps;
  nfc?: NFCProps;
  stampRow?: StampRowProps;
  shape?: ShapeProps;
  perforation?: PerforationProps;
};

export type CardDocument = {
  templateId: string;
  canvasWidth: number;
  canvasHeight: number;
  background: BackgroundConfig;
  theme: ThemeConfig;
  fonts: FontConfig;
  elements: CardElement[];
};

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 1200;

export const DEFAULT_THEME: ThemeConfig = {
  primaryTextColor: "#000000",
  secondaryTextColor: "#CFCFCF",
  dividerColor: "#D9D9D9",
  accentColor: "#000000",
};

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  mode: "color",
  color: "#FFFFFF",
  imageUri: null,
  overlayOpacity: 0,
};

export const DEFAULT_FONTS: FontConfig = {
  heading: "System",
  body: "System",
  accent: "System",
};
