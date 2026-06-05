import type { CardDocument, CardElement } from "./card";

export type EditorState = {
  document: CardDocument;
  selectedElementId: string | null;
  history: CardDocument[];
  historyIndex: number;
};

export type EditorAction =
  | { type: "SELECT_ELEMENT"; elementId: string | null; openInspector?: boolean }
  | { type: "MOVE_ELEMENT"; elementId: string; x: number; y: number }
  | { type: "RESIZE_ELEMENT"; elementId: string; width: number; height: number }
  | { type: "UPDATE_TEXT"; elementId: string; content: string }
  | { type: "UPDATE_ELEMENT"; elementId: string; updates: Partial<CardElement> }
  | { type: "DELETE_ELEMENT"; elementId: string }
  | { type: "DUPLICATE_ELEMENT"; elementId: string }
  | { type: "TOGGLE_VISIBILITY"; elementId: string }
  | { type: "ADD_ELEMENT"; element: CardElement }
  | { type: "SET_BG_COLOR"; color: string }
  | { type: "SET_BG_IMAGE"; uri: string }
  | { type: "SET_OVERLAY_OPACITY"; opacity: number }
  | { type: "SET_PRIMARY_COLOR"; color: string }
  | { type: "SET_SECONDARY_COLOR"; color: string }
  | { type: "SET_DIVIDER_COLOR"; color: string }
  | { type: "SET_HEADING_FONT"; font: string }
  | { type: "SET_BODY_FONT"; font: string }
  | { type: "SET_STAMP_FILLED"; elementId: string; filled: number }
  | { type: "MOVE_LAYER"; elementId: string; direction: "up" | "down" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "REPLACE_DOCUMENT"; document: CardDocument };
