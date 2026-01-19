import { test, expect } from '@playwright/test'

/**
 * E2E Test: Login y Logout - Mentor
 *
 * User Journey:
 * 1. Ir a la página de login de mentor
 * 2. Ingresar credenciales válidas de mentor
 * 3. Validar acceso a dashboard de mentor
 * 4. Realizar logout y validar redirección
 */

test.describe('Login y Logout - Mentor', () => {
  test('debe iniciar y cerrar sesión correctamente', async ({ page }) => {
    // Paso 1: Ir a la página de login mentor
    await page.goto('/mentor/auth/login')
    await expect(page).toHaveURL(/\/mentor\/auth\/login$/)

    // Paso 2: Ingresar credenciales
    // Diagnóstico: captura errores de consola y screenshot antes de esperar el input
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.screenshot({ path: 'diagnostic-mentor-login.png', fullPage: true });
    const emailInput = page.locator('input[name="email"]');
    const isVisible = await emailInput.isVisible();
    console.log('¿Input email visible?:', isVisible);
    if (!isVisible) {
      console.log('Errores de consola:', consoleErrors);
    }
    await expect(emailInput).toBeVisible();
    await emailInput.fill('mentor@test.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button:has-text("Iniciar sesión")');

    // Paso 3: Validar acceso
    await page.waitForURL(/\/mentor\/dashboard|\/mentor\/panel/)
    await expect(page.locator('text=/Bienvenido|Mentor|Panel/i')).toBeVisible()

    // Paso 4: Logout
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/mentor\/auth\/login/)
    await expect(page.locator('text=/Iniciar sesión|Login/i')).toBeVisible()
  })
})
