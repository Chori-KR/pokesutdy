"use client";

import { useEffect, useRef, useState } from "react";

// 스프라이트 시트(100px 그리드) 애니메이션 재생 — CC0 이펙트용. 한 번 재생 후 사라짐.
export interface Sheet { src: string; cols: number; rows: number; frames: number }

export default function SpriteAnim({
  sheet, left, top, size = 150, fps = 45,
}: { sheet: Sheet; left: string; top: string; size?: number; fps?: number }) {
  const [frame, setFrame] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const step = (t: number) => {
      const f = Math.floor((t - start) / (1000 / fps));
      if (f >= sheet.frames) { setFrame(-1); return; } // 끝나면 숨김
      setFrame(f);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [sheet.src, sheet.frames, fps]);

  if (frame < 0) return null;
  const col = frame % sheet.cols;
  const row = Math.floor(frame / sheet.cols);
  return (
    <div
      style={{
        position: "absolute", left, top, width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        backgroundImage: `url(/fx/${sheet.src})`,
        backgroundSize: `${sheet.cols * size}px ${sheet.rows * size}px`,
        backgroundPosition: `${-col * size}px ${-row * size}px`,
        pointerEvents: "none", zIndex: 6,
      }}
    />
  );
}
