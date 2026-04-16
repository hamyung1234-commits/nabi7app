import { createClient } from '@supabase/supabase-js'

// GitHub Pages 배포 환경에서도 작동하도록 하드코딩된 Supabase URL
// 이 값은 공개되어도安全问题 없는 publishable key용 URL입니다
const SUPABASE_URL = 'https://yxahyvjzhzmwarrwrftq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YWh5dmp6aHptd2FycndyZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExNjE1MTYsImV4cCI6MjAyNjczNzUxNn0.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;