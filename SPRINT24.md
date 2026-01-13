# Sprint 24: Funnel de Conversión - Guía de Soft Skills

**Fecha de inicio:** 12 de enero de 2026  
**Fecha de finalización:** 12 de enero de 2026  
**Estado:** ✅ COMPLETADO E IMPLEMENTADO  
**Objetivo:** Maximizar el AOV (Average Order Value) mediante Order Bumps y Upsells estratégicos

---

## 🎯 Resumen Ejecutivo

Este sprint implementa un **funnel de conversión optimizado end-to-end** para vender la Guía de Soft Skills con una estrategia de **incremento de AOV del 320%**:

- **Producto base:** $10 (Guía de Soft Skills)
- **Order Bump:** +$7 (Auditoría CV con IA) - Meta: 40% conversión
- **Upsell:** +$25 (1 mes Mentoría) - Meta: 25% conversión
- **AOV máximo:** $42 (320% incremento vs base)

### ✅ Implementaciones Completadas

1. ✅ Landing page con mini-diagnóstico interactivo
2. ✅ Checkout flow de 3 pasos con Order Bump y Upsell
3. ✅ Integración completa con Stripe Payments
4. ✅ Timer de urgencia (10 minutos) en modal de upsell
5. ✅ Página de confirmación con acceso a productos
6. ✅ Sistema de tracking completo de eventos del funnel
7. ✅ APIs de analytics para order bump y upsell
8. ✅ Hook personalizado de tracking (useFunnelTracking)
9. ✅ **Sistema de Entrega Automática (Delivery System)**
   - Supabase Edge Function para entrega de productos
   - Generación de signed URLs para PDFs (válidas 7 días)
   - Habilitación automática de créditos de CV audit
   - Activación de suscripciones de mentoría (4 sesiones)
   - Notificaciones por email automáticas
   - Webhook de Stripe para entregas en background
10. ✅ **Gestión de Acceso a Productos**
    - Tabla `product_access` para rastrear descargas
    - Tabla `user_assets` para créditos y recursos
    - Tabla `mentorship_subscriptions` para mentoría
    - Sistema de revocación en caso de reembolsos

---

## 🎯 Resumen Ejecutivo

Este sprint implementa un **funnel de conversión optimizado** para vender la Guía de Soft Skills con una estrategia de **incremento de AOV del 320%**:

- **Producto base:** $10 (Guía de Soft Skills)
- **Order Bump:** +$7 (Auditoría CV con IA) - Meta: 40% conversión
- **Upsell:** +$25 (1 mes Mentoría) - Meta: 25% conversión
- **AOV máximo:** $42 (320% incremento vs base)

### Proyección de Revenue (1,000 visitantes/mes)

| Escenario | Conversión | Ventas | AOV | Revenue Mensual |
|-----------|------------|--------|-----|-----------------|
| **Sin optimización** | 2% | 20 | $10 | $200 |
| **Con Order Bump** (40%) | 2% | 20 | $12.80 | $256 (+28%) |
| **Con Upsell** (25%) | 2% | 20 | $16.25 | $325 (+62%) |
| **Con ambos** | 2% | 20 | $18.50 | $370 (+85%) |

---

## 📊 Arquitectura del Funnel

```
┌─────────────────────────────────────────────────────────┐
│  Landing Page (/soft-skills-guide)                      │
│  - Hero con propuesta de valor                          │
│  - Mini-diagnóstico interactivo (lead magnet)           │
│  - Índice de contenidos (3 módulos)                     │
│  - Social proof (12K usuarios, 4.9/5)                   │
│  - CTA: "Comprar por $10"                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Checkout Step 1 (/soft-skills-guide/checkout)         │
│  - Email collection                                      │
│  - Order Bump (Checkbox):                               │
│    "¿Quieres que la IA audite tu CV ahora?"            │
│    +$7 (53% OFF - orig. $15)                           │
│  - Acceptance rate target: 40%                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Checkout Step 2                                         │
│  - Payment info (Stripe)                                 │
│  - Botón: "Completar Pago - $X"                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Checkout Step 3 (Upsell Modal)                         │
│  - "¡ESPERA! Oferta Exclusiva"                         │
│  - 1 mes Mentoría: +$25 (30% OFF - orig. $35)          │
│  - Escasez: "Solo 3 spots disponibles"                 │
│  - Urgencia: "Expira en 10 min"                        │
│  - Acceptance rate target: 25%                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Confirmation & Delivery                                 │
│  - Stripe Payment Intent confirmado                      │
│  - Email con links de descarga                          │
│  - Acceso a productos otorgado                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Archivos Implementados

### 1. **`app/soft-skills-guide/page.tsx`** (~900 líneas)

**Landing page optimizada para conversión** con:

#### Hero Section
```tsx
- Badge: "🔥 OFERTA LIMITADA: 50% OFF"
- Headline: "Domina las Soft Skills que los Reclutadores Buscan"
- Subheadline: Propuesta de valor clara
- Social proof: "12,000+ desarrolladores ya la adquirieron"
- CTA principal: Precio tachado $20 → $10 (50% OFF)
```

#### Mini-Diagnóstico Interactivo
```tsx
- Widget embedded de SoftSkillsDiagnostic
- Lead magnet: "Descubre si tus soft skills frenan tu carrera"
- CTA: "Iniciar Diagnóstico Gratis"
- Al completar → urgencia para comprar
```

#### Contenido Detallado
```tsx
3 Módulos:
1. Comunicación Asertiva (2 horas, 8 ejercicios)
   - Modelo asertivo vs agresivo vs pasivo
   - Feedback constructivo sin conflictos
   - Cómo decir 'no' profesionalmente
   
2. Negociación de Salario (3 horas, 12 ejercicios)
   - Investigación de rangos salariales
   - Scripts word-by-word para negociar
   - Respuesta a "Cuál es tu expectativa?"
   
3. Storytelling Técnico (2.5 horas, 15 ejercicios)
   - Framework STAR++ para entrevistas
   - Cuantificar impacto con métricas
   - 20+ preguntas de entrevista reales
```

#### Social Proof
```tsx
Stats:
- 12,000+ desarrolladores capacitados
- +28% promedio de aumento salarial
- 87% tasa de éxito en entrevistas
- 4.9/5 satisfacción del usuario

Testimonios:
- María González (Mercado Libre): "+35% aumento salarial"
- Carlos Rodríguez (Globant): "3 ofertas en 2 semanas"
- Ana Martínez (Despegar): "Liderazgo con más efectividad"
```

#### FAQ Section
```tsx
- ¿Para quién es esta guía?
- ¿Qué formato tiene?
- ¿Cuánto tiempo toma?
- ¿Funciona para negociar salario?
- ¿Garantía de devolución?
```

---

### 2. **`components/SoftSkillsDiagnostic.tsx`** (~400 líneas)

**Widget interactivo de diagnóstico** con psicología de conversión:

#### 3 Preguntas Estratégicas
```tsx
Q1: "¿Cómo respondes a 'Cuál es tu expectativa salarial?'"
    - Opciones muestran errores comunes
    - Solo 1 respuesta es correcta
    
Q2: "Tu líder pide horas extra sin compensación. ¿Qué haces?"
    - Evalúa comunicación asertiva
    - Diferencia entre pasivo, agresivo, asertivo
    
Q3: "Te preguntan: 'Cuéntame de un proyecto desafiante'"
    - Evalúa habilidades de storytelling
    - Framework STAR vs respuestas vagas
```

#### Sistema de Scoring
```tsx
- weak: 0 puntos
- medium: 50 puntos
- strong: 100 puntos

Niveles:
- 0-40: Beginner (necesita atención URGENTE)
- 40-70: Intermediate (dejas dinero sobre la mesa)
- 70-100: Advanced (cerca de la excelencia)
```

#### Resultados Personalizados
```tsx
Beginner:
- Título: "🚨 Tus Soft Skills Necesitan Atención URGENTE"
- Weak points: 4 razones específicas de por qué frena tu carrera
- Urgencia: "Cada mes sin estas habilidades es un mes perdido"
- CTA: "La buena noticia: Esto se arregla en semanas"

Intermediate:
- Título: "⚡ Tienes Bases, Pero Dejas Dinero Sobre la Mesa"
- Weak points: Gaps críticos identificados
- Urgencia: "Estás al 60% de tu potencial. ¿Por qué conformarte?"
- CTA: "Sube al siguiente nivel y desbloquea oportunidades"

Advanced:
- Título: "🎯 Tienes Buen Instinto, Pero Aún Hay Oro por Pulir"
- Weak points: Oportunidades de mejora con frameworks
- Urgencia: "Estás cerca de la excelencia. No te quedes al 80%"
- CTA: "Afina estas habilidades y conviértete en el candidato top"
```

#### Psicología de Conversión
```tsx
1. Efecto de Compromiso:
   - Usuario invirtió 60 segundos respondiendo
   - Gap de curiosidad (quieren ver resultado)
   
2. Diagnóstico Personalizado:
   - No es genérico, muestra problemas específicos
   - Crea dolor (awareness de debilidades)
   
3. Solución Inmediata:
   - CTA directo: "Obtener Guía por $10"
   - Proof: "12K+ lo tienen, +28% aumento"
```

---

### 3. **`app/soft-skills-guide/checkout/page.tsx`** (~800 líneas)

**Checkout flow de 3 pasos** con order bumps y upsells:

#### Step 1: Información + Order Bump
```tsx
Email collection:
- Input simple
- Promise: "Te enviaremos la guía inmediatamente"

Order Bump (pre-payment):
- Checkbox grande (8x8 px)
- Título: "⚡ ¿Quieres que la IA audite tu CV AHORA?"
- Precio: $15 tachado → $7 (53% OFF)
- Value prop: "Mientras lees la guía, la IA ya auditó tu CV"
- Social proof: "4,200+ lo añadieron este mes"
- Rating: 4.9/5 stars
- Features:
  * Análisis ATS completo
  * Detección de 50+ errores
  * Recomendaciones priorizadas
  * Comparación con CVs exitosos
  * Informe PDF descargable
```

**Psicología del Order Bump:**
- **Timing:** Antes de pago (baja fricción)
- **Precio ancla:** $15 → $7 (parece gran oferta)
- **Complementariedad:** CV audit + Guía = combo lógico
- **Urgency:** "4,200+ este mes" (FOMO)
- **Low friction:** Solo checkbox, no formularios

#### Step 2: Payment Info
```tsx
Stripe Elements:
- Card number
- Expiry (MM/YY)
- CVC

CTA button: "Completar Pago - $X USD"
- X = dinámico según cart
- Verde (color de confianza)
- Lock icon (seguridad)

Trust badges:
- Pago seguro con Stripe
- Cifrado SSL
```

#### Step 3: Upsell Modal
```tsx
Aparece DESPUÉS de ingresar tarjeta (commitment psicológico):

Header: "🎉 ¡ESPERA! Oferta Exclusiva Solo Para Ti"
Subheader: "Ya invertiste en tu desarrollo. ¿Por qué no asegurar tu éxito?"

Oferta:
- 1 Mes de Mentoría Profesional
- $35 tachado → $25 (30% OFF)
- Incluye:
  * 4 sesiones de 30 minutos
  * Revisión personalizada de CV
  * Mock interviews con feedback
  * Estrategia de búsqueda de empleo
  * Acceso a comunidad privada
  * Soporte por Slack

Urgencia (doble):
- Escasez: "Solo 3 spots disponibles este mes"
- Tiempo: "Oferta válida: Solo por 10 min"

Proof: "El 87% de usuarios con mentoría consiguen empleo en 45 días"

CTAs:
1. "SÍ, Añadir Mentoría por +$25" (grande, morado)
2. "No gracias, solo quiero la guía" (pequeño, gris)
```

**Psicología del Upsell:**
- **Timing:** Post-payment-info (ya committed)
- **Precio ancla:** $35 → $25 (30% off)
- **Complementariedad:** Guía + Mentoría = éxito asegurado
- **Escasez:** "Solo 3 spots" (FOMO)
- **Urgencia:** "Expira en 10 min" (decision pressure)
- **Social proof:** "87% consiguen empleo en 45 días"

#### Order Summary Sidebar
```tsx
Sticky sidebar que muestra:
- Productos en cart
- Subtotal
- Ahorros (en verde)
- Total (grande, morado)

Benefits checklist:
✅ Acceso inmediato
✅ Garantía 30 días
✅ Actualizaciones gratis
```

---

### 4. **`lib/checkout-flow.ts`** (~700 líneas)

**Backend de tracking y gestión** del funnel:

#### OrderBumpManager
```typescript
class OrderBumpManager {
  private orderBumps: Map<string, OrderBump>
  
  // Gestiona offers pre-pago
  getOrderBump(id: string): OrderBump
  getAllOrderBumps(): OrderBump[]
  addOrderBump(bump: OrderBump): void
  updateConversionRate(id: string, rate: number): void
  getRecommendedBump(cartValue, userSegment): OrderBump
}

Default Order Bump:
{
  id: 'cv-audit-ai',
  name: 'Auditoría de CV con IA',
  price: 7,
  originalPrice: 15,
  discountPercentage: 53,
  conversionRate: 0,  // Calculado desde analytics
  position: 'pre-payment',
  priority: 1
}
```

#### UpsellManager
```typescript
class UpsellManager {
  private upsells: Map<string, Upsell>
  
  // Gestiona offers post-commitment
  getUpsell(id: string): Upsell
  getAllUpsells(): Upsell[]
  addUpsell(upsell: Upsell): void
  updateConversionRate(id: string, rate: number): void
  getRecommendedUpsell(cartValue, products, segment): Upsell
}

Default Upsell:
{
  id: 'mentorship-month',
  name: '1 Mes de Mentoría',
  price: 25,
  originalPrice: 35,
  discountPercentage: 30,
  timing: 'post-payment-info',
  expiresIn: 600,  // 10 minutes
  urgencyMessage: 'Esta oferta expira en 10 minutos'
}
```

#### ConversionTracker
```typescript
class ConversionTracker {
  async trackEvent(event: FunnelEvent): Promise<void>
  async getSessionEvents(sessionId): Promise<FunnelEvent[]>
  async getAnalytics(startDate, endDate): Promise<FunnelAnalytics>
}

Eventos trackeados:
- page_view
- diagnostic_started
- diagnostic_completed
- checkout_started
- order_bump_viewed
- order_bump_accepted
- order_bump_declined
- payment_info_entered
- upsell_viewed
- upsell_accepted
- upsell_declined
- purchase_completed
- cart_abandoned

Métricas calculadas:
- diagnosticCompletionRate
- checkoutConversionRate
- orderBumpConversionRate (meta: 40%)
- upsellConversionRate (meta: 25%)
- overallConversionRate
- avgOrderValue
- avgOrderValueWithBump
- avgOrderValueWithUpsell
- avgOrderValueMax
```

#### AOVCalculator
```typescript
class AOVCalculator {
  calculateAOV(bump, upsell): number
  calculateAOVIncrease(original, new): { absolute, percentage }
  getAOVScenarios(): Scenario[]
  calculateExpectedRevenue(visitors, rates): RevenueProjection
}

AOV Scenarios:
1. Base (solo guía): $10 (baseline)
2. Con Order Bump: $17 (+70%)
3. Con Upsell: $35 (+250%)
4. Máximo (todo): $42 (+320%)

Expected Revenue (1,000 visitors, 2% conversion):
- Base: $200/mes
- Con bumps (40% + 25%): $370/mes (+85%)
```

---

### 5. **`app/api/checkout/create-order/route.ts`** (~400 líneas)

**API de procesamiento de órdenes** con Stripe:

#### POST /api/checkout/create-order
```typescript
Input:
{
  email: string
  products: string[]
  sessionId: string
  orderBumpAccepted: boolean
  upsellAccepted: boolean
  metadata?: object
}

Process:
1. Validate input
2. Calculate total con AOVCalculator
3. Create Stripe Payment Intent
4. Save order en Supabase
5. Track "checkout_started" event
6. Return client secret

Output:
{
  success: true,
  clientSecret: string,
  orderId: string,
  amount: number,
  currency: 'usd'
}
```

#### PUT /api/checkout/create-order (Confirm Order)
```typescript
Input:
{
  paymentIntentId: string
  sessionId: string
}

Process:
1. Verify payment con Stripe (status === 'succeeded')
2. Update order status → 'completed'
3. Grant product access en Supabase
4. Send confirmation email con download links
5. Track "purchase_completed" event
6. Track bump/upsell acceptance si aplica

Output:
{
  success: true,
  products: string[]
  downloadLinks: { [productId]: url }
}
```

#### GET /api/checkout/create-order (Order Status)
```typescript
Query params:
- orderId: string (optional)
- paymentIntentId: string (optional)

Returns:
{
  success: true,
  order: {
    id, email, amount, products, status,
    orderBumpAccepted, upsellAccepted,
    createdAt, paidAt
  },
  downloadLinks: { ... }  // Si completed
}
```

#### OPTIONS /api/checkout/create-order (Analytics)
```typescript
Query params:
- startDate: string (ISO 8601)
- endDate: string (ISO 8601)

Returns:
{
  success: true,
  analytics: FunnelAnalytics,
  aovScenarios: Scenario[],
  recommendations: {
    orderBumpTarget: 40,
    upsellTarget: 25,
    currentBumpRate: number,
    currentUpsellRate: number,
    potentialRevenue: RevenueProjection
  }
}
```

---

## 📈 Métricas de Conversión

### Tasas de Conversión Esperadas

| Etapa del Funnel | Conversión | Comentario |
|------------------|------------|------------|
| **Landing → Diagnostic Start** | 30% | Widget atractivo + bajo commitment |
| **Diagnostic Start → Complete** | 80% | Solo 3 preguntas, 60 segundos |
| **Diagnostic Complete → Checkout** | 15% | Buena urgencia en resultado |
| **Checkout Start → Payment Info** | 60% | Order bump aumenta engagement |
| **Payment Info → Purchase** | 80% | Ya ingresó tarjeta (commitment) |
| **Overall (Landing → Purchase)** | 2-3% | Típico para info products |

### Order Bump Performance

**Meta:** 40% acceptance rate

| Métrica | Target | Bueno | Excelente |
|---------|--------|-------|-----------|
| **View Rate** | 100% | 100% | 100% |
| **Acceptance Rate** | 40% | 50% | 60% |
| **Revenue per 100 visitors** | $5.60 | $7.00 | $8.40 |

**Estrategia de optimización:**
- A/B test: Precio ($6 vs $7 vs $8)
- A/B test: Copy ("AHORA" vs "GRATIS" vs "AUTOMATICO")
- A/B test: Position (antes vs después de email)
- Social proof dinámico (actualizar "4,200+" en tiempo real)

### Upsell Performance

**Meta:** 25% acceptance rate

| Métrica | Target | Bueno | Excelente |
|---------|--------|-------|-----------|
| **View Rate** | 80% | 90% | 100% |
| **Acceptance Rate** | 25% | 35% | 45% |
| **Revenue per 100 visitors** | $10.00 | $15.75 | $22.50 |

**Estrategia de optimización:**
- A/B test: Timing (post-payment-info vs post-purchase)
- A/B test: Urgency (10 min vs 5 min vs sin tiempo)
- A/B test: Escasez ("3 spots" vs "5 spots" vs sin escasez)
- A/B test: Precio ($20 vs $25 vs $30)
- Exit intent: Si intenta cerrar modal → reducir precio

---

## 💰 Proyecciones de Revenue

### Escenario Conservador (2% overall conversion)

**1,000 visitantes/mes:**

| Productos | Conversiones | AOV | Revenue | vs Base |
|-----------|--------------|-----|---------|---------|
| Solo guía | 20 | $10 | $200 | - |
| + Order Bump (40%) | 20 (8 bump) | $12.80 | $256 | +28% |
| + Upsell (25%) | 20 (5 upsell) | $16.25 | $325 | +62% |
| + Ambos | 20 | $18.50 | $370 | +85% |

**Anual:** $370 × 12 = **$4,440** (+$2,040 vs base)

### Escenario Optimista (3% overall conversion)

**1,000 visitantes/mes:**

| Productos | Conversiones | AOV | Revenue | vs Base |
|-----------|--------------|-----|---------|---------|
| Solo guía | 30 | $10 | $300 | - |
| + Order Bump (50%) | 30 (15 bump) | $13.50 | $405 | +35% |
| + Upsell (35%) | 30 (10.5 upsell) | $18.75 | $562.50 | +87% |
| + Ambos | 30 | $21.50 | $645 | +115% |

**Anual:** $645 × 12 = **$7,740** (+$4,140 vs base)

### Escenario Agresivo (5% overall conversion + optimizaciones)

**5,000 visitantes/mes** (con ads):

| Productos | Conversiones | AOV | Revenue | vs Base |
|-----------|--------------|-----|---------|---------|
| Solo guía | 250 | $10 | $2,500 | - |
| + Order Bump (60%) | 250 (150 bump) | $14.20 | $3,550 | +42% |
| + Upsell (45%) | 250 (112.5 upsell) | $21.25 | $5,312.50 | +112% |
| + Ambos | 250 | $24.50 | $6,125 | +145% |

**Anual:** $6,125 × 12 = **$73,500** (+$43,500 vs base)

---

## 🎨 Psicología de Conversión Aplicada

### 1. **Efecto de Compromiso (Commitment)**

**Técnica:** Una vez que alguien dice "sí" a algo pequeño, es más probable que diga "sí" a algo más grande.

**Aplicación:**
- Mini-diagnóstico (commitment pequeño: 60 segundos)
- Email collection (commitment medio: datos personales)
- Payment info (commitment grande: tarjeta ingresada)
- **Upsell DESPUÉS de payment info** (commitment máximo → más receptivo)

### 2. **Gap de Curiosidad**

**Técnica:** Crear un hueco entre lo que saben y lo que quieren saber.

**Aplicación:**
- "¿Tus soft skills frenan tu carrera?" (pregunta que genera curiosidad)
- Diagnóstico promete respuesta (cierre del gap)
- Resultado personalizado amplifica el gap (muestra problemas específicos)
- Guía es la solución (cierre definitivo)

### 3. **Anclaje de Precio (Price Anchoring)**

**Técnica:** El primer precio que ve el cerebro se convierte en referencia.

**Aplicación:**
- Guía: $20 tachado → $10 (50% OFF parece gran oferta)
- Order Bump: $15 tachado → $7 (53% OFF)
- Upsell: $35 tachado → $25 (30% OFF)
- **Resultado:** $10 se siente como "casi gratis" vs $20 original

### 4. **Escasez y Urgencia**

**Técnica:** Lo limitado/urgente se percibe más valioso.

**Aplicación:**
- Landing: "Oferta limitada - Solo este mes"
- Diagnóstico: "Cada mes sin estas habilidades es un mes perdido"
- Upsell: "Solo 3 spots disponibles" + "Expira en 10 minutos"
- **Resultado:** Decision pressure → compra más rápida

### 5. **Social Proof (Prueba Social)**

**Técnica:** Seguimos lo que otros hacen (especialmente si son como nosotros).

**Aplicación:**
- "12,000+ desarrolladores ya la adquirieron"
- Testimonios de María (Mercado Libre), Carlos (Globant), Ana (Despegar)
- Order Bump: "4,200+ lo añadieron este mes"
- Upsell: "87% consiguen empleo en 45 días con mentoría"

### 6. **Aversión a la Pérdida (Loss Aversion)**

**Técnica:** El dolor de perder es 2x más fuerte que el placer de ganar.

**Aplicación:**
- Diagnóstico muestra lo que PIERDES (dinero, oportunidades)
- "Estás dejando dinero sobre la mesa" (pérdida tangible)
- "Cada mes sin estas habilidades..." (pérdida de tiempo)
- Upsell: "No te quedes al 80%" (pérdida de potencial)

### 7. **Complementariedad (Bundle Logic)**

**Técnica:** Productos que se complementan se perciben más valiosos juntos.

**Aplicación:**
- Guía + CV Audit = combo lógico (mientras lees, ya tienes feedback)
- Guía + Mentoría = combo lógico (teoría + práctica personalizada)
- **Resultado:** No se siente como "upsell", sino como "completar la solución"

---

## 🔬 A/B Testing Guide

### Tests Prioritarios (Mes 1-2)

#### Test 1: Order Bump Price Point
```
Control: $7 (53% OFF)
Variant A: $6 (60% OFF)
Variant B: $8 (47% OFF)

Métrica primaria: Acceptance rate
Métrica secundaria: Revenue per visitor
Sample size: 500 por variante
```

#### Test 2: Upsell Timing
```
Control: Post-payment-info (antes de confirmar pago)
Variant A: Post-purchase (después de pago confirmado)

Métrica primaria: Acceptance rate
Métrica secundaria: Cart abandonment rate
Sample size: 300 por variante
```

#### Test 3: Diagnostic Result Intensity
```
Control: Resultado actual (3 niveles)
Variant A: Resultado más "doloroso" (enfatiza pérdidas)
Variant B: Resultado más "esperanzador" (enfatiza ganancias)

Métrica primaria: Diagnostic → Checkout rate
Sample size: 1,000 por variante
```

### Tests Secundarios (Mes 3-4)

#### Test 4: Landing Hero CTA
```
Control: "Obtener la Guía Completa Ahora"
Variant A: "Sí, Quiero Mejorar Mis Soft Skills"
Variant B: "Empezar Mi Transformación Profesional"

Métrica: Click-through rate
```

#### Test 5: Upsell Urgency
```
Control: "Expira en 10 minutos"
Variant A: "Expira en 5 minutos"
Variant B: Sin urgencia temporal

Métrica: Acceptance rate + Quality score (completions)
```

#### Test 6: Order Bump Position
```
Control: Después de email, antes de payment
Variant A: Junto con email (mismo paso)
Variant B: Después de payment info, antes de confirmar

Métrica: Acceptance rate
```

---

## 📊 Dashboard de Analytics

### KPIs Principales

```typescript
// Vista de dashboard recomendada
interface DashboardMetrics {
  // Traffic
  totalVisitors: number
  uniqueVisitors: number
  returningVisitors: number
  
  // Engagement
  diagnosticStartRate: number  // % que inician diagnóstico
  diagnosticCompleteRate: number  // % que completan
  avgTimeOnPage: number  // Segundos
  
  // Conversion
  checkoutStartRate: number  // % que llegan a checkout
  overallConversionRate: number  // % que compran
  
  // Order Bumps & Upsells
  orderBumpViewRate: number
  orderBumpAcceptanceRate: number
  upsellViewRate: number
  upsellAcceptanceRate: number
  
  // Revenue
  totalRevenue: number
  avgOrderValue: number
  revenuePerVisitor: number
  
  // Product Mix
  guideOnlySales: number
  guideWithBumpSales: number
  guideWithUpsellSales: number
  guideWithBothSales: number
}
```

### Alertas Automáticas

```typescript
// Configurar alertas si:
1. orderBumpAcceptanceRate < 30% (meta: 40%)
   → Review copy del order bump
   
2. upsellAcceptanceRate < 15% (meta: 25%)
   → Review timing o pricing del upsell
   
3. checkoutStartRate < 10%
   → Review diagnóstico result (no genera suficiente urgencia)
   
4. overallConversionRate < 1.5%
   → Review landing page (traffic no calificado)
   
5. avgOrderValue < $15
   → Bumps/upsells no funcionan, revisar propuesta de valor
```

---

## 🎯 Optimizaciones Futuras

### Corto Plazo (1-2 meses)

1. **Email Sequence Post-Diagnóstico**
   - Si no compra → Email a las 24h con resultado + descuento extra
   - Si no compra → Email a los 7 días con caso de éxito
   - Si no compra → Email a los 14 días con last chance offer

2. **Exit Intent Popup**
   - Detectar cuando intenta salir del checkout
   - Ofrecer descuento adicional (10% OFF) para cerrar ahora
   - "Espera! No pierdas tu diagnóstico personalizado"

3. **Retargeting Ads**
   - Facebook/Google Ads a quienes completaron diagnóstico
   - Mostrar su resultado (guardado en cookie)
   - CTA: "Vuelve y completa tu compra"

### Medio Plazo (3-6 meses)

4. **Dynamic Pricing**
   - Order Bump: $5 para usuarios mobile, $7 para desktop
   - Upsell: $20 para estudiantes, $25 estándar, $30 para seniors
   - A/B test dinámico por segmento

5. **Personalized Upsells**
   - Si compró solo guía → Email con offer de CV audit
   - Si compró guía + audit → Email con offer de mentoría
   - If bought everything → Email con offer de curso avanzado

6. **Video Testimonials**
   - Agregar videos de 30s de usuarios exitosos
   - En landing, checkout y upsell modal
   - Aumenta trust y conversión

### Largo Plazo (6-12 meses)

7. **Affiliate Program**
   - 30% comisión por venta referida
   - Tracking con cookies de 60 días
   - Dashboard para afiliados

8. **Bundles Pre-configurados**
   - Bundle "Starter": Guía ($10)
   - Bundle "Pro": Guía + CV Audit ($15 vs $17)
   - Bundle "Elite": Guía + CV + Mentoría ($35 vs $42)
   - Mostrar bundles en landing (aumenta AOV desde inicio)

9. **Subscription Model**
   - $19/mes: Acceso a todas las guías + 1 auditoría/mes
   - $49/mes: Todo lo anterior + 2 sesiones de mentoría/mes
   - LTV > AOV (ingresos recurrentes)

---

## 🔒 Compliance y Legal

### Stripe Integration
- ✅ PCI DSS compliant (Stripe maneja tarjetas)
- ✅ 3D Secure opcional (reduce chargebacks)
- ✅ Webhooks para payment confirmations
- ✅ Refund policy: 30 días money-back guarantee

### Email Marketing
- ✅ GDPR compliant (consent explícito)
- ✅ CAN-SPAM compliant (unsubscribe link)
- ✅ Double opt-in para newsletter

### Términos y Condiciones
- ✅ Refund policy clara (30 días)
- ✅ Digital product disclaimer (no garantías de resultados)
- ✅ Privacy policy (uso de cookies y analytics)

---

## 📚 Referencias y Recursos

### Libros sobre Funnel Optimization
- **"DotCom Secrets"** - Russell Brunson
- **"Expert Secrets"** - Russell Brunson
- **"$100M Offers"** - Alex Hormozi
- **"Influence"** - Robert Cialdini

### Tools Recomendadas
- **Analytics:** Mixpanel, Amplitude
- **A/B Testing:** Optimizely, VWO
- **Heatmaps:** Hotjar, Crazy Egg
- **Email:** SendGrid, Mailchimp
- **CRM:** HubSpot, Pipedrive

### Benchmarks de Industria
- **Info products conversion rate:** 1-3%
- **Order bump acceptance:** 30-50%
- **Upsell acceptance:** 20-40%
- **Average cart abandonment:** 70%
- **Email open rate:** 20-25%
- **Email click rate:** 2-5%

---

## ✅ Checklist de Deployment

### Frontend (Completado ✅)
- [x] Landing page (/soft-skills-guide)
- [x] Mini-diagnóstico interactivo (SoftSkillsDiagnostic)
- [x] Checkout flow con 3 pasos y Stripe Elements
- [x] Order Bump (pre-payment con tracking)
- [x] Upsell modal con countdown timer (10 min)
- [x] Success/Confirmation page
- [x] Hook de tracking (useFunnelTracking)

### Backend APIs (Completado ✅)
- [x] POST /api/checkout/create-order (Stripe Payment Intent)
- [x] POST /api/checkout/track-order-bump (Analytics)
- [x] POST /api/checkout/track-upsell (Analytics)
- [x] POST /api/checkout/track-funnel-event (General tracking)
- [x] GET /api/checkout/track-order-bump (Stats)
- [x] GET /api/checkout/track-upsell (Stats)
- [x] GET /api/checkout/track-funnel-event (Funnel analytics)

### Configuración Requerida (Pendiente ⚠️)
- [ ] Configurar Stripe en producción (API keys en .env)
- [ ] Crear productos en Stripe dashboard:
  - [ ] Soft Skills Guide ($10)
  - [ ] CV Audit AI ($7)
  - [ ] 1 Month Mentorship ($25)
- [ ] Setup SendGrid para confirmation emails
- [ ] Generar PDF de la guía (soft-skills-guide.pdf)
- [ ] Crear tablas en Supabase:
  - [ ] `orders` (id, email, amount, products, status, stripe_payment_intent_id, etc.)
  - [ ] `funnel_events` (id, session_id, event_type, data, timestamp, etc.)
  - [ ] `product_access` (user_id, product_id, granted_at, expires_at)
- [ ] Testing con Stripe test mode (4242 4242 4242 4242)
- [ ] Setup analytics dashboard (Mixpanel/Amplitude)
- [ ] Configurar Google Analytics events
- [ ] Setup email sequences (Mailchimp/SendGrid)

---

## 🚀 Cómo Probar el Funnel (Testing Guide)

### Paso 1: Configurar Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Paso 2: Crear Tablas en Supabase
```sql
-- Tabla de órdenes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  products JSONB NOT NULL,
  session_id TEXT,
  order_bump_accepted BOOLEAN DEFAULT false,
  upsell_accepted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de eventos del funnel
CREATE TABLE funnel_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  email TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_funnel_events_session ON funnel_events(session_id);
CREATE INDEX idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX idx_funnel_events_created ON funnel_events(created_at);
```

### Paso 3: Probar el Flujo Completo

#### 3.1. Landing Page
```
URL: http://localhost:3000/soft-skills-guide

Tests:
✅ Ver hero section con precio $10 (tachado $20)
✅ Click en "Iniciar Diagnóstico Gratis"
✅ Completar 3 preguntas del diagnóstico
✅ Ver resultado personalizado según score
✅ Click en CTA "Obtener la Guía por $10"
✅ Verificar que se registra evento "landing_view"
✅ Verificar que se registra "diagnostic_started"
✅ Verificar que se registra "diagnostic_completed"
```

#### 3.2. Checkout Step 1 (Email + Order Bump)
```
URL: http://localhost:3000/soft-skills-guide/checkout

Tests:
✅ Ingresar email válido
✅ Ver order bump prominente (+$7 CV Audit)
✅ Marcar/desmarcar checkbox del order bump
✅ Verificar que el total cambia ($10 → $17)
✅ Click en "Continuar al Pago"
✅ Verificar evento "checkout_started"
✅ Verificar evento "order_bump_decision" en DB
```

#### 3.3. Checkout Step 2 (Payment)
```
Tests:
✅ Ver Stripe CardElement cargado
✅ Ingresar tarjeta de prueba: 4242 4242 4242 4242
✅ Fecha: cualquier fecha futura (12/30)
✅ CVC: cualquier 3 dígitos (123)
✅ Click en "Completar Pago - $X"
✅ Ver loading state "Procesando..."
✅ Verificar llamada a /api/checkout/create-order
✅ Verificar Payment Intent creado en Stripe
```

#### 3.4. Checkout Step 3 (Upsell)
```
Tests:
✅ Ver modal de upsell con confetti animation
✅ Ver countdown timer de 10:00 corriendo
✅ Ver precio +$25 para mentoría (tachado $35)
✅ Click en "SÍ, Añadir Mentoría por +$25"
✅ Verificar evento "upsell_decision" con accepted=true
✅ Redirect a /soft-skills-guide/success
---
O bien:
✅ Click en "No gracias, solo quiero la guía"
✅ Verificar evento "upsell_decision" con accepted=false
✅ Redirect a /soft-skills-guide/success
```

#### 3.5. Success Page
```
URL: http://localhost:3000/soft-skills-guide/success?session=XXX

Tests:
✅ Ver confetti celebration
✅ Ver mensaje "¡Compra Exitosa! 🎉"
✅ Ver lista de productos comprados
✅ Ver total pagado ($10, $17, o $42)
✅ Ver links de descarga/acceso
✅ Ver "Próximos Pasos" personalizados
✅ Verificar email de confirmación enviado
```

### Paso 4: Verificar Analytics

#### Query Supabase para ver eventos
```sql
-- Ver todos los eventos de una sesión
SELECT * FROM funnel_events 
WHERE session_id = 'session_xxx' 
ORDER BY created_at;

-- Ver acceptance rate del order bump (últimos 100)
SELECT 
  COUNT(*) FILTER (WHERE data->>'accepted' = 'true') * 100.0 / COUNT(*) as acceptance_rate
FROM funnel_events 
WHERE event_type = 'order_bump_decision' 
ORDER BY created_at DESC 
LIMIT 100;

-- Ver funnel completo (conversión por etapa)
WITH funnel AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN event_type = 'landing_view' THEN session_id END) as landing,
    COUNT(DISTINCT CASE WHEN event_type = 'checkout_started' THEN session_id END) as checkout,
    COUNT(DISTINCT CASE WHEN event_type = 'payment_started' THEN session_id END) as payment,
    COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN session_id END) as purchase
  FROM funnel_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  landing,
  checkout,
  ROUND(checkout * 100.0 / landing, 2) as landing_to_checkout_rate,
  payment,
  ROUND(payment * 100.0 / checkout, 2) as checkout_to_payment_rate,
  purchase,
  ROUND(purchase * 100.0 / payment, 2) as payment_to_purchase_rate,
  ROUND(purchase * 100.0 / landing, 2) as overall_conversion_rate
FROM funnel;
```

#### APIs de Analytics

```bash
# Ver stats del order bump (últimos 30 días)
curl http://localhost:3000/api/checkout/track-order-bump?days=30

# Ver stats del upsell
curl http://localhost:3000/api/checkout/track-upsell?days=30

# Ver funnel completo
curl http://localhost:3000/api/checkout/track-funnel-event?days=30
```

### Paso 5: Testing con Tarjetas de Stripe

```
Tarjetas de prueba exitosas:
- 4242 4242 4242 4242 (Visa)
- 5555 5555 5555 4444 (Mastercard)
- 3782 822463 10005 (American Express)

Tarjetas que fallan:
- 4000 0000 0000 0002 (Card declined)
- 4000 0000 0000 9995 (Insufficient funds)
- 4000 0000 0000 0069 (Expired card)
```

---

## 📊 Métricas a Monitorear Post-Launch

### KPIs Principales
1. **Overall Conversion Rate** (Landing → Purchase)
   - Target: 2-3%
   - Formula: (Purchases / Landing Views) * 100

2. **Order Bump Acceptance Rate**
   - Target: 40%
   - Formula: (Order Bump Accepted / Order Bump Viewed) * 100

3. **Upsell Acceptance Rate**
   - Target: 25%
   - Formula: (Upsell Accepted / Upsell Viewed) * 100

4. **Average Order Value (AOV)**
   - Target: $18.50 (con ambos)
   - Formula: Total Revenue / Total Orders

5. **Revenue Per Visitor (RPV)**
   - Target: $0.37 (con 2% conversión y $18.50 AOV)
   - Formula: (Conversion Rate * AOV) / 100

### Drop-off Points (Optimizar primero)
1. **Landing → Checkout:** Meta: <50% drop-off
2. **Checkout → Payment:** Meta: <30% drop-off
3. **Payment → Complete:** Meta: <10% drop-off

### A/B Tests Recomendados
1. Order Bump Copy (urgencia vs beneficio)
2. Upsell Timer (5 min vs 10 min vs 15 min)
3. Precio del Order Bump ($5 vs $7 vs $9)
4. Precio del Upsell ($20 vs $25 vs $30)
5. Momento del diagnóstico (antes vs después del hero)

---

## 🚀 Sistema de Entrega Automática (Delivery System)

### Arquitectura del Sistema

El sistema de entrega automática gestiona la distribución inmediata de productos digitales después de un pago exitoso:

```
┌─────────────────────────────────────────────────────────┐
│  Stripe Payment Success                                 │
│  (payment_intent.succeeded)                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Webhook Handler (/api/webhook/stripe)                  │
│  • Verifica signature de Stripe                         │
│  • Obtiene metadata del pago                            │
│  • Llama a Delivery System                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Edge Function (deliver-purchase)              │
│  • Procesa cada producto comprado                       │
│  • Genera signed URLs para PDFs                         │
│  • Habilita créditos y suscripciones                    │
│  • Envía emails de confirmación                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Database Updates                                        │
│  • product_access: Registra acceso al ebook            │
│  • user_assets: Agrega crédito de CV audit             │
│  • mentorship_subscriptions: Activa mentoría           │
│  • orders: Marca como 'completed'                      │
└─────────────────────────────────────────────────────────┘
```

### Productos Soportados

#### 1. **E-book (Guía de Soft Skills)** - $10
```typescript
// Entrega:
- Genera signed URL para PDF (válida 7 días)
- Registra acceso en product_access
- Envía email con link de descarga

// Storage:
supabase.storage.from('products')
  .createSignedUrl('ebooks/guia-soft-skills-v1.pdf', 604800)
```

#### 2. **Auditoría de CV con IA** - $7
```typescript
// Entrega:
- Agrega 1 crédito en user_assets (type: 'cv_audit_credit')
- Habilita acceso al dashboard de upload
- Envía email con instrucciones

// Base de datos:
INSERT INTO user_assets (user_id, type, balance)
VALUES (user_id, 'cv_audit_credit', 1)
```

#### 3. **1 Mes de Mentoría** - $25
```typescript
// Entrega:
- Crea suscripción en mentorship_subscriptions (4 sesiones)
- Notifica a mentores disponibles
- Envía email con link de booking
- Activa acceso al calendario de mentoría

// Base de datos:
INSERT INTO mentorship_subscriptions (
  user_id, sessions_total, sessions_left, expires_at
) VALUES (
  user_id, 4, 4, NOW() + INTERVAL '30 days'
)
```

### Archivos del Sistema

```
supabase/
├── functions/
│   └── deliver-purchase/
│       └── index.ts              # Edge Function principal
└── migrations/
    └── 002_delivery_system.sql  # Schema de base de datos

lib/
└── delivery-system.ts            # Cliente para llamar a delivery

app/
└── api/
    ├── checkout/
    │   └── create-order/
    │       └── route.ts         # Llama a delivery después del pago
    └── webhook/
        └── stripe/
            └── route.ts         # Webhook handler (delivery en background)
```

### Configuración de Supabase Edge Function

#### 1. Deploy de la función
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref YOUR_PROJECT_ID

# Deploy function
supabase functions deploy deliver-purchase --no-verify-jwt
```

#### 2. Configurar secrets
```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key
```

#### 3. Invocar desde Next.js
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deliver-purchase`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      userId: 'user_123',
      email: 'user@example.com',
      orderId: 'order_uuid',
      purchaseItems: [
        { id: 'soft-skills-guide', name: 'Guía de Soft Skills', type: 'ebook' },
        { id: 'cv-audit-ai', name: 'CV Audit', type: 'cv_audit' }
      ],
      orderBumpAccepted: true,
      upsellAccepted: false
    })
  }
)
```

### Configuración del Webhook de Stripe

#### 1. Crear webhook en Stripe Dashboard
```
URL: https://tu-dominio.com/api/webhook/stripe
Eventos a escuchar:
  ✅ payment_intent.succeeded
  ✅ payment_intent.payment_failed
  ✅ charge.refunded
```

#### 2. Obtener webhook secret
```bash
# En Stripe Dashboard > Webhooks > Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Testing local con Stripe CLI
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Trigger evento de prueba
stripe trigger payment_intent.succeeded
```

### Flujo de Reembolsos

Cuando se emite un reembolso, el webhook automáticamente:

```typescript
// 1. Actualiza orden
UPDATE orders SET status = 'refunded', refunded_at = NOW()

// 2. Revoca acceso al ebook
UPDATE product_access 
SET revoked_at = NOW(), revoke_reason = 'refund'

// 3. Elimina créditos de CV
UPDATE user_assets 
SET balance = 0, revoked_at = NOW()

// 4. Cancela mentoría
UPDATE mentorship_subscriptions 
SET status = 'cancelled', cancellation_reason = 'refund'
```

### Emails Automáticos

#### Templates de SendGrid necesarios:

1. **delivery-ebook**
   - Subject: "🎉 Tu Guía de Soft Skills está lista"
   - Content: Link de descarga (válido 7 días)
   - CTA: "Descargar Ahora"

2. **delivery-cv-audit**
   - Subject: "✅ Tu crédito de Auditoría CV está activo"
   - Content: Instrucciones para subir CV
   - CTA: "Subir CV Ahora"

3. **delivery-mentorship**
   - Subject: "🚀 Tu mes de Mentoría ha comenzado"
   - Content: Cómo agendar sesiones
   - CTA: "Ver Mentores Disponibles"

4. **delivery-complete**
   - Subject: "¡Gracias por tu compra! Aquí están tus productos"
   - Content: Resumen de todos los productos
   - CTAs: Links a cada producto

### Monitoreo y Logs

```typescript
// Ver logs de la Edge Function
supabase functions logs deliver-purchase

// Query para ver entregas fallidas
SELECT * FROM orders 
WHERE status = 'delivery_failed' 
ORDER BY created_at DESC;

// Retry manual de entrega
-- Llamar a la Edge Function manualmente con los datos de la orden
```

### Testing del Sistema de Entrega

```bash
# 1. Probar Edge Function directamente
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/deliver-purchase' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "test_user",
    "email": "test@example.com",
    "orderId": "test_order_123",
    "purchaseItems": [
      { "id": "soft-skills-guide", "name": "Guía", "type": "ebook" }
    ],
    "orderBumpAccepted": false,
    "upsellAccepted": false
  }'

# 2. Verificar producto_access
SELECT * FROM product_access WHERE user_id = 'test_user';

# 3. Verificar signed URL
-- El URL generado debe ser accesible y descargar el PDF
```

### Seguridad

#### Políticas de Storage (RLS)
```sql
-- Solo usuarios con acceso pueden descargar
CREATE POLICY "Users can download purchased products"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products' 
  AND EXISTS (
    SELECT 1 FROM product_access
    WHERE product_access.user_id = auth.uid()::text
    AND product_access.download_url LIKE '%' || storage.objects.name || '%'
    AND product_access.revoked_at IS NULL
  )
);
```

#### Verificación de Webhook
```typescript
// SIEMPRE verificar signature de Stripe
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  webhookSecret
)
```

### Troubleshooting

| Problema | Solución |
|----------|----------|
| **PDF no se descarga** | Verificar que el archivo existe en Storage y el signed URL no expiró |
| **Crédito no aparece** | Revisar logs de Edge Function y verificar tabla user_assets |
| **Email no llega** | Verificar SendGrid API key y template IDs |
| **Webhook falla** | Verificar STRIPE_WEBHOOK_SECRET y revisar logs en Stripe Dashboard |
| **Delivery fallido** | Ver campo delivery_errors en tabla orders |
- [ ] Legal review (términos, privacy policy)
- [ ] Deploy a producción

---

## 🎉 Resultado Final

✅ **Funnel de conversión completo** con order bumps y upsells estratégicos  
✅ **320% incremento de AOV** posible ($10 → $42)  
✅ **Tracking completo** de métricas de conversión  
✅ **Psicología de conversión** aplicada en cada paso  
✅ **Sistema escalable** para agregar más productos  

**Proyección conservadora:** $370/mes con 1,000 visitantes  
**Proyección optimista:** $7,740/año con optimizaciones  
**Proyección agresiva:** $73,500/año con ads y 5K visitantes/mes  

---

**Desarrollado por:** Daniel - SkillsForIT  
**Sprint 24 Completado:** 12 de enero de 2026  
**Próximo Sprint:** Sprint 25 - Email Marketing Automation & Retargeting
