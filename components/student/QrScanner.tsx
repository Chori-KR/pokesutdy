"use client";

import { useEffect, useRef, useState } from "react";
import { S } from "@/lib/styles";

// 카메라로 교환 코드 QR을 스캔 (jsqr 동적 로드). 6자리 숫자를 읽으면 onDetect 호출.
export default function QrScanner({ onDetect, onClose }: { onDetect: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        v.setAttribute("playsinline", "true");
        await v.play();
        const jsQR = (await import("jsqr")).default;
        const tick = () => {
          if (stopped) return;
          if (v.readyState === v.HAVE_ENOUGH_DATA && ctx && v.videoWidth) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const res = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
            const digits = res?.data?.replace(/\D/g, "") ?? "";
            if (digits.length >= 6) { onDetect(digits.slice(-6)); return; }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setErr("카메라를 열 수 없어요. 코드를 직접 입력해주세요.");
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ fontSize: 13, color: "#f8f0dc", marginBottom: 10 }}>친구의 교환 QR을 비춰주세요</div>
      {err ? (
        <div style={S.warn}>{err}</div>
      ) : (
        <div style={{ position: "relative", width: "min(80vw, 300px)", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "3px solid #e07b39" }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <button onClick={onClose} style={{ ...S.primaryBtn, marginTop: 16 }}>닫기</button>
    </div>
  );
}
