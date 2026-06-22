import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import StartupRoot from "./StartupRoot";
import { reportStartupError } from "./src/lib/startupError";

const g = globalThis as any;

if (g.ErrorUtils) {
  const defaultHandler = g.ErrorUtils.getGlobalHandler();
  g.ErrorUtils.setGlobalHandler((error: unknown, isFatal: boolean) => {
    reportStartupError(error);
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

if (typeof g.HermesInternal !== "undefined") {
  g.HermesInternal?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id: number, rejection: unknown) => {
      reportStartupError(rejection);
    },
  });
}

registerRootComponent(StartupRoot);
