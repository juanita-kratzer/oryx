import React, { Component, ErrorInfo, ReactNode } from "react";
import { StartupErrorScreen } from "./StartupErrorScreen";

type Props = { children: ReactNode };
type State = { hasError: boolean; detail: string | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, detail: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      detail: [error.name, error.message, error.stack].filter(Boolean).join("\n"),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
    this.setState({
      detail: [
        error.name,
        error.message,
        error.stack,
        "",
        "Component stack:",
        info.componentStack,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  render() {
    if (this.state.hasError && this.state.detail) {
      return (
        <StartupErrorScreen
          title="The app crashed while running"
          detail={this.state.detail}
          phase="runtime"
        />
      );
    }
    return this.props.children;
  }
}
