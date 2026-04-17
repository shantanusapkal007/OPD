"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { "x-client-info": "opd-clinic" },
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId)
      );
    },
  },
  realtime: {
    params: { eventsPerSecond: 1 },
  },
  db: {
    schema: "public",
  },
});

// Disable realtime channels – not needed for this app
supabase.removeAllChannels();

/**
 * Lightweight health-check: touch the DB so a paused Supabase project wakes up.
 * Returns true when the project is reachable, false otherwise.
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("clinic_settings")
      .select("id")
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;
