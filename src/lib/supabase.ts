import { createClient } from '@supabase/supabase-js'

// Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yxahyvjzhzmwarrwrftq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Warning: VITE_SUPABASE_ANON_KEY not configured. Using localStorage fallback.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YWh5dmp6aHptd2FycndyZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.placeholder');

export default supabase;