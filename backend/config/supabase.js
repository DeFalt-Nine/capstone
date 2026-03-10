import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

if (!supabase) {
    console.warn('[Supabase] Client not initialized. Ensure SUPABASE_URL and SUPABASE_KEY are set.');
}
