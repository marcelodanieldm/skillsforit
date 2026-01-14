import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/cron/cart-recovery
 * 
 * Cron job que se ejecuta cada hora para:
 * 1. Detectar carritos abandonados hace más de 60 minutos
 * 2. Enviar Email 1 (recuperación inicial)
 * 3. Enviar Email 2 (con cupón 15% off) después de 24 horas
 * 4. Expirar cupones vencidos
 * 5. Expirar carritos viejos
 * 
 * Configuración en Vercel:
 * - Trigger: Cron expression: "0 * * * *" (cada hora)
 * - O usar Vercel Cron Jobs
 * 
 * Autenticación:
 * - Requiere header Authorization con CRON_SECRET
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticación de cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting cart recovery job...')

    const results: {
      cartsProcessed: number
      email1Sent: number
      email2Sent: number
      couponsExpired: number
      cartsExpired: number
      errors: Array<{ step: string; error: string; cart_id?: string }>
    } = {
      cartsProcessed: 0,
      email1Sent: 0,
      email2Sent: 0,
      couponsExpired: 0,
      cartsExpired: 0,
      errors: []
    }

    // 1. Expirar cupones vencidos
    try {
      await supabase.rpc('expire_old_coupons')
      const { count } = await supabase
        .from('recovery_coupons')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'expired')
      results.couponsExpired = count || 0
    } catch (error: any) {
      console.error('[CRON] Error expiring coupons:', error)
      results.errors.push({ step: 'expire_coupons', error: error.message })
    }

    // 2. Expirar carritos viejos (>7 días)
    try {
      await supabase.rpc('expire_old_carts')
      const { count } = await supabase
        .from('abandoned_carts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'expired')
      results.cartsExpired = count || 0
    } catch (error: any) {
      console.error('[CRON] Error expiring carts:', error)
      results.errors.push({ step: 'expire_carts', error: error.message })
    }

    // 3. Obtener carritos pendientes que necesitan Email 1 (1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: cartsForEmail1, error: e1 } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .eq('recovery_emails_sent', 0)
      .lte('abandoned_at', oneHourAgo)
      .limit(50) // Procesar máximo 50 por ejecución

    if (e1) {
      console.error('[CRON] Error fetching carts for Email 1:', e1)
      results.errors.push({ step: 'fetch_email1', error: e1.message })
    } else if (cartsForEmail1 && cartsForEmail1.length > 0) {
      console.log(`[CRON] Found ${cartsForEmail1.length} carts for Email 1`)
      
      for (const cart of cartsForEmail1) {
        try {
          await sendRecoveryEmail(cart, 'hour_1')
          results.email1Sent++
        } catch (error: any) {
          console.error('[CRON] Error sending Email 1:', error)
          results.errors.push({ 
            step: 'send_email1', 
            cart_id: cart.id, 
            error: error.message 
          })
        }
      }
    }

    // 4. Obtener carritos pendientes que necesitan Email 2 (24 horas)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: cartsForEmail2, error: e2 } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .eq('recovery_emails_sent', 1)
      .lte('abandoned_at', twentyFourHoursAgo)
      .limit(50)

    if (e2) {
      console.error('[CRON] Error fetching carts for Email 2:', e2)
      results.errors.push({ step: 'fetch_email2', error: e2.message })
    } else if (cartsForEmail2 && cartsForEmail2.length > 0) {
      console.log(`[CRON] Found ${cartsForEmail2.length} carts for Email 2`)
      
      for (const cart of cartsForEmail2) {
        try {
          await sendRecoveryEmail(cart, 'hour_24')
          results.email2Sent++
        } catch (error: any) {
          console.error('[CRON] Error sending Email 2:', error)
          results.errors.push({ 
            step: 'send_email2', 
            cart_id: cart.id, 
            error: error.message 
          })
        }
      }
    }

    results.cartsProcessed = results.email1Sent + results.email2Sent

    console.log('[CRON] Cart recovery job completed:', results)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('[CRON] Fatal error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cron job failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Enviar email de recuperación
 */
async function sendRecoveryEmail(cart: any, emailType: 'hour_1' | 'hour_24') {
  try {
    // Llamar a API de emails
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send-recovery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({
        cartId: cart.id,
        emailType
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Actualizar contador de emails enviados
    await supabase
      .from('abandoned_carts')
      .update({
        recovery_emails_sent: cart.recovery_emails_sent + 1,
        last_email_sent_at: new Date().toISOString()
      })
      .eq('id', cart.id)

    console.log(`[CRON] Email ${emailType} sent to ${cart.user_email}`)
    
    return data

  } catch (error) {
    console.error(`[CRON] Error sending ${emailType} for cart ${cart.id}:`, error)
    throw error
  }
}

/**
 * Endpoint alternativo para testing manual
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cartId, emailType } = body

    if (!cartId || !emailType) {
      return NextResponse.json(
        { error: 'cartId and emailType required' },
        { status: 400 }
      )
    }

    const { data: cart } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', cartId)
      .single()

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    await sendRecoveryEmail(cart, emailType)

    return NextResponse.json({
      success: true,
      message: `Email ${emailType} sent to ${cart.user_email}`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
