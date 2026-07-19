"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/styles";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function TeacherLogin() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(""); setInfo("");
    if (!email.includes("@")) { setErr("이메일 형식을 확인해주세요."); return; }
    if (pw.length < 6) { setErr("비밀번호는 6자 이상으로 해주세요."); return; }
    setBusy(true);
    const supa = supabaseBrowser();
    try {
      if (mode === "signup") {
        const { data, error } = await supa.auth.signUp({ email, password: pw });
        if (error) { setErr(errMsg(error.message)); return; }
        // 프로젝트 설정에 따라 이메일 확인이 필요할 수 있다
        if (!data.session)
          setInfo("가입 확인 메일을 보냈어요. 메일함에서 확인 후 로그인해주세요.");
      } else {
        const { error } = await supa.auth.signInWithPassword({ email, password: pw });
        if (error) setErr(errMsg(error.message));
      }
    } finally {
      setBusy(false);
    }
  }

  function errMsg(m: string) {
    if (m.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 달라요.";
    if (m.includes("already registered")) return "이미 가입된 이메일이에요. 로그인해주세요.";
    if (m.includes("Email not confirmed")) return "가입 확인 메일을 먼저 확인해주세요.";
    return `실패했어요: ${m}`;
  }

  return (
    <div style={{ ...T.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>잡으면서 배우자! · 교사</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        {mode === "login" ? "다시 오신 것을 환영해요!" : "가입하면 학급과 학급 코드가 만들어져요."}
      </div>
      <div style={{ ...T.card, width: "100%", maxWidth: 380, padding: 20 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => { setMode("login"); setErr(""); setInfo(""); }} style={{ ...T.tabBtn, flex: 1, ...(mode === "login" ? T.tabOn : {}) }}>로그인</button>
          <button onClick={() => { setMode("signup"); setErr(""); setInfo(""); }} style={{ ...T.tabBtn, flex: 1, ...(mode === "signup" ? T.tabOn : {}) }}>회원가입</button>
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" type="email" style={{ ...T.input, width: "100%", marginBottom: 8 }} />
        <input value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="비밀번호 (6자 이상)" type="password" style={{ ...T.input, width: "100%", marginBottom: 10 }} />
        {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 10 }}>{err}</div>}
        {info && <div style={{ fontSize: 12, color: "#0f6e56", marginBottom: 10 }}>{info}</div>}
        <button onClick={submit} disabled={busy} style={{ ...T.primaryBtn, width: "100%", opacity: busy ? 0.6 : 1 }}>
          {busy ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </div>
      <Link href="/" style={{ fontSize: 13, color: "#888", marginTop: 16 }}>처음으로</Link>
    </div>
  );
}
