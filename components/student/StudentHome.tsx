"use client";

import { useEffect, useRef, useState } from "react";
import { S } from "@/lib/styles";
import { MAX_HP, myPokemonOf } from "@/lib/game";
import { initAudio, isMuted, setMuted, SFX, stopBattleBgm } from "@/lib/sound";
import { StudentData, ClassInfo, DayInfo, GameInfo } from "@/lib/types";
import BallIcon from "@/components/BallIcon";
import HpBar from "@/components/HpBar";
import BattleTab from "@/components/student/BattleTab";
import RaidTab from "@/components/student/RaidTab";
import SolveTab from "@/components/student/SolveTab";
import DailyTab from "@/components/student/DailyTab";
import ExploreTab from "@/components/student/ExploreTab";
import ShopTab from "@/components/student/ShopTab";
import DexTab from "@/components/student/DexTab";
import TradeTab from "@/components/student/TradeTab";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  cls: ClassInfo;
  caught: number[];
  setCaught: (ids: number[]) => void;
  counts: Record<number, number>;
  setCounts: (c: Record<number, number>) => void;
  shinies: number[];
  setShinies: (s: number[]) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
  game: GameInfo;
  setGame: (g: GameInfo) => void;
  onLogout: () => void;
}

const BALL_KINDS = ["poke", "superb", "hyper", "master"] as const;
type Tab = "battle" | "raid" | "solve" | "explore" | "shop" | "dex" | "trade";

export default function StudentHome({ student, setStudent, cls, caught, setCaught, counts, setCounts, shinies, setShinies, day, setDay, game, setGame, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("battle");
  const [toast, setToast] = useState("");
  const [muted, setMutedState] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const quizAutoRef = useRef(false);

  useEffect(() => { setMutedState(isMuted()); }, []);
  // 로그인 직후: 오늘의 퀴즈를 아직 안 풀었으면 첫 팝업으로 자동 표시 (하루 1번)
  useEffect(() => {
    if (!quizAutoRef.current && !day.quizDone) { quizAutoRef.current = true; setQuizOpen(true); }
  }, [day.quizDone]);
  const openQuiz = () => { initAudio(); SFX.click(); setQuizOpen(true); };
  // 홈은 헤더 안 토글을 쓰므로 고정 토글 숨김
  useEffect(() => {
    document.body.classList.add("app-has-header");
    return () => document.body.classList.remove("app-has-header");
  }, []);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  };

  // 탭 이동 시 클릭음. 배틀 탭을 벗어나면 BGM 정지.
  const goTab = (k: Tab) => {
    initAudio();
    SFX.click();
    if (k !== "battle") stopBattleBgm();
    setTab(k);
  };
  const toggleMute = () => {
    initAudio();
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
    if (!next) SFX.click();
  };

  const mine = myPokemonOf(game.battlePid);

  // 오늘의 퀴즈는 탭이 아니라 로그인 팝업 + 상단 띠로 제공(모바일 탭 수 절감)
  const tabs: [Tab, string][] = [
    ["battle", `배틀(${Math.max(0, day.battleLimit - day.battleUsed)})`],
    ["raid", "레이드"],
    ["solve", "문제풀이"],
    ["explore", `탐색(${Math.max(0, day.exploreLimit - day.encUsed)})`],
    ["shop", "상점"],
    ["dex", `도감(${caught.length})`],
    ["trade", "교환"],
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 16 }}>
            {student.nickname} <span style={{ fontSize: 11, opacity: 0.7 }}>{cls.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, fontSize: 11 }}>
            <span>{mine.name} Lv.{student.level}</span>
            <HpBar cur={student.hp} max={MAX_HP} width={80} />
            <span style={{ opacity: 0.8 }}>{student.hp}/{MAX_HP}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 17, color: "#eaa300" }}>{student.points.toLocaleString()} P</div>
          <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>
            {BALL_KINDS.map((k) =>
              student.inventory[k] > 0 ? (
                <span key={k} style={{ marginLeft: 6 }}>
                  <BallIcon kind={k} size={12} /> {student.inventory[k]}
                </span>
              ) : null
            )}
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <ThemeToggle variant="header" />
            <button onClick={toggleMute} title="소리 켜기/끄기" style={{ ...S.ghostBtn, padding: "2px 8px", fontSize: 12 }}>{muted ? "🔇" : "🔊"}</button>
            <button onClick={onLogout} style={{ ...S.ghostBtn, padding: "2px 8px", fontSize: 10 }}>로그아웃</button>
          </div>
        </div>
      </div>

      {/* 오늘의 퀴즈 상태 띠 — 안 풀었으면 눌러서 팝업 열기, 풀었으면 완료 표시 */}
      {!day.quizDone ? (
        <button
          onClick={openQuiz}
          style={{ ...S.panel, width: "100%", margin: "10px 0 0", padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "1px solid #e0b84a", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: "var(--ink)", textAlign: "left" }}
        >
          <span style={{ fontSize: 18 }}>🧠</span>
          <span style={{ flex: 1 }}>오늘의 퀴즈가 기다려요!</span>
          <span style={{ color: "#e0a63a", fontWeight: 700 }}>눌러서 풀기 →</span>
        </button>
      ) : (
        <div style={{ margin: "10px 0 0", padding: "7px 14px", fontSize: 12, color: "var(--ink-2)", textAlign: "center" }}>
          ✓ 오늘의 퀴즈 완료 — 내일 또 만나요
        </div>
      )}

      <div style={{ display: "flex", gap: 3, margin: "10px 0", flexWrap: "wrap", background: "#e9e9ee", padding: 3, borderRadius: 12 }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => goTab(k)} style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "battle" && (
        <BattleTab
          student={student}
          setStudent={setStudent}
          moveDiff={cls.settings?.moveDiff !== false}
          timerOn={cls.settings?.timerOn !== false}
          timeScale={cls.settings?.timeScale ?? 1.5}
          allowSubject={cls.settings?.allowStudentSubject === true}
          caught={caught}
          setCaught={setCaught}
          counts={counts}
          setCounts={setCounts}
          shinies={shinies}
          setShinies={setShinies}
          day={day}
          setDay={setDay}
          game={game}
          setGame={setGame}
          showToast={showToast}
        />
      )}
      {tab === "raid" && (
        <RaidTab
          student={student}
          setStudent={setStudent}
          game={game}
          timerOn={cls.settings?.timerOn !== false}
          timeScale={cls.settings?.timeScale ?? 1.5}
          caught={caught}
          setCaught={setCaught}
          counts={counts}
          setCounts={setCounts}
          shinies={shinies}
          setShinies={setShinies}
          showToast={showToast}
        />
      )}
      {tab === "solve" && <SolveTab student={student} setStudent={setStudent} day={day} setDay={setDay} />}
      {tab === "explore" && (
        <ExploreTab
          student={student}
          setStudent={setStudent}
          day={day}
          setDay={setDay}
          caught={caught}
          setCaught={setCaught}
          counts={counts}
          setCounts={setCounts}
          shinies={shinies}
          setShinies={setShinies}
          showToast={showToast}
        />
      )}
      {tab === "shop" && <ShopTab student={student} setStudent={setStudent} showToast={showToast} />}
      {tab === "dex" && (
        <DexTab
          caught={caught}
          counts={counts}
          setCounts={setCounts}
          shinies={shinies}
          student={student}
          setStudent={setStudent}
          game={game}
          setGame={setGame}
          showToast={showToast}
        />
      )}
      {tab === "trade" && (
        <TradeTab caught={caught} setCaught={setCaught} counts={counts} setCounts={setCounts} showToast={showToast} />
      )}

      {/* 오늘의 퀴즈 팝업 (로그인 자동 + 상단 띠로 재열기). 하루 1번은 서버가 관리. */}
      {quizOpen && (
        <div
          onClick={() => setQuizOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,10,22,0.72)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "inherit" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>🧠 오늘의 퀴즈</div>
              <button onClick={() => setQuizOpen(false)} style={{ ...S.ghostBtn, padding: "4px 12px", fontSize: 13 }}>✕ 닫기</button>
            </div>
            <DailyTab student={student} setStudent={setStudent} day={day} setDay={setDay} />
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
