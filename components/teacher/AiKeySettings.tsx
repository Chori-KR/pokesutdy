"use client";

import { useState } from "react";
import { T } from "@/lib/styles";
import { AI_PROVIDERS, AiProvider } from "@/lib/ai";
import { teacherFetch } from "@/lib/teacherClient";
import type { ClassRow } from "@/components/teacher/TeacherHome";

interface Props {
  cls: ClassRow;
  setCls: (c: ClassRow) => void;
  showToast: (t: string) => void;
}

// AI 키(BYOK) 등록 (명세 §5.3): 제공사 선택 + 키 입력 + 연결 테스트.
// 키는 서버로만 전송되어 암호화 저장 — 화면에는 끝 4자 힌트만 남는다.
export default function AiKeySettings({ cls, setCls, showToast }: Props) {
  const [provider, setProvider] = useState<AiProvider>((cls.settings.aiProvider as AiProvider) || "gemini");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const registered = !!cls.settings.aiKeyEnc;

  async function save() {
    if (key.trim().length < 10) { setErr("API 키를 붙여넣어주세요."); return; }
    setErr("");
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/ai-key", {
        method: "POST",
        body: JSON.stringify({ provider, key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "등록에 실패했어요."); return; }
      setCls({ ...cls, settings: { ...cls.settings, aiProvider: data.provider, aiKeyEnc: "(등록됨)", aiKeyHint: data.hint } });
      setKey("");
      showToast("연결 테스트 성공! AI 문제 생성을 쓸 수 있어요. 🤖");
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("등록된 AI 키를 삭제할까요? AI 생성 버튼이 비활성화됩니다.")) return;
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/ai-key", { method: "DELETE" });
      if (!res.ok) { showToast("삭제에 실패했어요."); return; }
      const settings = { ...cls.settings };
      delete settings.aiProvider;
      delete settings.aiKeyEnc;
      delete settings.aiKeyHint;
      setCls({ ...cls, settings });
      showToast("AI 키를 삭제했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={T.card}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🤖 AI 문제 생성 (내 API 키 사용)</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 10 }}>
        본인의 AI API 키를 등록하면 문제 은행에서 <b>AI 생성</b> 버튼을 쓸 수 있어요.
        키는 암호화되어 저장되고 서버에서만 사용됩니다. Google Gemini는 <b>무료</b> 키 발급 가능 —{" "}
        <a href="/guide/ai-key" target="_blank" style={{ color: "#3d6fd9" }}>5분 키 발급 가이드 →</a>
      </div>

      {registered && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 10px", background: "#eef7ef", borderRadius: 8, fontSize: 12, marginBottom: 10 }}>
          <span>✅ 등록됨: <b>{AI_PROVIDERS[(cls.settings.aiProvider as AiProvider) || "gemini"]?.name}</b> (키 끝자리 ····{cls.settings.aiKeyHint})</span>
          <button onClick={remove} disabled={busy} style={{ ...T.smallBtn, marginLeft: "auto" }}>삭제</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={provider} onChange={(e) => setProvider(e.target.value as AiProvider)} style={T.input}>
          {(Object.keys(AI_PROVIDERS) as AiProvider[]).map((p) => (
            <option key={p} value={p}>{AI_PROVIDERS[p].name}</option>
          ))}
        </select>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={registered ? "새 키로 바꾸려면 입력" : "API 키 붙여넣기"}
          style={{ ...T.input, flex: 1, minWidth: 180 }}
        />
        <button onClick={save} disabled={busy} style={T.primaryBtn}>
          {busy ? "테스트 중..." : "저장 + 연결 테스트"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>{AI_PROVIDERS[provider].keyHelp}</div>
      {err && <div style={{ fontSize: 12, color: "#a32d2d", marginTop: 8 }}>{err}</div>}
    </div>
  );
}
