import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/cart/track-click
 * 
 * Registra cuando un usuario hace click en el magic link
 * Útil para analytics y medir efectividad de emails
 * 
 * Body:
 * {
 *   token: string
 * }
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // Actualizar status del email a 'clicked'
    const supabase = getSupabase()
    await supabase
      .from('recovery_emails')
      .update({
        status: 'clicked',
        clicked_at: new Date().toISOString()
      })
      .eq('magic_token', token)
      .eq('status', 'sent') // Solo actualizar si aún está en 'sent'

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

/**
 * POST /api/cart/track-open
 * 
 * Registra cuando un usuario abre el email (pixel tracking)
 * 
 * Body:
 * {
 *   token: string
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (token) {
      // Actualizar status a 'opened'
      const supabase = getSupabase()
      await supabase
        .from('recovery_emails')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('magic_token', token)
        .eq('status', 'sent')
    }

    // Retornar pixel transparente 1x1
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Error tracking open:', error)
    // Retornar pixel aunque falle
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: { 'Content-Type': 'image/png' }
    })
  }
}
