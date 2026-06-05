import React from "react";
import { View } from "react-native";

type Props = {
  color: string;
  width: number;
  scale: number;
};

export function DividerElement({ color, width, scale }: Props) {
  return (
    <View
      style={{
        width,
        height: scale,
        backgroundColor: color,
      }}
    />
  );
}
