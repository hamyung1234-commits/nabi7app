import { createClient } from '@supabase/supabase-js'

// Check if Supabase is properly configured with valid credentials
function checkSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Must have valid, non-empty, non-placeholder values
  return !!(
    url && key &&
    url !== '' && key !== '' &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
}

// Check configuration
const isConfigured = checkSupabaseConfig();

// Only create Supabase client if credentials are properly configured
// Otherwise, set to null and skip all Supabase operations
export const supabase = isConfigured
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = isConfigured;
