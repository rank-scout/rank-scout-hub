/**
 * Supabase Configuration
 * 
 * This file provides hardcoded fallback values for Supabase connection
 * when environment variables are not available (e.g., external hosting on IONOS).
 * 
 * The values here are the ANON (public) key which is safe to expose.
 * Service role keys should NEVER be placed here.
 */

// Hardcoded fallback values for external hosting
const HARDCODED_SUPABASE_URL = "https://zvlrpjakdsujncmfzurk.supabase.co";
const HARDCODED_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bHJwamFrZHN1am5jbWZ6dXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTQ0ODksImV4cCI6MjA4MzI3MDQ4OX0.TelUj7kWZabGxfbOZTQ4uPBxLQKKkciELAJLtn6RDXc";

/**
 * Get Supabase URL - uses environment variable if available, otherwise hardcoded fallback
 */
export function getSupabaseUrl(): string {
  // Try environment variables first (for Lovable/Vite environment)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  
  // Fallback to hardcoded value for external hosting
  return HARDCODED_SUPABASE_URL;
}

/**
 * Get Supabase Anon Key - uses environment variable if available, otherwise hardcoded fallback
 */
export function getSupabaseAnonKey(): string {
  // Try environment variables first (for Lovable/Vite environment)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  }
  
  // Fallback to hardcoded value for external hosting
  return HARDCODED_SUPABASE_ANON_KEY;
}

/**
 * Supabase configuration object
 */
export const supabaseConfig = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
} as const;
