import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './lib/supabase-config'

const PROTECTED_PATHS = ['/dashboard', '/supplier-dashboard', '/admin', '/api/admin']

export async function middleware(request: NextRequest) {
  // Skip static assets early
  const { pathname } = request.nextUrl

  // allow public assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // Build a response wrapper so we can set cookies when needed
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    // Get current user (if present)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user || null

    // If the path is protected and there's no user, redirect to login
    if (PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) && !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If requesting /admin ensure user has admin role
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Attempt to fetch profile role — non-blocking
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (!profile || profile.role !== 'admin') {
          // Not an admin — redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (e) {
        console.error('Error checking admin role in middleware:', e)
        // If role check fails, be conservative and redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // TODO: refresh session tokens if needed — supabase server client manages cookies for usual flows
  } catch (error) {
    console.error('Middleware error:', error)
    // Let request continue — don't block static or public routes if Supabase is down
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
