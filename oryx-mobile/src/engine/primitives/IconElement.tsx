import React from "react";
import Svg, { Path, Circle, Rect, G, Line } from "react-native-svg";
import type { IconProps } from "../../types/card";

type Props = {
  config: IconProps;
  scale: number;
};

const ICONS: Record<string, (size: number, color: string, sw: number) => React.ReactNode> = {
  nfc: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Path d="M12 36V20a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v4a4 4 0 0 1-4 4h-4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="20" cy="32" r="4" stroke={c} strokeWidth={sw} />
    </Svg>
  ),
  ticket: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Path d="M4 18V10a2 2 0 0 1 2-2h36a2 2 0 0 1 2 2v8a4 4 0 0 0 0 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a4 4 0 0 0 0-8Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <Line x1="18" y1="8" x2="18" y2="38" stroke={c} strokeWidth={sw} strokeDasharray="4 3" />
    </Svg>
  ),
  tag: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Path d="M42.2 22.6 25.4 5.8A2 2 0 0 0 24 5.2H8a2 2 0 0 0-2 2V24c0 .5.2 1 .6 1.4l16.8 16.8a2 2 0 0 0 2.8 0l16-16a2 2 0 0 0 0-2.8Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <Circle cx="16" cy="16" r="3" fill={c} />
    </Svg>
  ),
  gift: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Rect x="4" y="18" width="40" height="24" rx="2" stroke={c} strokeWidth={sw} />
      <Rect x="6" y="10" width="36" height="8" rx="2" stroke={c} strokeWidth={sw} />
      <Line x1="24" y1="10" x2="24" y2="42" stroke={c} strokeWidth={sw} />
      <Path d="M24 10c-4-6-12-6-12 0" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M24 10c4-6 12-6 12 0" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  ),
  star: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Path d="M24 4l6.2 12.6L44 18.5l-10 9.8 2.4 13.7L24 35.6l-12.4 6.4L14 28.3 4 18.5l13.8-1.9Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    </Svg>
  ),
  starFilled: (s, c, _sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Path d="M24 4l6.2 12.6L44 18.5l-10 9.8 2.4 13.7L24 35.6l-12.4 6.4L14 28.3 4 18.5l13.8-1.9Z" fill={c} stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  ),
  calendar: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="10" width="36" height="32" rx="2" stroke={c} strokeWidth={sw} />
      <Line x1="6" y1="20" x2="42" y2="20" stroke={c} strokeWidth={sw} />
      <Line x1="16" y1="6" x2="16" y2="14" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="32" y1="6" x2="32" y2="14" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  ),
  info: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="20" stroke={c} strokeWidth={sw} />
      <Line x1="24" y1="22" x2="24" y2="34" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Circle cx="24" cy="15" r="1.5" fill={c} />
    </Svg>
  ),
  qr: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="6" width="14" height="14" rx="2" stroke={c} strokeWidth={sw} />
      <Rect x="28" y="6" width="14" height="14" rx="2" stroke={c} strokeWidth={sw} />
      <Rect x="6" y="28" width="14" height="14" rx="2" stroke={c} strokeWidth={sw} />
      <Rect x="10" y="10" width="6" height="6" rx="1" fill={c} />
      <Rect x="32" y="10" width="6" height="6" rx="1" fill={c} />
      <Rect x="10" y="32" width="6" height="6" rx="1" fill={c} />
      <Rect x="28" y="28" width="6" height="6" rx="1" fill={c} />
      <Rect x="38" y="28" width="4" height="4" fill={c} />
      <Rect x="28" y="38" width="4" height="4" fill={c} />
      <Rect x="38" y="38" width="4" height="4" fill={c} />
    </Svg>
  ),
  image: (s, c, sw) => (
    <Svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="10" width="36" height="28" rx="2" stroke={c} strokeWidth={sw} />
      <Circle cx="16" cy="20" r="3" stroke={c} strokeWidth={sw} />
      <Path d="M42 32l-10-10-14 14" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M28 36l-6-6-16 8" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
};

export function IconElement({ config, scale }: Props) {
  const size = config.size * scale;
  const sw = config.strokeWidth;
  const renderer = ICONS[config.name];
  if (!renderer) return null;
  return <>{renderer(size, config.color, sw)}</>;
}
