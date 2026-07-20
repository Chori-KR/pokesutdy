"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/styles";
import { teacherFetch } from "@/lib/teacherClient";

interface Stats {
  teacherCount: number;
  classCount: number;
  studentCount: number;
  recent: { email: string; created_at: string }[];
  generatedAt: string;
}

// 관리자(앱 제작자) 전용 가입 현황. 서버가 이메일로 권한을 검증한다.
export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await teacherFetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "불러오지 못했어요."); setStats(null); }
      else setStats(data as Stats);
    } catch {
      setErr("서버에 연결할 수 없어요.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const fmtDate = (s: string) => {
    if (!s) return "-";
    const d = new Date(s);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const cards: [string, number, string][] = stats
    ? [["가입 교사", stats.teacherCount, "👩‍🏫"], ["만든 학급", stats.classCount, "🏫"], ["학생 계정", stats.studentCount, "🎒"]]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>📊 가입 현황 <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>(관리자 전용)</span></div>
        <button onClick={load} disabled={loading} style={{ ...T.secondaryBtn, fontSize: 12, opacity: loading ? 0.6 : 1 }}>새로고침</button>
      </div>

      {loading && <div style={{ ...T.card, color: "#888", textAlign: "center" }}>불러오는 중...</div>}

      {err && !loading && (
        <div style={{ ...T.card, border: "1px solid #f0c9c9", background: "#fdf3f3" }}>
          <div style={{ fontSize: 13, color: "#a33", fontWeight: 600 }}>{err}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
            배포 환경변수에 <b>ADMIN_EMAIL</b>(또는 NEXT_PUBLIC_ADMIN_EMAIL)이 관리자 이메일로 설정돼 있어야 해요.
          </div>
        </div>
      )}

      {stats && !loading && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {cards.map(([label, n, ico]) => (
              <div key={label} style={{ ...T.card, textAlign: "center", padding: "16px 8px" }}>
                <div style={{ fontSize: 22 }}>{ico}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#3d6fd9", margin: "4px 0 2px" }}>{n.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>최근 가입한 교사 <span style={{ fontSize: 11, color: "#999", fontWeight: 400 }}>(최대 30명)</span></div>
            {stats.recent.length === 0 ? (
              <div style={{ fontSize: 12, color: "#999" }}>아직 가입한 교사가 없어요.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {stats.recent.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "7px 2px", borderBottom: i < stats.recent.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                    <span style={{ color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                    <span style={{ color: "#999", fontSize: 12, flexShrink: 0, marginLeft: 10 }}>{fmtDate(r.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, color: "#aaa", textAlign: "right" }}>
            기준 시각 {new Date(stats.generatedAt).toLocaleString("ko-KR")}
          </div>
        </>
      )}
    </div>
  );
}
