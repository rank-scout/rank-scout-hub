import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// KYRA FIX: Hardcoded Credentials, damit es sofort läuft
const SUPABASE_URL = "https://oeshjjvhtmebjwbouayc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3Wk4Tcg02ylmxwh5Om45UQ_j7GlZ7Ic";

// Console Log zur Sicherheit (damit wir sehen, dass es geladen wird)
console.log("Supabase Client Init mit:", SUPABASE_URL);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});