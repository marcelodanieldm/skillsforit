import { test, expect } from '@playwright/test'

/**
 * E2E Test: Ebook - Pago con Stripe (Validación avanzada)
 *
 * User Journey:
 * 1. Ir a la página de checkout de ebook
 * 2. Completar formulario de compra
 * 3. Proceder al pago con Stripe
 * 4. Validar éxito y redirección
 * 5. Validar integración con Stripe y backend
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_API_BASE = 'https://api.stripe.com/v1'

// Helper para consultar Stripe API
async function getStripePaymentIntent(paymentIntentId: string) {
  const res = await fetch(`${STRIPE_API_BASE}/payment_intents/${paymentIntentId}`, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  })
  if (!res.ok) throw new Error('No se pudo consultar Stripe API')
  return res.json()
}

test.describe('Ebook - Pago con Stripe (Validación Stripe y Backend)', () => {
  test('debe completar el pago y validar integración', async ({ page, request }) => {
    // Paso 1: Ir a la página de checkout de ebook
    await page.goto('/ebook/checkout')
    await expect(page).toHaveURL(/\/ebook\/checkout$/)

    // Paso 2: Completar formulario de compra
    // Diagnóstico: captura errores de consola y screenshot antes de esperar el input
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.screenshot({ path: 'diagnostic-ebook-stripe-checkout.png', fullPage: true });
    const nameInput = page.locator('input[name="name"]');
    const isVisible = await nameInput.isVisible();
    console.log('¿Input name visible?:', isVisible);
    if (!isVisible) {
      console.log('Errores de consola:', consoleErrors);
    }
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test Usuario Ebook');
    const testEmail = `ebook-stripe-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);

    // Paso 3: Click en pagar con Stripe
    const checkoutButton = page.locator('button:has-text("Pagar con Stripe")')
    await expect(checkoutButton).toBeVisible()
    await checkoutButton.click()

    // Espera redirección a Stripe Checkout
    await page.waitForURL(/checkout.stripe.com/)

    // Completa el formulario de Stripe Checkout
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cardnumber"]').fill('4242 4242 4242 4242')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="exp-date"]').fill('12/34')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cvc"]').fill('123')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="postal"]').fill('12345')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('button[type="submit"]').click()

    // Espera redirección de vuelta a la app (success page)
    await page.waitForURL(/\/ebook\/success\?session_id=/)
    await expect(page.locator('text=/Pago exitoso|¡Gracias por tu compra!/i')).toBeVisible()

    // Paso 5: Validar integración con Stripe y backend
    // Extraer payment_intent de la URL (usualmente session_id o payment_intent)
    const url = page.url()
    const sessionId = new URL(url).searchParams.get('session_id')
    expect(sessionId).toBeTruthy()

    // Consultar Stripe API para validar el pago
    if (STRIPE_SECRET_KEY) {
      // Buscar el payment_intent asociado al session_id (requiere lógica extra si usas Checkout Sessions)
      // Aquí se asume que session_id es el payment_intent
      const paymentIntent = await getStripePaymentIntent(sessionId!)
      expect(paymentIntent.status).toBe('succeeded')
      expect(paymentIntent.charges.data[0].billing_details.email).toBe(testEmail)
      expect(paymentIntent.amount).toBeGreaterThan(0)
    } else {
      console.warn('STRIPE_SECRET_KEY no está definido, omitiendo validación Stripe API')
    }

    // Consultar backend para validar el registro del pago (ebook_orders)
    // Suponiendo endpoint: /api/ebook/order/[payment_intent_id]
    const backendResponse = await request.get(`/api/ebook/order/${sessionId}`)
    expect(backendResponse.ok()).toBeTruthy()
    const backendData = await backendResponse.json()
    expect(backendData).toHaveProperty('status', 'completed')
    expect(backendData).toHaveProperty('user_id')
    expect(backendData).toHaveProperty('email', testEmail)
    expect(backendData).toHaveProperty('stripe_payment_intent_id', sessionId)
    expect(backendData).toHaveProperty('amount')
    expect(backendData.amount).toBeGreaterThan(0)
  })
})
