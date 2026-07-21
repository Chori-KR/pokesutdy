"use client";

import { useEffect, useState } from "react";

// 다크모드 토글.
//  - variant="fixed"(기본): 우측 상단 고정 버튼 — 헤더가 없는 로그인/랜딩용.
//    (홈 화면에서는 body.app-has-header일 때 CSS로 숨김 → 헤더 안 버튼과 중복 방지)
//  - variant="header": 헤더 안에 들어가는 알약형 버튼 — 학생/교사 홈 헤더용.
// html.dark 클래스 + localStorage에 저장. 최초 적용은 layout.tsx 인라인 스크립트가 담당.
export default function ThemeToggle({ variant = "fixed" }: { variant?: "fixed" | "header" }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    setDark(next);
  };
  const label = dark ? "☀️" : "🌙";
  if (variant === "header") {
    return (
      <button
        onClick={toggle}
        title="밝게 / 어둡게"
        aria-label="밝게/어둡게 전환"
        style={{
          border: "1px solid rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.18)",
          color: "#fff", borderRadius: 999, padding: "2px 9px", fontSize: 12, cursor: "pointer",
          lineHeight: 1.6,
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="밝게/어둡게 전환" title="밝게 / 어둡게">
      {label}
    </button>
  );
}
