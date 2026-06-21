import React from "react";
import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const TRACK_OFF = "#e5e7eb";
const TRACK_ON = "#111827";
const THUMB = "#ffffff";

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const TRACK_PADDING = 2;

export type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** Black & white toggle — RN Switch ignores track/thumb colors on web and some iOS builds. */
export function AppSwitch({
  value,
  onValueChange,
  disabled = false,
  testID,
  style,
}: AppSwitchProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[
        styles.track,
        {
          backgroundColor: value ? TRACK_ON : TRACK_OFF,
          opacity: disabled ? 0.45 : 1,
        },
        Platform.OS === "web" && !disabled ? styles.webCursor : null,
        style,
      ]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: THUMB,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
      },
    }),
  },
  thumbOff: {
    alignSelf: "flex-start",
  },
  thumbOn: {
    alignSelf: "flex-end",
  },
  webCursor: {
    cursor: "pointer",
  },
});
