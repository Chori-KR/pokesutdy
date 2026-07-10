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
    supa.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supa.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
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
