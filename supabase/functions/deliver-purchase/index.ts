import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Sprint 24: Sistema de Entrega Automática de Productos
 * 
 * Edge Function de Supabase que maneja la entrega inmediata
 * de productos digitales después de una compra exitosa.
 * 
 * Productos soportados:
 * - ebook: Guía de Soft Skills (PDF con signed URL)
 * - cv_audit: Auditoría de CV con IA (crédito en dashboard)
 * - mentorship: 1 mes de Mentoría (4 sesiones)
 * 
 * Flow:
 * 1. Webhook de Stripe llama a esta función
 * 2. Verificar pago exitoso
 * 3. Procesar cada producto comprado
 * 4. Enviar emails de confirmación
 * 5. Registrar entrega en base de datos
 */

interface DeliveryRequest {
  userId: string
  email: string
  orderId: string
  purchaseItems: Array<{
    id: string
    name: string
    type: 'ebook' | 'cv_audit' | 'mentorship'
  }>
  orderBumpAccepted: boolean
  upsellAccepted: boolean
}

interface EmailTemplate {
  to: string
  template: string
  params: Record<string, any>
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// SendGrid configuration
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!

async function sendEmail(emailData: EmailTemplate): Promise<void> {
  const { to, template, params } = emailData
  
  const templates: Record<string, string> = {
    'delivery-ebook': 'd-xxx-ebook-template-id',
    'delivery-cv-audit': 'd-xxx-cv-audit-template-id',
    'delivery-mentorship': 'd-xxx-mentorship-template-id',
    'delivery-complete': 'd-xxx-complete-template-id'
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        dynamic_template_data: params
      }],
      from: {
        email: 'no-reply@skillsforit.com',
        name: 'SkillsForIT'
      },
      template_id: templates[template]
    })
  })

  if (!response.ok) {
    console.error('[SendGrid] Error sending email:', await response.text())
    throw new Error(`Failed to send email: ${response.statusText}`)
  }

  console.log('[SendGrid] Email sent successfully:', template, 'to', to)
}

async function deliverEbook(userId: string, email: string, orderId: string) {
  console.log('[Delivery] Processing ebook delivery for user:', userId)

  try {
    // 1. Generate signed URL for PDF (valid for 7 days)
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('products')
      .createSignedUrl('ebooks/guia-soft-skills-v1.pdf', 604800) // 7 días = 604800 segundos

    if (urlError) {
      console.error('[Delivery] Error creating signed URL:', urlError)
      throw urlError
    }

    console.log('[Delivery] Signed URL generated:', signedUrlData.signedUrl)

    // 2. Save access record in database
    const { error: accessError } = await supabase
      .from('product_access')
      .insert({
        user_id: userId,
        product_id: 'soft-skills-guide',
        product_type: 'ebook',
        order_id: orderId,
        download_url: signedUrlData.signedUrl,
        expires_at: new Date(Date.now() + 604800 * 1000).toISOString(),
        granted_at: new Date().toISOString()
      })

    if (accessError) {
      console.error('[Delivery] Error saving access record:', accessError)
    }

    // 3. Send email with download link
    await sendEmail({
      to: email,
      template: 'delivery-ebook',
      params: {
        downloadUrl: signedUrlData.signedUrl,
        productName: 'Guía Completa de Soft Skills',
        expiresIn: '7 días',
        supportEmail: 'soporte@skillsforit.com'
      }
    })

    console.log('[Delivery] Ebook delivered successfully')
    return { success: true, downloadUrl: signedUrlData.signedUrl }
  } catch (error) {
    console.error('[Delivery] Ebook delivery failed:', error)
    throw error
  }
}

async function deliverCVAudit(userId: string, email: string, orderId: string) {
  console.log('[Delivery] Processing CV audit credit for user:', userId)

  try {
    // 1. Check if user already has credits
    const { data: existingAsset } = await supabase
      .from('user_assets')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('type', 'cv_audit_credit')
      .single()

    if (existingAsset) {
      // Update existing balance
      const { error: updateError } = await supabase
        .from('user_assets')
        .update({ 
          balance: existingAsset.balance + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id)

      if (updateError) throw updateError
    } else {
      // Create new credit
      const { error: insertError } = await supabase
        .from('user_assets')
        .insert({
          user_id: userId,
          type: 'cv_audit_credit',
          balance: 1,
          order_id: orderId,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError
    }

    // 2. Send email with instructions
    await sendEmail({
      to: email,
      template: 'delivery-cv-audit',
      params: {
        creditsGranted: 1,
        uploadUrl: 'https://skillsforit.com/upload?audit=cv',
        dashboardUrl: 'https://skillsforit.com/dashboard',
        supportEmail: 'soporte@skillsforit.com'
      }
    })

    console.log('[Delivery] CV audit credit delivered successfully')
    return { success: true, creditsGranted: 1 }
  } catch (error) {
    console.error('[Delivery] CV audit delivery failed:', error)
    throw error
  }
}

async function deliverMentorship(userId: string, email: string, orderId: string) {
  console.log('[Delivery] Processing mentorship subscription for user:', userId)

  try {
    // 1. Create mentorship subscription (4 sessions)
    const { data: subscription, error: subError } = await supabase
      .from('mentorship_subscriptions')
      .insert({
        user_id: userId,
        order_id: orderId,
        status: 'active',
        sessions_total: 4,
        sessions_used: 0,
        sessions_left: 4,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (subError) throw subError

    // 2. Notify mentors (get available mentors)
    const { data: mentors, error: mentorsError } = await supabase
      .from('mentors')
      .select('id, email, name')
      .eq('status', 'active')
      .eq('accepting_students', true)
      .limit(5)

    if (!mentorsError && mentors && mentors.length > 0) {
      // Notify first available mentor
      await sendEmail({
        to: mentors[0].email,
        template: 'new-mentee-notification',
        params: {
          menteeName: email,
          menteeEmail: email,
          sessionsCount: 4,
          dashboardUrl: 'https://skillsforit.com/mentor/dashboard'
        }
      })
    }

    // 3. Send email to user with instructions
    await sendEmail({
      to: email,
      template: 'delivery-mentorship',
      params: {
        subscriptionId: subscription.id,
        sessionsTotal: 4,
        expiresIn: '30 días',
        bookingUrl: 'https://skillsforit.com/mentors',
        dashboardUrl: 'https://skillsforit.com/dashboard',
        supportEmail: 'soporte@skillsforit.com',
        mentorsAvailable: mentors?.length || 0
      }
    })

    console.log('[Delivery] Mentorship subscription delivered successfully')
    return { success: true, subscriptionId: subscription.id, sessionsGranted: 4 }
  } catch (error) {
    console.error('[Delivery] Mentorship delivery failed:', error)
    throw error
  }
}

async function sendCompletionEmail(email: string, deliveryResults: any) {
  await sendEmail({
    to: email,
    template: 'delivery-complete',
    params: {
      productsDelivered: Object.keys(deliveryResults),
      ebookUrl: deliveryResults.ebook?.downloadUrl,
      cvCredits: deliveryResults.cv_audit?.creditsGranted,
      mentorshipSessions: deliveryResults.mentorship?.sessionsGranted,
      dashboardUrl: 'https://skillsforit.com/dashboard',
      supportEmail: 'soporte@skillsforit.com'
    }
  })
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const body: DeliveryRequest = await req.json()
    const { userId, email, orderId, purchaseItems, orderBumpAccepted, upsellAccepted } = body

    console.log('[Delivery] Starting delivery process:', {
      userId,
      email,
      orderId,
      itemsCount: purchaseItems.length
    })

    // Validate required fields
    if (!userId || !email || !orderId || !purchaseItems || purchaseItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const deliveryResults: Record<string, any> = {}
    const errors: Array<{ product: string, error: string }> = []

    // Process each purchased item
    for (const item of purchaseItems) {
      try {
        switch (item.type) {
          case 'ebook':
            deliveryResults.ebook = await deliverEbook(userId, email, orderId)
            break

          case 'cv_audit':
            deliveryResults.cv_audit = await deliverCVAudit(userId, email, orderId)
            break

          case 'mentorship':
            deliveryResults.mentorship = await deliverMentorship(userId, email, orderId)
            break

          default:
            console.warn('[Delivery] Unknown product type:', item.type)
        }
      } catch (error) {
        console.error(`[Delivery] Failed to deliver ${item.type}:`, error)
        errors.push({
          product: item.type,
          error: error.message || 'Unknown error'
        })
      }
    }

    // Send completion email with all products
    try {
      await sendCompletionEmail(email, deliveryResults)
    } catch (emailError) {
      console.error('[Delivery] Failed to send completion email:', emailError)
      // Don't fail the entire delivery if email fails
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: errors.length === 0 ? 'completed' : 'partially_completed',
        delivered_at: new Date().toISOString(),
        delivery_errors: errors.length > 0 ? errors : null
      })
      .eq('id', orderId)

    if (orderUpdateError) {
      console.error('[Delivery] Failed to update order status:', orderUpdateError)
    }

    // Track delivery event
    await supabase
      .from('funnel_events')
      .insert({
        event_type: 'purchase_delivered',
        session_id: orderId,
        email,
        data: {
          products: purchaseItems.map(p => p.type),
          orderBumpAccepted,
          upsellAccepted,
          deliveryResults,
          errors: errors.length > 0 ? errors : undefined,
          timestamp: new Date().toISOString()
        }
      })

    console.log('[Delivery] Process completed:', {
      successful: Object.keys(deliveryResults).length,
      failed: errors.length
    })

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        message: errors.length === 0 ? 'Entrega procesada exitosamente' : 'Entrega parcialmente completada',
        deliveryResults,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: errors.length === 0 ? 200 : 207,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('[Delivery] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
