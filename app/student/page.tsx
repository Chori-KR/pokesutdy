"use client";

import { useCallback, useEffect, useState } from "react";
import { StudentData, ClassInfo, DayInfo, GameInfo } from "@/lib/types";
import { DEFAULT_EXPLORE_LIMIT, DEFAULT_SOLVE_LIMIT, DEFAULT_BATTLE_LIMIT, DEFAULT_BATTLE_PID } from "@/lib/game";
import LoginView from "@/components/student/LoginView";
import StudentHome from "@/components/student/StudentHome";
import StarterSelect from "@/components/student/StarterSelect";

type Phase = "loading" | "login" | "starter" | "home";

const EMPTY_DAY: DayInfo = {
  quizDone: false,
  encUsed: 0,
  solveCount: 0,
  battleUsed: 0,
  exploreLimit: DEFAULT_EXPLORE_LIMIT,
  solveLimit: DEFAULT_SOLVE_LIMIT,
  battleLimit: DEFAULT_BATTLE_LIMIT,
};
const EMPTY_GAME: GameInfo = { starter: null, battlePid: DEFAULT_BATTLE_PID, wins: {}, evoCount: 0, dexRewards: [] };

export default function StudentPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [caught, setCaught] = useState<number[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({}); // M8: 종별 마리 수
  const [shinies, setShinies] = useState<number[]>([]); // M11: 이로치 보유 종
  const [day, setDay] = useState<DayInfo>(EMPTY_DAY);
  const [game, setGame] = useState<GameInfo>(EMPTY_GAME);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/student/me");
      if (!res.ok) { setPhase("login"); return; }
      const data = await res.json();
      setStudent(data.student);
      setCls(data.class);
      setCaught(data.caught);
      setCounts(data.counts ?? {});
      setShinies(data.shinies ?? []);
      setDay(data.day ?? EMPTY_DAY);
      setGame(data.game ?? EMPTY_GAME);
      // 스타팅 미선택(신규 가입 또는 기존 학생 첫 접속) → 선택 화면 먼저
      setPhase(data.game?.starter ? "home" : "starter");
    } catch {
      setPhase("login");
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  async function logout() {
    await fetch("/api/student/logout", { method: "POST" });
    setStudent(null);
    setPhase("login");
  }

  if (phase === "loading")
    return (
      <div style={{ minHeight: "100vh", background: "#f4f5fa", color: "#8a8f9a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        불러오는 중...
      </div>
    );

  if (phase === "login" || !student || !cls)
    return <LoginView onSuccess={loadMe} />;

  if (phase === "starter")
    return <StarterSelect nickname={student.nickname} onDone={loadMe} />;

  return (
    <StudentHome
      student={student}
      setStudent={setStudent}
      cls={cls}
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
      onLogout={logout}
    />
  );
}
