"use client";

import { useEffect, useState } from "react";

// 우측 상단 고정 다크모드 토글. html.dark 클래스 + localStorage에 저장.
// 최초 적용(깜빡임 방지)은 layout.tsx의 인라인 스크립트가 담당한다.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    setDark(next);
  };
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="밝게/어둡게 전환" title="밝게 / 어둡게">
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
