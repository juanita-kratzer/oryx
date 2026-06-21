import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { StartupErrorScreen } from "./src/components/StartupErrorScreen";
import {
  formatStartupError,
  reportStartupError,
  subscribeStartupError,
} from "./src/lib/startupError";

type Phase = "booting" | "loading-app" | "ready" | "error";

export default function StartupRoot() {
  const [phase, setPhase] = useState<Phase>("booting");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [AppComponent, setAppComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    return subscribeStartupError((message) => {
      setErrorDetail(message);
      setPhase("error");
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadApp() {
      try {
        setPhase("loading-app");
        const module = await import("./App");
        if (cancelled) return;
        setAppComponent(() => module.default);
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        const message = formatStartupError(error);
        setErrorDetail(message);
        setPhase("error");
        reportStartupError(error);
      }
    }

    loadApp();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "error" && errorDetail) {
    return (
      <StartupErrorScreen
        title="The app failed to start"
        detail={errorDetail}
        phase={phase}
      />
    );
  }

  if (phase === "ready" && AppComponent) {
    return <AppComponent />;
  }

  return (
    <View style={styles.boot}>
      <Text style={styles.bootTitle}>Oryx</Text>
      <ActivityIndicator size="large" color="#111827" style={styles.spinner} />
      <Text style={styles.bootStatus}>
        {phase === "booting" ? "Starting…" : "Loading app…"}
      </Text>
      <Text style={styles.bootMeta}>Platform: {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 24,
  },
  bootTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 12,
  },
  bootStatus: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
  bootMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
});
