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
    await page.fill('input[name="email"]', 'usuario@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')
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
