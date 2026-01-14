import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error('[EbookWebhook] Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`[EbookWebhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[EbookWebhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { email, product, includeCVAudit, basePrice, cvAuditPrice, base_payment_intent_id, mentorship_price, analysis_id } = paymentIntent.metadata

  if (!email) {
    console.error('[EbookWebhook] No email in payment intent metadata')
    return
  }

  try {
    // Handle CV audit full report payment
    if (product === 'cv_audit_full') {
      await handleCVAuditPayment(email, paymentIntent, analysis_id)
      return
    }

    // Handle mentorship upsell
    if (product === 'mentorship_upsell') {
      await handleMentorshipUpsell(email, paymentIntent, mentorship_price)
      return
    }

    // Handle normal ebook purchase
    await handleEbookPurchase(email, paymentIntent, includeCVAudit, basePrice, cvAuditPrice)
  } catch (error: any) {
    console.error('[EbookWebhook] Error processing payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { email } = paymentIntent.metadata

  if (!email) return

  // Update order status to failed
  const { error } = await supabase
    .from('ebook_orders')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('[EbookWebhook] Error updating failed order:', error)
  }

  console.log(`[EbookWebhook] Payment failed for ${email}`)
}

async function sendDeliveryEmail(email: string, options: {
  includeCVAudit: boolean
  includeMentorship: boolean
  paymentIntentId: string
}) {
  try {
    // Generate secure download links (24 hours expiry)
    const downloadToken = generateSecureToken()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const downloadLinks = {
      pdf: `${baseUrl}/api/ebook/download/pdf?token=${downloadToken}`,
      epub: `${baseUrl}/api/ebook/download/epub?token=${downloadToken}`
    }

    // Store download token temporarily (24 hours)
    await supabase
      .from('download_tokens')
      .insert({
        token: downloadToken,
        email,
        payment_intent_id: options.paymentIntentId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        downloads_used: 0,
        max_downloads: 3
      })

    // Send email using Resend
    const emailData = {
      to: email,
      subject: '¡Tu Guía de Soft Skills IT está lista! 🚀',
      html: generateDeliveryEmailHTML({
        email,
        downloadLinks,
        includeCVAudit: options.includeCVAudit,
        includeMentorship: options.includeMentorship,
        paymentIntentId: options.paymentIntentId
      })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      console.error('[EbookWebhook] Failed to send delivery email:', await response.text())
    } else {
      console.log(`[EbookWebhook] Delivery email sent to ${email}`)
    }

  } catch (error: any) {
    console.error('[EbookWebhook] Error sending delivery email:', error)
  }
}

function generateSecureToken(): string {
  return require('crypto').randomBytes(32).toString('hex')
}

function generateDeliveryEmailHTML(options: {
  email: string
  downloadLinks: { pdf: string, epub: string }
  includeCVAudit: boolean
  includeMentorship: boolean
  paymentIntentId: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tu Guía de Soft Skills IT</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center;">¡Felicidades! 🎉</h1>

        <p>Hola,</p>

        <p>Tu compra de la <strong>Guía Completa de Soft Skills IT</strong> ha sido procesada exitosamente.</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">📚 Tu Contenido Digital</h2>
          <p>Descarga tu guía en el formato que prefieras:</p>
          <p>
            <a href="${options.downloadLinks.pdf}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">📄 Descargar PDF</a>
            <a href="${options.downloadLinks.epub}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">📖 Descargar EPUB</a>
          </p>
          <p style="font-size: 14px; color: #666;"><em>Links válidos por 24 horas. Máximo 3 descargas.</em></p>
        </div>

        ${options.includeCVAudit ? `
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h2 style="color: #92400e; margin-top: 0;">🤖 Tu Auditoría de CV con IA</h2>
          <p>Para acceder a tu auditoría personalizada:</p>
          <ol>
            <li>Ve a tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #2563eb;">Dashboard de Alumno</a></li>
            <li>Busca la sección "Auditoría CV"</li>
            <li>Sube tu CV actual para recibir feedback inmediato</li>
          </ol>
        </div>
        ` : ''}

        ${options.includeMentorship ? `
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; margin-top: 0;">👨‍🏫 Tu Mentoría Personalizada</h2>
          <p>¡Excelente decisión! Tu mes de mentoría incluye 4 sesiones de 10 minutos cada una.</p>
          <p><strong>Próximos pasos:</strong></p>
          <ol>
            <li>Revisa tu email en las próximas horas para coordinar tu primera sesión</li>
            <li>Accede a tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mentorship" style="color: #2563eb;">Panel de Mentoría</a></li>
            <li>Selecciona tu mentor preferido basado en su especialización</li>
          </ol>
        </div>
        ` : ''}

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">💡 Cómo Sacar el Máximo Provecho</h3>
          <ul>
            <li><strong>Lee el Capítulo 1 primero:</strong> Establece tus fundamentos</li>
            <li><strong>Toma notas:</strong> Cada capítulo incluye ejercicios prácticos</li>
            <li><strong>Aplica inmediatamente:</strong> La práctica es clave para el éxito</li>
            <li><strong>Únete a la comunidad:</strong> Comparte tus progresos en nuestro grupo</li>
          </ul>
        </div>

        <p>¿Necesitas ayuda? Responde este email o contáctanos en <a href="mailto:support@skillsforit.com">support@skillsforit.com</a></p>

        <p style="text-align: center; color: #666; font-size: 14px;">
          SkillsForIT - Transformando Carreras IT<br>
          ID de Transacción: ${options.paymentIntentId}
        </p>
      </div>
    </body>
    </html>
  `
}

async function sendMentorshipEmail(email: string, paymentIntentId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const emailData = {
      to: email,
      subject: '¡Tu Mentoría Personalizada está Activada! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tu Mentoría Personalizada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">¡Felicidades! 🎉</h1>

            <p>Hola,</p>

            <p>Tu mentoría personalizada de 1 mes ha sido activada exitosamente. Ahora tienes acceso a <strong>4 sesiones de 10 minutos</strong> con mentores expertos en IT.</p>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h2 style="color: #065f46; margin-top: 0;">🚀 Próximos Pasos</h2>
              <ol>
                <li><strong>Accede a tu Dashboard:</strong> Ve a <a href="${baseUrl}/dashboard/ebook" style="color: #2563eb;">tu panel de alumno</a></li>
                <li><strong>Selecciona tu Mentor:</strong> Elige entre nuestros mentores especializados según tu perfil</li>
                <li><strong>Agenda tu Primera Sesión:</strong> Coordina el horario que mejor te convenga</li>
                <li><strong>Prepárate:</strong> Antes de cada sesión, piensa en tus preguntas específicas</li>
              </ol>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💡 Cómo Sacar el Máximo Provecho</h3>
              <ul>
                <li><strong>Sesión 1:</strong> Evaluación inicial y definición de objetivos</li>
                <li><strong>Sesión 2:</strong> Desarrollo de habilidades técnicas específicas</li>
                <li><strong>Sesión 3:</strong> Preparación para entrevistas y CV</li>
                <li><strong>Sesión 4:</strong> Plan de acción y próximos pasos</li>
              </ul>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
              SkillsForIT - Transformando Carreras IT<br>
              ID de Transacción: ${paymentIntentId}
            </p>
          </div>
        </body>
        </html>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      console.error('[EbookWebhook] Failed to send mentorship email:', await response.text())
    } else {
      console.log(`[EbookWebhook] Mentorship activation email sent to ${email}`)
    }

  } catch (error: any) {
    console.error('[EbookWebhook] Error sending mentorship email:', error)
  }
}

async function handleEbookPurchase(email: string, paymentIntent: Stripe.PaymentIntent, includeCVAudit: string, basePrice: string, cvAuditPrice: string) {
  // Find or create user
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
    throw userError
  }

  let userId: string

  if (!user) {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (createError) throw createError
    userId = newUser.id
  } else {
    userId = user.id
  }

  // Update order status
  const { error: orderError } = await supabase
    .from('ebook_orders')
    .update({
      status: 'completed',
      user_id: userId,
      completed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (orderError) {
    console.error('[EbookWebhook] Error updating order:', orderError)
  }

  // Grant ebook access
  const { error: ebookAssetError } = await supabase
    .from('user_assets')
    .insert({
      user_id: userId,
      asset_type: 'ebook',
      asset_id: 'soft-skills-guide',
      granted_at: new Date().toISOString(),
      expires_at: null, // Lifetime access
      metadata: {
        payment_intent_id: paymentIntent.id,
        base_price: basePrice,
        purchase_date: new Date().toISOString()
      }
    })

  if (ebookAssetError) {
    console.error('[EbookWebhook] Error granting ebook access:', ebookAssetError)
  }

  // Grant CV audit access if purchased
  if (includeCVAudit === 'true') {
    const { error: cvAssetError } = await supabase
      .from('user_assets')
      .insert({
        user_id: userId,
        asset_type: 'cv_audit',
        asset_id: 'cv-audit-service',
        granted_at: new Date().toISOString(),
        expires_at: null, // One-time service
        metadata: {
          payment_intent_id: paymentIntent.id,
          price: cvAuditPrice,
          purchase_date: new Date().toISOString()
        }
      })

    if (cvAssetError) {
      console.error('[EbookWebhook] Error granting CV audit access:', cvAssetError)
    }
  }

  // Send delivery email
  await sendDeliveryEmail(email, {
    includeCVAudit: includeCVAudit === 'true',
    includeMentorship: false, // Will be handled separately if upsold
    paymentIntentId: paymentIntent.id
  })

  console.log(`[EbookWebhook] Successfully processed ebook payment for ${email}`)
}

async function handleMentorshipUpsell(email: string, paymentIntent: Stripe.PaymentIntent, mentorshipPrice: string) {
  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !user) {
    console.error('[EbookWebhook] User not found for mentorship upsell:', email)
    return
  }

  // Grant mentorship access
  const { error: mentorshipAssetError } = await supabase
    .from('user_assets')
    .insert({
      user_id: user.id,
      asset_type: 'mentorship',
      asset_id: 'mentorship-1-month',
      granted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: {
        payment_intent_id: paymentIntent.id,
        price: mentorshipPrice,
        sessions_remaining: 4,
        purchase_date: new Date().toISOString()
      }
    })

  if (mentorshipAssetError) {
    console.error('[EbookWebhook] Error granting mentorship access:', mentorshipAssetError)
    return
  }

  // Send mentorship activation email
  await sendMentorshipEmail(email, paymentIntent.id)

  console.log(`[EbookWebhook] Successfully processed mentorship upsell for ${email}`)
}

async function handleCVAuditPayment(email: string, paymentIntent: Stripe.PaymentIntent, analysisId: string) {
  // Find or create user
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
    throw userError
  }

  let userId: string

  if (!user) {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (createError) throw createError
    userId = newUser.id
  } else {
    userId = user.id
  }

  // Record CV audit payment
  const { error: paymentError } = await supabase
    .from('cv_audit_payments')
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      created_at: new Date().toISOString()
    })

  if (paymentError) {
    console.error('[EbookWebhook] Error recording CV audit payment:', paymentError)
  }

  // Send confirmation email
  await sendCVAuditConfirmationEmail(email, paymentIntent.id)

  console.log(`[EbookWebhook] Successfully processed CV audit payment for ${email}`)
}

async function sendCVAuditConfirmationEmail(email: string, paymentIntentId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const emailData = {
      to: email,
      subject: '¡Tu Auditoría Completa de CV está Lista! 📊',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tu Auditoría Completa de CV</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">¡Auditoría Completa Desbloqueada! 🎉</h1>

            <p>Hola,</p>

            <p>Tu pago ha sido procesado exitosamente. Ahora tienes acceso completo a tu auditoría de CV con IA, incluyendo:</p>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h2 style="color: #065f46; margin-top: 0;">✅ Lo que Ahora tienes Acceso</h2>
              <ul>
                <li><strong>Consejos Detallados:</strong> Soluciones específicas para cada problema</li>
                <li><strong>Keywords Específicas:</strong> Lista completa de términos técnicos</li>
                <li><strong>Plan de Mejora:</strong> Pasos concretos para optimizar tu CV</li>
                <li><strong>Ejemplos Prácticos:</strong> Antes/Después de frases y secciones</li>
                <li><strong>Reporte Completo:</strong> Análisis exhaustivo de 50+ criterios</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/cv-audit/report?paymentIntentId=${paymentIntentId}"
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                📊 Ver mi Auditoría Completa
              </a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
              SkillsForIT - Transformando Carreras IT<br>
              ID de Transacción: ${paymentIntentId}
            </p>
          </div>
        </body>
        </html>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      console.error('[EbookWebhook] Failed to send CV audit confirmation email:', await response.text())
    } else {
      console.log(`[EbookWebhook] CV audit confirmation email sent to ${email}`)
    }

  } catch (error: any) {
    console.error('[EbookWebhook] Error sending CV audit confirmation email:', error)
  }
}