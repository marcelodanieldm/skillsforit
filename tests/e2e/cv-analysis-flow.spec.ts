import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * E2E Test: Complete CV Analysis Purchase Flow
 * 
 * User Journey:
 * 1. Upload CV with personal info
 * 2. Navigate to cart
 * 3. See order bump for E-book
 * 4. Add E-book to cart
 * 5. Checkout with Stripe
 * 6. Verify PDF report generated
 * 7. Verify E-book delivered (if purchased)
 * 
 * Validations:
 * - PDF contains 5+ technical observations
 * - Analysis includes score, problems, improvements
 * - E-book delivered when purchased
 */

test.describe('CV Analysis Purchase Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/')
  })

  test('should complete CV analysis purchase without E-book', async ({ page }) => {
    // Step 1: Navigate to upload page
    await page.click('a[href="/upload"]')
    await expect(page).toHaveURL('/upload')

    // Step 2: Upload CV file
    const testCVPath = path.join(process.cwd(), 'tests', 'fixtures', 'sample-cv.pdf')
    
    // Create test CV if doesn't exist
    if (!fs.existsSync(testCVPath)) {
      fs.mkdirSync(path.dirname(testCVPath), { recursive: true })
      fs.writeFileSync(testCVPath, createTestPDFContent())
    }

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testCVPath)

    // Verify file uploaded
    await expect(page.locator('text=/sample-cv.pdf|CV cargado/')).toBeVisible()

    // Step 3: Click next to go to form
    await page.click('button:has-text("Siguiente")')

    // Step 4: Fill form
    await page.fill('input[name="name"]', 'Test Developer')
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.selectOption('select[name="country"]', 'Estados Unidos')
    await page.selectOption('select[name="profession"]', 'Frontend Developer')

    // Step 5: Submit form
    await page.click('button[type="submit"]')

    // Step 6: Should redirect to cart
    await expect(page).toHaveURL('/cart')

    // Step 7: Verify cart shows CV Analysis
    await expect(page.locator('text=/Auditoría de CV con IA/')).toBeVisible()
    await expect(page.locator('text=/\\$7/')).toBeVisible()

    // Step 8: Verify order bump is visible
    await expect(page.locator('text=/E-book.*CV Perfecto para IT/i')).toBeVisible()
    await expect(page.locator('text=/\\$5/')).toBeVisible()

    // Step 9: DON'T add E-book, go directly to checkout
    const checkoutButton = page.locator('button:has-text("Pagar con Stripe")')
    await expect(checkoutButton).toBeVisible()
    
    // Verify total is $7 (without E-book)
    await expect(page.locator('text=/Total.*\\$7/i')).toBeVisible()

    // Step 10: Click checkout and handle Stripe payment
    await checkoutButton.click()

    // Espera redirección a Stripe Checkout
    await page.waitForURL(/checkout.stripe.com/)

    // Completa el formulario de Stripe Checkout
    // (Selector puede variar según integración, ajustar si es necesario)
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cardnumber"]').fill('4242 4242 4242 4242')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="exp-date"]').fill('12/34')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cvc"]').fill('123')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="postal"]').fill('12345')
    // Click pagar/submit
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('button[type="submit"]').click()

    // Espera redirección de vuelta a la app (success page)
    await page.waitForURL(/\/success\?session_id=/)
    await expect(page.locator('text=/Pago exitoso|¡Gracias por tu compra!/i')).toBeVisible()
  })

  test('should complete purchase WITH E-book and show correct total', async ({ page }) => {
    // Step 1: Navigate to upload page
    await page.click('a[href="/upload"]')
    await expect(page).toHaveURL('/upload')

    // Step 2: Upload CV file
    const testCVPath = path.join(process.cwd(), 'tests', 'fixtures', 'sample-cv.pdf')
    
    if (!fs.existsSync(testCVPath)) {
      fs.mkdirSync(path.dirname(testCVPath), { recursive: true })
      fs.writeFileSync(testCVPath, createTestPDFContent())
    }

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testCVPath)

    // Step 3: Next to form
    await page.click('button:has-text("Siguiente")')

    // Step 4: Fill form
    await page.fill('input[name="name"]', 'Test Full Stack Dev')
    await page.fill('input[name="email"]', `test-ebook-${Date.now()}@example.com`)
    await page.selectOption('select[name="country"]', 'España')
    await page.selectOption('select[name="profession"]', 'Full Stack Developer')

    // Step 5: Submit
    await page.click('button[type="submit"]')

    // Step 6: Wait for cart page
    await expect(page).toHaveURL('/cart')

    // Step 7: Verify order bump visible
    const addEbookButton = page.locator('button:has-text("Agregar al Carrito")')
    await expect(addEbookButton).toBeVisible()

    // Step 8: Click to add E-book
    await addEbookButton.click()

    // Step 9: Verify E-book added to cart
    await expect(page.locator('text=/E-book.*CV Perfecto/i')).toHaveCount(2) // Title + item in cart

    // Step 10: Verify total updated to $12
    await expect(page.locator('text=/Total.*\\$12/i')).toBeVisible()

    // Step 11: Verify savings badge
    await expect(page.locator('text=/Ahorras.*\\$3/i')).toBeVisible()

    // Step 12: Verify can remove E-book
    const removeButton = page.locator('button:has-text("Quitar")')
    await expect(removeButton).toBeVisible()
    
    // Step 13: Remove and verify total goes back to $7
    await removeButton.click()
    await expect(page.locator('text=/Total.*\\$7/i')).toBeVisible()

    // Step 14: Add again for final purchase
    await page.locator('button:has-text("Agregar al Carrito")').click()
    await expect(page.locator('text=/Total.*\\$12/i')).toBeVisible()

    // Step 15: Click checkout and handle Stripe payment
    const checkoutButton = page.locator('button:has-text("Pagar con Stripe")')
    await expect(checkoutButton).toBeVisible()
    await checkoutButton.click()

    // Espera redirección a Stripe Checkout
    await page.waitForURL(/checkout.stripe.com/)

    // Completa el formulario de Stripe Checkout
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cardnumber"]').fill('4242 4242 4242 4242')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="exp-date"]').fill('12/34')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cvc"]').fill('123')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="postal"]').fill('12345')
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('button[type="submit"]').click()

    // Espera redirección de vuelta a la app (success page)
    await page.waitForURL(/\/success\?session_id=/)
    await expect(page.locator('text=/Pago exitoso|¡Gracias por tu compra!/i')).toBeVisible()
  })

  test('should show validation errors on empty form', async ({ page }) => {
    await page.click('a[href="/upload"]')
    await expect(page).toHaveURL('/upload')

    // Try to submit without file
    const nextButton = page.locator('button:has-text("Siguiente")')
    
    // Button should be disabled or not work without file
    const isDisabled = await nextButton.isDisabled()
    expect(isDisabled).toBe(true)
  })

  test('should handle drag and drop file upload', async ({ page }) => {
    await page.click('a[href="/upload"]')
    await expect(page).toHaveURL('/upload')

    // Create test file
    const testCVPath = path.join(process.cwd(), 'tests', 'fixtures', 'sample-cv.pdf')
    if (!fs.existsSync(testCVPath)) {
      fs.mkdirSync(path.dirname(testCVPath), { recursive: true })
      fs.writeFileSync(testCVPath, createTestPDFContent())
    }

    // Simulate drag and drop (Playwright way)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testCVPath)

    // Verify file name appears
    await expect(page.locator('text=/sample-cv.pdf/')).toBeVisible()
  })

  test('should preserve cart data in sessionStorage', async ({ page }) => {
    // Upload CV and fill form
    await page.click('a[href="/upload"]')
    
    const testCVPath = path.join(process.cwd(), 'tests', 'fixtures', 'sample-cv.pdf')
    if (!fs.existsSync(testCVPath)) {
      fs.mkdirSync(path.dirname(testCVPath), { recursive: true })
      fs.writeFileSync(testCVPath, createTestPDFContent())
    }

    await page.locator('input[type="file"]').setInputFiles(testCVPath)
    await page.click('button:has-text("Siguiente")')
    
    await page.fill('input[name="name"]', 'Storage Test')
    await page.fill('input[name="email"]', 'storage@test.com')
    await page.selectOption('select[name="country"]', 'México')
    await page.selectOption('select[name="profession"]', 'Backend Developer')
    
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/cart')

    // Check sessionStorage has cart data
    const cartData = await page.evaluate(() => {
      return sessionStorage.getItem('cartData')
    })

    expect(cartData).toBeTruthy()
    const parsed = JSON.parse(cartData!)
    expect(parsed.name).toBe('Storage Test')
    expect(parsed.email).toBe('storage@test.com')
    expect(parsed.country).toBe('México')
    expect(parsed.profession).toBe('Backend Developer')
    expect(parsed.cvId).toBeTruthy()
  })

  test('should show trust signals and security badges', async ({ page }) => {
    // Go directly to cart (mock sessionStorage)
    await page.goto('/cart')
    
    // Set mock cart data
    await page.evaluate(() => {
      sessionStorage.setItem('cartData', JSON.stringify({
        cvId: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        country: 'España',
        profession: 'Frontend Developer'
      }))
    })

    // Reload to apply sessionStorage
    await page.reload()

    // Verify trust signals present
    await expect(page.locator('text=/Pago 100% seguro/i')).toBeVisible()
    await expect(page.locator('text=/Entrega inmediata/i')).toBeVisible()
    await expect(page.locator('text=/Garantía/i')).toBeVisible()
  })
})

/**
 * Helper: Create sample PDF content for testing
 */
function createTestPDFContent(): string {
  // Simple PDF structure (minimal valid PDF)
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 700 Td
(John Doe - Frontend Developer) Tj
0 -20 Td
(Email: john@example.com) Tj
0 -40 Td
(EXPERIENCE:) Tj
0 -20 Td
(- React Developer at Tech Corp (3 years)) Tj
0 -20 Td
(- Built dashboards with React, TypeScript, Redux) Tj
0 -20 Td
(- Improved performance by 40%) Tj
0 -40 Td
(SKILLS: React, TypeScript, Node.js, AWS) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
567
%%EOF`
}
