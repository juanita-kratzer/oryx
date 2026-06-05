import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import type { PerforationProps } from "../../types/card";

type Props = {
  config: PerforationProps;
  width: number;
  scale: number;
  bgColor?: string;
};

export function PerforationElement({ config, width, scale, bgColor = "#FFFFFF" }: Props) {
  const dotSize = config.dotSize * scale;
  const gap = config.gap * scale;
  const cutoutR = config.cutoutRadius * scale;
  const height = cutoutR * 2 + 4 * scale;
  const dotCount = Math.max(
    0,
    Math.floor((width - cutoutR * 4 - gap) / (dotSize + gap))
  );

  return (
    <Svg width={width} height={height}>
      {/* Left cutout */}
      <Circle cx={0} cy={height / 2} r={cutoutR} fill={bgColor} />
      {/* Right cutout */}
      <Circle cx={width} cy={height / 2} r={cutoutR} fill={bgColor} />
      {/* Dotted line */}
      {Array.from({ length: dotCount }, (_, i) => {
        const startX = cutoutR * 2 + gap;
        const cx = startX + i * (dotSize + gap) + dotSize / 2;
        return (
          <Circle
            key={i}
            cx={cx}
            cy={height / 2}
            r={dotSize / 2}
            fill={config.color}
          />
        );
      })}
    </Svg>
  );
}
