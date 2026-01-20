import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { 
  getOrderBumpManager, 
  getUpsellManager, 
  getConversionTracker, 
  getAOVCalculator 
} from '@/lib/checkout-flow'
import { triggerDelivery, mapCartToDeliveryItems } from '@/lib/delivery-system'
import { sendMentoriaWelcomeEmail, sendProductDeliveryEmail } from '@/lib/send-email'

/**
 * Sprint 24: API de Procesamiento de Órdenes
 * 
 * Endpoints:
 * - POST /api/checkout/create-order: Crear Payment Intent con Stripe
 * - POST /api/checkout/confirm-order: Confirmar compra y entregar productos
 * - GET /api/checkout/order-status: Consultar estado de orden
 * 
 * Integración con:
 * - Stripe Payment Intents
 * - Supabase (orders, purchases, funnel_events)
 * - Email delivery (SendGrid)
 * - Product delivery (PDF generation)
 * 
 * Tracking:
 * - Conversion events
 * - AOV metrics
 * - Order bump acceptance
 * - Upsell acceptance
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

// ============================================
// CREATE ORDER (Payment Intent)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = getSupabase()
    const body = await request.json()
    const { 
      email, 
      products, 
      sessionId,
      orderBumpAccepted = false,
      upsellAccepted = false,
      metadata = {}
    } = body

    // Validation
    if (!email || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'Email and products are required' },
        { status: 400 }
      )
    }

    // Calculate order total
    const calculator = getAOVCalculator()
    const total = calculator.calculateAOV(orderBumpAccepted, upsellAccepted)

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      receipt_email: email,
      metadata: {
        email,
        products: JSON.stringify(products),
        sessionId: sessionId || 'unknown',
        orderBumpAccepted: String(orderBumpAccepted),
        upsellAccepted: String(upsellAccepted),
        ...metadata
      },
      description: 'SkillsForIT - Soft Skills Guide Purchase'
    })

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email,
        stripe_payment_intent_id: paymentIntent.id,
        amount: total,
        currency: 'usd',
        products,
        session_id: sessionId,
        order_bump_accepted: orderBumpAccepted,
        upsell_accepted: upsellAccepted,
        status: 'pending',
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('[CreateOrder] Error saving order:', orderError)
      // Continue anyway - Stripe payment is more critical
    }

    // Track conversion event
    const tracker = getConversionTracker()
    await tracker.trackEvent({
      sessionId: sessionId || 'unknown',
      email,
      eventType: 'checkout_started',
      timestamp: new Date().toISOString(),
      cartValue: total,
      products,
      metadata: {
        orderBumpAccepted,
        upsellAccepted,
        paymentIntentId: paymentIntent.id
      }
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order?.id,
      amount: total,
      currency: 'usd'
    })
  } catch (error: any) {
    console.error('[CreateOrder] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

// ============================================
// CONFIRM ORDER (After Payment Success)
// ============================================

export async function PUT(request: NextRequest) {
  const stripe = getStripe()
  const supabase = getSupabase()
  
  try {
    const body = await request.json()
    const { paymentIntentId, sessionId, userId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const email = paymentIntent.metadata.email
    const products = JSON.parse(paymentIntent.metadata.products || '[]')
    const orderBumpAccepted = paymentIntent.metadata.orderBumpAccepted === 'true'
    const upsellAccepted = paymentIntent.metadata.upsellAccepted === 'true'

    // Get order from database
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (orderFetchError || !order) {
      console.error('[ConfirmOrder] Order not found:', orderFetchError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        paid_at: new Date().toISOString(),
        stripe_payment_status: paymentIntent.status
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('[ConfirmOrder] Error updating order:', updateError)
    }

    // **TRIGGER DELIVERY SYSTEM**
    try {
      const deliveryItems = mapCartToDeliveryItems(products)
      
      const deliveryResult = await triggerDelivery({
        userId: userId || email, // Use email as fallback if no userId
        email,
        orderId: order.id,
        purchaseItems: deliveryItems,
        orderBumpAccepted,
        upsellAccepted
      })

      console.log('[ConfirmOrder] Delivery triggered:', deliveryResult)

      // Update order with delivery status
      await supabase
        .from('orders')
        .update({
          status: deliveryResult.success ? 'completed' : 'delivery_failed',
          delivered_at: deliveryResult.success ? new Date().toISOString() : null,
          delivery_errors: deliveryResult.errors || null
        })
        .eq('id', order.id)

    } catch (deliveryError: any) {
      console.error('[ConfirmOrder] Delivery failed:', deliveryError)
      
      // Mark order as needing manual intervention
      await supabase
        .from('orders')
        .update({
          status: 'delivery_failed',
          delivery_errors: [{ error: deliveryError.message }]
        })
        .eq('id', order.id)
    }

    // Enviar email de bienvenida mentoría si corresponde
    if (products.includes('mentoria')) {
      await sendMentoriaWelcomeEmail({
        to: email,
        password: 'contraseña-temporal', // reemplazar por la real si aplica
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/mentoria`
      });
    }
    // Enviar email de entrega de producto si corresponde
    if (products.includes('soft-skills-guide')) {
      await sendProductDeliveryEmail({
        to: email,
        productName: 'Soft Skills Guide',
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/descarga/soft-skills-guide`
      });
    }

    // Track purchase completion
    const tracker = getConversionTracker()
    await tracker.trackEvent({
      sessionId: sessionId || 'unknown',
      email,
      eventType: 'purchase_completed',
      timestamp: new Date().toISOString(),
      cartValue: paymentIntent.amount / 100,
      products,
      metadata: {
        orderBumpAccepted,
        upsellAccepted,
        paymentIntentId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Purchase confirmed and products delivered',
      orderId: order.id,
      products
    })
  } catch (error: any) {
    console.error('[ConfirmOrder] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm order' },
      { status: 500 }
    )
  }
}

// ============================================
// GET ORDER STATUS
// ============================================

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!orderId && !paymentIntentId) {
      return NextResponse.json(
        { error: 'Order ID or Payment Intent ID is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('orders').select('*')

    if (orderId) {
      query = query.eq('id', orderId)
    } else if (paymentIntentId) {
      query = query.eq('stripe_payment_intent_id', paymentIntentId)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // If order is completed, include download links
    let downloadLinks = {}
    if (order.status === 'completed') {
      downloadLinks = getDownloadLinks(order.products)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        email: order.email,
        amount: order.amount,
        currency: order.currency,
        products: order.products,
        status: order.status,
        orderBumpAccepted: order.order_bump_accepted,
        upsellAccepted: order.upsell_accepted,
        createdAt: order.created_at,
        paidAt: order.paid_at
      },
      downloadLinks
    })
  } catch (error: any) {
    console.error('[GetOrderStatus] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get order status' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function grantProductAccess(email: string, products: string[]): Promise<void> {
  const supabase = getSupabase()
  
  try {
    // Find or create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let userId = user?.id

    if (!userId) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email })
        .select()
        .single()

      if (createError) {
        console.error('[GrantAccess] Error creating user:', createError)
        return
      }

      userId = newUser.id
    }

    // Grant access to each product
    const accessRecords = products.map(productId => ({
      user_id: userId,
      product_id: productId,
      granted_at: new Date().toISOString(),
      expires_at: null  // Lifetime access
    }))

    const { error: accessError } = await supabase
      .from('product_access')
      .insert(accessRecords)

    if (accessError) {
      console.error('[GrantAccess] Error granting access:', accessError)
    }
  } catch (error) {
    console.error('[GrantAccess] Exception:', error)
  }
}

async function sendConfirmationEmail(email: string, products: string[]): Promise<void> {
  try {
    // TODO: Integrate with SendGrid or similar
    console.log('[SendEmail] Confirmation email to:', email)
    console.log('[SendEmail] Products:', products)

    // For now, just log
    // In production, use SendGrid:
    /*
    await sendgrid.send({
      to: email,
      from: 'noreply@skillsforit.com',
      subject: '¡Tu compra está confirmada! Descarga tu Guía de Soft Skills',
      html: generateEmailHTML(products)
    })
    */
  } catch (error) {
    console.error('[SendEmail] Error:', error)
  }
}

function getDownloadLinks(products: string[]): Record<string, string> {
  const links: Record<string, string> = {}

  for (const productId of products) {
    switch (productId) {
      case 'soft-skills-guide':
        links['soft-skills-guide'] = '/downloads/soft-skills-guide.pdf'
        break
      case 'cv-audit-ai':
        links['cv-audit-ai'] = '/cv-analysis'
        break
      case 'mentorship-month':
        links['mentorship-month'] = '/mentorship/schedule'
        break
      default:
        console.warn('[DownloadLinks] Unknown product:', productId)
    }
  }

  return links
}

// ============================================
// ANALYTICS ENDPOINT
// ============================================

// GET /api/checkout/analytics
export async function OPTIONS(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const tracker = getConversionTracker()
    const analytics = await tracker.getAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    const calculator = getAOVCalculator()
    const aovScenarios = calculator.getAOVScenarios()

    return NextResponse.json({
      success: true,
      analytics,
      aovScenarios,
      recommendations: {
        orderBumpTarget: 40,  // 40% conversion rate target
        upsellTarget: 25,     // 25% conversion rate target
        currentBumpRate: analytics.orderBumpConversionRate,
        currentUpsellRate: analytics.upsellConversionRate,
        potentialRevenue: calculator.calculateExpectedRevenue(
          analytics.totalVisitors,
          analytics.overallConversionRate,
          analytics.orderBumpConversionRate || 40,
          analytics.upsellConversionRate || 25
        )
      }
    })
  } catch (error: any) {
    console.error('[Analytics] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
