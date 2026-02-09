# 🧪 Testing Documentation - SkillsForIT

## 📋 Overview

Suite completa de tests E2E con Playwright que valida el flujo crítico de negocio: **Upload CV → Cart → Checkout → Payment → Analysis**.

## Ejemplos de payload para email templates

```json
// mentoriaWelcome
{
  "to": "test@mailtrap.io",
  "password": "demo123",
  "dashboardUrl": "https://skillsforit.vercel.app/dashboard"
}
// productDelivery
{
  "to": "test@mailtrap.io",
  "productName": "Curso React",
  "downloadUrl": "https://skillsforit.vercel.app/ebook/soft-skills-guide"
}
// cvAnalysisConfirmation
{
  "to": "test@mailtrap.io",
  "analysisId": "A12345"
}
// cvAnalysisResult
{
  "to": "test@mailtrap.io",
  "analysisId": "A12345",
  "resultUrl": "https://skillsforit.vercel.app/cv-audit/result"
}
// mentorshipSessionConfirmation
{
  "to": "test@mailtrap.io",
  "mentorName": "Ana Mentor",
  "sessionDate": "2026-01-21 18:00",
  "sessionUrl": "https://skillsforit.vercel.app/session",
  "userName": "Carlos"
}
// cartRecovery
{
  "to": "test@mailtrap.io",
  "recoveryUrl": "https://skillsforit.vercel.app/cart",
  "productName": "Curso React"
}
// sessionReminder
{
  "to": "test@mailtrap.io",
  "mentorName": "Ana Mentor",
  "sessionDate": "2026-01-22 10:00",
  "sessionUrl": "https://skillsforit.vercel.app/session",
  "userName": "Carlos"
}
// upsellOffer
{
  "to": "test@mailtrap.io",
  "userName": "Carlos",
  "productName": "Mentoría Premium",
  "discount": "20%",
  "offerUrl": "https://skillsforit.vercel.app/upsell"
}
// feedbackRequest
{
  "to": "test@mailtrap.io",
  "userName": "Carlos",
  "productName": "Curso React",
  "mentorName": "Ana Mentor",
  "feedbackUrl": "https://skillsforit.vercel.app/feedback"
}
```

Cada payload es enviado al endpoint `/api/email-templates/test` y validado en Mailtrap.

## Criterios de aceptación generales

- Todos los flujos críticos deben ejecutarse sin errores en ambiente de staging y producción.
- Los emails deben enviarse y recibirse correctamente (verificable en Mailtrap).
- Los pagos deben procesarse correctamente y reflejarse en la base de datos.
- Los dashboards deben mostrar la información esperada según el rol.
- Los archivos (PDF, E-book) deben generarse y entregarse al usuario.
- Los endpoints protegidos deben validar roles y autenticación.
- Los formularios deben validar datos y mostrar errores claros.
- El usuario debe poder iniciar y cerrar sesión correctamente.
- Los datos sensibles no deben filtrarse en respuestas de error.
- Los reportes de Playwright deben estar disponibles tras cada ejecución.

## Archivos de prueba Playwright

- email-templates.e2e.spec.ts
- e2e/user-reservations-positive-negative.spec.ts
- e2e/user-download-guide-skills.spec.ts
- e2e/user-download-guide-skills-email.spec.ts
- e2e/soft-skills-guide-payment-stripe-api.spec.ts
- e2e/soft-skills-guide-payment-flow.spec.ts
- e2e/mentoria-payment-stripe-validation.spec.ts
- e2e/mentoria-payment-stripe-api.spec.ts
- e2e/mentoria-payment-stripe-api-full.spec.ts
- e2e/mentoria-payment-flow.spec.ts
- e2e/mentor-availability-crud.spec.ts
- e2e/login-logout-user.spec.ts
- e2e/login-logout-mentor.spec.ts
- e2e/login-logout-admin.spec.ts
- e2e/email-templates.e2e.spec.ts
- e2e/ebook-payment-stripe-api.spec.ts
- e2e/ebook-payment-flow.spec.ts
- e2e/cv-analysis-flow.spec.ts
- e2e/ceo-upload-download-guide-skills.spec.ts
- e2e/ceo-security.spec.ts
- e2e/ceo-crud-mentor-access.spec.ts
- e2e/ceo-crud-mentor-edit-delete.spec.ts
- e2e/api-validation.spec.ts

## Casos de prueba automatizados por módulo y flujo

### Email y Notificaciones
- **email-templates.e2e.spec.ts**
  - Criterios de aceptación:
    - Cada tipo de email se envía correctamente y llega a la bandeja de pruebas.
    - El endpoint responde con éxito (`success: true`).
  - Email templates cubiertos:
    - mentoriaWelcome
    - productDelivery
    - cvAnalysisConfirmation
    - cvAnalysisResult
    - mentorshipSessionConfirmation
    - cartRecovery
    - sessionReminder
    - upsellOffer
    - feedbackRequest

### CV Audit
- **cv-analysis-flow.spec.ts**
  - Criterios de aceptación:
    - El usuario puede subir un CV válido y completar el flujo de compra.
    - El PDF generado contiene observaciones técnicas y score.
    - El E-book se entrega si fue adquirido.
    - Los errores de formulario se muestran correctamente.

### Mentoría
- **mentoria-payment-flow.spec.ts**
  - Criterios de aceptación:
    - El usuario puede reservar y pagar una sesión de mentoría.
    - La sesión queda agendada y el usuario recibe confirmación.
    - Los pagos fallidos muestran mensajes claros.
- **mentoria-payment-stripe-api.spec.ts / mentoria-payment-stripe-api-full.spec.ts / mentoria-payment-stripe-validation.spec.ts**
  - Criterios de aceptación:
    - Stripe procesa el pago y el backend lo registra.
    - Los flujos de error y validación funcionan correctamente.

### Soft Skills Guide
- **soft-skills-guide-payment-flow.spec.ts / soft-skills-guide-payment-stripe-api.spec.ts**
  - Criterios de aceptación:
    - El usuario puede comprar y descargar el Soft Skills Guide.
    - El pago se procesa y se valida en backend.

### Ebook
- **ebook-payment-flow.spec.ts / ebook-payment-stripe-api.spec.ts**
  - Criterios de aceptación:
    - El usuario puede comprar y descargar el E-book.
    - El pago se procesa y se valida en backend.

### Usuario IT
- **user-reservations-positive-negative.spec.ts**
  - Criterios de aceptación:
    - El usuario puede reservar, modificar y cancelar sesiones según su plan.
    - No puede reservar fuera de condiciones o en horarios no disponibles.
- **user-download-guide-skills.spec.ts / user-download-guide-skills-email.spec.ts**
  - Criterios de aceptación:
    - El usuario puede descargar el PDF desde el dashboard o vía email.

### CEO Dashboard
- **ceo-upload-download-guide-skills.spec.ts**
  - Criterios de aceptación:
    - El CEO puede subir, descargar y reemplazar el PDF Guide Skills.
- **ceo-security.spec.ts**
  - Criterios de aceptación:
    - Solo el CEO puede acceder a endpoints y dashboard protegidos.
    - Los datos sensibles están protegidos y no se filtran.
- **ceo-crud-mentor-access.spec.ts / ceo-crud-mentor-edit-delete.spec.ts**
  - Criterios de aceptación:
    - El CEO puede crear, editar, eliminar y validar acceso de mentores.

### Login y Seguridad
- **login-logout-user.spec.ts / login-logout-mentor.spec.ts / login-logout-admin.spec.ts**
  - Criterios de aceptación:
    - Cada tipo de usuario puede iniciar y cerrar sesión correctamente.
    - Los accesos están protegidos según el rol.

### API y Backend
- **api-validation.spec.ts**
  - Criterios de aceptación:
    - Los endpoints validan datos, roles y errores correctamente.
    - Los eventos y segmentaciones se registran y responden como se espera.

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
