"use client";

import { useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { Difficulty, DIFF_FROM_LABEL } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { QuestionRow } from "@/components/teacher/QuestionBank";

interface Props {
  classId: string;
  onRegistered: (rows: QuestionRow[]) => void;
  onClose: () => void;
  showToast: (t: string) => void;
}

interface ParsedLine {
  line: number;
  ok: boolean;
  error?: string;
  q?: { body: string; options: string[]; answer_idx: number; difficulty: Difficulty; tag: string };
}

const EXAMPLE = `3+4는 얼마일까요? | 6 | 7 | 8 | 9 | 2 | 쉬움 | 수학·덧셈
조선을 건국한 사람은? | 이성계 | 왕건 | 세종 | 이순신 | 1 | 보통 | 사회·조선`;

// 대량 등록 (명세 §5.1 확장): 한 줄 = 한 문제.
// 형식: 문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답번호(1~4) | 난이도 | 태그
// (난이도·태그는 생략 가능 — 기본 보통/미분류)
export default function BulkImport({ classId, onRegistered, onClose, showToast }: Props) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const parsed: ParsedLine[] = useMemo(() => {
    return text
      .split("\n")
      .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
      .filter(({ raw }) => raw.length > 0)
      .map(({ raw, line }) => {
        const parts = raw.split("|").map((p) => p.trim());
        if (parts.length < 6) return { line, ok: false, error: "칸이 부족해요 (최소: 문제|보기4개|정답번호)" };
        const [body, o1, o2, o3, o4, ansRaw, diffRaw, tagRaw] = parts;
        if (!body || !o1 || !o2 || !o3 || !o4) return { line, ok: false, error: "문제와 보기 4개를 모두 채워주세요" };
        const ans = Number(ansRaw);
        if (!(ans >= 1 && ans <= 4)) return { line, ok: false, error: `정답번호는 1~4여야 해요 (지금: '${ansRaw}')` };
        const difficulty = (diffRaw && (DIFF_FROM_LABEL[diffRaw] ?? (["easy", "medium", "hard"].includes(diffRaw) ? diffRaw : null))) || "medium";
        if (diffRaw && difficulty === "medium" && !["보통", "medium"].includes(diffRaw) && !DIFF_FROM_LABEL[diffRaw])
          return { line, ok: false, error: `난이도는 쉬움/보통/어려움 중 하나예요 (지금: '${diffRaw}')` };
        return {
          line, ok: true,
          q: { body, options: [o1, o2, o3, o4], answer_idx: ans - 1, difficulty: difficulty as Difficulty, tag: tagRaw || "미분류" },
        };
      });
  }, [text]);

  const good = parsed.filter((p) => p.ok);
  const bad = parsed.filter((p) => !p.ok);

  async function register() {
    if (good.length === 0) { setErr("등록할 수 있는 문제가 없어요. 형식을 확인해주세요."); return; }
    const supa = supabaseBrowser();
    const payload = good.map((p) => ({ ...p.q!, class_id: classId, source: "대량" }));
    const { data, error } = await supa.from("questions").insert(payload).select("*");
    if (error || !data) { setErr(`등록 실패: ${error?.message}`); return; }
    onRegistered(data as QuestionRow[]);
    showToast(`${data.length}개 문제를 등록했어요!`);
    onClose();
  }

  return (
    <div style={{ ...T.card, marginBottom: 10, border: "2px solid #2e8b57" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>📥 대량 등록</div>
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
        한 줄에 한 문제씩, 세로선(|)으로 구분해 붙여넣으세요. 엑셀에서 만들어 복사해도 좋아요.<br />
        <b>문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답번호(1~4) | 난이도 | 태그</b> (난이도·태그 생략 가능)
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        style={{ ...T.input, width: "100%", minHeight: 120, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}
      />
      {parsed.length > 0 && (
        <div style={{ fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: "#0f6e56" }}>등록 가능 {good.length}개</span>
          {bad.length > 0 && <span style={{ color: "#a32d2d" }}> · 오류 {bad.length}개</span>}
          {bad.slice(0, 5).map((b) => (
            <div key={b.line} style={{ color: "#a32d2d", marginTop: 3 }}>{b.line}번째 줄: {b.error}</div>
          ))}
        </div>
      )}
      {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={register} disabled={good.length === 0} style={{ ...T.primaryBtn, background: "#2e8b57", opacity: good.length === 0 ? 0.5 : 1 }}>
          {good.length}개 등록
        </button>
        <button onClick={onClose} style={T.secondaryBtn}>닫기</button>
      </div>
    </div>
  );
}
