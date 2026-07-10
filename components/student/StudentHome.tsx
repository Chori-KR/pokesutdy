"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { MY } from "@/lib/game";
import { StudentData, ClassInfo } from "@/lib/types";
import BallIcon from "@/components/BallIcon";
import HpBar from "@/components/HpBar";
import BattleTab from "@/components/student/BattleTab";
import DexTab from "@/components/student/DexTab";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  cls: ClassInfo;
  caught: number[];
  setCaught: (ids: number[]) => void;
  onLogout: () => void;
}

const BALL_KINDS = ["poke", "superb", "hyper", "master"] as const;

export default function StudentHome({ student, setStudent, cls, caught, setCaught, onLogout }: Props) {
  const [tab, setTab] = useState<"battle" | "dex">("battle");
  const [toast, setToast] = useState("");

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 16 }}>
            {student.nickname} <span style={{ fontSize: 11, opacity: 0.7 }}>{cls.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, fontSize: 11 }}>
            <span>{MY.name} Lv.{student.level}</span>
            <HpBar cur={student.hp} max={MY.maxHp} width={80} />
            <span style={{ opacity: 0.8 }}>{student.hp}/{MY.maxHp}</span>
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
          <button onClick={onLogout} style={{ ...S.ghostBtn, marginTop: 4, padding: "2px 8px", fontSize: 10 }}>로그아웃</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, margin: "10px 0", flexWrap: "wrap" }}>
        {([["battle", "배틀"], ["dex", `도감 ${caught.length}/151`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "battle" && (
        <BattleTab
          student={student}
          setStudent={setStudent}
          moveDiff={cls.settings?.moveDiff !== false}
          caught={caught}
          setCaught={setCaught}
          showToast={showToast}
        />
      )}
      {tab === "dex" && <DexTab caught={caught} />}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
