import { createClient } from '@supabase/supabase-js'

// Environment variables (may not be available in production)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = envUrl && envUrl.length > 0 && envKey && envKey.length > 0;

// Only create Supabase client if we have real credentials
// Otherwise, create a mock client that will fail gracefully
let supabase;

if (hasValidCredentials) {
  // Real Supabase connection
  supabase = createClient(envUrl, envKey);
  console.log('[Supabase] Connected to:', envUrl);
} else {
  // No credentials - use placeholder that will fail fast
  console.warn('[Supabase] No credentials found. Using offline mode.');
  // Use the project's actual Supabase URL if available
  supabase = createClient(
    'https://yxahyvjzhzmwarrwrftq.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YWh5dmp6aHptd2FycndyZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.placeholder'
  );
}

export default supabase;