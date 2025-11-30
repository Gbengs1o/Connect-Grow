// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // STEP 1: Refresh the session ON EVERY request. This is the crucial fix.
  const { data: { session } } = await supabase.auth.getSession()

  // STEP 2: Now, run your route protection logic.
  const { pathname } = request.nextUrl

  // If the user is logged in and tries to go to the login page, redirect them.
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If the user is NOT logged in and tries to access a protected admin page, redirect them.
  // We need to explicitly exclude /admin-signup because it starts with /admin
  if (!session && pathname.startsWith('/admin') && !pathname.startsWith('/admin-signup')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If none of the above, continue as normal.
  return response
}

// STEP 3: Use the correct, broader matcher to run on all necessary paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}