import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

export function WebDevBanner() {
  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Web preview — sign in to load your account. Mock data on web; real
        Firestore on iOS.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#dbeafe",
    borderBottomWidth: 1,
    borderBottomColor: "#93c5fd",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    color: "#1e40af",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
