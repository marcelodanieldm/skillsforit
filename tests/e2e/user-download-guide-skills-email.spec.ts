import { test, expect } from '@playwright/test'

/**
 * E2E Test: Descarga de PDF de Guide Skills vía email para usuario IT
 *
 * User Journey:
 * 1. Login como usuario IT
 * 2. Realizar acción que dispare el envío de email con link de descarga
 * 3. Acceder al email (mock/test inbox)
 * 4. Extraer y abrir el link de descarga
 * 5. Validar que el PDF se descarga correctamente
 */

test.describe('Usuario IT - Descarga de PDF Guide Skills vía email', () => {
  test('debe recibir email y descargar el PDF', async ({ page, context }) => {
    // Paso 1: Login usuario IT
    await page.goto('/auth/login')
    await expect(page).toHaveURL(/\/auth\/login$/)
    await page.fill('input[name="email"]', 'usuario@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/dashboard|\/home|\/panel/)
    await expect(page.locator('text=/Bienvenido|Dashboard|Panel/i')).toBeVisible()

    // Paso 2: Disparar acción que envía el email (puede ser compra, botón, etc)
    await page.click('button:has-text("Solicitar Guide Skills por email")')
    await expect(page.locator('text=/Te hemos enviado un correo|Revisa tu email/i')).toBeVisible()

    // Paso 3: Acceder a inbox de test (mock, MailHog, Mailtrap, etc)
    // Este paso depende de tu infraestructura de testing
    // Simulación: obtener el último email enviado a usuario@test.com
    // const email = await getLastEmail('usuario@test.com')
    // expect(email.subject).toMatch(/Guide Skills|Descarga/i)
    // const downloadLink = extractDownloadLink(email.html)

    // Paso 4: Acceder al link de descarga y validar PDF
    // await page.goto(downloadLink)
    // const [ download ] = await Promise.all([
    //   page.waitForEvent('download'),
    //   page.click('a:has-text("Descargar PDF")')
    // ])
    // expect(download.suggestedFilename()).toMatch(/guide-skills.*\.pdf$/i)

    // Nota: Implementa la función getLastEmail y extractDownloadLink según tu sistema de emails de test
  })
})
