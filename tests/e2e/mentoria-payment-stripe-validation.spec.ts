import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid';
import { mentorsDb } from '../../lib/database';

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

test.describe('Mentoría - Pago con Stripe (Validación Stripe)', () => {
  test('debe completar el pago y validar integración', async ({ page, request }) => {
    // Seed mentor for test reliability
    const mentorId = uuidv4();
    mentorsDb.create({
      id: mentorId,
      userId: uuidv4(),
      name: 'Mentor E2E',
      email: 'mentor-e2e@example.com',
      bio: 'Mentor de prueba para E2E',
      expertise: ['Frontend', 'Career Growth'],
      linkedinUrl: 'https://linkedin.com/in/mentor-e2e',
      hourlyRate: 20,
      totalSessions: 0,
      rating: 5,
      reviewCount: 0,
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' }
      ]
    });
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
    const testEmail = `mentoria-stripe-${Date.now()}@example.com`
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

    // Paso 6: Validar integración con Stripe y backend
    // 1. Validar que el email de prueba aparece en la base de datos (opcional, si tienes endpoint de consulta)
    // 2. Validar que el webhook de Stripe fue recibido (opcional, si tienes logs o endpoint de eventos)
    // 3. Validar que el pago aparece en Stripe Dashboard (manual o vía API de Stripe si tienes clave de test)
    // 4. Validar que el estado de la sesión en la app es 'pagado' o 'confirmado' (opcional)

    // Ejemplo: Validar que la URL contiene el session_id de Stripe
    const url = page.url()
    expect(url).toMatch(/session_id=\w+/)

    // (Opcional) Si tienes endpoint para consultar la sesión, podrías hacer:
    // const sessionId = new URL(url).searchParams.get('session_id')
    // const response = await request.get(`/api/mentors/session/${sessionId}`)
    // expect(response.ok()).toBeTruthy()
    // const data = await response.json()
    // expect(data.status).toBe('paid')
  })
})
