"use client";

import { useState } from "react";
import Link from "next/link";
import { S } from "@/lib/styles";

export default function LoginView({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    if (!code.trim()) { setErr("학급 코드를 입력해주세요."); return; }
    if (!nick.trim()) { setErr("닉네임을 입력해주세요."); return; }
    if (pw.length < 4) { setErr("비밀번호는 4자 이상으로 해주세요."); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/student/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), nickname: nick.trim(), password: pw }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "실패했어요. 다시 시도해주세요."); return; }
      onSuccess();
    } catch {
      setErr("서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 11, color: "#5b7a99", marginBottom: 2, letterSpacing: 1 }}>포켓몬 기반 학습 플랫폼</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>잡으면서 배우자!</div>
      <div style={{ fontSize: 12, color: "#5b7a99", marginBottom: 20 }}>
        {mode === "login" ? "다시 만나서 반가워요!" : "새로운 트레이너의 등장!"}
      </div>
      <div style={{ ...S.panel, width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => { setMode("login"); setErr(""); }} style={{ ...S.tabBtn, ...(mode === "login" ? S.tabOn : {}) }}>로그인</button>
          <button onClick={() => { setMode("signup"); setErr(""); }} style={{ ...S.tabBtn, ...(mode === "signup" ? S.tabOn : {}) }}>회원가입</button>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="학급 코드 (숫자 4자리)"
          style={S.input}
        />
        <input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="닉네임" style={S.input} />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="비밀번호 (4자 이상)" style={S.input} />
        {err && <div style={{ fontSize: 12, color: "#e0342a", marginBottom: 10 }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ ...S.primaryBtn, width: "100%", fontSize: 13, opacity: busy ? 0.6 : 1 }}>
          {busy ? "잠깐만요..." : mode === "login" ? "모험 시작!" : "가입하기 (500P + 몬스터볼 3개 지급!)"}
        </button>
        {mode === "signup" && (
          <div style={{ fontSize: 10, color: "#8a8f9a", marginTop: 10, lineHeight: 1.7, textAlign: "center" }}>
            개인정보 없이 학급 코드 + 닉네임만으로 가입해요.
          </div>
        )}
      </div>
      <Link href="/" style={{ ...S.ghostBtn, marginTop: 14, textDecoration: "none" }}>처음으로</Link>
    </div>
  );
}
