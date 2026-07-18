"use client";

import { useEffect, useState } from "react";
import { S } from "@/lib/styles";
import { MAX_HP, myPokemonOf } from "@/lib/game";
import { initAudio, isMuted, setMuted, SFX, stopBattleBgm } from "@/lib/sound";
import { StudentData, ClassInfo, DayInfo, GameInfo } from "@/lib/types";
import BallIcon from "@/components/BallIcon";
import HpBar from "@/components/HpBar";
import BattleTab from "@/components/student/BattleTab";
import SolveTab from "@/components/student/SolveTab";
import DailyTab from "@/components/student/DailyTab";
import ExploreTab from "@/components/student/ExploreTab";
import ShopTab from "@/components/student/ShopTab";
import DexTab from "@/components/student/DexTab";
import TradeTab from "@/components/student/TradeTab";

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
type Tab = "battle" | "solve" | "quiz" | "explore" | "shop" | "dex" | "trade";

export default function StudentHome({ student, setStudent, cls, caught, setCaught, counts, setCounts, shinies, setShinies, day, setDay, game, setGame, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("battle");
  const [toast, setToast] = useState("");
  const [muted, setMutedState] = useState(false);

  useEffect(() => { setMutedState(isMuted()); }, []);

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

  // 탭 순서는 명세 §3: 배틀 / 문제풀이 / 오늘의 퀴즈 / 야생 탐색 / 상점 / 도감
  const tabs: [Tab, string][] = [
    ["battle", `배틀(${Math.max(0, day.battleLimit - day.battleUsed)})`],
    ["solve", "문제풀이"],
    ["quiz", day.quizDone ? "퀴즈 ✓" : "퀴즈"],
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
          <div style={{ fontSize: 17, color: "#ffd54a" }}>{student.points.toLocaleString()} P</div>
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
            <button onClick={toggleMute} title="소리 켜기/끄기" style={{ ...S.ghostBtn, padding: "2px 8px", fontSize: 12 }}>{muted ? "🔇" : "🔊"}</button>
            <button onClick={onLogout} style={{ ...S.ghostBtn, padding: "2px 8px", fontSize: 10 }}>로그아웃</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, margin: "10px 0", flexWrap: "wrap" }}>
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
      {tab === "solve" && <SolveTab student={student} setStudent={setStudent} day={day} setDay={setDay} />}
      {tab === "quiz" && <DailyTab student={student} setStudent={setStudent} day={day} setDay={setDay} />}
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
      {tab === "dex" && <DexTab caught={caught} counts={counts} shinies={shinies} />}
      {tab === "trade" && (
        <TradeTab caught={caught} setCaught={setCaught} counts={counts} setCounts={setCounts} showToast={showToast} />
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
