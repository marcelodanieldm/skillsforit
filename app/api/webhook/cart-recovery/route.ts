import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/webhook/cart-recovery
 * 
 * Webhook handler para detectar carritos abandonados desde Stripe
 * 
 * Eventos manejados:
 * - checkout.session.expired: Sesión expiró sin completarse
 * - checkout.session.async_payment_failed: Pago falló
 * 
 * Flujo:
 * 1. Verificar firma de Stripe
 * 2. Registrar carrito abandonado en BD
 * 3. Programar emails de recuperación
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verificar firma de Stripe
    const stripe = getStripe()
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.expired':
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.async_payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.completed':
        // Marcar carrito como recuperado si existía
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Manejar sesión expirada
 * Stripe expira sesiones después de 24 horas de inactividad
 */
async function handleSessionExpired(session: Stripe.Checkout.Session) {
  try {
    const stripe = getStripe()
    const supabase = getSupabase()
    console.log('Processing expired session:', session.id)

    // Extraer datos del carrito desde metadata o line_items
    const customer = session.customer
    const customerEmail = session.customer_details?.email || session.customer_email

    if (!customerEmail) {
      console.error('No email found for expired session:', session.id)
      return
    }

    // Obtener items del carrito
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 10
    })

    const cartData = {
      ebook: false,
      cv_audit: false,
      mentorship: false,
      prices: {},
      raw_items: lineItems.data.map(item => ({
        description: item.description,
        amount: item.amount_total,
        quantity: item.quantity
      }))
    }

    // Parsear items (esto depende de cómo estén configurados tus productos)
    lineItems.data.forEach(item => {
      const desc = item.description?.toLowerCase() || ''
      if (desc.includes('ebook') || desc.includes('soft skills')) {
        cartData.ebook = true
      }
      if (desc.includes('cv') || desc.includes('audit')) {
        cartData.cv_audit = true
      }
      if (desc.includes('mentor') || desc.includes('mentoría')) {
        cartData.mentorship = true
      }
    })

    // Verificar si ya existe este carrito
    const { data: existing } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    if (existing) {
      console.log('Cart already registered:', session.id)
      return
    }

    // Insertar carrito abandonado
    const { data: cart, error } = await supabase
      .from('abandoned_carts')
      .insert({
        user_email: customerEmail,
        user_id: typeof customer === 'string' ? customer : customer?.id,
        cart_data: cartData,
        total_amount: (session.amount_total || 0) / 100, // Convertir de centavos
        currency: session.currency?.toUpperCase() || 'USD',
        stripe_session_id: session.id,
        stripe_customer_id: typeof customer === 'string' ? customer : customer?.id,
        cart_created_at: new Date(session.created * 1000).toISOString(),
        abandoned_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        status: 'pending',
        metadata: {
          session_mode: session.mode,
          payment_status: session.payment_status,
          expires_at_stripe: session.expires_at
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting abandoned cart:', error)
      return
    }

    console.log('Abandoned cart registered:', cart.id)

    // Trigger immediate email (1 hora)
    // El cron job se encargará de enviarlo
    
  } catch (error) {
    console.error('Error handling expired session:', error)
  }
}

/**
 * Manejar pago fallido
 */
async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing failed payment:', session.id)

    // Similar a expired, pero con status 'failed'
    await handleSessionExpired(session)

    // Actualizar status a 'failed' si ya existe
    const supabase = getSupabase()
    await supabase
      .from('abandoned_carts')
      .update({ 
        status: 'failed',
        metadata: { payment_failure: true }
      })
      .eq('stripe_session_id', session.id)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

/**
 * Manejar sesión completada
 * Si había un carrito abandonado, marcarlo como recuperado
 */
async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed session:', session.id)

    const customerEmail = session.customer_details?.email || session.customer_email

    if (!customerEmail) return

    // Buscar carrito abandonado por email (últimas 24 horas)
    const supabase = getSupabase()
    const { data: carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('user_email', customerEmail)
      .eq('status', 'pending')
      .gte('abandoned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('abandoned_at', { ascending: false })
      .limit(1)

    if (carts && carts.length > 0) {
      const cart = carts[0]

      // Determinar método de recuperación
      const { data: emails } = await supabase
        .from('recovery_emails')
        .select('email_type, clicked_at')
        .eq('abandoned_cart_id', cart.id)
        .order('sent_at', { ascending: false })
        .limit(1)

      const recoveryMethod = emails && emails.length > 0 && emails[0].clicked_at
        ? emails[0].email_type.replace('hour_', 'email_')
        : 'manual'

      // Marcar como recuperado
      await supabase
        .from('abandoned_carts')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
          recovery_method: recoveryMethod
        })
        .eq('id', cart.id)

      // Marcar email como convertido si existe
      if (emails && emails.length > 0) {
        await supabase
          .from('recovery_emails')
          .update({
            status: 'converted',
            converted_at: new Date().toISOString()
          })
          .eq('abandoned_cart_id', cart.id)
      }

      console.log('Cart recovered:', cart.id, 'via', recoveryMethod)
    }

  } catch (error) {
    console.error('Error handling completed session:', error)
  }
}
