"use client";

import { useEffect, useState } from "react";

// Apps Script 코드(public/sheets/pokestudy.gs)를 보여주고 한 번에 복사하게 한다.
export default function ScriptBox() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/sheets/pokestudy.gs").then((r) => r.text()).then(setCode).catch(() => setCode(""));
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setOpen(true);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <button
          onClick={copy}
          disabled={!code}
          style={{
            padding: "9px 16px", borderRadius: 9, border: "none", cursor: code ? "pointer" : "default",
            background: copied ? "#2f9e6a" : "#3d6fd9", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
          }}
        >
          {copied ? "✓ 복사했어요!" : code ? "📋 코드 전체 복사" : "불러오는 중..."}
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #ccd", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
        >
          {open ? "코드 접기" : "코드 펼쳐 보기"}
        </button>
        <span style={{ fontSize: 12, color: "#888" }}>{code ? `${code.split("\n").length}줄` : ""}</span>
      </div>
      {open && (
        <pre style={{
          maxHeight: 420, overflow: "auto", background: "#1e2130", color: "#e6e6e6", borderRadius: 10,
          padding: 14, fontSize: 12, lineHeight: 1.55, userSelect: "all",
        }}>
          {code}
        </pre>
      )}
    </div>
  );
}
