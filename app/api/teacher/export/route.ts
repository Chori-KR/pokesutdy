import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";
import { exportLogs, ExportLogRow } from "@/lib/sheetExport";

export const maxDuration = 60;

// 풀이 기록 CSV 내려받기 — 시트 연동을 쓰지 않는 선생님용.
// 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다.
const MAX_PAGES = 40; // 최대 4만 행 (60초 안에 끝나도록)

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const seoulTime = (iso: string) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date(iso));

export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const rows: ExportLogRow[] = [];
  let cursor = "";
  try {
    for (let i = 0; i < MAX_PAGES; i++) {
      const page = await exportLogs(supa, cls.id, cursor);
      rows.push(...page.rows);
      cursor = page.cursor;
      if (page.done) break;
    }
  } catch {
    return jsonError(500, "기록을 불러오지 못했어요.");
  }

  const head = ["날짜시각", "이름", "상황", "과목", "단원", "난이도", "정답", "문항", "정답 보기"];
  const lines = [head.join(",")];
  for (const [, at, nick, ctx, subj, unit, diff, ok, body, ans] of rows)
    lines.push([seoulTime(at), nick, ctx, subj, unit, diff, ok ? "O" : "X", body, ans].map(cell).join(","));

  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const name = `${cls.name || "학급"}_풀이기록_${date}.csv`;
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
}
