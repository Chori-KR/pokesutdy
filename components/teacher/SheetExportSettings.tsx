"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/styles";
import { teacherFetch } from "@/lib/teacherClient";
import type { ClassRow } from "@/components/teacher/TeacherHome";

interface Props {
  cls: ClassRow;
  setCls: (c: ClassRow) => void;
  showToast: (t: string) => void;
}

// 초리쌤이 만들어 둔 템플릿 시트의 "사본 만들기" 링크 (…/copy). 없으면 버튼을 숨긴다.
const TEMPLATE_URL = process.env.NEXT_PUBLIC_SHEETS_TEMPLATE_URL || "";

// 구글 시트 연동: 연동 주소(토큰) 발급·재발급·해제 + CSV 내려받기.
// 연동 주소를 시트 메뉴에 붙여넣으면 시트가 이 주소로 풀이 기록을 가져간다.
export default function SheetExportSettings({ cls, setCls, showToast }: Props) {
  const token = cls.settings.exportToken;
  const [origin, setOrigin] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);
  const url = token ? `${origin}/api/export?token=${token}` : "";
  const masked = token ? `${origin}/api/export?token=${token.slice(0, 6)}••••••••${token.slice(-4)}` : "";

  async function issue(again: boolean) {
    if (again && !window.confirm("연동 주소를 새로 만들까요?\n지금 쓰는 주소는 바로 끊기니, 시트에 새 주소를 다시 넣어주셔야 해요.")) return;
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/export-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "만들지 못했어요."); return; }
      setCls({ ...cls, settings: { ...cls.settings, exportToken: data.exportToken } });
      setShow(false);
      showToast(again ? "새 연동 주소를 만들었어요. 시트에 다시 넣어주세요." : "연동 주소를 만들었어요! 🔗");
    } catch {
      showToast("연결에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!window.confirm("시트 연동을 끊을까요?\n시트에 이미 쌓인 기록은 그대로 남고, 새 기록만 더 이상 가지 않아요.")) return;
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/export-token", { method: "DELETE" });
      if (!res.ok) { showToast("해제에 실패했어요."); return; }
      const settings = { ...cls.settings };
      delete settings.exportToken;
      setCls({ ...cls, settings });
      showToast("시트 연동을 끊었어요.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("연동 주소를 복사했어요. 시트 메뉴에 붙여넣으세요.");
    } catch {
      setShow(true);
      showToast("자동 복사가 안 돼요. 주소를 직접 선택해 복사해주세요.");
    }
  }

  async function downloadCsv() {
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/export");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "내려받기에 실패했어요.");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const m = cd.match(/filename\*=UTF-8''([^;]+)/);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = m ? decodeURIComponent(m[1]) : "풀이기록.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch {
      showToast("연결에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={T.card}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>📊 구글 시트 연동</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 10 }}>
        학생들의 문제 풀이 기록을 <b>내 구글 시트</b>로 자동으로 보내요. 시트에서 학생별 대시보드
        (과목·단원별 정답률, 난이도별, 오답 모아보기, 기간 선택)를 볼 수 있어요.{" "}
        <a href="/guide/sheets" target="_blank" style={{ color: "#3d6fd9" }}>설정 방법 보기 →</a>
      </div>

      {!token ? (
        <button onClick={() => issue(false)} disabled={busy} style={{ ...T.primaryBtn, padding: "8px 14px", fontSize: 13 }}>
          🔗 연동 주소 만들기
        </button>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>연동 주소</div>
          <div style={{
            fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 11.5, padding: "8px 10px",
            background: "#f5f6fa", border: "1px solid #e3e6ef", borderRadius: 8, wordBreak: "break-all",
            userSelect: show ? "all" : "none", marginBottom: 8,
          }}>
            {show ? url : masked}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <button onClick={copy} disabled={busy || !origin} style={{ ...T.primaryBtn, padding: "6px 12px", fontSize: 12 }}>📋 복사</button>
            <button onClick={() => setShow((v) => !v)} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>{show ? "가리기" : "전체 보기"}</button>
            <button onClick={() => issue(true)} disabled={busy} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>🔄 다시 만들기</button>
            <button onClick={revoke} disabled={busy} style={{ ...T.smallBtn, border: "1px solid #f0b4b4", color: "#c0392b", padding: "6px 12px", fontSize: 12 }}>연결 끊기</button>
          </div>
          <div style={{ fontSize: 11, color: "#a0522d", background: "#fdf5ec", borderRadius: 8, padding: "7px 10px", lineHeight: 1.6 }}>
            🔒 이 주소를 아는 사람은 우리 반 풀이 기록을 볼 수 있어요. <b>다른 사람에게 알려주지 마세요.</b>
            새어 나갔다면 <b>다시 만들기</b>를 누르면 예전 주소는 바로 막혀요.
          </div>
        </>
      )}

      <div style={{ borderTop: "1px solid #eee", marginTop: 12, paddingTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {TEMPLATE_URL && (
          <a href={TEMPLATE_URL} target="_blank" style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12, textDecoration: "none" }}>
            📄 시트 템플릿 사본 만들기
          </a>
        )}
        <button onClick={downloadCsv} disabled={busy} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>
          ⬇️ 풀이 기록 CSV로 내려받기
        </button>
        <span style={{ fontSize: 11, color: "#999" }}>시트 연동 없이 엑셀로 바로 볼 때</span>
      </div>
    </div>
  );
}
