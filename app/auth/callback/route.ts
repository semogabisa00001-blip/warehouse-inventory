import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('Auth callback - Origin:', origin)
  console.log('Auth callback - Code present:', !!code)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error.message, error.status)
      return NextResponse.redirect(new URL(`/login?error=auth_failed&message=${encodeURIComponent(error.message)}`, origin))
    }

    console.log('Auth successful, user:', data.user?.email)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', origin))
}
