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
  q?: { body: string; options: string[]; answer_idx: number; difficulty: Difficulty; tag: string; type: "multiple" | "short" };
}

const EXAMPLE = `객관식 | 3+4는 얼마일까요? | 6 | 7 | 8 | 9 | 2 | 쉬움 | 수학·덧셈
단답형 | 조선을 건국한 사람은? |  |  |  |  | 이성계 | 보통 | 사회·조선`;

const SHORT_WORDS = ["단답형", "단답", "주관식", "short"];
const MULT_WORDS = ["객관식", "사지선다", "4지선다", "multiple", "mc"];

// 대량 등록: 한 줄 = 한 문제. 첫 칸에 유형(객관식/단답형)을 넣을 수 있고, 생략하면 객관식으로 봄.
// 형식: 유형 | 문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답 | 난이도 | 태그
//   - 객관식: 보기 4개 + 정답=번호(1~4)
//   - 단답형: 보기 비움 + 정답=허용 정답들(쉼표 구분)
function normDiff(diffRaw: string): Difficulty | null {
  if (!diffRaw) return "medium";
  if (DIFF_FROM_LABEL[diffRaw]) return DIFF_FROM_LABEL[diffRaw];
  if (["easy", "medium", "hard"].includes(diffRaw)) return diffRaw as Difficulty;
  return null;
}

export default function BulkImport({ classId, onRegistered, onClose, showToast }: Props) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const parsed: ParsedLine[] = useMemo(() => {
    return text
      .split("\n")
      .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
      .filter(({ raw }) => raw.length > 0)
      .map(({ raw, line }): ParsedLine => {
        const parts = raw.split("|").map((p) => p.trim());
        // 첫 칸이 유형이면 소비, 아니면 객관식으로 간주(구형 형식 호환)
        let type: "multiple" | "short" = "multiple";
        if (parts.length && (SHORT_WORDS.includes(parts[0]) || MULT_WORDS.includes(parts[0]))) {
          type = SHORT_WORDS.includes(parts[0]) ? "short" : "multiple";
          parts.shift();
        }
        const [body, o1, o2, o3, o4, ansRaw, diffRaw, tagRaw] = parts;
        if (!body) return { line, ok: false, error: "문제를 채워주세요" };
        const diff = normDiff(diffRaw ?? "");
        if (diff === null) return { line, ok: false, error: `난이도는 쉬움/보통/어려움 중 하나예요 (지금: '${diffRaw}')` };
        const tag = tagRaw || "미분류";

        if (type === "short") {
          // 단답형: 정답 칸(ansRaw)에 허용 정답들(쉼표)
          const answers = (ansRaw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
          if (answers.length === 0) return { line, ok: false, error: "단답형은 정답 칸에 허용 정답을 1개 이상 넣어주세요 (여러 개는 쉼표)" };
          return { line, ok: true, q: { body, options: answers, answer_idx: 0, difficulty: diff, tag, type: "short" } };
        }
        // 객관식
        if (!o1 || !o2 || !o3 || !o4) return { line, ok: false, error: "객관식은 보기 4개를 모두 채워주세요 (단답형이면 첫 칸에 '단답형')" };
        const ans = Number(ansRaw);
        if (!(ans >= 1 && ans <= 4)) return { line, ok: false, error: `객관식 정답번호는 1~4여야 해요 (지금: '${ansRaw}')` };
        return { line, ok: true, q: { body, options: [o1, o2, o3, o4], answer_idx: ans - 1, difficulty: diff, tag, type: "multiple" } };
      });
  }, [text]);

  const good = parsed.filter((p) => p.ok);
  const bad = parsed.filter((p) => !p.ok);

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const header = ["유형(객관식/단답형)", "문제", "보기1", "보기2", "보기3", "보기4", "정답(객관식:번호 1~4 / 단답형:정답들 쉼표)", "난이도(쉬움/보통/어려움)", "태그(과목·단원)"];
    const ex1 = ["객관식", "3+4는 얼마일까요?", "6", "7", "8", "9", 2, "쉬움", "수학·덧셈"];
    const ex2 = ["단답형", "조선을 건국한 사람은?", "", "", "", "", "이성계", "보통", "사회·조선"];
    const ws = XLSX.utils.aoa_to_sheet([header, ex1, ex2]);
    ws["!cols"] = [{ wch: 16 }, { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "문제");
    XLSX.writeFile(wb, "잡으면서배우자_문제양식.xlsx");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false });
      const lines = rows
        // 헤더 행 건너뛰기(첫 칸에 '유형' 또는 '문제' 포함)
        .filter((r, i) => !(i === 0 && (String(r[0] ?? "").includes("유형") || String(r[0] ?? "").trim() === "문제")))
        .filter((r) => r.some((c) => String(c ?? "").trim() !== ""))
        .map((r) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => String(r[c] ?? "").trim()).join(" | "));
      setText(lines.join("\n"));
      showToast(`엑셀에서 ${lines.length}줄을 불러왔어요. 아래에서 확인 후 등록하세요.`);
    } catch {
      setErr("엑셀 파일을 읽지 못했어요. 양식(.xlsx)이 맞는지 확인해주세요.");
    } finally {
      e.target.value = "";
    }
  }

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

      <div style={{ background: "#f0f7f2", border: "1px solid #cfe6d8", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#2e6b4f", fontWeight: 600, marginBottom: 6 }}>엑셀로 한 번에 올리기 (권장)</div>
        <div style={{ fontSize: 11, color: "#557", lineHeight: 1.7, marginBottom: 8 }}>
          ① <b>양식 다운로드</b> → ② 엑셀에서 문제 채우기(한 줄 = 한 문제) → ③ <b>엑셀 업로드</b> → 아래 미리보기 확인 후 등록<br />
          <b>객관식</b>은 보기 4개 + 정답번호, <b>단답형</b>은 보기를 비우고 정답 칸에 허용 정답(쉼표 구분)을 적어요.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={downloadTemplate} style={{ ...T.secondaryBtn, fontSize: 12 }}>⬇ 양식 다운로드 (.xlsx)</button>
          <label style={{ ...T.primaryBtn, background: "#2e8b57", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
            ⬆ 엑셀 업로드
            <input type="file" accept=".xlsx,.xls" onChange={onFile} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
        또는 아래에 직접 붙여넣기 (한 줄 = 한 문제, 세로선 | 구분):<br />
        <b>유형 | 문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답 | 난이도 | 태그</b>
        <span style={{ color: "#999" }}> (유형·난이도·태그 생략 가능 — 유형 생략 시 객관식)</span>
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
