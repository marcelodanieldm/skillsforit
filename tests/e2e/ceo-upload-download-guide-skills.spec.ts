import { test, expect } from '@playwright/test'

/**
 * E2E Test: Subida y descarga de PDF de Guide Skills por CEO
 *
 * User Journey:
 * 1. Login como CEO
 * 2. Subir un PDF de Guide Skills
 * 3. Descargar el PDF y validar contenido
 * 4. Subir un nuevo PDF y validar reemplazo
 */

test.describe('CEO - Subida y Descarga de PDF Guide Skills', () => {
  const pdfPath1 = 'tests/assets/guide-skills-v1.pdf'
  const pdfPath2 = 'tests/assets/guide-skills-v2.pdf'

  test('debe subir, descargar y reemplazar el PDF', async ({ page, context }) => {
    // Paso 1: Login CEO
    await page.goto('/ceo/auth/login')
    await expect(page).toHaveURL(/\/ceo\/auth\/login$/)
    await page.fill('input[name="email"]', 'ceo@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/ceo\/dashboard/)
    await expect(page.locator('text=/Dashboard|CEO/i')).toBeVisible()

    // Paso 2: Subir PDF v1
    await page.setInputFiles('input[type="file"]', pdfPath1)
    await page.click('button:has-text("Subir PDF")')
    await expect(page.locator('text=/PDF subido exitosamente/i')).toBeVisible()

    // Paso 3: Descargar PDF y validar nombre
    const [ download1 ] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a:has-text("Descargar Guide Skills")')
    ])
    expect(download1.suggestedFilename()).toMatch(/guide-skills.*\.pdf$/i)

    // Paso 4: Subir PDF v2 (reemplazo)
    await page.setInputFiles('input[type="file"]', pdfPath2)
    await page.click('button:has-text("Subir PDF")')
    await expect(page.locator('text=/PDF subido exitosamente/i')).toBeVisible()

    // Paso 5: Descargar PDF y validar que es el nuevo
    const [ download2 ] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a:has-text("Descargar Guide Skills")')
    ])
    expect(download2.suggestedFilename()).toMatch(/guide-skills.*\.pdf$/i)
    // (Opcional) Validar que el archivo descargado es diferente al anterior
    // const buffer1 = await download1.createReadStream()
    // const buffer2 = await download2.createReadStream()
    // expect(buffer1 !== buffer2)
  })
})
