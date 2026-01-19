import { test, expect } from '@playwright/test'

test.describe('CEO Dashboard - Security Tests', () => {
  let userToken: string
  let ceoToken: string

  test.beforeAll(async ({ request }) => {
    // Login as regular user
    const userLogin = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'user@example.com',
        password: 'user123'
      }
    })
    
    expect(userLogin.ok()).toBeTruthy()
    const userData = await userLogin.json()
    userToken = userData.token
    
    // Login as CEO
    const ceoLogin = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'ceo@skillsforit.com',
        password: 'ceo123'
      }
    })
    
    expect(ceoLogin.ok()).toBeTruthy()
    const ceoData = await ceoLogin.json()
    ceoToken = ceoData.token
  })

  test('Usuario IT no puede acceder al endpoint de LTV', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/ceo/ltv', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })

    // Should return 403 Forbidden
    expect(response.status()).toBe(403)
    
    const data = await response.json()
    expect(data.error).toContain('Sesión no encontrada')
  })

  test('Usuario IT no puede acceder al endpoint de Projections', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/ceo/projections', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })

    // Should return 403 Forbidden
    expect(response.status()).toBe(403)
    
    const data = await response.json()
    expect(data.error).toContain('Sesión no encontrada')
  })

  test('Usuario sin token no puede acceder a endpoints CEO', async ({ request }) => {
    // Test LTV without token
    const ltvResponse = await request.get('http://localhost:3000/api/ceo/ltv')
    expect(ltvResponse.status()).toBe(403)

    // Test Projections without token
    const projectionsResponse = await request.get('http://localhost:3000/api/ceo/projections')
    expect(projectionsResponse.status()).toBe(403)
  })

  test('CEO puede acceder al endpoint de LTV', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/ceo/ltv?period=180', {
      headers: {
        'Authorization': `Bearer ${ceoToken}`
      }
    })

    // Should return 200 OK
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBeTruthy()
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBeTruthy()
    
    // Validate data structure
    if (data.data.length > 0) {
      const firstSegment = data.data[0]
      expect(firstSegment).toHaveProperty('segment')
      expect(firstSegment).toHaveProperty('ltv')
      expect(firstSegment).toHaveProperty('churnRate')
      expect(firstSegment).toHaveProperty('totalUsers')
    }
  })

  test('CEO puede acceder al endpoint de Projections', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/ceo/projections', {
      headers: {
        'Authorization': `Bearer ${ceoToken}`
      }
    })

    // Should return 200 OK
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBeTruthy()
    expect(data.data).toBeDefined()
    expect(data.data).toHaveProperty('historical')
    expect(data.data).toHaveProperty('future')
    expect(data.data).toHaveProperty('assumptions')
    
    // Validate projections structure
    expect(Array.isArray(data.data.historical)).toBeTruthy()
    expect(Array.isArray(data.data.future)).toBeTruthy()
    expect(data.data.assumptions).toHaveProperty('realistic')
    expect(data.data.assumptions).toHaveProperty('optimistic')
  })

  test('Token expirado no permite acceso', async ({ request }) => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token'
    
    const response = await request.get('http://localhost:3000/api/ceo/ltv', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    })

    expect(response.status()).toBe(403)
  })

  test('Usuario IT no puede acceder visualmente al dashboard CEO', async ({ page }) => {
    // Login as regular user
    await page.goto('http://localhost:3000/ceo/login')
    
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'user123')
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('text=/Solo usuarios con rol CEO/', { timeout: 5000 })
    
    // Should not redirect to dashboard
    expect(page.url()).toContain('/ceo/login')
  })

  test('CEO puede acceder visualmente al dashboard', async ({ page }) => {
    // Login as CEO
    await page.goto('http://localhost:3000/ceo/login')
    
    await page.fill('input[type="email"]', 'ceo@skillsforit.com')
    await page.fill('input[type="password"]', 'ceo123')
    await page.click('button[type="submit"]')

    // Wait for dashboard to load
    await page.waitForURL('**/ceo/dashboard', { timeout: 10000 })
    
    // Verify dashboard elements
    await expect(page.locator('text=Dashboard Ejecutivo')).toBeVisible()
    await expect(page.locator('text=Proyecciones de Ingresos')).toBeVisible()
    await expect(page.locator('text=LTV por Segmento')).toBeVisible()
    await expect(page.locator('text=Embudo de Conversión')).toBeVisible()
  })

  test('Datos sensibles no se filtran en respuestas de error', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/ceo/ltv', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })

    const data = await response.json()
    
    // Error message should not contain sensitive data
    expect(data).not.toHaveProperty('data')
    expect(data).not.toHaveProperty('ltv')
    expect(data).not.toHaveProperty('revenue')
    
    // Should only contain error message
    expect(data).toHaveProperty('error')
  })

  test('Multiples intentos de acceso no autorizado no escalan privilegios', async ({ request }) => {
    // Try 5 times to access with user token
    for (let i = 0; i < 5; i++) {
      const response = await request.get('http://localhost:3000/api/ceo/ltv', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })
      
      expect(response.status()).toBe(403)
    }
    
    // Verify user still cannot access after multiple attempts
    const finalAttempt = await request.get('http://localhost:3000/api/ceo/ltv', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })
    
    expect(finalAttempt.status()).toBe(403)
  })
})
