import React from "react";
import { View } from "react-native";
import { CardShell } from "./CardShell";
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
} from "./primitives";
import type { CardDocument, CardElement } from "../types/card";
import { CANVAS_WIDTH as CW } from "../types/card";

type Props = {
  document: CardDocument;
  width: number;
};

export function CardRenderer({ document: doc, width }: Props) {
  const scale = width / CW;
  const bgColor = doc.background.color;

  return (
    <CardShell width={width} background={doc.background}>
      {doc.elements
        .filter((el) => el.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => (
          <View
            key={el.id}
            style={{
              position: "absolute",
              left: el.x * scale,
              top: el.y * scale,
              width: el.width * scale,
              height: el.height * scale,
              transform: el.rotation ? [{ rotate: `${el.rotation}deg` }] : [],
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents="none"
          >
            <ElementRenderer element={el} scale={scale} bgColor={bgColor} />
          </View>
        ))}
    </CardShell>
  );
}

function ElementRenderer({ element: el, scale, bgColor }: { element: CardElement; scale: number; bgColor: string }) {
  const w = el.width * scale;
  const h = el.height * scale;

  switch (el.type) {
    case "text":
      if (!el.text) return null;
      return <TextElement config={el.text} scale={scale} />;

    case "image":
      if (!el.image) return null;
      return <ImageElement config={el.image} width={w} height={h} scale={scale} />;

    case "icon":
      if (!el.icon) return null;
      return <IconElement config={el.icon} scale={scale} />;

    case "qr":
      if (!el.qr) return null;
      return <QRElement config={el.qr} scale={scale} />;

    case "nfc":
      if (!el.nfc) return null;
      return <NFCElement config={el.nfc} width={w} height={h} scale={scale} />;

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
      return <ShapeElement config={el.shape} width={w} height={h} scale={scale} />;

    case "stampRow":
      if (!el.stampRow) return null;
      return <StampRowElement config={el.stampRow} scale={scale} />;

    case "perforation":
      if (!el.perforation) return null;
      return <PerforationElement config={el.perforation} width={w} scale={scale} bgColor={bgColor} />;

    default:
      return null;
  }
}
