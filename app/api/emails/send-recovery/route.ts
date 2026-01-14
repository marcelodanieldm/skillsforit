import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkillsForIt <noreply@skillsforit.com>'

/**
 * POST /api/emails/send-recovery
 * 
 * Envía emails de recuperación de carrito
 * 
 * Body:
 * {
 *   cartId: string,
 *   emailType: 'hour_1' | 'hour_24'
 * }
 */
export async function POST(request: Request) {
  try {
    // Autenticación (solo cron o admin)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { cartId, emailType } = await request.json()

    if (!cartId || !emailType) {
      return NextResponse.json(
        { error: 'cartId and emailType required' },
        { status: 400 }
      )
    }

    // Obtener carrito
    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', cartId)
      .single()

    if (cartError || !cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Generar magic token
    const magicToken = crypto.randomBytes(32).toString('hex')

    // Crear cupón si es email_2
    let couponCode: string | null = null
    let couponId: string | null = null
    let couponExpiresAt: string | null = null

    if (emailType === 'hour_24') {
      const couponData = await createRecoveryCoupon(cart)
      couponCode = couponData.code
      couponId = couponData.id
      couponExpiresAt = couponData.expiresAt
    }

    // Construir magic link
    const magicLink = `${APP_URL}/recover-cart?token=${magicToken}`

    // Determinar contenido del email
    const emailContent = emailType === 'hour_1' 
      ? buildEmail1(cart, magicLink)
      : buildEmail2(cart, magicLink, couponCode!)

    // Enviar email con Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: cart.user_email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (emailError) {
      throw new Error(`Resend error: ${emailError.message}`)
    }

    // Registrar email enviado
    await supabase
      .from('recovery_emails')
      .insert({
        abandoned_cart_id: cart.id,
        email_type: emailType,
        recipient_email: cart.user_email,
        subject: emailContent.subject,
        body_preview: emailContent.preview,
        coupon_code: couponCode,
        coupon_discount_percent: couponCode ? 15 : null,
        coupon_expires_at: couponExpiresAt,
        magic_link: magicLink,
        magic_token: magicToken,
        email_provider: 'resend',
        provider_message_id: emailData?.id,
        status: 'sent'
      })

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
      magicLink,
      couponCode
    })

  } catch (error: any) {
    console.error('Error sending recovery email:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Crear cupón de recuperación en Stripe
 */
async function createRecoveryCoupon(cart: any) {
  const code = `RECOVER${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 horas
  
  try {
    // Crear cupón en Stripe
    const stripeCoupon = await stripe.coupons.create({
      percent_off: 15,
      duration: 'once',
      max_redemptions: 1,
      metadata: {
        cart_id: cart.id,
        user_email: cart.user_email,
        type: 'cart_recovery'
      }
    })

    // Crear promotion code para que sea más fácil de usar
    const promotionCode = await stripe.promotionCodes.create({
      coupon: stripeCoupon.id,
      code: code,
      max_redemptions: 1,
      expires_at: Math.floor(expiresAt.getTime() / 1000)
    } as any)

    // Registrar en BD
    const { data: coupon } = await supabase
      .from('recovery_coupons')
      .insert({
        abandoned_cart_id: cart.id,
        code: code,
        discount_type: 'percentage',
        discount_value: 15,
        stripe_coupon_id: stripeCoupon.id,
        stripe_promotion_code_id: promotionCode.id,
        valid_until: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    return {
      id: coupon.id,
      code: code,
      expiresAt: expiresAt.toISOString()
    }

  } catch (error) {
    console.error('Error creating coupon:', error)
    throw error
  }
}

/**
 * Email 1: "¿Hubo algún problema técnico?"
 */
function buildEmail1(cart: any, magicLink: string) {
  const cartItems = []
  if (cart.cart_data.ebook) cartItems.push('📘 E-book de Soft Skills')
  if (cart.cart_data.cv_audit) cartItems.push('📝 CV Auditor + Order Bump')
  if (cart.cart_data.mentorship) cartItems.push('👨‍🏫 Mentoría 1:1')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Olvidaste algo?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">SkillsForIt</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Tu carrera no puede esperar</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">¿Hubo algún problema técnico?</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Notamos que iniciaste el proceso de compra pero no pudiste completarlo. 
                <strong>Te guardamos tu lugar.</strong>
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Tu carrito incluye:</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280;">
                  ${cartItems.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
                </ul>
                <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 20px 0 0 0;">
                  Total: $${cart.total_amount.toFixed(2)} USD
                </p>
              </div>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Si tuviste problemas con el pago o simplemente cambiaste de opinión, 
                <strong>estamos aquí para ayudarte.</strong>
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Completar Mi Compra →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Este enlace es seguro y pre-carga tu carrito automáticamente.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                ¿Preguntas? Responde a este email o contacta a 
                <a href="mailto:support@skillsforit.com" style="color: #6366f1; text-decoration: none;">support@skillsforit.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} SkillsForIt. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return {
    subject: '¿Olvidaste algo? Tu carrito te está esperando 🛒',
    html,
    preview: 'Notamos que iniciaste el proceso de compra pero no pudiste completarlo. Te guardamos tu lugar.'
  }
}

/**
 * Email 2: "15% de descuento extra"
 */
function buildEmail2(cart: any, magicLink: string, couponCode: string) {
  const cartItems = []
  if (cart.cart_data.ebook) cartItems.push('📘 E-book de Soft Skills')
  if (cart.cart_data.cv_audit) cartItems.push('📝 CV Auditor + Order Bump')
  if (cart.cart_data.mentorship) cartItems.push('👨‍🏫 Mentoría 1:1')

  const discountedTotal = (cart.total_amount * 0.85).toFixed(2)
  const savings = (cart.total_amount * 0.15).toFixed(2)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>15% OFF - Última oportunidad</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: #fbbf24; padding: 12px 30px; text-align: center;">
              <p style="color: #78350f; margin: 0; font-size: 14px; font-weight: 700;">
                ⏰ Oferta válida solo por 12 horas
              </p>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🎉 ¡15% OFF SOLO PARA TI!</h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 18px;">Tu carrera no puede esperar</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Sabemos que estás considerándolo...</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Por eso queremos hacer más fácil tu decisión. 
                <strong>Aquí tienes un descuento extra del 15%</strong> sobre tu carrito.
              </p>

              <!-- Discount Box -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; padding: 30px; margin: 20px 0; border-radius: 12px; text-align: center;">
                <p style="color: #78350f; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                  Tu código de descuento
                </p>
                <div style="background-color: #ffffff; border: 2px dashed #f59e0b; padding: 20px; border-radius: 8px; margin: 15px 0;">
                  <p style="color: #1f2937; font-size: 32px; font-weight: 900; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                    ${couponCode}
                  </p>
                </div>
                <p style="color: #92400e; font-size: 13px; margin: 10px 0 0 0; font-weight: 600;">
                  ⏳ Expira en 12 horas
                </p>
              </div>

              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Tu carrito:</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280;">
                  ${cartItems.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
                </ul>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 16px; margin: 0 0 5px 0; text-decoration: line-through;">
                    Antes: $${cart.total_amount.toFixed(2)} USD
                  </p>
                  <p style="color: #10b981; font-size: 24px; font-weight: 700; margin: 0;">
                    Ahora: $${discountedTotal} USD
                  </p>
                  <p style="color: #059669; font-size: 14px; font-weight: 600; margin: 10px 0 0 0;">
                    ✓ Ahorras $${savings} USD
                  </p>
                </div>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: 700; font-size: 20px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      Aplicar Descuento Ahora →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                El enlace aplica el descuento automáticamente. <br>
                No necesitas copiar el código.
              </p>

              <!-- Urgency Reminder -->
              <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; margin: 30px 0 0 0; border-radius: 8px; text-align: center;">
                <p style="color: #991b1b; font-size: 16px; margin: 0; font-weight: 600;">
                  ⚠️ Esta oferta expira en <strong>12 horas</strong>
                </p>
                <p style="color: #dc2626; font-size: 14px; margin: 10px 0 0 0;">
                  Después de ese tiempo, el cupón dejará de funcionar.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                ¿Preguntas? Responde a este email o contacta a 
                <a href="mailto:support@skillsforit.com" style="color: #10b981; text-decoration: none;">support@skillsforit.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} SkillsForIt. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return {
    subject: `🎁 ${couponCode}: 15% OFF - Última oportunidad (12 horas)`,
    html,
    preview: `Tu descuento exclusivo del 15% expira en 12 horas. Ahorra $${savings} en tu carrito.`
  }
}
