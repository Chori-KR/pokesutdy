"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";

// 교사용 서버 API 호출: Supabase 세션의 access token을 Authorization으로 첨부.
export async function teacherFetch(path: string, init?: RequestInit) {
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data.session?.access_token;
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token ?? ""}`,
    },
  });
}
