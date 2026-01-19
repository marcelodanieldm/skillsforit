import { test, expect } from '@playwright/test'

/**
 * E2E Test: Mentor - Gestión de Disponibilidad y Validación en Dashboard IT
 *
 * User Journey:
 * 1. Login como mentor
 * 2. Habilitar horarios de disponibilidad por rango horario, por día y por semana
 * 3. Modificar y cancelar horarios
 * 4. Validar persistencia en dashboard de usuario IT
 */

test.describe('Mentor - Gestión de Disponibilidad y Validación IT', () => {
  const mentorEmail = 'mentor@test.com'
  const mentorPassword = 'testpassword'
  const itEmail = 'usuario@test.com'
  const itPassword = 'testpassword'

  test('debe gestionar disponibilidad y reflejarse en dashboard IT', async ({ page, context, browser }) => {
    // Paso 1: Login mentor
    await page.goto('/mentor/auth/login')
    await expect(page).toHaveURL(/\/mentor\/auth\/login$/)
    // Diagnóstico: captura errores de consola y screenshot antes de esperar el input
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.screenshot({ path: 'diagnostic-mentor-availability-login.png', fullPage: true });
    const emailInput = page.locator('input[name="email"]');
    const isVisible = await emailInput.isVisible();
    console.log('¿Input email visible?:', isVisible);
    if (!isVisible) {
      console.log('Errores de consola:', consoleErrors);
    }
    await expect(emailInput).toBeVisible();
    await emailInput.fill(mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL(/\/mentor\/dashboard/)
    await expect(page.locator('text=/Bienvenido|Mentor|Panel/i')).toBeVisible()

    // Paso 2: Habilitar disponibilidad por rango horario
    await page.click('button:has-text("Agregar Disponibilidad")')
    await page.fill('input[name="start_time"]', '09:00')
    await page.fill('input[name="end_time"]', '11:00')
    await page.selectOption('select[name="day"]', 'Lunes')
    await page.click('button:has-text("Guardar")')
    await expect(page.locator('text=Lunes 09:00 - 11:00')).toBeVisible()

    // Habilitar disponibilidad por día completo
    await page.click('button:has-text("Agregar Disponibilidad")')
    await page.selectOption('select[name="day"]', 'Martes')
    await page.click('input[name="all_day"]')
    await page.click('button:has-text("Guardar")')
    await expect(page.locator('text=Martes Todo el día')).toBeVisible()

    // Habilitar disponibilidad por semana (ejemplo: todos los días 14:00-16:00)
    for (const day of ['Lunes','Martes','Miércoles','Jueves','Viernes']) {
      await page.click('button:has-text("Agregar Disponibilidad")')
      await page.fill('input[name="start_time"]', '14:00')
      await page.fill('input[name="end_time"]', '16:00')
      await page.selectOption('select[name="day"]', day)
      await page.click('button:has-text("Guardar")')
      await expect(page.locator(`text=${day} 14:00 - 16:00`)).toBeVisible()
    }

    // Paso 3: Modificar un horario
    await page.locator('tr:has-text("Lunes 09:00 - 11:00") button:has-text("Editar")').click()
    await page.fill('input[name="end_time"]', '12:00')
    await page.click('button:has-text("Guardar")')
    await expect(page.locator('text=Lunes 09:00 - 12:00')).toBeVisible()

    // Cancelar un horario
    await page.locator('tr:has-text("Martes Todo el día") button:has-text("Eliminar")').click()
    await page.click('button:has-text("Confirmar")')
    await expect(page.locator('text=Martes Todo el día')).not.toBeVisible()

    // Paso 4: Validar persistencia en dashboard IT
    const itPage = await browser.newPage()
    await itPage.goto('/auth/login')
    await itPage.fill('input[name="email"]', itEmail)
    await itPage.fill('input[name="password"]', itPassword)
    await itPage.click('button:has-text("Iniciar sesión")')
    await itPage.waitForURL(/\/dashboard|\/home|\/panel/)
    await itPage.goto('/mentors')
    await expect(itPage.locator('text=Lunes 09:00 - 12:00')).toBeVisible()
    await expect(itPage.locator('text=Martes Todo el día')).not.toBeVisible()
    for (const day of ['Lunes','Martes','Miércoles','Jueves','Viernes']) {
      await expect(itPage.locator(`text=${day} 14:00 - 16:00`)).toBeVisible()
    }
    await itPage.close()
  })
})
