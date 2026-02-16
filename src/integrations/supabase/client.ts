import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Wir nutzen die Keys direkt, um Env-Probleme auf Cloudflare auszuschließen
const SUPABASE_URL = "https://oeshjjvhtmebjwbouayc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lc2hqanZodG1lYmp3Ym91YXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzY2ODMsImV4cCI6MjA4NDMxMjY4M30.8smfa_NrhlfFmcqRSoFKDVgz0z64eYwGgHJ_odQOwhM";

console.log("Supabase Client: Initialisiert mit Hardcoded Keys.");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("FATAL ERROR: Supabase Keys fehlen trotz Hardcoding!");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});