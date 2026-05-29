// src/app/api/integrations/google/auth/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAuthUrl } from '@/lib/google-calendar'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { origin } = new URL(request.url)
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const redirectUri = process.env.GOOGLE_REDIRECT_URI!
  const authUrl = buildAuthUrl(redirectUri)
  return NextResponse.redirect(authUrl)
}
