import { createClient } from '@supabase/supabase-js'

// GitHub Pages 배포 환경에서는 환경변수가 없을 수 있으므로 기본값 fallback 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxahyvjzhzmwarrwrftq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 환경변수 디버깅 로그
console.log('[Supabase] Initializing with URL:', supabaseUrl ? '✓ configured' : '✗ missing')
console.log('[Supabase] AnonKey:', supabaseAnonKey ? '✓ configured' : '✗ missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] ⚠️ Environment variables not fully configured. Some features may not work.')
  console.warn('[Supabase] VITE_SUPABASE_URL:', supabaseUrl || '(not set)')
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '(set)' : '(not set)')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase