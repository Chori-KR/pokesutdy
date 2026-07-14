import type { CSSProperties } from "react";
import type { Difficulty } from "@/lib/game";

// 학생 화면: 밝고 동글동글한 테마 (프리텐다드) — 밝은 인디고 배경 + 파스텔 액센트
const FONT = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif";
export const S = {
  page: {
    minHeight: "100vh", background: "linear-gradient(170deg,#3a4180 0%,#2b3160 100%)",
    color: "#f4f6ff", fontFamily: FONT, padding: "16px 13px",
    maxWidth: 640, margin: "0 auto",
  } as CSSProperties,
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "linear-gradient(135deg,#7b8bf5,#a074f0)", color: "#fff",
    border: "none", borderRadius: 22, padding: "13px 18px",
    boxShadow: "0 8px 22px rgba(90,80,200,0.35)",
  } as CSSProperties,
  tabBtn: {
    flex: "1 1 auto", padding: "9px 6px", fontSize: 12, borderRadius: 999, cursor: "pointer",
    border: "2px solid #ffffff22", background: "#3d4480",
    color: "#c7cdf0", fontFamily: FONT, fontWeight: 600,
  } as CSSProperties,
  tabOn: { background: "#ff9a52", color: "#fff", border: "2px solid #ff9a52", boxShadow: "0 4px 12px rgba(255,154,82,0.45)" } as CSSProperties,
  panel: {
    background: "#3b4278", border: "1px solid #ffffff1a", borderRadius: 20, padding: 15,
    boxShadow: "0 6px 16px rgba(20,25,60,0.25)",
  } as CSSProperties,
  primaryBtn: {
    padding: "12px 20px", fontSize: 14, borderRadius: 16, cursor: "pointer",
    border: "none", background: "linear-gradient(135deg,#ff9a52,#ff7d6b)", color: "#fff",
    fontFamily: FONT, fontWeight: 700, boxShadow: "0 6px 16px rgba(255,125,107,0.4)",
  } as CSSProperties,
  choiceBtn: {
    padding: "12px 8px", fontSize: 13, borderRadius: 14, cursor: "pointer",
    border: "2px solid #ffffff22", background: "#454c85", color: "#f4f6ff", fontFamily: FONT, fontWeight: 600,
  } as CSSProperties,
  ghostBtn: {
    padding: "7px 13px", fontSize: 11, borderRadius: 999, cursor: "pointer",
    border: "2px solid #ffffff2e", background: "transparent", color: "#c7cdf0", fontFamily: FONT, fontWeight: 600,
  } as CSSProperties,
  moveBtn: (diff: Difficulty): CSSProperties => ({
    padding: "11px 6px", borderRadius: 16, cursor: "pointer", border: "none",
    color: "#fff", fontFamily: FONT, fontWeight: 700,
    background: diff === "easy" ? "linear-gradient(135deg,#5bcf9a,#3db98a)"
      : diff === "medium" ? "linear-gradient(135deg,#ffc061,#f0a63a)"
      : "linear-gradient(135deg,#ff7b7b,#e85555)",
    boxShadow: "0 5px 13px rgba(20,25,60,0.3)",
  }),
  warn: {
    background: "#4a3f6b", border: "1px solid #8a79c3", borderRadius: 12,
    padding: "8px 12px", fontSize: 12, color: "#e6ddff", margin: "8px 0",
  } as CSSProperties,
  toast: {
    position: "sticky", bottom: 14, margin: "12px auto 0", width: "fit-content",
    maxWidth: "90%", background: "#fff", color: "#2f3550", padding: "10px 18px",
    borderRadius: 999, fontSize: 12.5, fontWeight: 700, boxShadow: "0 8px 22px rgba(0,0,0,0.3)", textAlign: "center",
  } as CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box", padding: "12px 13px", fontSize: 14,
    borderRadius: 14, border: "2px solid #ffffff2e", background: "#2f3563",
    color: "#f4f6ff", outline: "none", marginBottom: 10, fontFamily: FONT,
  } as CSSProperties,
};

// 교사 화면: 밝고 사무적인 관리 도구 (프로토타입 T 포팅)
export const T = {
  page: {
    minHeight: "100vh", background: "#f6f5f1", color: "#2c2c34",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    padding: "16px 14px", maxWidth: 760, margin: "0 auto",
  } as CSSProperties,
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#1a1c2c", color: "#f8f0dc", borderRadius: 12, padding: "14px 18px",
  } as CSSProperties,
  tabBtn: {
    padding: "8px 15px", fontSize: 13, borderRadius: 999, cursor: "pointer",
    border: "1px solid #ddd", background: "#fff", color: "#666",
  } as CSSProperties,
  tabOn: { background: "#7b8bf5", color: "#fff", border: "1px solid #7b8bf5" } as CSSProperties,
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: "13px 15px" } as CSSProperties,
  input: {
    padding: "8px 10px", fontSize: 13, borderRadius: 10, border: "1px solid #ddd",
    background: "#fff", color: "#2c2c34", outline: "none",
  } as CSSProperties,
  primaryBtn: {
    padding: "9px 17px", fontSize: 13, borderRadius: 12, cursor: "pointer",
    border: "none", background: "#7b8bf5", color: "#fff", fontWeight: 600,
  } as CSSProperties,
  secondaryBtn: {
    padding: "9px 17px", fontSize: 13, borderRadius: 12, cursor: "pointer",
    border: "1px solid #ccc", background: "#fff", color: "#444",
  } as CSSProperties,
  smallBtn: {
    padding: "3px 10px", fontSize: 11, borderRadius: 999, cursor: "pointer",
    border: "1px solid #e0b4b4", background: "#fff", color: "#a33",
  } as CSSProperties,
  chip: {
    fontSize: 12, padding: "4px 11px", borderRadius: 13, cursor: "pointer",
    border: "1px solid #ddd", background: "#fff", color: "#777",
  } as CSSProperties,
  chipOn: { border: "1px solid #3d6fd9", background: "#e8effc", color: "#2a4fa0" } as CSSProperties,
};
