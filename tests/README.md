# 🧪 Testing Documentation - SkillsForIT

## 📋 Overview

Suite completa de tests E2E con Playwright que valida el flujo crítico de negocio: **Upload CV → Cart → Checkout → Payment → Analysis**.

## 🚀 Quick Start

### Instalar Dependencias
```bash
npm install
npx playwright install chromium
```

### Ejecutar Tests
```bash
# Todos los tests (headless)
npm test

# Con interfaz gráfica interactiva
npm run test:ui

# Ver ejecución en navegador
npm run test:headed

# Modo debug (paso a paso)
npm run test:debug

# Ver último reporte HTML
npm run test:report
```

## 📁 Estructura de Tests

```
tests/
├── e2e/
│   ├── cv-analysis-flow.spec.ts     # Flujo completo de usuario
│   └── api-validation.spec.ts       # Validación de API endpoints
└── fixtures/
    └── sample-cv.pdf                 # CV de prueba (auto-generado)
```

## 🎯 Test Coverage

### 1. **CV Analysis Flow** (`cv-analysis-flow.spec.ts`)

#### Test Cases:

**✅ Complete purchase WITHOUT E-book**
- Upload CV válido (PDF/Word)
- Completar formulario con datos personales
- Navegar a cart
- Verificar order bump visible
- NO agregar E-book
- Confirmar total = $7

**✅ Complete purchase WITH E-book**
- Upload CV
- Completar formulario
- Agregar E-book con 1 click
- Verificar total = $12
- Verificar badge de ahorro ($3)
- Poder quitar E-book
- Total vuelve a $7
- Re-agregar E-book

**✅ Validation Errors**
- Intentar submit sin archivo
- Botón "Siguiente" deshabilitado
- Mensaje de error claro

**✅ Drag & Drop Upload**
- Arrastrar archivo PDF al dropzone
- Verificar nombre de archivo aparece
- Continuar con flujo normal

**✅ SessionStorage Persistence**
- Datos de cart guardados en sessionStorage
- Incluye: cvId, name, email, country, profession
- Persiste al navegar entre páginas

**✅ Trust Signals & Security**
- Badges de "Pago 100% seguro"
- "Entrega inmediata"
- "Garantía de satisfacción"
- Íconos de seguridad visibles

---

### 2. **API Validation** (`api-validation.spec.ts`)

#### Endpoints Tested:

**POST /api/upload**
- ✅ Rechazar tipos de archivo inválidos
- ✅ Validar tamaño máximo (5MB)
- ✅ Retornar `analysisId` en respuesta

**POST /api/checkout**
- ✅ Crear sesión de Stripe con datos válidos
- ✅ Incluir E-book como line item
- ✅ Metadata con `includeEbook` flag
- ✅ Validar campos requeridos

**POST /api/events**
- ✅ Trackear `page_view` events
- ✅ Trackear `form_submission` events
- ✅ Trackear `checkout_started` events
- ✅ Metadata completa (device, referrer, profession)

**GET /api/events**
- ✅ Retornar funnel metrics
- ✅ Retornar segment distribution
- ✅ Conversión por etapa

**POST /api/users**
- ✅ Crear perfil con segmentación automática
- ✅ Segmento "Junior" (0-3 años)
- ✅ Segmento "Transition" (3-7 años)
- ✅ Segmento "Leadership" (7+ años)

---

## 🔧 Configuración

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './tests/e2e',
  timeout: 60000,              // 60s por test
  fullyParallel: false,        // Sequential (DB consistency)
  retries: 2,                  // En CI
  workers: 1,                  // Single worker
  reporter: ['html', 'list'],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000
  }
}
```

---

## 📊 Expected Results

### Success Criteria:

**Frontend Tests:**
- ✅ Upload funciona con drag & drop
- ✅ Form validation en acción
- ✅ Cart muestra items correctamente
- ✅ Order bump interactivo
- ✅ Total dinámico se actualiza
- ✅ SessionStorage funcional

**API Tests:**
- ✅ Todos los endpoints responden 200/201
- ✅ Validación de datos funciona
- ✅ Segmentación automática correcta
- ✅ Event tracking operativo

**Business Logic:**
- ✅ CV Analysis: $7
- ✅ E-book: $5 (down from $8)
- ✅ Bundle: $12 total
- ✅ Savings: $3 shown
- ✅ Metadata preservada en checkout

---

## 🐛 Debugging

### Ver Tests en UI Mode:
```bash
npm run test:ui
```
- Interfaz interactiva
- Ver cada paso
- Time travel debugging
- DOM inspector

### Debug Mode (Breakpoints):
```bash
npm run test:debug
```
- Pausa en cada `await`
- Ejecutar comandos manualmente
- Inspector de Playwright

### Ver Traces:
```bash
npx playwright show-trace trace.zip
```
- Timeline completo
- Network requests
- Screenshots
- Console logs

---

## 📸 Screenshots & Videos

### Configuración Actual:
- **Screenshots**: Solo en fallas
- **Videos**: Retain on failure
- **Traces**: First retry

### Ubicación:
```
test-results/
├── cv-analysis-flow-complete-purchase-with-e-book/
│   ├── video.webm
│   ├── trace.zip
│   └── screenshot.png
└── api-validation-checkout-session/
    └── trace.zip
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        run: npm test
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Sprint 6 Validation Requirements

### ✅ User Story: QA Automation
> "Como QA Automation, quiero ejecutar un test de extremo a extremo (E2E) que simule una compra exitosa y verifique que el PDF generado contenga al menos 5 observaciones técnicas"

### Implementado:

1. **Complete Purchase Flow**
   - ✅ Upload CV
   - ✅ Fill form
   - ✅ Add E-book
   - ✅ Checkout

2. **PDF Validation** (Fase 2 - requiere mock de Stripe)
   - [ ] Simular pago exitoso con Stripe test card
   - [ ] Esperar webhook processing
   - [ ] Descargar PDF generado
   - [ ] Parse PDF content
   - [ ] Verificar 5+ observaciones técnicas
   - [ ] Verificar score presente
   - [ ] Verificar 10+ problems
   - [ ] Verificar 15+ improvements

3. **E-book Delivery** (Fase 2)
   - [ ] Mock email service
   - [ ] Verificar E-book adjunto cuando purchased
   - [ ] Verificar NO adjunto cuando not purchased

---

## 🚦 Test Status

### ✅ Fase 1 - Completada:
- Cart UI interactions
- Order bump functionality
- API endpoint validation
- User segmentation
- Event tracking
- Form validation

### 🔄 Fase 2 - Pending:
- Stripe payment simulation (test cards)
- Webhook processing validation
- PDF content parsing
- Email delivery verification
- AI analysis output validation

---

## 📝 Running Individual Tests

```bash
# Single test file
npx playwright test cv-analysis-flow.spec.ts

# Single test case
npx playwright test -g "should complete purchase WITH E-book"

# Specific browser
npx playwright test --project=chromium

# Watch mode (re-run on changes)
npx playwright test --watch
```

---

## 💡 Best Practices

1. **Always use test fixtures**
   - Sample CV auto-generated
   - Consistent test data
   - No external dependencies

2. **Unique identifiers per test**
   ```typescript
   email: `test-${Date.now()}@example.com`
   ```

3. **Wait for navigation**
   ```typescript
   await expect(page).toHaveURL('/cart')
   ```

4. **Explicit assertions**
   ```typescript
   await expect(page.locator('text=/Total.*\\$12/i')).toBeVisible()
   ```

5. **Clean up sessionStorage**
   ```typescript
   await page.evaluate(() => sessionStorage.clear())
   ```

---

## 🔗 Related Documentation

- [Playwright Docs](https://playwright.dev)
- [SPRINT6.md](../SPRINT6.md) - Feature specifications
- [SPRINT5.md](../SPRINT5.md) - Analytics implementation
- [SETUP.md](../SETUP.md) - Project setup

---

**Last Updated**: Sprint 6 - Enero 10, 2026  
**Test Framework**: Playwright v1.57.0  
**Coverage**: Frontend UI + API Endpoints  
**Status**: ✅ Fase 1 Complete | 🔄 Fase 2 Pending
