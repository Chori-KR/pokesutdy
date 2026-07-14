"use client";

import { useEffect, useState } from "react";

// 교환 코드를 QR 이미지로 표시 (qrcode 라이브러리를 클라이언트에서 동적 로드)
export default function QrCode({ text, size = 128 }: { text: string; size?: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(text, { width: size, margin: 1, color: { dark: "#1a1c2c", light: "#ffffff" } })
      )
      .then((u) => { if (alive) setUrl(u); })
      .catch(() => {});
    return () => { alive = false; };
  }, [text, size]);

  return (
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 8, overflow: "hidden" }}>
      {url && <img src={url} width={size} height={size} alt={`QR ${text}`} style={{ display: "block" }} />}
    </div>
  );
}
