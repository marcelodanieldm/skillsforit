import { test, expect } from '@playwright/test'

/**
 * E2E Test: Login y Logout - Admin
 *
 * User Journey:
 * 1. Ir a la página de login de admin
 * 2. Ingresar credenciales válidas de admin
 * 3. Validar acceso a dashboard de admin
 * 4. Realizar logout y validar redirección
 */

test.describe('Login y Logout - Admin', () => {
  test('debe iniciar y cerrar sesión correctamente', async ({ page }) => {
    // Paso 1: Ir a la página de login admin
    await page.goto('/admin/auth/login')
    await expect(page).toHaveURL(/\/admin\/auth\/login$/)

    // Paso 2: Ingresar credenciales
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')

    // Paso 3: Validar acceso
    await page.waitForURL(/\/admin\/dashboard|\/admin\/panel/)
    await expect(page.locator('text=/Bienvenido|Admin|Panel/i')).toBeVisible()

    // Paso 4: Logout
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/admin\/auth\/login/)
    await expect(page.locator('text=/Iniciar sesión|Login/i')).toBeVisible()
  })
})
