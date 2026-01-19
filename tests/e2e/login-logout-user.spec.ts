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
    // Diagnóstico: captura errores de consola y screenshot antes de esperar el input
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.screenshot({ path: 'diagnostic-user-login.png', fullPage: true });
    const emailInput = page.locator('input[name="email"]');
    const isVisible = await emailInput.isVisible();
    console.log('¿Input email visible?:', isVisible);
    if (!isVisible) {
      console.log('Errores de consola:', consoleErrors);
      // Print page HTML for debugging
      const html = await page.content();
      console.log('HTML actual de la página:', html);
      // Log network requests/responses
      page.on('request', request => {
        console.log('Request:', request.method(), request.url());
      });
      page.on('response', response => {
        console.log('Response:', response.status(), response.url());
      });
    }
    await expect(emailInput).toBeVisible();
    await emailInput.fill('usuario@test.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button:has-text("Iniciar sesión")');

    // Paso 3: Validar acceso
    await page.waitForURL(/\/dashboard|\/home|\/panel/)
    await expect(page.locator('text=/Bienvenido|Dashboard|Panel/i')).toBeVisible()

    // Paso 4: Logout
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/auth\/login/)
    await expect(page.locator('text=/Iniciar sesión|Login/i')).toBeVisible()
  })
})
