import { test, expect } from '@playwright/test'

/**
 * E2E Test: Mentoría - Pago con Stripe
 *
 * User Journey:
 * 1. Ir a la página de mentores
 * 2. Seleccionar un mentor y agendar sesión
 * 3. Completar formulario de reserva
 * 4. Proceder al pago con Stripe
 * 5. Validar éxito y redirección
 */

test.describe('Mentoría - Pago con Stripe', () => {
  test('debe completar el pago de mentoría exitosamente', async ({ page }) => {
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
    await page.fill('input[name="email"]', `mentoria-test-${Date.now()}@example.com`)
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
    await expect(page.locator('text=/Pago exitoso|¡Gracias por tu compra!/i')).toBeVisible()
  })
})
