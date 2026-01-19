import { test, expect } from '@playwright/test'

/**
 * E2E Test: Ebook - Pago con Stripe
 *
 * User Journey:
 * 1. Ir a la página de checkout de ebook
 * 2. Completar formulario de compra
 * 3. Proceder al pago con Stripe
 * 4. Validar éxito y redirección
 */

test.describe('Ebook - Pago con Stripe', () => {
  test('debe completar el pago de ebook exitosamente', async ({ page }) => {
    // Paso 1: Ir a la página de checkout de ebook
    await page.goto('/ebook/checkout')
    await expect(page).toHaveURL(/\/ebook\/checkout$/)

    // Paso 2: Completar formulario de compra
    await page.waitForSelector('input[name="name"]', { state: 'visible' })
    await page.fill('input[name="name"]', 'Test Usuario Ebook')
    await page.fill('input[name="email"]', `ebook-test-${Date.now()}@example.com`)

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
  })
})
