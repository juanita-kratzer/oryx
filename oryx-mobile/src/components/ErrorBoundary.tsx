import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BRAND } from "../constants/colors";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app ran into an unexpected error. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.debug}>{this.state.error.message}</Text>
          )}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={this.handleRetry}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: BRAND.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: BRAND.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: BRAND.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  debug: {
    fontSize: 12,
    color: BRAND.error,
    fontFamily: "Courier",
    textAlign: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    overflow: "hidden",
  },
  button: {
    backgroundColor: BRAND.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  pressed: { opacity: 0.85 },
});
