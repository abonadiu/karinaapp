/**
 * Safe Supabase Client with Fallback
 * 
 * This module creates a Supabase client that works even if environment variables
 * are not properly injected at runtime. It uses public fallback values (URL + anon key)
 * which are safe to hardcode since they're public by design.
 * 
 * IMPORTANT: Never put the service_role key here - only use publishable/anon keys.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';

// Public fallback values - these are safe to hardcode
// (URL and anon/publishable key are public by design)
const FALLBACK_URL = "https://dlsnflfqemavnhavtaxe.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc25mbGZxZW1hdm5oYXZ0YXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzUxNDcsImV4cCI6MjA4NTMxMTE0N30.xPuH5ds_uzbyXxEn1Hvn6ED_S2Hox-5vGEtL6vYi_ow";

// Try to get values from environment, fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

// Track if we're using fallback (useful for debugging)
export const isUsingFallback = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (isUsingFallback) {
  console.warn(
    "[Backend Client] Environment variables not found. Using fallback configuration. " +
    "This is expected in some preview environments."
  );
}

// Create and export the client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
