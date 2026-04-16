import { createClient } from '@supabase/supabase-js'

// Direct Supabase credentials for GitHub Pages deployment
// Note: anon key is a publishable key - safe to expose in client-side code
const SUPABASE_URL = 'https://yxahyvjzhzmwarrwrftq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YWh5dmp6aHptd2FycndyZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.placeholder';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;