import { test, expect } from '@playwright/test'

/**
 * E2E Test: Login y Logout - Usuario Estándar
 *
 * User Journey:
 * 1. Ir a la página de login
 * 2. Ingresar credenciales válidas de usuario estándar
 * 3. Validar acceso a dashboard o página principal
 * 4. Realizar logout y validar redirección
 */

test.describe('Login y Logout - Usuario Estándar', () => {
  test('debe iniciar y cerrar sesión correctamente', async ({ page }) => {
    // Paso 1: Ir a la página de login
    await page.goto('/auth/login')
    await expect(page).toHaveURL(/\/auth\/login$/)

    // Paso 2: Ingresar credenciales
    await page.fill('input[name="email"]', 'usuario@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')

    // Paso 3: Validar acceso
    await page.waitForURL(/\/dashboard|\/home|\/panel/)
    await expect(page.locator('text=/Bienvenido|Dashboard|Panel/i')).toBeVisible()

    // Paso 4: Logout
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/auth\/login/)
    await expect(page.locator('text=/Iniciar sesión|Login/i')).toBeVisible()
  })
})
