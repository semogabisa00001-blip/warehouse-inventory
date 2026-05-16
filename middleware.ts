import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/inbound')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/outbound')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/parts')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/categories')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/stock-monitor')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith('/users')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
