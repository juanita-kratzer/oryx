import React from "react";
import { View } from "react-native";
import type { ShapeProps } from "../../types/card";

type Props = {
  config: ShapeProps;
  width: number;
  height: number;
  scale: number;
};

export function ShapeElement({ config, width, height, scale }: Props) {
  if (config.shapeType === "circle") {
    const size = Math.min(width, height);
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.fill || "transparent",
          borderWidth: config.strokeWidth * scale,
          borderColor: config.stroke,
        }}
      />
    );
  }

  if (config.shapeType === "line" || config.shapeType === "dashedLine") {
    return (
      <View
        style={{
          width,
          height: 0,
          borderTopWidth: config.strokeWidth * scale,
          borderTopColor: config.stroke,
          borderStyle: config.shapeType === "dashedLine" ? "dashed" : "solid",
        }}
      />
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderRadius: config.borderRadius * scale,
        backgroundColor: config.fill || "transparent",
        borderWidth: config.strokeWidth * scale,
        borderColor: config.stroke,
        borderStyle: config.strokeDasharray ? "dashed" : "solid",
      }}
    />
  );
}
