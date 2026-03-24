import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (supabaseUrl) console.log('[Supabase] URL found.');
if (supabaseKey) console.log('[Supabase] Key found.');

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

if (!supabase) {
    console.warn('[Supabase] Client not initialized. Ensure SUPABASE_URL and SUPABASE_KEY are set.');
}
