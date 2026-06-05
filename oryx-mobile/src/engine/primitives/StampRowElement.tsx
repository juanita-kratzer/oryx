import React from "react";
import { View, StyleSheet } from "react-native";
import { IconElement } from "./IconElement";
import type { StampRowProps } from "../../types/card";

type Props = {
  config: StampRowProps;
  scale: number;
};

export function StampRowElement({ config, scale }: Props) {
  const size = config.size * scale;
  const stamps = [];

  for (let i = 0; i < config.total; i++) {
    const isFilled = i < config.filled;
    stamps.push(
      <View
        key={i}
        style={[
          styles.stamp,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: isFilled ? 0 : 1.5 * scale,
            borderColor: config.emptyColor,
            borderStyle: isFilled ? "solid" : "dashed",
            backgroundColor: isFilled ? config.filledColor : "transparent",
            marginHorizontal: 4 * scale,
          },
        ]}
      >
        {isFilled && (
          <IconElement
            config={{
              name: "starFilled",
              size: config.size * 0.6,
              color: "#FFFFFF",
              strokeWidth: 1.5,
            }}
            scale={scale}
          />
        )}
      </View>
    );
  }

  return <View style={styles.row}>{stamps}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  stamp: {
    justifyContent: "center",
    alignItems: "center",
  },
});
