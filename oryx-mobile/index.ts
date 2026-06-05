import { registerRootComponent } from "expo";
import App from "./App";

const g = globalThis as any;

if (g.ErrorUtils) {
  const defaultHandler = g.ErrorUtils.getGlobalHandler();
  g.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.error(`[Global ${isFatal ? "FATAL" : "error"}]`, error);
    if (!isFatal && defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

if (typeof g.HermesInternal !== "undefined") {
  g.HermesInternal?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id: number, rejection: unknown) => {
      console.warn("Unhandled promise rejection:", rejection);
    },
  });
}

registerRootComponent(App);
