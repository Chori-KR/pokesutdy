// 기본 문제 은행 만들기 — tools/question-bank/banks/bank_*.json → public/library/
//   index.json : 학년군 → 과목 → (영역) → 단원 목록 + 문제 수
//   b001.json… : 원본 묶음 파일 그대로 (서버가 읽어 출제·채점하고, 교사 화면이 문제 보기에 쓴다)
//   standards.json : 성취기준 코드 → 원문 (tools/question-bank/standards 의 "### 코드" 다음 줄) — 학습경로·현황표용
// 문제는 학급에 복사하지 않는다 — 학급은 켠 단원·숨긴 문제 목록만 갖는다(lib/library.ts).
// next build / next dev 를 시작할 때 next.config.mjs 가 부른다. public/library 는 커밋하지 않는다.
// 직접 실행: node scripts/build-library.mjs
import { readFileSync, readdirSync, mkdirSync, rmSync, statSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { join } from "path";

// 성취기준 문서(.md) 목록 — 하위 폴더까지
const mdFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? mdFiles(join(dir, e.name)) : e.name.endsWith(".md") ? [join(dir, e.name)] : []);

const SRC = "tools/question-bank/banks";
const STD_SRC = "tools/question-bank/standards";
const OUT = "public/library";
const BANDS = ["초1-2", "초3-4", "초5-6", "중1-3"];
const SUBJECTS = ["국어", "수학", "사회", "과학", "영어", "체육", "음악", "미술"];
const AREA = { 일사: "일반사회", 지리: "지리" };

// 성취기준 코드(예: 4수01-02, 9사(지리)03-01)로 교과서 순서를 맞춘다
const stdKey = (s) => {
  const m = /^\d+(\D+?)(\d+)-(\d+)/.exec(s ?? "");
  return m ? [m[1], +m[2], +m[3]] : ["~", 99, 99];
};
const cmpKey = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1] || a[2] - b[2]);

export function buildLibrary() {
  const files = readdirSync(SRC).filter((f) => f.startsWith("bank_") && f.endsWith(".json")).sort();
  // 문제 파일이 그대로면 건너뛴다 (next build 는 설정을 여러 번 읽는다)
  const docs = existsSync(STD_SRC) ? mdFiles(STD_SRC).sort() : [];
  const sig = [...files.map((f) => `${SRC}/${f}`), ...docs]
    .map((f) => { const st = statSync(f); return `${f}:${st.size}:${st.mtimeMs}`; }).join("\n");
  if (existsSync(`${OUT}/.sig`) && readFileSync(`${OUT}/.sig`, "utf8") === sig) return;
  mkdirSync(OUT, { recursive: true });

  const units = new Map(); // tag → 단원 정보
  const src = {};          // b001.json → 원래 파일 이름 (지문 고유 번호에 씀)
  files.forEach((f, i) => {
    const text = readFileSync(`${SRC}/${f}`, "utf8");
    const bank = JSON.parse(text);
    const meta = bank.meta ?? {};
    const id = `b${String(i + 1).padStart(3, "0")}.json`;
    writeFileSync(`${OUT}/${id}`, text);
    src[id] = f;
    for (const q of bank.questions ?? []) {
      const subject = q.subject ?? meta.subject;
      const band = q.gradeBand ?? meta.gradeBand;
      const unit = q.unit ?? meta.unit;
      // lib/bankImport.ts 와 같은 태그 규칙: "과목·학년군 단원"
      const tag = q.tag || `${subject}·${band} ${unit}`;
      let u = units.get(tag);
      if (!u) {
        const area = /^\d+\D+?\((\S+?)\)/.exec(q.standard ?? "")?.[1];
        const group = meta.course && meta.course !== subject ? meta.course : AREA[area] ?? "";
        u = { tag, band, subject, group, unit, count: 0, mc: 0, svg: 0, passage: 0, files: [], stds: new Set(), key: stdKey(q.standard) };
        units.set(tag, u);
      }
      u.count++;
      if ((q.type ?? "multiple") !== "short") u.mc++;
      if (q.svg) u.svg++;
      if (q.passage) u.passage++;
      if (!u.files.includes(id)) u.files.push(id);
      if (q.standard) u.stds.add(q.standard);
      const k = stdKey(q.standard);
      if (cmpKey(k, u.key) < 0) u.key = k;
    }
  });

  const order = (list, x) => (list.indexOf(x) < 0 ? 99 : list.indexOf(x));
  const all = [...units.values()];
  const index = {
    total: all.reduce((n, u) => n + u.count, 0),
    files: src,
    bands: [...new Set(all.map((u) => u.band))]
      .sort((a, b) => order(BANDS, a) - order(BANDS, b))
      .map((band) => {
        const inBand = all.filter((u) => u.band === band);
        return {
          band,
          count: inBand.reduce((n, u) => n + u.count, 0),
          subjects: [...new Set(inBand.map((u) => u.subject))]
            .sort((a, b) => order(SUBJECTS, a) - order(SUBJECTS, b))
            .map((subject) => {
              const list = inBand.filter((u) => u.subject === subject).sort((a, b) => cmpKey(a.key, b.key));
              return {
                subject,
                count: list.reduce((n, u) => n + u.count, 0),
                units: list.map(({ tag, group, unit, count, mc, svg, passage, files, stds }) => ({
                  tag, group, unit, count, mc, svg, passage, files,
                  stds: [...stds].sort((a, b) => cmpKey(stdKey(a), stdKey(b))), // 이 단원의 성취기준(교과서 순서)
                })),
              };
            }),
        };
      }),
  };
  writeFileSync(`${OUT}/index.json`, JSON.stringify(index));

  // 성취기준 원문 — 문제에 쓰인 코드만
  const used = new Set(all.flatMap((u) => [...u.stds]));
  const texts = {};
  for (const f of docs) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((l, i) => {
      const m = /^###\s+(\S+)\s*$/.exec(l);
      if (!m || !used.has(m[1]) || texts[m[1]]) return;
      const text = (lines.slice(i + 1).find((x) => x.trim()) ?? "").trim();
      if (text && !text.startsWith("-") && !text.startsWith("#")) texts[m[1]] = text;
    });
  }
  writeFileSync(`${OUT}/standards.json`, JSON.stringify(texts));
  // 묶음이 줄었으면 남은 옛 파일 정리
  for (const f of readdirSync(OUT)) if (/^b\d+\.json$/.test(f) && +f.slice(1, -5) > files.length) rmSync(`${OUT}/${f}`);
  writeFileSync(`${OUT}/.sig`, sig);
  console.log(`기본 문제 은행: ${files.length}개 묶음 · ${units.size}개 단원 · ${index.total}문제 · 성취기준 ${used.size}개(원문 ${Object.keys(texts).length}) → ${OUT}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildLibrary();
