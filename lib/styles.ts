import type { CSSProperties } from "react";
import type { Difficulty } from "@/lib/game";

// 학생 화면: 게임보이풍 픽셀 감성 (프로토타입 S 포팅)
export const S = {
  page: {
    minHeight: "100vh", background: "#1a1c2c", color: "#f8f0dc",
    fontFamily: "'DGM', 'Galmuri11', sans-serif", padding: "14px 12px",
    maxWidth: 640, margin: "0 auto",
  } as CSSProperties,
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#252840", border: "3px solid #2c2c34", borderRadius: 12, padding: "10px 14px",
  } as CSSProperties,
  tabBtn: {
    flex: "1 1 auto", padding: "8px 6px", fontSize: 11, borderRadius: 9, cursor: "pointer",
    border: "2px solid #f8f0dc22", background: "#252840", color: "#9fb0d8", fontFamily: "inherit",
  } as CSSProperties,
  tabOn: { background: "#e07b39", color: "#fff", border: "2px solid #2c2c34" } as CSSProperties,
  panel: { background: "#252840", border: "3px solid #2c2c34", borderRadius: 12, padding: 14 } as CSSProperties,
  primaryBtn: {
    padding: "11px 20px", fontSize: 14, borderRadius: 10, cursor: "pointer",
    border: "3px solid #2c2c34", background: "#e07b39", color: "#fff",
    fontFamily: "inherit", boxShadow: "0 3px 0 #2c2c3499",
  } as CSSProperties,
  choiceBtn: {
    padding: "11px 8px", fontSize: 13, borderRadius: 9, cursor: "pointer",
    border: "2px solid #f8f0dc33", background: "#2c2f44", color: "#f8f0dc", fontFamily: "inherit",
  } as CSSProperties,
  ghostBtn: {
    padding: "6px 12px", fontSize: 11, borderRadius: 8, cursor: "pointer",
    border: "2px solid #f8f0dc33", background: "transparent", color: "#9fb0d8", fontFamily: "inherit",
  } as CSSProperties,
  moveBtn: (diff: Difficulty): CSSProperties => ({
    padding: "10px 6px", borderRadius: 9, cursor: "pointer", border: "3px solid #2c2c34",
    color: "#fff", fontFamily: "inherit",
    background: diff === "easy" ? "#3d9970" : diff === "medium" ? "#e0a63a" : "#d64545",
    boxShadow: "0 3px 0 #2c2c3499",
  }),
  warn: {
    background: "#3a3323", border: "1px solid #8a7433", borderRadius: 8,
    padding: "7px 10px", fontSize: 11, color: "#e8d9a0", margin: "8px 0",
  } as CSSProperties,
  toast: {
    position: "sticky", bottom: 14, margin: "12px auto 0", width: "fit-content",
    maxWidth: "90%", background: "#f8f0dc", color: "#2c2c34", padding: "9px 16px",
    borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", textAlign: "center",
  } as CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 14,
    borderRadius: 9, border: "2px solid #f8f0dc33", background: "#1a1c2c",
    color: "#f8f0dc", outline: "none", marginBottom: 10, fontFamily: "inherit",
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
    padding: "8px 14px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: "1px solid #ddd", background: "#fff", color: "#666",
  } as CSSProperties,
  tabOn: { background: "#1a1c2c", color: "#f8f0dc", border: "1px solid #1a1c2c" } as CSSProperties,
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: "12px 14px" } as CSSProperties,
  input: {
    padding: "7px 9px", fontSize: 13, borderRadius: 8, border: "1px solid #ddd",
    background: "#fff", color: "#2c2c34", outline: "none",
  } as CSSProperties,
  primaryBtn: {
    padding: "9px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: "none", background: "#3d6fd9", color: "#fff", fontWeight: 600,
  } as CSSProperties,
  secondaryBtn: {
    padding: "9px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: "1px solid #ccc", background: "#fff", color: "#444",
  } as CSSProperties,
  smallBtn: {
    padding: "3px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer",
    border: "1px solid #e0b4b4", background: "#fff", color: "#a33",
  } as CSSProperties,
  chip: {
    fontSize: 12, padding: "4px 11px", borderRadius: 13, cursor: "pointer",
    border: "1px solid #ddd", background: "#fff", color: "#777",
  } as CSSProperties,
  chipOn: { border: "1px solid #3d6fd9", background: "#e8effc", color: "#2a4fa0" } as CSSProperties,
};
