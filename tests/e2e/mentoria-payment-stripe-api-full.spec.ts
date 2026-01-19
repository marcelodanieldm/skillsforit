import { test, expect } from '@playwright/test'

/**
 * E2E Test: Mentoría - Pago con Stripe (Validación avanzada)
 *
 * User Journey:
 * 1. Ir a la página de mentores
 * 2. Seleccionar un mentor y agendar sesión
 * 3. Completar formulario de reserva
 * 4. Proceder al pago con Stripe
 * 5. Validar éxito y redirección
 * 6. Validar integración con Stripe y backend
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_API_BASE = 'https://api.stripe.com/v1'

// Helper para consultar Stripe API
async function getStripeCheckoutSession(sessionId: string) {
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  })
  if (!res.ok) throw new Error('No se pudo consultar Stripe API')
  return res.json()
}

test.describe('Mentoría - Pago con Stripe (Validación Stripe y Backend)', () => {
  test('debe completar el pago y validar integración', async ({ page, request }) => {
    // Paso 1: Ir a la página de mentores
    await page.goto('/mentors')
    await expect(page).toHaveURL(/\/mentors$/)

    // Paso 2: Seleccionar el primer mentor disponible
    const mentorCard = page.locator('[data-testid="mentor-card"]').first()
    await expect(mentorCard).toBeVisible()
    await mentorCard.click()

    // Paso 3: Agendar sesión (rellenar formulario)
    await expect(page).toHaveURL(/\/mentors\/book/)
    await page.fill('input[name="name"]', 'Test Usuario Mentoría')
    const testEmail = `mentoria-stripe-api-${Date.now()}@example.com`
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="date"]', '2026-01-20')
    await page.fill('input[name="time"]', '10:00')
    await page.selectOption('select[name="duration"]', '30')

    // Paso 4: Click en pagar con Stripe
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
    await page.waitForURL(/\/mentors\/success\?session_id=/)
    await expect(page.locator('text=/Pago exitoso|¡Gracias por tu compra!|Sesión Reservada/i')).toBeVisible()

    // Paso 5: Extrae el session_id de Stripe
    const url = page.url()
    const sessionId = new URL(url).searchParams.get('session_id')
    expect(sessionId).toBeTruthy()

    // Paso 6: Consulta la API de Stripe para validar el pago
    if (STRIPE_SECRET_KEY) {
      const session = await getStripeCheckoutSession(sessionId!)
      expect(session.payment_status).toBe('paid')
      expect(session.customer_email).toBe(testEmail)
      expect(session.amount_total).toBeGreaterThan(0)
      expect(session.status).toBe('complete')
    } else {
      console.warn('STRIPE_SECRET_KEY no está definido, omitiendo validación Stripe API')
    }

    // Paso 7: Consulta el backend para validar el estado de la sesión (mentor_bookings)
    const backendResponse = await request.get(`/api/mentors/session/${sessionId}`)
    expect(backendResponse.ok()).toBeTruthy()
    const backendData = await backendResponse.json()
    expect(backendData).toHaveProperty('sessionId')
    expect(backendData).toHaveProperty('paymentStatus')
    expect(["paid", "scheduled", "confirmed", "completed"]).toContain(backendData.paymentStatus)
  })
})
