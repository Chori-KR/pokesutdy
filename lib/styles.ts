import type { CSSProperties } from "react";
import type { Difficulty } from "@/lib/game";

// 디자인 시스템: iOS(정갈·얇은 구분선·시스템색) + 모던 소프트(밝은 카드·부드러운 그림자).
// 학생/교사 모두 라이트 톤으로 통일. 색 토큰:
//   배경 #f4f5fa · 카드 #fff · 본문 #1c1c1e · 보조 #8a8f9a · 포인트 블루 #4b7bec · 골드 #eaa300
const FONT = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif";
const CARD_SHADOW = "0 4px 16px rgba(30,40,80,0.06)";
const HAIRLINE = "inset 0 0 0 0.5px rgba(60,60,67,0.08)";

export const S = {
  page: {
    minHeight: "100vh", background: "linear-gradient(180deg,#f5f6fb 0%,#edeff6 100%)",
    color: "#1c1c1e", fontFamily: FONT, padding: "16px 13px",
    maxWidth: 640, margin: "0 auto",
  } as CSSProperties,
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "linear-gradient(135deg,#7b8bf5,#9a7cf0)", color: "#fff",
    border: "none", borderRadius: 22, padding: "13px 18px",
    boxShadow: "0 10px 26px rgba(120,110,220,0.30)",
  } as CSSProperties,
  // iOS 세그먼트 컨트롤: 컨테이너(트랙)는 StudentHome에서, 아래는 개별 탭
  tabBtn: {
    flex: "1 1 auto", padding: "8px 6px", fontSize: 12.5, borderRadius: 9, cursor: "pointer",
    border: "none", background: "transparent",
    color: "#8a8f9a", fontFamily: FONT, fontWeight: 600, transition: "all 0.15s",
  } as CSSProperties,
  tabOn: { background: "#fff", color: "#1c1c1e", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" } as CSSProperties,
  panel: {
    background: "#fff", border: "none", borderRadius: 18, padding: 15,
    boxShadow: `${CARD_SHADOW}, ${HAIRLINE}`,
  } as CSSProperties,
  primaryBtn: {
    padding: "12px 20px", fontSize: 14, borderRadius: 14, cursor: "pointer",
    border: "none", background: "#4b7bec", color: "#fff",
    fontFamily: FONT, fontWeight: 600, boxShadow: "0 6px 16px rgba(75,123,236,0.28)",
  } as CSSProperties,
  choiceBtn: {
    padding: "12px 8px", fontSize: 13, borderRadius: 13, cursor: "pointer",
    border: "1px solid #e4e6ee", background: "#fff", color: "#1c1c1e", fontFamily: FONT, fontWeight: 600,
  } as CSSProperties,
  ghostBtn: {
    padding: "7px 13px", fontSize: 11, borderRadius: 999, cursor: "pointer",
    border: "1px solid #e0e2ec", background: "#fff", color: "#5b6272", fontFamily: FONT, fontWeight: 600,
  } as CSSProperties,
  moveBtn: (diff: Difficulty): CSSProperties => ({
    padding: "11px 6px", borderRadius: 15, cursor: "pointer", border: "none",
    color: "#fff", fontFamily: FONT, fontWeight: 700,
    background: diff === "easy" ? "linear-gradient(135deg,#5bcf9a,#3db98a)"
      : diff === "medium" ? "linear-gradient(135deg,#ffc061,#f0a63a)"
      : "linear-gradient(135deg,#ff8a8a,#ef5f5f)",
    boxShadow: "0 4px 12px rgba(30,40,80,0.16)",
  }),
  warn: {
    background: "#fff4f4", border: "1px solid #f3c9c9", borderRadius: 12,
    padding: "8px 12px", fontSize: 12, color: "#c0392b", margin: "8px 0",
  } as CSSProperties,
  toast: {
    position: "sticky", bottom: 14, margin: "12px auto 0", width: "fit-content",
    maxWidth: "90%", background: "rgba(28,28,30,0.94)", color: "#fff", padding: "10px 18px",
    borderRadius: 999, fontSize: 12.5, fontWeight: 600, boxShadow: "0 8px 22px rgba(0,0,0,0.25)", textAlign: "center",
  } as CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box", padding: "12px 13px", fontSize: 14,
    borderRadius: 12, border: "1px solid #d9dbe4", background: "#fff",
    color: "#1c1c1e", outline: "none", marginBottom: 10, fontFamily: FONT,
  } as CSSProperties,
};

// 교사 화면: 순수 iOS 느낌의 관리 도구 (그룹 배경 + 흰 카드 + 하이라인)
export const T = {
  page: {
    minHeight: "100vh", background: "#f2f2f7", color: "#1c1c1e",
    fontFamily: FONT,
    padding: "16px 14px", maxWidth: 760, margin: "0 auto",
  } as CSSProperties,
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "linear-gradient(135deg,#4b7bec,#6a6cf0)", color: "#fff", borderRadius: 16, padding: "14px 18px",
    boxShadow: "0 8px 22px rgba(75,110,230,0.25)",
  } as CSSProperties,
  tabBtn: {
    padding: "8px 15px", fontSize: 13, borderRadius: 999, cursor: "pointer",
    border: "1px solid #e2e2ea", background: "#fff", color: "#6b7280", fontWeight: 600,
  } as CSSProperties,
  tabOn: { background: "#4b7bec", color: "#fff", border: "1px solid #4b7bec", boxShadow: "0 4px 12px rgba(75,123,236,0.28)" } as CSSProperties,
  card: { background: "#fff", border: "none", borderRadius: 16, padding: "14px 16px", boxShadow: `0 3px 12px rgba(30,40,80,0.05), ${HAIRLINE}` } as CSSProperties,
  input: {
    padding: "9px 11px", fontSize: 13, borderRadius: 10, border: "1px solid #d9dbe4",
    background: "#fff", color: "#1c1c1e", outline: "none",
  } as CSSProperties,
  primaryBtn: {
    padding: "9px 17px", fontSize: 13, borderRadius: 12, cursor: "pointer",
    border: "none", background: "#4b7bec", color: "#fff", fontWeight: 600,
  } as CSSProperties,
  secondaryBtn: {
    padding: "9px 17px", fontSize: 13, borderRadius: 12, cursor: "pointer",
    border: "1px solid #d5d7e0", background: "#fff", color: "#3c3c43",
  } as CSSProperties,
  smallBtn: {
    padding: "3px 10px", fontSize: 11, borderRadius: 999, cursor: "pointer",
    border: "1px solid #f0c4c4", background: "#fff", color: "#c0392b",
  } as CSSProperties,
  chip: {
    fontSize: 12, padding: "4px 11px", borderRadius: 999, cursor: "pointer",
    border: "1px solid #e2e2ea", background: "#fff", color: "#6b7280",
  } as CSSProperties,
  chipOn: { border: "1px solid #4b7bec", background: "#eaf0ff", color: "#2a4fa0" } as CSSProperties,
};
