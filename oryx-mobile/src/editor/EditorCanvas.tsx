import React, { useCallback, useRef } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import { CardShell } from "../engine/CardShell";
import {
  TextElement,
  ImageElement,
  IconElement,
  QRElement,
  NFCElement,
  DividerElement,
  ShapeElement,
  StampRowElement,
  PerforationElement,
} from "../engine/primitives";
import type { CardDocument, CardElement } from "../types/card";
import { CANVAS_WIDTH } from "../types/card";
import type { EditorAction } from "../types/editor";

type Props = {
  document: CardDocument;
  selectedElementId: string | null;
  width: number;
  dispatch: React.Dispatch<EditorAction>;
};

function ElementRenderer({
  element: el,
  scale,
}: {
  element: CardElement;
  scale: number;
}) {
  const w = el.width * scale;
  const h = el.height * scale;

  switch (el.type) {
    case "text":
      if (!el.text) return null;
      return <TextElement config={el.text} scale={scale} />;
    case "image":
      if (!el.image) return null;
      return (
        <ImageElement config={el.image} width={w} height={h} scale={scale} />
      );
    case "icon":
      if (!el.icon) return null;
      return <IconElement config={el.icon} scale={scale} />;
    case "qr":
      if (!el.qr) return null;
      return <QRElement config={el.qr} scale={scale} />;
    case "nfc":
      if (!el.nfc) return null;
      return (
        <NFCElement config={el.nfc} width={w} height={h} scale={scale} />
      );
    case "divider":
      return (
        <DividerElement
          color={el.shape?.stroke || "#D9D9D9"}
          width={w}
          scale={scale}
        />
      );
    case "shape":
      if (!el.shape) return null;
      return (
        <ShapeElement config={el.shape} width={w} height={h} scale={scale} />
      );
    case "stampRow":
      if (!el.stampRow) return null;
      return <StampRowElement config={el.stampRow} scale={scale} />;
    case "perforation":
      if (!el.perforation) return null;
      return (
        <PerforationElement config={el.perforation} width={w} scale={scale} />
      );
    default:
      return null;
  }
}

function CanvasElement({
  el,
  scale,
  isSelected,
  dispatch,
}: {
  el: CardElement;
  scale: number;
  isSelected: boolean;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const startPos = useRef({ x: el.x, y: el.y });
  const isDragging = useRef(false);

  const elRef = useRef(el);
  elRef.current = el;
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        !elRef.current.locked &&
        (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3),
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        !elRef.current.locked &&
        (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const cur = elRef.current;
        startPos.current = { x: cur.x, y: cur.y };
        isDragging.current = false;
        dispatchRef.current({
          type: "SELECT_ELEMENT",
          elementId: cur.id,
          openInspector: false,
        });
      },
      onPanResponderMove: (_, gs) => {
        if (elRef.current.locked) return;
        if (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3) {
          isDragging.current = true;
        }
        if (isDragging.current) {
          const s = scaleRef.current;
          const newX = startPos.current.x + gs.dx / s;
          const newY = startPos.current.y + gs.dy / s;
          dispatchRef.current({
            type: "MOVE_ELEMENT",
            elementId: elRef.current.id,
            x: Math.round(newX),
            y: Math.round(newY),
          });
        }
      },
      onPanResponderRelease: () => {
        if (!isDragging.current) {
          dispatchRef.current({
            type: "SELECT_ELEMENT",
            elementId: elRef.current.id,
          });
        }
        startPos.current = { x: elRef.current.x, y: elRef.current.y };
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.element,
        {
          left: el.x * scale,
          top: el.y * scale,
          width: el.width * scale,
          height: el.height * scale,
          transform: el.rotation ? [{ rotate: `${el.rotation}deg` }] : [],
          zIndex: el.zIndex + 10,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <ElementRenderer element={el} scale={scale} />
      {isSelected && (
        <View style={styles.selectionBorder} pointerEvents="none">
          <View style={[styles.handle, styles.handleTL]} />
          <View style={[styles.handle, styles.handleTR]} />
          <View style={[styles.handle, styles.handleBL]} />
          <View style={[styles.handle, styles.handleBR]} />
        </View>
      )}
    </View>
  );
}

export function EditorCanvas({
  document: doc,
  selectedElementId,
  width,
  dispatch,
}: Props) {
  const scale = width / CANVAS_WIDTH;

  const handleCanvasTap = useCallback(() => {
    dispatch({ type: "SELECT_ELEMENT", elementId: null });
  }, [dispatch]);

  return (
    <View style={styles.canvasWrapper}>
      <CardShell width={width} background={doc.background}>
        <View
          style={StyleSheet.absoluteFill}
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget) handleCanvasTap();
          }}
        >
          {doc.elements
            .filter((el) => el.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <CanvasElement
                key={el.id}
                el={el}
                scale={scale}
                isSelected={el.id === selectedElementId}
                dispatch={dispatch}
              />
            ))}
        </View>
      </CardShell>
    </View>
  );
}

const HANDLE_SIZE = 10;

const styles = StyleSheet.create({
  canvasWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  element: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 2,
  },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },
  handleTL: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  handleTR: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  handleBL: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  handleBR: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
});
