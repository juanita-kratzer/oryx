import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import type { ImageProps } from "../../types/card";

type Props = {
  config: ImageProps;
  width: number;
  height: number;
  scale: number;
};

export function ImageElement({ config, width, height, scale }: Props) {
  const borderRadius = config.borderRadius * scale;
  const borderWidth = config.borderWidth * scale;

  if (config.uri) {
    return (
      <Image
        source={{ uri: config.uri }}
        style={{
          width,
          height,
          borderRadius,
          borderWidth,
          borderColor: config.borderColor,
        }}
        resizeMode={config.objectFit}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width,
          height,
          borderRadius,
          borderWidth: borderWidth || StyleSheet.hairlineWidth,
          borderColor: config.borderColor || "#CFCFCF",
          borderStyle: config.borderStyle,
        },
      ]}
    >
      <Text
        style={[
          styles.placeholderText,
          { fontSize: 11 * scale, color: "#CFCFCF" },
        ]}
      >
        {config.placeholderText || "YOUR\nIMAGE\nHERE"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  placeholderText: {
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 1,
  },
});
