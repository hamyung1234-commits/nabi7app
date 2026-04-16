import { createClient } from '@supabase/supabase-js'

// Supabase credentials - hardcoded for GitHub Pages deployment
// Note: anon key is a publishable key - safe to expose in client-side code
const SUPABASE_URL = 'https://yxahyvjzhzmwarrwrftq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YWh5dmp6aHptd2FycndyZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.XuFP6kOk8Y3K5P8d_JvqLqdvY_ZqNJ7aWJNqK9R6xk0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isSupabaseConfigured = true;

export default supabase;
