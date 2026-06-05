import type { EditorState, EditorAction } from "../types/editor";
import type { CardDocument, CardElement } from "../types/card";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../types/card";

const MAX_HISTORY = 50;

function pushHistory(state: EditorState, newDoc: CardDocument): EditorState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(newDoc);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return {
    ...state,
    document: newDoc,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function updateElement(
  doc: CardDocument,
  id: string,
  updater: (el: CardElement) => CardElement
): CardDocument {
  return {
    ...doc,
    elements: doc.elements.map((el) => (el.id === id ? updater(el) : el)),
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

let elementCounter = 1000;
function nextId() {
  return `el_${++elementCounter}`;
}

export function editorReducer(
  state: EditorState,
  action: EditorAction
): EditorState {
  const { document: doc } = state;

  switch (action.type) {
    case "SELECT_ELEMENT":
      return { ...state, selectedElementId: action.elementId };

    case "MOVE_ELEMENT": {
      const el = doc.elements.find((e) => e.id === action.elementId);
      if (!el || el.locked) return state;
      const newX = clamp(action.x, 0, CANVAS_WIDTH - el.width);
      const newY = clamp(action.y, 0, CANVAS_HEIGHT - el.height);
      const newDoc = updateElement(doc, action.elementId, (e) => ({
        ...e,
        x: newX,
        y: newY,
      }));
      return pushHistory(state, newDoc);
    }

    case "RESIZE_ELEMENT": {
      const el = doc.elements.find((e) => e.id === action.elementId);
      if (!el || el.locked) return state;
      const w = clamp(action.width, 20, CANVAS_WIDTH - el.x);
      const h = clamp(action.height, 10, CANVAS_HEIGHT - el.y);
      const newDoc = updateElement(doc, action.elementId, (e) => ({
        ...e,
        width: w,
        height: h,
      }));
      return pushHistory(state, newDoc);
    }

    case "UPDATE_TEXT": {
      const newDoc = updateElement(doc, action.elementId, (e) =>
        e.text ? { ...e, text: { ...e.text, content: action.content } } : e
      );
      return pushHistory(state, newDoc);
    }

    case "UPDATE_ELEMENT": {
      const newDoc = updateElement(doc, action.elementId, (e) => ({
        ...e,
        ...action.updates,
      }));
      return pushHistory(state, newDoc);
    }

    case "DELETE_ELEMENT": {
      const el = doc.elements.find((e) => e.id === action.elementId);
      if (!el) return state;
      const newDoc = {
        ...doc,
        elements: doc.elements.map((e) =>
          e.id === action.elementId ? { ...e, visible: false } : e
        ),
      };
      return {
        ...pushHistory(state, newDoc),
        selectedElementId:
          state.selectedElementId === action.elementId
            ? null
            : state.selectedElementId,
      };
    }

    case "DUPLICATE_ELEMENT": {
      const el = doc.elements.find((e) => e.id === action.elementId);
      if (!el) return state;
      const dup: CardElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: nextId(),
        x: Math.min(el.x + 30, CANVAS_WIDTH - el.width),
        y: Math.min(el.y + 30, CANVAS_HEIGHT - el.height),
        locked: false,
        zIndex: Math.max(...doc.elements.map((e) => e.zIndex)) + 1,
      };
      const newDoc = { ...doc, elements: [...doc.elements, dup] };
      return {
        ...pushHistory(state, newDoc),
        selectedElementId: dup.id,
      };
    }

    case "TOGGLE_VISIBILITY": {
      const newDoc = updateElement(doc, action.elementId, (e) => ({
        ...e,
        visible: !e.visible,
      }));
      return pushHistory(state, newDoc);
    }

    case "ADD_ELEMENT": {
      const el = { ...action.element, id: nextId() };
      const newDoc = { ...doc, elements: [...doc.elements, el] };
      return {
        ...pushHistory(state, newDoc),
        selectedElementId: el.id,
      };
    }

    case "SET_BG_COLOR": {
      const newDoc = {
        ...doc,
        background: { ...doc.background, mode: "color" as const, color: action.color },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_BG_IMAGE": {
      const newDoc = {
        ...doc,
        background: { ...doc.background, mode: "image" as const, imageUri: action.uri },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_OVERLAY_OPACITY": {
      const newDoc = {
        ...doc,
        background: { ...doc.background, overlayOpacity: action.opacity },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_PRIMARY_COLOR": {
      const newDoc = {
        ...doc,
        theme: { ...doc.theme, primaryTextColor: action.color },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_SECONDARY_COLOR": {
      const newDoc = {
        ...doc,
        theme: { ...doc.theme, secondaryTextColor: action.color },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_DIVIDER_COLOR": {
      const newDoc = {
        ...doc,
        theme: { ...doc.theme, dividerColor: action.color },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_HEADING_FONT": {
      const newDoc = {
        ...doc,
        fonts: { ...doc.fonts, heading: action.font },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_BODY_FONT": {
      const newDoc = {
        ...doc,
        fonts: { ...doc.fonts, body: action.font },
      };
      return pushHistory(state, newDoc);
    }

    case "SET_STAMP_FILLED": {
      const stampEl = doc.elements.find((e) => e.id === action.elementId);
      if (!stampEl?.stampRow) return state;
      const total = stampEl.stampRow.total;
      const filled = action.filled;
      const remaining = total - filled;
      let newDoc = updateElement(doc, action.elementId, (e) =>
        e.stampRow
          ? { ...e, stampRow: { ...e.stampRow, filled } }
          : e
      );
      const countEl = newDoc.elements.find((e) => e.id === "stampCount");
      if (countEl?.text) {
        newDoc = updateElement(newDoc, "stampCount", (e) => ({
          ...e,
          text: {
            ...e.text!,
            content: `${filled} OF ${total} STAMPS`,
            placeholder: `${filled} OF ${total} STAMPS`,
          },
        }));
      }
      const helperEl = newDoc.elements.find((e) => e.id === "stampHelper");
      if (helperEl?.text) {
        const msg =
          remaining === 0
            ? "Congratulations! You've earned your reward!"
            : `Earn ${remaining} more stamp${remaining > 1 ? "s" : ""} to get your reward!`;
        newDoc = updateElement(newDoc, "stampHelper", (e) => ({
          ...e,
          text: { ...e.text!, content: msg, placeholder: msg },
        }));
      }
      return pushHistory(state, newDoc);
    }

    case "MOVE_LAYER": {
      const sorted = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === action.elementId);
      if (idx === -1) return state;
      const swapIdx =
        action.direction === "up"
          ? Math.min(idx + 1, sorted.length - 1)
          : Math.max(idx - 1, 0);
      if (swapIdx === idx) return state;
      const zA = sorted[idx].zIndex;
      const zB = sorted[swapIdx].zIndex;
      const newDoc = {
        ...doc,
        elements: doc.elements.map((e) => {
          if (e.id === sorted[idx].id) return { ...e, zIndex: zB };
          if (e.id === sorted[swapIdx].id) return { ...e, zIndex: zA };
          return e;
        }),
      };
      return pushHistory(state, newDoc);
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIdx = state.historyIndex - 1;
      return {
        ...state,
        document: state.history[newIdx],
        historyIndex: newIdx,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIdx = state.historyIndex + 1;
      return {
        ...state,
        document: state.history[newIdx],
        historyIndex: newIdx,
      };
    }

    case "REPLACE_DOCUMENT":
      return pushHistory(state, action.document);

    default:
      return state;
  }
}

export function createInitialEditorState(doc: CardDocument): EditorState {
  return {
    document: doc,
    selectedElementId: null,
    history: [doc],
    historyIndex: 0,
  };
}
