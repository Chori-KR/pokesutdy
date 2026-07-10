import { createClient } from "@supabase/supabase-js";

// service-role 클라이언트 — 서버(Route Handler) 전용. RLS를 우회하므로
// 절대 클라이언트 번들에 포함되면 안 된다 (NEXT_PUBLIC_ 접두사 금지).
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env가 설정되지 않았습니다 (.env.local 확인)");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
