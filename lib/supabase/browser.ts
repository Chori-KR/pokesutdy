"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 브라우저용 anon(publishable) 클라이언트 — 교사 화면에서 사용 (RLS로 보호).
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
