"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  url: string;
  size?: number;
  className?: string;
  label?: string;
};

export function CardQrCode({ url, size = 160, className, label = "Scan to open card" }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: size, margin: 1, errorCorrectionLevel: "M" })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [url, size]);

  if (!url) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={label}
          width={size}
          height={size}
          className="rounded-lg border border-gray-200 bg-white p-2"
        />
      ) : (
        <div
          className="rounded-lg border border-gray-200 bg-white"
          style={{ width: size, height: size }}
        />
      )}
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}
