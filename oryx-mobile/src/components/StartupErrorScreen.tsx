import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";

type Props = {
  title: string;
  detail: string;
  phase?: string;
};

export function StartupErrorScreen({ title, detail, phase }: Props) {
  const meta = [
    `Platform: ${Platform.OS}`,
    phase ? `Phase: ${phase}` : null,
    `Time: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const fullReport = `${title}\n\n${detail}\n\n---\n${meta}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Oryx startup error</Text>
        <Text style={styles.headerHint}>
          Screenshot this screen and send it to support.
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text selectable style={styles.report}>
          {fullReport}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff7ed",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#fdba74",
    backgroundColor: "#ffedd5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9a3412",
    marginBottom: 4,
  },
  headerHint: {
    fontSize: 14,
    color: "#c2410c",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  report: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7c2d12",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
});
