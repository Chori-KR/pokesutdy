"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { T } from "@/lib/styles";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { SEED_QUESTIONS, generateClassCode } from "@/lib/seedQuestions";
import QuestionBank, { QuestionRow } from "@/components/teacher/QuestionBank";
import StatsTab from "@/components/teacher/StatsTab";
import AiKeySettings from "@/components/teacher/AiKeySettings";
import RaidSettings from "@/components/teacher/RaidSettings";
import AdminStats from "@/components/teacher/AdminStats";
import Brand from "@/components/Brand";

// 관리자(앱 제작자) 이메일 — 이 계정으로 로그인했을 때만 '가입 현황' 탭이 보인다.
// 실제 권한 검증은 서버(/api/admin/stats)에서 다시 하므로 여기선 표시 여부만 결정.
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim().toLowerCase();

export interface ClassRow {
  id: string;
  name: string;
  class_code: string;
  settings: {
    moveDiff: boolean;
    exploreLimit?: number;
    solveLimit?: number;
    battleLimit?: number;
    timerOn?: boolean;
    timeScale?: number;
    rareRate?: number;
    specialRate?: number;
    legendRate?: number;
    shinyRate?: number;
    raid?: {
      on?: boolean; pid?: number; shiny?: boolean; round?: number;
      threshold?: number; rewardPts?: number; rewardItem?: string; rewardCount?: number;
    };
    aiProvider?: string;
    aiKeyEnc?: string;
    aiKeyHint?: string;
  };
}

export default function TeacherHome({ session }: { session: Session }) {
  const [cls, setCls] = useState<ClassRow | null>(null);
  const [needsClass, setNeedsClass] = useState(false);
  const [className, setClassName] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [tab, setTab] = useState<"bank" | "stats" | "settings" | "admin">("bank");
  const isAdmin = !!ADMIN_EMAIL && (session.user.email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  };

  const loadQuestions = useCallback(async (classId: string) => {
    const supa = supabaseBrowser();
    const { data } = await supa
      .from("questions")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });
    setQuestions((data as QuestionRow[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data } = await supa.from("classes").select("*").limit(1);
      if (data && data.length > 0) {
        setCls(data[0] as ClassRow);
        loadQuestions(data[0].id);
      } else {
        setNeedsClass(true);
      }
    })();
  }, [loadQuestions]);

  async function createClass() {
    setErr("");
    const name = className.trim() || "우리 반";
    const supa = supabaseBrowser();
    // 학급 코드 충돌 시 재시도 (unique 제약)
    for (let i = 0; i < 5; i++) {
      const class_code = generateClassCode();
      const { data, error } = await supa
        .from("classes")
        .insert({ teacher_id: session.user.id, name, class_code })
        .select("*")
        .single();
      if (!error && data) {
        // 시연용 샘플 문제 등록
        await supa.from("questions").insert(
          SEED_QUESTIONS.map((q) => ({ ...q, class_id: data.id, source: "기본" }))
        );
        setCls(data as ClassRow);
        setNeedsClass(false);
        loadQuestions(data.id);
        showToast(`학급이 만들어졌어요! 학급 코드: ${data.class_code}`);
        return;
      }
      if (error && error.code !== "23505") {
        setErr(`학급 생성에 실패했어요: ${error.message}`);
        return;
      }
    }
    setErr("학급 코드 발급에 실패했어요. 다시 시도해주세요.");
  }

  async function updateSettings(patch: Partial<ClassRow["settings"]>) {
    if (!cls) return;
    const settings = { ...cls.settings, ...patch };
    const supa = supabaseBrowser();
    const { error } = await supa.from("classes").update({ settings }).eq("id", cls.id);
    if (!error) setCls({ ...cls, settings });
    else showToast("설정 저장에 실패했어요.");
  }

  function toggleMoveDiff() {
    updateSettings({ moveDiff: !(cls?.settings?.moveDiff !== false) });
  }

  async function logout() {
    await supabaseBrowser().auth.signOut();
  }

  if (needsClass)
    return (
      <div style={{ ...T.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>학급 만들기</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 18, textAlign: "center", lineHeight: 1.7 }}>
          학급을 만들면 학생들이 가입할 때 쓸 <b>학급 코드</b>가 자동으로 발급돼요.
        </div>
        <div style={{ ...T.card, width: "100%", maxWidth: 380, padding: 20 }}>
          <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="반 이름 (예: 5학년 2반)" style={{ ...T.input, width: "100%", marginBottom: 10 }} />
          {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 10 }}>{err}</div>}
          <button onClick={createClass} style={{ ...T.primaryBtn, width: "100%" }}>학급 생성 + 코드 발급</button>
        </div>
      </div>
    );

  if (!cls)
    return (
      <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        학급 정보를 불러오는 중...
      </div>
    );

  return (
    <div style={T.page}>
      <div style={{ marginBottom: 10 }}>
        <Brand height={34} color="#2c2c34" align="left" />
      </div>
      <div style={T.header}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>잡으면서 배우자! · 교사 메뉴</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
            {cls.name} · 학급 코드 <b style={{ color: "#ffd54a" }}>{cls.class_code}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ textAlign: "center", fontSize: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{questions.length}</div>총 문제
          </div>
          <div style={{ textAlign: "center", fontSize: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{questions.filter((q) => q.active).length}</div>출제 중
          </div>
          <button onClick={logout} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 6, cursor: "pointer", border: "2px solid #f8f0dc66", background: "transparent", color: "#f8f0dc" }}>
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
        {([["bank", "문제 은행"], ["stats", "학생·통계"], ["settings", "시스템 설정"], ...(isAdmin ? [["admin", "가입 현황"]] as const : [])] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...T.tabBtn, ...(tab === k ? T.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "bank" && (
        <QuestionBank
          classId={cls.id}
          questions={questions}
          setQuestions={setQuestions}
          showToast={showToast}
          hasAiKey={!!cls.settings?.aiKeyEnc}
        />
      )}

      {tab === "stats" && <StatsTab questions={questions} showToast={showToast} />}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={T.card}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>학급 코드</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2, color: "#3d6fd9" }}>{cls.class_code}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>학생들에게 이 코드를 알려주세요. 학생은 코드 + 닉네임 + 비밀번호만으로 가입해요.</div>
          </div>
          <div style={T.card}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, cursor: "pointer" }}>
              <div>
                기술 선택 = 난이도 선택
                <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>끄면 배틀에서 기술이 하나(보통 난이도)로 단순해집니다.</div>
              </div>
              <span onClick={toggleMoveDiff} style={{ position: "relative", width: 40, height: 21, background: cls.settings?.moveDiff !== false ? "#3d6fd9" : "#ccc", borderRadius: 11, cursor: "pointer", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 2, left: cls.settings?.moveDiff !== false ? 21 : 2, width: 17, height: 17, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
              </span>
            </label>
          </div>
          <div style={T.card}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, cursor: "pointer" }}>
              <div>
                배틀 제한 시간
                <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>끄면 시간 제한 없이 천천히 풀 수 있어요(그림·자료 문제에 적합). 켜면 아래 배수로 시간을 넉넉히 조절.</div>
              </div>
              <span
                onClick={() => updateSettings({ timerOn: !(cls?.settings?.timerOn !== false) })}
                style={{ position: "relative", width: 40, height: 21, background: cls.settings?.timerOn !== false ? "#3d6fd9" : "#ccc", borderRadius: 11, cursor: "pointer", flexShrink: 0 }}
              >
                <span style={{ position: "absolute", top: 2, left: cls.settings?.timerOn !== false ? 21 : 2, width: 17, height: 17, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
              </span>
            </label>
            {cls.settings?.timerOn !== false && (
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {[[1, "기본"], [1.5, "1.5배"], [2, "2배"], [3, "3배"]].map(([v, lab]) => {
                  const cur = cls.settings?.timeScale ?? 1.5;
                  const on = cur === v;
                  return (
                    <button key={String(v)} onClick={() => updateSettings({ timeScale: v as number })}
                      style={{ ...(on ? T.primaryBtn : T.secondaryBtn), padding: "6px 12px", fontSize: 12 }}>
                      {lab as string}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {(() => {
            const r0 = Math.round((cls.settings?.rareRate ?? 0.15) * 100);
            const sp0 = Math.round((cls.settings?.specialRate ?? 0.25) * 100);
            const l0 = Math.round((cls.settings?.legendRate ?? 0.05) * 100);
            const c0 = Math.max(0, 100 - r0 - sp0 - l0);
            const cur: Record<string, number> = { common: c0, special: sp0, rare: r0, legend: l0 };
            const KEYS = ["common", "special", "rare", "legend"] as const;
            const setRarity = (which: (typeof KEYS)[number], vRaw: number) => {
              const v = Math.max(0, Math.min(100, Math.round(vRaw) || 0));
              const others = KEYS.filter((k) => k !== which);
              const remain = 100 - v;
              const sumO = others.reduce((s, k) => s + cur[k], 0);
              const vals: Record<string, number> = { [which]: v };
              let acc = 0;
              others.forEach((k, i) => {
                if (i === others.length - 1) { vals[k] = Math.max(0, remain - acc); }
                else { const a = sumO <= 0 ? Math.round(remain / others.length) : Math.round((remain * cur[k]) / sumO); vals[k] = a; acc += a; }
              });
              updateSettings({ rareRate: vals.rare / 100, specialRate: vals.special / 100, legendRate: vals.legend / 100 });
            };
            const shinyPct = Math.round((cls.settings?.shinyRate ?? 0.025) * 1000) / 10;
            const sum = c0 + sp0 + r0 + l0;
            return (
              <div style={T.card}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>야생 출현 확률 <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>(이벤트 주간에 조정!)</span></div>
                <div style={{ fontSize: 11, color: "#888", margin: "4px 0 10px" }}>
                  네 등급의 합은 항상 100%로 자동 맞춰져요. (기본: 흔함 55 · 특별 25 · 희귀 15 · 전설 5)
                </div>
                {([["common", "흔함"], ["special", "특별"], ["rare", "희귀"], ["legend", "전설"]] as const).map(([key, label]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span>{label} 확률(%)</span>
                    <input type="number" min={0} max={100} value={cur[key]}
                      onChange={(e) => setRarity(key, Number(e.target.value))}
                      style={{ ...T.input, width: 70, textAlign: "center", flexShrink: 0 }} />
                  </div>
                ))}
                <div style={{ fontSize: 11, color: sum === 100 ? "#3a7" : "#a33", marginTop: 2, marginBottom: 12 }}>
                  합계 {sum}% (흔함 {c0} · 특별 {sp0} · 희귀 {r0} · 전설 {l0})
                </div>
                <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <span>✨ 이로치 확률(%) <span style={{ fontSize: 11, color: "#888" }}>(기본 2.5%)</span></span>
                  <input type="number" min={0} max={100} step={0.5} value={shinyPct}
                    onChange={(e) => updateSettings({ shinyRate: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100 })}
                    style={{ ...T.input, width: 70, textAlign: "center", flexShrink: 0 }} />
                </div>
              </div>
            );
          })()}
          <div style={T.card}>
            {([
              ["battleLimit", "하루 배틀 횟수", 2, "야생 포켓몬과 조우하는 횟수. 배틀 승리 포인트의 하루 상한 역할도 해요."],
              ["exploreLimit", "하루 야생 탐색 횟수", 3, "배틀 없이 볼만 던져 잡는 찬스. 0이면 탐색 탭이 잠깁니다."],
              ["solveLimit", "문제풀이 일일 한도", 10, "정답 1개당 +20P. 한도 × 20P가 하루 최대 수입이에요."],
            ] as const).map(([key, label, def, desc]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <div>
                  {label}
                  <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{desc}</div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={cls.settings?.[key] ?? def}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(99, Number(e.target.value)));
                    updateSettings({ [key]: v });
                  }}
                  style={{ ...T.input, width: 64, textAlign: "center", flexShrink: 0 }}
                />
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#999", marginTop: 12, lineHeight: 1.7 }}>
              변경은 저장 즉시 적용돼요 (학생은 화면 새로고침 후). 학생 선물·비밀번호 초기화는 <b>학생·통계</b> 탭에 있어요.
            </div>
          </div>
          <RaidSettings cls={cls} setCls={setCls} showToast={showToast} />
          <AiKeySettings cls={cls} setCls={setCls} showToast={showToast} />
        </div>
      )}

      {tab === "admin" && isAdmin && <AdminStats />}

      {toast && <div style={{ position: "sticky", bottom: 14, margin: "12px auto 0", width: "fit-content", maxWidth: "90%", background: "#1a1c2c", color: "#f8f0dc", padding: "9px 16px", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", textAlign: "center" }}>{toast}</div>}
    </div>
  );
}
