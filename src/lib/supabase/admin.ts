import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * #2: Privileged Client for Admin Actions (Service Role)
 * 
 * This client uses the SERVICE_ROLE_KEY and has god-mode access to your
 * database. It bypasses all Row Level Security (RLS) policies.
 * Use this ONLY for trusted server-side operations where you need to
 * perform administrative tasks (e.g., in an Edge Function).
 * 
 * NOTE: This is an object, not a function. You import and use it directly.
 */
export const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
