import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * #1: Client for Server Components & Server Actions (User Context)
 * 
 * This client is used for any server-side logic that needs to know who the
 * current user is. It reads the user's auth cookie to perform actions
 * on their behalf.
 * 
 * NOTE: This is a SYNCHRONOUS function. You do NOT need to `await` it.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}


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