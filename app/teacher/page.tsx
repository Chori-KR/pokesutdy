"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import TeacherLogin from "@/components/teacher/TeacherLogin";
import TeacherHome from "@/components/teacher/TeacherHome";

export default function TeacherPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supa = supabaseBrowser();
    // 세션 확인이 오래 걸려도(예: Supabase 도달 지연) 최대 6초 뒤엔 화면을 띄운다.
    // 세션이 없으면 로그인 화면으로 빠지고, 늦게라도 세션이 오면 아래에서 반영된다.
    const stop = setTimeout(() => setLoading(false), 6000);
    supa.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => {})
      .finally(() => { clearTimeout(stop); setLoading(false); });
    const { data: sub } = supa.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { clearTimeout(stop); sub.subscription.unsubscribe(); };
  }, []);

  if (loading)
    return (
      <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        불러오는 중...
      </div>
    );

  if (!session) return <TeacherLogin />;
  return <TeacherHome session={session} />;
}
