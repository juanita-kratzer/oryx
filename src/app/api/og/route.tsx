import { ImageResponse } from "next/og";

export const runtime = "edge";

const OG_SIZE = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") ?? "Oryx - Apple Wallet Cards";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f2937",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 24, color: "#9ca3af" }}>
          Digital cards for Apple Wallet & NFC
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
