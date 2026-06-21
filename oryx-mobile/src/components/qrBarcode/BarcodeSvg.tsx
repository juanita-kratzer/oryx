import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import JsBarcode from "jsbarcode";
import { SvgXml } from "react-native-svg";

type Props = {
  value: string;
  format?: string;
  width?: number;
  height?: number;
};

function buildBarcodeSvg(value: string, format: string, height: number): string {
  const document = new DOMImplementation().createDocument(
    "http://www.w3.org/1999/xhtml",
    "html",
    null
  );
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svgNode, value, {
    xmlDocument: document as unknown as XMLDocument,
    format,
    height,
    displayValue: false,
    margin: 8,
    width: 2,
  });
  return new XMLSerializer().serializeToString(svgNode);
}

export function BarcodeSvg({
  value,
  format = "CODE128",
  width = 280,
  height = 96,
}: Props) {
  const xml = useMemo(() => {
    if (!value.trim()) return null;
    try {
      return buildBarcodeSvg(value.trim(), format, height - 16);
    } catch {
      try {
        return buildBarcodeSvg(value.trim(), "CODE128", height - 16);
      } catch {
        return null;
      }
    }
  }, [value, format, height]);

  if (!xml) {
    return <View style={[styles.fallback, { width, height }]} />;
  }

  return (
    <View style={[styles.wrap, { width }]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
});
