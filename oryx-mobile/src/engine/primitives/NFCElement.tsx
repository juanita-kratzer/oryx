import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconElement } from "./IconElement";
import type { NFCProps } from "../../types/card";

type Props = {
  config: NFCProps;
  width: number;
  height: number;
  scale: number;
};

export function NFCElement({ config, width, height, scale }: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: 12 * scale,
          borderWidth: 1.5 * scale,
          borderColor: config.borderColor,
          borderStyle: config.style,
        },
      ]}
    >
      <IconElement
        config={{
          name: "nfc",
          size: 32,
          color: config.iconColor,
          strokeWidth: 2,
        }}
        scale={scale}
      />
      <Text
        style={[
          styles.label,
          {
            fontSize: 11 * scale,
            color: config.textColor,
            marginTop: 4 * scale,
            letterSpacing: 2 * scale,
          },
        ]}
      >
        {config.label || "NFC"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
  },
});
