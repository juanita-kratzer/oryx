import React from "react";
import { View, Image, StyleSheet } from "react-native";
import type { BackgroundConfig } from "../types/card";

type Props = {
  width: number;
  background: BackgroundConfig;
  children: React.ReactNode;
};

const ASPECT_RATIO = 3 / 4;

export function CardShell({ width, background, children }: Props) {
  const height = width / ASPECT_RATIO;

  return (
    <View style={[styles.shell, { width, height, backgroundColor: background.color }]}>
      {background.mode === "image" && background.imageUri && (
        <>
          <Image
            source={{ uri: background.imageUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          {background.overlayOpacity > 0 && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: `rgba(0,0,0,${background.overlayOpacity})` },
              ]}
            />
          )}
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
});
