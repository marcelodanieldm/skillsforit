import { test, expect } from '@playwright/test'

/**
 * E2E Test: CRUD de Mentor desde Dashboard CEO (edición y eliminación)
 *
 * User Journey:
 * 1. Login como CEO
 * 2. Crear un nuevo mentor
 * 3. Editar datos del mentor y validar persistencia
 * 4. Eliminar mentor y validar que ya no aparece
 */

test.describe('CEO - Edición y Eliminación de Mentor', () => {
  const mentorEmail = `mentor-e2e-${Date.now()}@test.com`
  const mentorPassword = 'TestPassword123!'
  const mentorEditName = 'Mentor E2E Editado'

  test('debe crear, editar y eliminar un mentor', async ({ page }) => {
    // Paso 1: Login CEO
    await page.goto('/ceo/auth/login')
    await expect(page).toHaveURL(/\/ceo\/auth\/login$/)
    await page.fill('input[name="email"]', 'ceo@test.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/ceo\/dashboard/)
    await expect(page.locator('text=/Dashboard|CEO/i')).toBeVisible()

    // Paso 2: Crear nuevo mentor
    await page.click('button:has-text("Nuevo Mentor")')
    await page.fill('input[name="name"]', 'Mentor E2E')
    await page.fill('input[name="email"]', mentorEmail)
    await page.fill('input[name="password"]', mentorPassword)
    await page.click('button:has-text("Guardar")')
    await expect(page.locator(`text=${mentorEmail}`)).toBeVisible()

    // Paso 3: Editar mentor
    await page.locator(`tr:has-text('${mentorEmail}') button:has-text('Editar')`).click()
    await page.fill('input[name="name"]', mentorEditName)
    await page.click('button:has-text("Guardar")')
    await expect(page.locator(`text=${mentorEditName}`)).toBeVisible()

    // Paso 4: Eliminar mentor
    await page.locator(`tr:has-text('${mentorEditName}') button:has-text('Eliminar')`).click()
    await page.click('button:has-text("Confirmar")')
    await expect(page.locator(`text=${mentorEditName}`)).not.toBeVisible()
    await expect(page.locator(`text=${mentorEmail}`)).not.toBeVisible()
  })
})
