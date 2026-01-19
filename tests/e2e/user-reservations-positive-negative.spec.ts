import { test, expect } from '@playwright/test'

/**
 * E2E Test: Usuario IT - Administración de reservas de sesiones (casos positivos y negativos)
 *
 * Casos positivos:
 * - Reservar día y horario disponible según plan comprado
 * - Modificar una reserva dentro de los límites del plan
 * - Cancelar una reserva correctamente
 *
 * Casos negativos:
 * - Intentar reservar más sesiones de las permitidas por el plan
 * - Reservar en un horario no disponible
 * - Modificar o cancelar una reserva fuera de plazo o condiciones
 */

test.describe('Usuario IT - Administración de reservas de sesiones', () => {
  const userEmail = 'usuario@test.com'
  const userPassword = 'testpassword'

  test('puede reservar, modificar y cancelar dentro de su plan (positivo)', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.waitForSelector('input[name="email"]', { state: 'visible' })
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/dashboard|\/home|\/panel/)

    // Reservar un horario disponible
    await page.goto('/mentors')
    await page.click('button:has-text("Reservar")')
    await page.selectOption('select[name="day"]', 'Lunes')
    await page.fill('input[name="time"]', '10:00')
    await page.click('button:has-text("Confirmar reserva")')
    await expect(page.locator('text=/Reserva confirmada|Sesión agendada/i')).toBeVisible()

    // Modificar la reserva
    await page.click('button:has-text("Modificar reserva")')
    await page.selectOption('select[name="day"]', 'Martes')
    await page.fill('input[name="time"]', '11:00')
    await page.click('button:has-text("Guardar cambios")')
    await expect(page.locator('text=Martes 11:00')).toBeVisible()

    // Cancelar la reserva
    await page.click('button:has-text("Cancelar reserva")')
    await page.click('button:has-text("Confirmar")')
    await expect(page.locator('text=/No tienes reservas activas|Reserva cancelada/i')).toBeVisible()
  })

  test('no puede reservar más sesiones de las permitidas (negativo)', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.waitForSelector('input[name="email"]', { state: 'visible' })
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/dashboard|\/home|\/panel/)

    // Suponiendo que el plan permite 1 sesión, intenta reservar dos
    await page.goto('/mentors')
    await page.click('button:has-text("Reservar")')
    await page.selectOption('select[name="day"]', 'Lunes')
    await page.fill('input[name="time"]', '10:00')
    await page.click('button:has-text("Confirmar reserva")')
    await expect(page.locator('text=/Reserva confirmada|Sesión agendada/i')).toBeVisible()

    // Intentar reservar otra sesión
    await page.click('button:has-text("Reservar")')
    await page.selectOption('select[name="day"]', 'Martes')
    await page.fill('input[name="time"]', '11:00')
    await page.click('button:has-text("Confirmar reserva")')
    await expect(page.locator('text=/Límite de sesiones alcanzado|No puedes reservar más/i')).toBeVisible()
  })

  test('no puede reservar en horario no disponible (negativo)', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.waitForSelector('input[name="email"]', { state: 'visible' })
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/dashboard|\/home|\/panel/)

    // Intentar reservar en horario no habilitado
    await page.goto('/mentors')
    await page.click('button:has-text("Reservar")')
    await page.selectOption('select[name="day"]', 'Domingo')
    await page.fill('input[name="time"]', '23:00')
    await page.click('button:has-text("Confirmar reserva")')
    await expect(page.locator('text=/Horario no disponible|No puedes reservar/i')).toBeVisible()
  })

  test('no puede modificar/cancelar fuera de condiciones (negativo)', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.click('button:has-text("Iniciar sesión")')
    await page.waitForURL(/\/dashboard|\/home|\/panel/)

    // Suponiendo que hay una reserva pasada o fuera de plazo
    await page.goto('/reservas')
    await page.click('button:has-text("Modificar reserva")')
    await expect(page.locator('text=/No puedes modificar esta reserva|Fuera de plazo/i')).toBeVisible()
    await page.click('button:has-text("Cancelar reserva")')
    await expect(page.locator('text=/No puedes cancelar esta reserva|Fuera de plazo/i')).toBeVisible()
  })
})
