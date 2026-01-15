import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { triggerDelivery, mapCartToDeliveryItems } from '@/lib/delivery-system'

/**
 * Sprint 24: Stripe Webhook Handler
 * 
 * Maneja eventos de Stripe automáticamente, especialmente:
 * - payment_intent.succeeded: Confirmar compra y entregar productos
 * - payment_intent.payment_failed: Registrar fallo de pago
 * - charge.refunded: Revocar acceso a productos
 * 
 * Este webhook asegura que los productos se entreguen automáticamente
 * incluso si el usuario cierra la ventana después del pago.
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover'
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log('[Webhook] Event received:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      default:
        console.log('[Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('[Webhook] Payment succeeded:', paymentIntent.id)

  const supabase = getSupabase()
  const email = paymentIntent.metadata.email
  const products = JSON.parse(paymentIntent.metadata.products || '[]')
  const sessionId = paymentIntent.metadata.sessionId || 'webhook'
  const orderBumpAccepted = paymentIntent.metadata.orderBumpAccepted === 'true'
  const upsellAccepted = paymentIntent.metadata.upsellAccepted === 'true'

  // Get order from database
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (orderError || !order) {
    console.error('[Webhook] Order not found:', orderError)
    return
  }

  // Check if already delivered
  if (order.status === 'completed' && order.delivered_at) {
    console.log('[Webhook] Order already delivered, skipping')
    return
  }

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'processing',
      paid_at: new Date().toISOString(),
      stripe_payment_status: paymentIntent.status
    })
    .eq('id', order.id)

  // **TRIGGER DELIVERY SYSTEM**
  try {
    const deliveryItems = mapCartToDeliveryItems(products)
    
    const deliveryResult = await triggerDelivery({
      userId: email, // Use email as userId for now
      email,
      orderId: order.id,
      purchaseItems: deliveryItems,
      orderBumpAccepted,
      upsellAccepted
    })

    console.log('[Webhook] Delivery completed:', deliveryResult)

    // Update order with delivery status
    await supabase
      .from('orders')
      .update({
        status: deliveryResult.success ? 'completed' : 'delivery_failed',
        delivered_at: deliveryResult.success ? new Date().toISOString() : null,
        delivery_errors: deliveryResult.errors || null
      })
      .eq('id', order.id)

    // Track conversion
    await supabase
      .from('funnel_events')
      .insert({
        event_type: 'purchase_completed',
        session_id: sessionId,
        email,
        data: {
          products: products.map((p: any) => p.id),
          amount: paymentIntent.amount / 100,
          orderBumpAccepted,
          upsellAccepted,
          paymentIntentId: paymentIntent.id,
          deliveredViaWebhook: true,
          timestamp: new Date().toISOString()
        }
      })

  } catch (deliveryError: any) {
    console.error('[Webhook] Delivery failed:', deliveryError)
    
    await supabase
      .from('orders')
      .update({
        status: 'delivery_failed',
        delivery_errors: [{ error: deliveryError.message }]
      })
      .eq('id', order.id)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('[Webhook] Payment failed:', paymentIntent.id)

  const supabase = getSupabase()
  const email = paymentIntent.metadata.email
  const sessionId = paymentIntent.metadata.sessionId || 'webhook'

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'failed',
      stripe_payment_status: paymentIntent.status,
      payment_error: paymentIntent.last_payment_error?.message
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Track failed payment
  await supabase
    .from('funnel_events')
    .insert({
      event_type: 'payment_failed',
      session_id: sessionId,
      email,
      data: {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
        timestamp: new Date().toISOString()
      }
    })

  // TODO: Send email to user with retry link
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('[Webhook] Refund issued:', charge.id)

  const supabase = getSupabase()
  const paymentIntentId = charge.payment_intent as string

  // Find order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!order) {
    console.error('[Webhook] Order not found for refund')
    return
  }

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('id', order.id)

  // Revoke product access
  await supabase
    .from('product_access')
    .update({
      revoked_at: new Date().toISOString(),
      revoke_reason: 'refund'
    })
    .eq('order_id', order.id)
    .is('revoked_at', null)

  // Revoke CV audit credits
  await supabase
    .from('user_assets')
    .update({
      balance: 0,
      revoked_at: new Date().toISOString()
    })
    .eq('order_id', order.id)
    .eq('type', 'cv_audit_credit')

  // Deactivate mentorship subscription
  await supabase
    .from('mentorship_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'refund'
    })
    .eq('order_id', order.id)

  console.log('[Webhook] Product access revoked for order:', order.id)

  // TODO: Send refund confirmation email
}
