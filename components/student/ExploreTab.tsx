"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { BALLS, RARITY, TYPE_COLORS, captureRate, josa, sleep, BallKind, Rarity, BIOMES } from "@/lib/game";
import { StudentData, DayInfo } from "@/lib/types";
import BallIcon from "@/components/BallIcon";
import Sprite from "@/components/Sprite";
import ShinyFx from "@/components/student/ShinyFx";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
  caught: number[];
  setCaught: (ids: number[]) => void;
  counts: Record<number, number>;
  setCounts: (c: Record<number, number>) => void;
  shinies: number[];
  setShinies: (s: number[]) => void;
  showToast: (t: string) => void;
}

interface Wild { id: number; name: string; type: string; rarity: Rarity; shiny?: boolean }
type EncState = "idle" | "active" | "throwing" | "caught" | "fled";

const BALL_KINDS = ["poke", "superb", "hyper", "master"] as const;

// 야생 탐색 (명세 §4.3): 배틀 없이 볼만 던져 포획. 출현·판정은 전부 서버.
export default function ExploreTab({ student, setStudent, day, setDay, caught, setCaught, counts, setCounts, shinies, setShinies, showToast }: Props) {
  const [wild, setWild] = useState<Wild | null>(null);
  const [token, setToken] = useState("");
  const [state, setState] = useState<EncState>("idle");
  const [fails, setFails] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sprayAsk, setSprayAsk] = useState(false); // 빛나는 스프레이 사용 여부 모달

  const left = Math.max(0, day.exploreLimit - day.encUsed);

  // 탐색 진입: 스프레이 보유 시 사용 여부를 먼저 묻고, 아니면 바로 시작
  function beginExplore() {
    if (busy || left <= 0) return;
    if ((student.inventory.spray ?? 0) > 0) setSprayAsk(true);
    else explore(false);
  }

  async function explore(withSpray = false) {
    if (busy || left <= 0) return;
    setSprayAsk(false);
    setBusy(true);
    try {
      const spray = withSpray && (student.inventory.spray ?? 0) > 0;
      const res = await fetch("/api/explore/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spray ? { useSpray: true } : {}),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "탐색에 실패했어요."); return; }
      if (data.inventory) setStudent({ ...student, inventory: data.inventory });
      setWild(data.pokemon);
      setToken(data.token);
      setFails(0);
      setState("active");
      { const bio = BIOMES[data.biome ?? ""]?.name; const where = bio ? `${bio}에서 ` : ""; setMsg(data.pokemon.shiny ? `✨ ${where}이로치 야생의 ${josa(data.pokemon.name, "이", "가")} 나타났다!` : `앗! ${where}야생의 ${josa(data.pokemon.name, "이", "가")} 나타났다!`); }
      setDay({ ...day, encUsed: data.encUsed });
    } catch {
      showToast("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function throwBall(kind: BallKind) {
    if (!wild || state !== "active" || student.inventory[kind] <= 0 || busy) return;
    setBusy(true);
    setState("throwing");
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    try {
      const [res] = await Promise.all([
        fetch("/api/battle/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ball: kind, token }),
        }),
        sleep(1500), // 몬스터볼 흔들림 연출 시간
      ]);
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "포획에 실패했어요.");
        setState("active");
        return;
      }
      setStudent({ ...student, inventory: data.inventory });
      if (data.success) {
        setState("caught");
        setMsg(`신난다! ${josa(wild.name, "을", "를")} 잡았다!`);
        if (data.caughtCount != null) setCounts({ ...counts, [wild.id]: data.caughtCount });
        if (data.shiny && !shinies.includes(wild.id)) {
          setShinies([...shinies, wild.id]);
          showToast(`✨ 이로치 ${wild.name}을(를) 도감에 기록했다!`);
        }
        if (data.newlyCaught) {
          setCaught([...caught, wild.id]);
          showToast("도감에 새로운 포켓몬이 기록되었다!");
        } else if ((data.caughtCount ?? 0) > 1) {
          showToast(`또 잡았다! (보유 ${data.caughtCount}마리)`);
        }
      } else {
        const f = fails + 1;
        setFails(f);
        if (f >= 2) {
          setState("fled");
          setMsg(`아앗! 야생 ${josa(wild.name, "이", "가")} 도망쳐 버렸다!`);
        } else {
          setState("active");
          setMsg("아... 아깝다! 조금만 더 하면 잡을 수 있었는데! (기회 1번 남음)");
        }
      }
    } catch {
      showToast("연결에 실패했어요. 다시 시도해주세요.");
      setState("active");
    } finally {
      setBusy(false);
    }
  }

  const encounterOver = !wild || state === "caught" || state === "fled";

  return (
    <div style={S.panel}>
      {encounterOver ? (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          {wild && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "center", opacity: state === "fled" ? 0.4 : 1 }}>
                <span style={{ position: "relative", display: "inline-block" }}>
                  <Sprite id={wild.id} color={TYPE_COLORS[wild.type]} pixel shiny={wild.shiny} size={110} />
                  {wild.shiny && <ShinyFx />}
                </span>
              </div>
              <div style={{ fontSize: 13, marginTop: 8 }}>{msg}</div>
            </div>
          )}
          {left > 0 ? (
            <>
              <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 10 }}>
                오늘 남은 탐색: {left}번 · 배틀 없이 볼만 던져서 잡는 찬스!
              </div>
              <button onClick={beginExplore} disabled={busy} style={S.primaryBtn}>
                {busy ? "탐색 중..." : "풀숲을 탐색한다"}
              </button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#9fd8ff", padding: 8 }}>
              오늘의 탐색을 모두 사용했어요. 내일 다시 만나요! (배틀로 잡는 건 배틀 탭에서 계속!)
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{wild.name}</span>
            <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 8, background: RARITY[wild.rarity].color, color: "#2c2c34" }}>
              {RARITY[wild.rarity].label}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", animation: state === "throwing" ? "none" : "floaty 2.2s ease-in-out infinite" }}>
            {state === "throwing" ? (
              <div style={{ width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ animation: "wiggle 1.5s ease-in-out infinite" }}>
                  <BallIcon kind="poke" size={42} />
                </div>
              </div>
            ) : (
              <Sprite id={wild.id} color={TYPE_COLORS[wild.type]} pixel shiny={wild.shiny} size={110} />
            )}
          </div>
          <div style={{ fontSize: 12, margin: "10px 0 12px", minHeight: 18 }}>{msg}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BALL_KINDS.map((k) => {
              const rate = captureRate(wild.rarity, k);
              return (
                <button
                  key={k}
                  onClick={() => throwBall(k)}
                  disabled={student.inventory[k] <= 0 || state === "throwing" || busy}
                  style={{ ...S.choiceBtn, opacity: student.inventory[k] <= 0 ? 0.35 : 1, fontSize: 12 }}
                >
                  <BallIcon kind={k} size={15} /> {BALLS[k].name} ×{student.inventory[k]}
                  <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 3 }}>성공률 {Math.round(rate * 100)}%</div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { setWild(null); setState("idle"); setMsg(""); }}
            style={{ ...S.ghostBtn, marginTop: 10 }}
          >
            포기하고 떠난다
          </button>
        </div>
      )}

      {/* 빛나는 스프레이 사용 여부 모달 */}
      {sprayAsk && (
        <div
          onClick={() => explore(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,10,22,0.82)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ ...S.panel, width: "100%", maxWidth: 300, textAlign: "center", padding: 20, animation: "pop 0.25s ease-out" }}>
            <div style={{ fontSize: 34, marginBottom: 4 }}>✨</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>빛나는 스프레이 (보유 {student.inventory.spray})</div>
            <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 16, lineHeight: 1.6 }}>
              사용하면 이번 야생을 <b style={{ color: "#ffd54a" }}>이로치로 확정</b>해요! (1개 소모)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => explore(false)} style={{ ...S.ghostBtn, flex: 1, padding: "10px 0", fontSize: 13 }}>그냥 탐색</button>
              <button onClick={() => explore(true)} style={{ ...S.primaryBtn, flex: 1, padding: "10px 0", fontSize: 13 }}>✨ 사용하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
