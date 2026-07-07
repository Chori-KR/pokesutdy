import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const DIFF = {
  easy: { label: "쉬움", bg: "#e1f5ee", fg: "#0f6e56" },
  medium: { label: "보통", bg: "#faeeda", fg: "#854f0b" },
  hard: { label: "어려움", bg: "#fcebeb", fg: "#a32d2d" },
};
const DIFF_FROM_LABEL = { 쉬움: "easy", 보통: "medium", 어려움: "hard" };

const SEED = [
  { id: 1, q: "1/5 + 2/5 = ?", opts: ["3/5", "3/10", "2/25", "4/5"], answer: 0, d: "easy", tag: "분수의 덧셈", active: true, src: "기본" },
  { id: 2, q: "1/2 + 1/3 = ?", opts: ["5/6", "2/5", "2/6", "1/6"], answer: 0, d: "medium", tag: "분수의 덧셈", active: true, src: "기본" },
  { id: 3, q: "철수는 피자의 1/4을, 영희는 3/8을 먹었습니다. 두 사람이 먹은 피자는 전체의 얼마일까요?", opts: ["5/8", "4/12", "1/2", "7/8"], answer: 0, d: "hard", tag: "분수의 덧셈", active: true, src: "기본" },
  { id: 4, q: "자석에서 클립이 가장 많이 붙는 곳은 어디일까요?", opts: ["양쪽 끝(극)", "한가운데", "아무 곳이나 같다", "붙지 않는다"], answer: 0, d: "easy", tag: "과학·자석", active: true, src: "기본" },
];

const STORAGE_KEY = "pokestudy-qbank-v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export default function App() {
  const [bank, setBank] = useState(null); // null = 로딩 중
  const [storageOk, setStorageOk] = useState(true);
  const [tab, setTab] = useState("bank"); // bank | ai | bulk | add
  const [filterTag, setFilterTag] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // ── 저장소 로드 ──
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        setBank(res?.value ? JSON.parse(res.value) : SEED);
      } catch {
        try {
          if (typeof window.storage === "undefined") setStorageOk(false);
        } catch { setStorageOk(false); }
        setBank(SEED);
      }
    })();
  }, []);

  async function saveBank(next) {
    setBank(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setStorageOk(false);
    }
  }

  function showToast(t) {
    setToast(t);
    setTimeout(() => setToast(""), 2500);
  }

  function addQuestions(items, srcLabel) {
    const base = Date.now();
    const withIds = items.map((it, i) => ({ ...it, id: base + i, active: true, src: srcLabel }));
    saveBank([...(bank || []), ...withIds]);
    showToast(`문제 ${items.length}개가 문제 은행에 등록되었습니다`);
    setTab("bank");
  }

  if (bank === null)
    return (
      <div style={S.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#666" }}>문제 은행을 불러오는 중...</div>
      </div>
    );

  const tags = [...new Set(bank.map((q) => q.tag))];
  const visible = bank.filter(
    (q) => (!filterTag || q.tag === filterTag) && (!search || q.q.includes(search))
  );
  const activeCount = bank.filter((q) => q.active).length;

  return (
    <div style={S.page}>
      {/* 헤더 */}
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 600 }}>포켓 스터디 · 교사 메뉴</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>
            5학년 2반 · 학급 코드 TIGER24 (프로토타입)
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 13, textAlign: "center" }}>
          <div><div style={{ fontSize: 20, fontWeight: 600 }}>{bank.length}</div><div style={{ opacity: 0.75 }}>총 문제</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 600 }}>{activeCount}</div><div style={{ opacity: 0.75 }}>출제 중</div></div>
        </div>
      </div>

      {!storageOk && (
        <div style={{ background: "#fff6e0", border: "1px solid #e8c56a", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#7a5b0d", margin: "10px 0" }}>
          이 환경에서는 영구 저장이 지원되지 않아 새로고침 시 데이터가 초기화됩니다. 실제 배포판에서는 서버에 저장됩니다.
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>
        {[["bank", "문제 은행"], ["ai", "AI 문제 생성"], ["bulk", "대량 등록"], ["add", "직접 추가"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "bank" && (
        <BankView
          bank={bank} visible={visible} tags={tags}
          filterTag={filterTag} setFilterTag={setFilterTag}
          search={search} setSearch={setSearch}
          onToggle={(id) => saveBank(bank.map((q) => (q.id === id ? { ...q, active: !q.active } : q)))}
          onDelete={(id) => saveBank(bank.filter((q) => q.id !== id))}
        />
      )}
      {tab === "ai" && <AiView onApprove={(items) => addQuestions(items, "AI")} />}
      {tab === "bulk" && <BulkView onRegister={(items) => addQuestions(items, "대량")} />}
      {tab === "add" && <AddView onAdd={(item) => addQuestions([item], "수동")} />}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 문제 은행 목록
// ─────────────────────────────────────────────
function BankView({ bank, visible, tags, filterTag, setFilterTag, search, setSearch, onToggle, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="문제 검색" style={{ ...S.input, flex: 1 }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#888" }}>단원 필터</span>
        <Chip on={!filterTag} onClick={() => setFilterTag(null)}>전체</Chip>
        {tags.map((t) => (
          <Chip key={t} on={filterTag === t} onClick={() => setFilterTag(filterTag === t ? null : t)}>{t}</Chip>
        ))}
      </div>

      {visible.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "#999", fontSize: 14 }}>
          문제가 없습니다. AI 생성이나 대량 등록으로 문제를 채워보세요.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map((q) => (
          <div key={q.id} style={{ ...S.card, opacity: q.active ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}>{q.q}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                  {q.opts.map((o, i) => (
                    <span key={i} style={{ marginRight: 10, color: i === q.answer ? "#0f6e56" : "#888", fontWeight: i === q.answer ? 600 : 400 }}>
                      {["①", "②", "③", "④"][i]} {o}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                  <Badge bg={DIFF[q.d].bg} fg={DIFF[q.d].fg}>{DIFF[q.d].label}</Badge>
                  <Badge bg="#eef1f8" fg="#3a4a7a">{q.tag}</Badge>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{q.src} 등록</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666", cursor: "pointer" }}>
                  출제
                  <span onClick={() => onToggle(q.id)} style={{ position: "relative", width: 34, height: 18, background: q.active ? "#3d6fd9" : "#ccc", borderRadius: 9, display: "inline-block", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 2, left: q.active ? 18 : 2, width: 14, height: 14, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                  </span>
                </label>
                <button onClick={() => onDelete(q.id)} style={S.smallBtn}>삭제</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI 생성
// ─────────────────────────────────────────────
function AiView({ onApprove }) {
  const [subject, setSubject] = useState("수학");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("초등 5학년");
  const [tag, setTag] = useState("");
  const [counts, setCounts] = useState({ easy: 2, medium: 2, hard: 1 });
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]); // 검토 대기 문제

  const total = counts.easy + counts.medium + counts.hard;

  async function generate() {
    if (!topic.trim()) { setError("단원·주제를 입력해주세요 (예: 조선의 건국, 분수의 덧셈)"); return; }
    if (total === 0 || total > 6) { setError("난이도별 개수 합계는 1~6개로 해주세요 (프로토타입 제한)"); return; }
    setError("");
    setLoading(true);
    setDrafts([]);
    try {
      const prompt = `당신은 학교 교사를 돕는 시험 문제 출제 도우미입니다. 다음 조건으로 4지선다 문제를 만들어주세요.

과목: ${subject}
단원·주제: ${topic}
학년 수준: ${grade}
난이도별 개수: 쉬움 ${counts.easy}개, 보통 ${counts.medium}개, 어려움 ${counts.hard}개
${extra.trim() ? `추가 지시: ${extra}` : ""}

출제 규칙:
- 오답 보기는 학생들이 실제로 저지르는 흔한 실수나 오개념에서 만들 것
- 난이도를 명확히 구분할 것: 쉬움=기본 개념 확인, 보통=개념 적용, 어려움=응용·복합·문장제
- 문제와 보기는 해당 학년이 이해할 수 있는 어휘로 쓸 것
- 정답이 특정 번호에 몰리지 않게 answer 인덱스를 골고루 분배할 것

반드시 아래 형식의 JSON 배열만 출력하세요. 마크다운 코드블록, 설명, 인사말을 절대 붙이지 마세요.
[{"q":"문제 내용","opts":["보기1","보기2","보기3","보기4"],"answer":0,"d":"easy","why":"정답 해설 한 줄"}]
answer는 정답 보기의 인덱스(0~3), d는 easy/medium/hard 중 하나입니다.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("empty");
      const clean = parsed
        .filter((p) => p.q && Array.isArray(p.opts) && p.opts.length === 4 && p.answer >= 0 && p.answer <= 3)
        .map((p) => ({ ...p, d: ["easy", "medium", "hard"].includes(p.d) ? p.d : "medium", tag: tag.trim() || `${subject}·${topic.trim()}` }));
      if (clean.length === 0) throw new Error("empty");
      setDrafts(clean.map((c, i) => ({ ...c, _key: i, _approved: true })));
    } catch (e) {
      setError("문제 생성에 실패했습니다. 잠시 후 다시 시도하거나, 개수를 줄여보세요.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(key, patch) {
    setDrafts((d) => d.map((x) => (x._key === key ? { ...x, ...patch } : x)));
  }

  function approveAll() {
    const items = drafts.filter((d) => d._approved).map(({ _key, _approved, why, ...rest }) => rest);
    if (items.length === 0) return;
    onApprove(items);
    setDrafts([]);
  }

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>어떤 문제를 만들까요?</div>
        <div style={{ display: "grid", gridTemplateColumns: "110px 2fr 1fr", gap: 8, marginBottom: 8 }}>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={S.input}>
            {["국어", "수학", "사회", "과학", "영어", "도덕", "실과", "체육", "음악", "미술", "진로와직업", "기타"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="단원·주제 (예: 조선의 건국, 분수의 덧셈)" style={S.input} />
          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={S.input}>
            {["초등 3학년", "초등 4학년", "초등 5학년", "초등 6학년", "중학교 1학년", "중학교 2학년", "중학교 3학년"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder={`단원 태그 (비우면 "${subject}·단원명" 자동 생성)`} style={S.input} />
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="추가 지시 (선택, 예: 문장제 위주로)" style={S.input} />
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12, fontSize: 13 }}>
          {["easy", "medium", "hard"].map((d) => (
            <label key={d} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge bg={DIFF[d].bg} fg={DIFF[d].fg}>{DIFF[d].label}</Badge>
              <select value={counts[d]} onChange={(e) => setCounts({ ...counts, [d]: +e.target.value })} style={{ ...S.input, padding: "4px 6px" }}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}개</option>)}
              </select>
            </label>
          ))}
          <span style={{ color: "#888", fontSize: 12 }}>합계 {total}개 (최대 6)</span>
        </div>
        <button onClick={generate} disabled={loading} style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "AI가 문제를 만드는 중... (몇 초 걸려요)" : "AI로 문제 생성하기"}
        </button>
        {error && <div style={{ color: "#a32d2d", fontSize: 13, marginTop: 8 }}>{error}</div>}
        <div style={{ fontSize: 11, color: "#999", marginTop: 10, lineHeight: 1.6 }}>
          프로토타입은 내장 AI(무료)를 사용합니다. 실제 배포판에서는 설정에서 본인의 제미나이 API 키를 등록해 사용하는 방식(BYOK)으로 바뀝니다.
        </div>
      </div>

      {drafts.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              생성된 문제 검토 ({drafts.filter((d) => d._approved).length}/{drafts.length} 선택됨)
            </div>
            <button onClick={approveAll} style={S.primaryBtn}>선택한 문제 등록하기</button>
          </div>
          <div style={{ fontSize: 12, color: "#996a1e", background: "#fdf6e3", border: "1px solid #e8d9a0", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
            AI가 만든 문제는 반드시 정답과 계산을 직접 확인한 뒤 등록하세요. 수정이 필요하면 내용을 바로 고칠 수 있습니다.
          </div>
          {drafts.map((d) => (
            <div key={d._key} style={{ ...S.card, marginBottom: 8, borderColor: d._approved ? "#b8cdf0" : "#e5e5e5" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input type="checkbox" checked={d._approved} onChange={(e) => updateDraft(d._key, { _approved: e.target.checked })} style={{ marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <textarea value={d.q} onChange={(e) => updateDraft(d._key, { q: e.target.value })} style={{ ...S.input, width: "100%", minHeight: 40, resize: "vertical", marginBottom: 6, boxSizing: "border-box" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                    {d.opts.map((o, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="radio" name={`ans-${d._key}`} checked={d.answer === i} onChange={() => updateDraft(d._key, { answer: i })} title="정답으로 지정" />
                        <input value={o} onChange={(e) => updateDraft(d._key, { opts: d.opts.map((x, xi) => (xi === i ? e.target.value : x)) })} style={{ ...S.input, flex: 1, borderColor: d.answer === i ? "#3d9970" : undefined }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select value={d.d} onChange={(e) => updateDraft(d._key, { d: e.target.value })} style={{ ...S.input, padding: "4px 6px" }}>
                      <option value="easy">쉬움</option><option value="medium">보통</option><option value="hard">어려움</option>
                    </select>
                    {d.why && <span style={{ fontSize: 12, color: "#888" }}>해설: {d.why}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 대량 등록
// ─────────────────────────────────────────────
function BulkView({ onRegister }) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");
  const [preview, setPreview] = useState(null);

  function parse() {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const ok = [];
    const bad = [];
    lines.forEach((line, idx) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 7) { bad.push(idx + 1); return; }
      const [q, o1, o2, o3, o4, ansRaw, dRaw] = parts;
      const answer = parseInt(ansRaw, 10) - 1;
      const d = DIFF_FROM_LABEL[dRaw];
      if (!q || !o1 || !o2 || !o3 || !o4 || isNaN(answer) || answer < 0 || answer > 3 || !d) { bad.push(idx + 1); return; }
      ok.push({ q, opts: [o1, o2, o3, o4], answer, d, tag: parts[7] || tag.trim() || "미분류" });
    });
    setPreview({ ok, bad });
  }

  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>엑셀·한글에서 복사해 붙여넣기</div>
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 10 }}>
        한 줄에 문제 하나씩, 항목을 세로선(|)으로 구분해주세요:<br />
        <code style={{ background: "#f4f4f0", padding: "2px 6px", borderRadius: 4 }}>
          문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답번호(1~4) | 난이도(쉬움/보통/어려움) | 단원태그(선택)
        </code>
      </div>
      <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="기본 단원 태그 (줄에 태그가 없을 때 사용)" style={{ ...S.input, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder={"세종대왕이 만든 문자는? | 한글 | 한자 | 가나 | 알파벳 | 1 | 쉬움 | 국어·우리 문화\n임진왜란이 일어난 해는? | 1492년 | 1592년 | 1692년 | 1392년 | 2 | 보통 | 사회·조선"}
        style={{ ...S.input, width: "100%", minHeight: 120, resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", fontSize: 12 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={parse} style={S.secondaryBtn}>미리보기</button>
        {preview && preview.ok.length > 0 && (
          <button onClick={() => { onRegister(preview.ok); setText(""); setPreview(null); }} style={S.primaryBtn}>
            {preview.ok.length}개 등록하기
          </button>
        )}
      </div>
      {preview && (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <span style={{ color: "#0f6e56" }}>인식 성공 {preview.ok.length}개</span>
          {preview.bad.length > 0 && (
            <span style={{ color: "#a32d2d", marginLeft: 10 }}>
              형식 오류 {preview.bad.length}개 (줄: {preview.bad.join(", ")})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 직접 추가
// ─────────────────────────────────────────────
function AddView({ onAdd }) {
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);
  const [d, setD] = useState("easy");
  const [tag, setTag] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!q.trim() || opts.some((o) => !o.trim()) || !tag.trim()) {
      setErr("문제, 보기 4개, 단원 태그를 모두 입력해주세요.");
      return;
    }
    onAdd({ q: q.trim(), opts: opts.map((o) => o.trim()), answer, d, tag: tag.trim() });
    setQ(""); setOpts(["", "", "", ""]); setAnswer(0); setErr("");
  }

  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>문제 직접 추가</div>
      <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="문제 내용" style={{ ...S.input, width: "100%", minHeight: 60, resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
        {opts.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" name="add-ans" checked={answer === i} onChange={() => setAnswer(i)} title="정답으로 지정" />
            <input value={o} onChange={(e) => setOpts(opts.map((x, xi) => (xi === i ? e.target.value : x)))} placeholder={`보기 ${i + 1}${answer === i ? " (정답)" : ""}`} style={{ ...S.input, flex: 1, borderColor: answer === i ? "#3d9970" : undefined }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select value={d} onChange={(e) => setD(e.target.value)} style={S.input}>
          <option value="easy">쉬움</option><option value="medium">보통</option><option value="hard">어려움</option>
        </select>
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="단원 태그" style={{ ...S.input, flex: 1 }} />
      </div>
      <button onClick={submit} style={S.primaryBtn}>등록하기</button>
      {err && <div style={{ color: "#a32d2d", fontSize: 13, marginTop: 8 }}>{err}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 공용 UI
// ─────────────────────────────────────────────
function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, padding: "4px 12px", borderRadius: 14, cursor: "pointer",
      border: on ? "1px solid #3d6fd9" : "1px solid #ddd",
      background: on ? "#e8effc" : "#fff", color: on ? "#2a4fa0" : "#777",
    }}>
      {children}
    </button>
  );
}

function Badge({ bg, fg, children }) {
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: bg, color: fg }}>
      {children}
    </span>
  );
}

const S = {
  page: {
    minHeight: "100vh", background: "#f6f5f1", color: "#2c2c34",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    padding: "20px 16px", maxWidth: 760, margin: "0 auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#1a1c2c", color: "#f8f0dc", borderRadius: 14, padding: "16px 20px",
  },
  tabBtn: {
    padding: "8px 14px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: "1px solid #ddd", background: "#fff", color: "#666",
  },
  tabOn: { background: "#1a1c2c", color: "#f8f0dc", border: "1px solid #1a1c2c" },
  card: {
    background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "14px 16px",
  },
  input: {
    padding: "8px 10px", fontSize: 13, borderRadius: 8, border: "1px solid #ddd",
    background: "#fff", color: "#2c2c34", outline: "none",
  },
  primaryBtn: {
    padding: "10px 18px", fontSize: 14, borderRadius: 8, cursor: "pointer",
    border: "none", background: "#3d6fd9", color: "#fff", fontWeight: 600,
  },
  secondaryBtn: {
    padding: "10px 18px", fontSize: 14, borderRadius: 8, cursor: "pointer",
    border: "1px solid #ccc", background: "#fff", color: "#444",
  },
  smallBtn: {
    padding: "4px 10px", fontSize: 12, borderRadius: 6, cursor: "pointer",
    border: "1px solid #e0b4b4", background: "#fff", color: "#a33",
  },
  toast: {
    position: "sticky", bottom: 16, margin: "16px auto 0", width: "fit-content",
    background: "#1a1c2c", color: "#f8f0dc", padding: "10px 20px", borderRadius: 10, fontSize: 13,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  },
};
