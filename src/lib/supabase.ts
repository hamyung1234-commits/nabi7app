import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from environment variables
// These are set in .env file (for local development) or Vercel/Netlify environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create Supabase client if credentials are properly configured
// Otherwise, the app will work with localStorage only
const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.placeholder');

export default supabase;
