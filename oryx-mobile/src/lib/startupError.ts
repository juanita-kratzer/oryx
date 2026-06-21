type Listener = (message: string) => void;

let latestError: string | null = null;
const listeners = new Set<Listener>();

export function formatStartupError(error: unknown): string {
  if (error instanceof Error) {
    return [error.name, error.message, error.stack].filter(Boolean).join("\n");
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

export function reportStartupError(error: unknown) {
  latestError = formatStartupError(error);
  for (const listener of listeners) {
    listener(latestError);
  }
}

export function subscribeStartupError(listener: Listener) {
  if (latestError) listener(latestError);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
