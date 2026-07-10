"use client";

import { useCallback, useEffect, useState } from "react";
import { StudentData, ClassInfo } from "@/lib/types";
import LoginView from "@/components/student/LoginView";
import StudentHome from "@/components/student/StudentHome";

type Phase = "loading" | "login" | "home";

export default function StudentPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [caught, setCaught] = useState<number[]>([]);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/student/me");
      if (!res.ok) { setPhase("login"); return; }
      const data = await res.json();
      setStudent(data.student);
      setCls(data.class);
      setCaught(data.caught);
      setPhase("home");
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
      <div style={{ minHeight: "100vh", background: "#1a1c2c", color: "#9fd8ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DGM', sans-serif" }}>
        불러오는 중...
      </div>
    );

  if (phase === "login" || !student || !cls)
    return <LoginView onSuccess={loadMe} />;

  return (
    <StudentHome
      student={student}
      setStudent={setStudent}
      cls={cls}
      caught={caught}
      setCaught={setCaught}
      onLogout={logout}
    />
  );
}
