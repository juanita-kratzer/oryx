import React from "react";
import { Switch, type SwitchProps } from "react-native";

const TRACK_OFF = "#e5e7eb";
const TRACK_ON = "#111827";
const THUMB = "#ffffff";

/** iOS / Android switch styled black & white (not system green). */
export function AppSwitch(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ false: TRACK_OFF, true: TRACK_ON }}
      thumbColor={THUMB}
      ios_backgroundColor={TRACK_OFF}
      {...props}
    />
  );
}
