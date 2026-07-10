"use client";

import { useState, CSSProperties } from "react";
import { SPRITE, BACK_SPRITE } from "@/lib/game";

interface SpriteProps {
  id: number;
  color?: string; // 이미지 로드 실패 시 대체 도형 색
  size?: number | string;
  silhouette?: boolean;
  back?: boolean;
  pixelated?: boolean;
  style?: CSSProperties;
}

// PokéAPI 스프라이트. 로드 실패 시 프로토타입의 젤리 도형으로 대체.
export default function Sprite({ id, color, size, silhouette, back, pixelated, style }: SpriteProps) {
  const [err, setErr] = useState(false);
  if (err) {
    const seed = id % 4;
    const shapes = [
      "48% 52% 55% 45% / 55% 50% 50% 45%",
      "60% 40% 45% 55% / 45% 60% 40% 55%",
      "50% 50% 40% 60% / 60% 45% 55% 40%",
      "42% 58% 60% 40% / 50% 55% 45% 50%",
    ];
    return (
      <div style={{ width: size, aspectRatio: "1/1", position: "relative", ...style }}>
        <div style={{ position: "absolute", inset: "10%", background: silhouette ? "#20222f" : (color || "#9fd8ff"), border: "3px solid #2c2c3488", borderRadius: shapes[seed] }}>
          {!silhouette && (
            <>
              <div style={{ position: "absolute", left: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}>
                <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
              </div>
              <div style={{ position: "absolute", right: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}>
                <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={back ? BACK_SPRITE(id) : SPRITE(id)}
      alt=""
      onError={() => setErr(true)}
      draggable={false}
      style={{
        width: size, height: size, objectFit: "contain",
        imageRendering: pixelated ? "pixelated" : "auto",
        filter: silhouette ? "brightness(0) opacity(0.85)" : "none",
        ...style,
      }}
    />
  );
}
