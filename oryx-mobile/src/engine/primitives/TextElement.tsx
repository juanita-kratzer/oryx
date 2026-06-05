import React from "react";
import { Text, StyleSheet } from "react-native";
import type { TextProps } from "../../types/card";

type Props = {
  config: TextProps;
  scale: number;
};

export function TextElement({ config, scale }: Props) {
  const display = config.content || config.placeholder;
  const isPlaceholder = !config.content;

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: config.fontSize * scale,
          fontWeight: config.fontWeight,
          color: isPlaceholder ? config.color + "80" : config.color,
          textAlign: config.textAlign,
          letterSpacing: config.letterSpacing * scale,
          opacity: config.opacity,
          lineHeight: config.lineHeight
            ? config.lineHeight * scale
            : undefined,
        },
      ]}
      numberOfLines={config.maxLines || undefined}
      adjustsFontSizeToFit={config.autoScale}
      minimumFontScale={0.5}
    >
      {display}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
});
