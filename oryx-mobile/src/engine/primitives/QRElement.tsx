import React from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { QRProps } from "../../types/card";

type Props = {
  config: QRProps;
  scale: number;
};

export function QRElement({ config, scale }: Props) {
  const size = config.size * scale;
  const borderRadius = config.borderRadius * scale;
  const borderWidth = config.borderWidth * scale;

  return (
    <View
      style={{
        borderRadius,
        borderWidth,
        borderColor: config.borderColor,
        padding: 4 * scale,
        backgroundColor: config.backgroundColor,
        overflow: "hidden",
      }}
    >
      <QRCode
        value={config.value || "https://oryx.app"}
        size={size - (borderWidth + 4 * scale) * 2}
        color={config.color}
        backgroundColor={config.backgroundColor}
      />
    </View>
  );
}
