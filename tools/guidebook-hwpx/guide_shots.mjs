// 가이드북 새 기능 스크린샷 — 메인 빌드 + 가짜 API (DB 없이)
import { createRequire } from "module";
const require = createRequire("/home/user/pokesutdy/");
const { chromium } = require("playwright");
const B = process.env.B, OUT = process.env.OUT;
const AREAS = ["받아올림·내림이 없는 두 자리 및 세 자리 수의 덧셈과 뺄셈", "받아올림·내림이 1번 있는 두 자리 수의 덧셈 및 뺄셈",
  "곱셈구구 및 곱셈구구 범위의 기초 나눗셈", "올림이 없는 두 자리 수 곱하기 한 자리 수", "올림이 있는 두 자리 수 곱하기 한 자리 수"];
const SAMPLE = [["34 + 25 = ?", ["59", "49", "58", "69"]], ["47 + 36 = ?", ["83", "73", "713", "82"]], ["7 × 8 = ?", ["56", "54", "48", "63"]],
  ["23 × 3 = ?", ["69", "66", "96", "26"]], ["46 × 4 = ?", ["184", "164", "1624", "174"]]];
const qs = Array.from({ length: 960 }, (_, i) => {
  const a = i % 5, [body, opts] = SAMPLE[a];
  return { id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`, class_id: "c1", body: i < 5 ? body : `${body.replace(" = ?", "")} 계산하기 (${i})`,
    options: opts, answer_idx: 0, difficulty: ["easy", "medium", "hard"][i % 3], tag: "수학·" + AREAS[a], active: true, source: "대량",
    type: "multiple", raid_only: i % 40 === 3, tries: 12 + (i % 9), wrong: 2 + (i % 5), created_at: new Date(2026, 9, 1, 0, i).toISOString() };
});
const U = { id: "11111111-1111-1111-1111-111111111111", email: "teacher@example.com", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const tok = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImV4cCI6NDEwMjQ0NDgwMH0.x";
const cls = { id: "c1", teacher_id: U.id, name: "특수교육사례발표대회 제출용", class_code: "0213",
  settings: { moveDiff: true, gens: [1, 2, 9], allowStudentSubject: true, timerOn: true, battleLimit: 2, exploreLimit: 3, solveLimit: 10 } };
const fix = async (p) => p.evaluate(() => {   // 화면 속 로컬 주소를 실제 사이트 주소로
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) n.nodeValue = n.nodeValue.replace(/http:\/\/localhost:\d+/g, "https://pokesutdy.vercel.app");
});
const b = await chromium.launch();

// ── 교사 화면 ──
{
  const ctx = await b.newContext({ viewport: { width: 760, height: 1000 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.on("pageerror", (e) => console.log("PAGEERR", e.message.slice(0, 300)));
  p.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 300)); });
  const J = (r, o) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(o) });
  await p.route("http://localhost:3011/**", async (r) => {
    const u = new URL(r.request().url());
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (u.pathname.startsWith("/auth/v1/token")) return J(r, { access_token: tok, token_type: "bearer", expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, refresh_token: "r", user: U });
    if (u.pathname.startsWith("/auth/v1/user")) return J(r, U);
    if (u.pathname === "/rest/v1/classes") return J(r, [cls]);
    if (u.pathname === "/rest/v1/questions") { const off = +(u.searchParams.get("offset") ?? 0), lim = +(u.searchParams.get("limit") ?? 1000); return J(r, qs.slice(off, off + lim)); }
    return J(r, []);
  });
  await p.route("**/api/teacher/**", async (r) => {
    const u = new URL(r.request().url());
    if (u.pathname.endsWith("/export-token")) return J(r, { ok: true, exportToken: "pk_Qx7mR2vLk9TsW4nB8cYd1FhJ6pZa3UeG" });
    if (u.pathname.endsWith("/raid-requests")) return J(r, { list: [{ pid: 249, count: 2 }, { pid: 150, count: 1 }], total: 3, winCount: 0, studentTotal: 4 });
    return J(r, []);
  });
  await p.goto(B + "/teacher"); await p.waitForTimeout(1200);
  await p.fill('input[placeholder="이메일"]', "teacher@example.com"); await p.fill("input[type=password]", "whatever1");
  await p.locator("button", { hasText: /^로그인$/ }).last().click(); await p.waitForTimeout(3000);
  await p.screenshot({ path: `${OUT}/t_bank_top.png`, clip: { x: 0, y: 0, width: 760, height: 470 } });
  const more = p.locator("text=/보는 중/").first(); await more.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const mb = await more.boundingBox();
  await p.screenshot({ path: `${OUT}/t_bank_more.png`, clip: { x: 0, y: Math.max(0, mb.y - 300), width: 760, height: 360 } });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator("button", { hasText: "시스템 설정" }).first().click(); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/dbg_settings.png`, fullPage: true });
  const tg = p.getByText("출제 과목", { exact: false }).first(); await tg.scrollIntoViewIfNeeded();
  const tb = await tg.boundingBox();
  await p.screenshot({ path: `${OUT}/t_toggle.png`, clip: { x: 0, y: Math.max(0, tb.y - 100), width: 760, height: 180 } });
  const card = p.locator("text=📊 구글 시트 연동").first().locator("xpath=..");
  await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await card.screenshot({ path: `${OUT}/t_sheet_before.png` });
  await p.locator("button", { hasText: "연동 주소 만들기" }).click(); await p.waitForTimeout(3500);
  await fix(p); await p.waitForTimeout(200);
  await card.screenshot({ path: `${OUT}/t_sheet_after.png` });
  await ctx.close();
}

// ── 학생 화면 ──
{
  const ctx = await b.newContext({ viewport: { width: 760, height: 1000 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const me = { student: { id: "s1", nickname: "학생C", points: 1075, inventory: { poke: 8, superb: 3 }, hp: 100, level: 114, xp: 40 },
    class: { name: cls.name, class_code: "0213", settings: cls.settings },
    caught: [909, 910, 911, 25, 152, 155, 158], counts: { 909: 0, 910: 0, 911: 1, 25: 2, 152: 1, 155: 1, 158: 1 }, shinies: [],
    day: { quizDone: true, encUsed: 0, solveCount: 0, battleUsed: 0, exploreLimit: 3, solveLimit: 10, battleLimit: 2 },
    game: { starter: 909, battlePid: 911, wins: { 911: 3 }, evoCount: 2, dexRewards: [] } };
  const bq = qs.slice(0, 50).map((q) => ({ ...q, last: "none" }));
  const ORDER = [...AREAS].sort((a, c) => a.localeCompare(c, "ko"));
  await p.route("**/api/**", async (r) => {
    const u = new URL(r.request().url()), m = r.request().method();
    const j = (o) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(o) });
    if (u.pathname === "/api/student/me") return j(me);
    if (u.pathname === "/api/battle/questions") return j({ questions: bq, seenTodayIds: [] });
    if (u.pathname === "/api/solve/question" && m === "GET") return j({ allowed: true, label: "영역", areas: ORDER });
    if (u.pathname === "/api/solve/question" && m === "POST") return j({ question: { id: "q1", body: "23 × 3 = ?", options: ["69", "66", "96", "26"], difficulty: "easy", tag: "수학·" + AREAS[3], type: "multiple" }, solveCount: 3, solveLimit: 10 });
    if (u.pathname === "/api/solve/answer") return j({ correct: true, answer_idx: 0, reward: 20, level: 114, levelBonus: 0, points: 1095, xp: 42, solveCount: 4 });
    return j({});
  });
  await p.goto(B + "/student"); await p.waitForTimeout(2500);
  const sel = p.locator("select").first(); const sb = await sel.boundingBox();
  await p.screenshot({ path: `${OUT}/s_battle_area.png`, clip: { x: 0, y: 0, width: 760, height: Math.min(1000, sb.y + 110) } });
  await p.locator("button", { hasText: /^문제풀이$/ }).first().click(); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/s_solve_pick.png`, clip: { x: 0, y: 0, width: 760, height: 470 } });
  await p.locator("select").first().selectOption(AREAS[3]); await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/s_solve_picked.png`, clip: { x: 0, y: 0, width: 760, height: 470 } });
  await p.locator("button", { hasText: "문제 받기" }).click(); await p.waitForTimeout(700);
  await p.locator("button", { hasText: /^1\./ }).click(); await p.locator("button", { hasText: "정답 제출" }).click(); await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/s_solve_next.png`, clip: { x: 0, y: 0, width: 760, height: 720 } });
  await ctx.close();
}
await b.close();
console.log("done");
