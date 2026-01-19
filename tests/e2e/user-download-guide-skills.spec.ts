import { test, expect } from '@playwright/test'

/**
 * E2E Test: Descarga de PDF de Guide Skills por usuario IT
 *
 * User Journey:
 * 1. Login como usuario IT
 * 2. Acceder a dashboard
 * 3. Descargar el PDF de Guide Skills desde dashboard
 * 4. Validar que el archivo se descarga correctamente
 */

test.describe('Usuario IT - Descarga de PDF Guide Skills', () => {
  test('debe poder descargar el PDF desde el dashboard', async ({ page, context }) => {
    // Paso 1: Login usuario IT
    await page.goto('/auth/login')
    await expect(page).toHaveURL(/\/auth\/login$/)
    // Diagnóstico: captura errores de consola y screenshot antes de esperar el input
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.screenshot({ path: 'diagnostic-user-download-login.png', fullPage: true });
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
    await page.waitForURL(/\/dashboard|\/home|\/panel/)
    await expect(page.locator('text=/Bienvenido|Dashboard|Panel/i')).toBeVisible()

    // Paso 2: Descargar PDF desde dashboard
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a:has-text("Descargar Guide Skills")')
    ])
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    expect(download.suggestedFilename()).toMatch(/guide-skills.*\.pdf$/i)
  })
})
