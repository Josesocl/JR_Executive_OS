// src/app/api/integrations/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  exchangeCodeForTokens,
  getAccountEmail,
  listCalendars,
} from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/settings?tab=integrations&error=google_denied`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    const accountEmail = await getAccountEmail(tokens.access_token)
    const calendars = await listCalendars(tokens.access_token)

    const calendarList = calendars.map((c) => ({
      id: c.id,
      name: c.summary,
      active: c.primary ?? false,
    }))

    await supabase.from('user_integrations').upsert(
      {
        user_id: user.id,
        provider: 'google',
        account_email: accountEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scopes: tokens.scope.split(' '),
        calendars: calendarList,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    )

    return NextResponse.redirect(`${origin}/settings?tab=integrations&connected=google`)
  } catch (err) {
    console.error('Google Calendar callback error:', err)
    return NextResponse.redirect(`${origin}/settings?tab=integrations&error=google_failed`)
  }
}
