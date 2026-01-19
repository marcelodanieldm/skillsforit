import { test, expect } from '@playwright/test'

/**
 * E2E Test: CRUD de Mentor desde Dashboard CEO y validación de acceso
 *
 * User Journey:
 * 1. Login como CEO
 * 2. Crear un nuevo mentor desde el dashboard
 * 3. Validar que el mentor aparece en la lista (persistencia)
 * 4. Logout CEO
 * 5. Login con el nuevo mentor
 * 6. Validar acceso exitoso y logout
 */

test.describe('CEO - CRUD Mentor y Validación de Acceso', () => {
  const mentorEmail = `mentor-e2e-${Date.now()}@test.com`
  const mentorPassword = 'TestPassword123!'

  test('debe crear, listar y validar acceso de mentor', async ({ page }) => {
    // Paso 1: Login CEO
    await page.goto('/ceo/auth/login')
    await expect(page).toHaveURL(/\/ceo\/auth\/login$/)
    await page.waitForSelector('input[name="email"]', { state: 'visible' })
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

    // Paso 3: Validar persistencia (mentor aparece en la lista)
    await expect(page.locator(`text=${mentorEmail}`)).toBeVisible()

    // Paso 4: Logout CEO
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/ceo\/auth\/login/)

    // Paso 5: Login con el nuevo mentor
    await page.goto('/mentor/auth/login')
    await expect(page).toHaveURL(/\/mentor\/auth\/login$/)
    await page.fill('input[name="email"]', mentorEmail)
    await page.fill('input[name="password"]', mentorPassword)
    await page.click('button:has-text("Iniciar sesión")')

    // Paso 6: Validar acceso y logout
    await page.waitForURL(/\/mentor\/dashboard|\/mentor\/panel/)
    await expect(page.locator('text=/Bienvenido|Mentor|Panel/i')).toBeVisible()
    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL(/\/mentor\/auth\/login/)
  })
})
