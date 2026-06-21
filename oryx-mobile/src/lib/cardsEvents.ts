type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeCardsChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyCardsChanged(): void {
  for (const listener of listeners) {
    listener();
  }
}
