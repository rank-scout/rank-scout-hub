import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// KYRA FIX: Wir nutzen den ECHTEN JWT Key jetzt direkt (Hardcoded), um alle Env-Probleme zu umgehen.
const SUPABASE_URL = "https://oeshjjvhtmebjwbouayc.supabase.co";
// Dein echter Anon-Key (JWT), den du mir gesendet hast:
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lc2hqanZodG1lYmp3Ym91YXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzY2ODMsImV4cCI6MjA4NDMxMjY4M30.8smfa_NrhlfFmcqRSoFKDVgz0z64eYwGgHJ_odQOwhM";

console.log("Supabase Client Reset mit Hardcoded Key (Startet mit eyJ...)");

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});