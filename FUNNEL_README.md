# 🚀 Funnel de Conversión - Guía de Soft Skills

Sistema completo de ventas con order bumps, upsells y tracking de conversiones.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Testing](#testing)
- [APIs](#apis)
- [Métricas](#métricas)

## Descripción

Funnel optimizado para maximizar el AOV (Average Order Value) de $10 a $42 mediante:
- **Order Bump pre-pago:** Auditoría de CV con IA (+$7)
- **Upsell post-pago:** 1 mes de Mentoría (+$25)
- **Tracking completo:** Todos los eventos del funnel registrados

## Arquitectura

```
┌─────────────────────────────────────────┐
│  Landing (/soft-skills-guide)           │
│  • Mini-diagnóstico interactivo         │
│  • Social proof y testimonios           │
│  • CTA: $10 (50% OFF)                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Checkout Step 1                        │
│  • Email collection                     │
│  • ✅ Order Bump: +$7 (40% target)     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Checkout Step 2                        │
│  • Stripe CardElement                   │
│  • Payment processing                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Checkout Step 3                        │
│  • 🎁 Upsell Modal: +$25 (25% target) │
│  • ⏰ 10-min countdown timer           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Success Page                           │
│  • Confirmación con confetti            │
│  • Links de descarga                    │
│  • Próximos pasos                       │
└─────────────────────────────────────────┘
```

## Instalación

### 1. Instalar Dependencias

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js canvas-confetti
```

### 2. Crear Tablas en Supabase

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

-- Índices
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_funnel_events_session ON funnel_events(session_id);
CREATE INDEX idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX idx_funnel_events_created ON funnel_events(created_at);
```

### 3. Configurar Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Configuración

### Stripe Setup

1. **Ir a Stripe Dashboard:** https://dashboard.stripe.com/test/apikeys
2. **Copiar API keys** (modo test para desarrollo)
3. **Crear productos:**
   - Soft Skills Guide: $10 USD
   - CV Audit AI: $7 USD
   - 1 Month Mentorship: $25 USD

### Testing con Tarjetas de Prueba

```
✅ Pago exitoso:
4242 4242 4242 4242
Fecha: 12/30
CVC: 123

❌ Pago fallido (para testing):
4000 0000 0000 0002 (Card declined)
4000 0000 0000 9995 (Insufficient funds)
```

## Testing

### Flow Completo de Usuario

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir landing
http://localhost:3000/soft-skills-guide

# 3. Completar diagnóstico (3 preguntas)
# 4. Click en "Obtener la Guía por $10"
# 5. Ingresar email y marcar order bump (+$7)
# 6. Ingresar tarjeta 4242 4242 4242 4242
# 7. Ver upsell modal con timer
# 8. Aceptar o rechazar upsell
# 9. Ver página de confirmación
```

### Verificar Eventos en Supabase

```sql
-- Ver todos los eventos de una sesión
SELECT * FROM funnel_events 
WHERE session_id = 'session_xxx' 
ORDER BY created_at;

-- Calcular conversion rate del order bump
SELECT 
  COUNT(*) FILTER (WHERE data->>'accepted' = 'true') * 100.0 / COUNT(*) as acceptance_rate
FROM funnel_events 
WHERE event_type = 'order_bump_decision';
```

## APIs

### POST /api/checkout/create-order
Crear Payment Intent de Stripe y registrar orden.

```typescript
// Request
{
  email: string
  products: Array<{ id, name, price }>
  sessionId: string
  orderBumpAccepted: boolean
  upsellAccepted: boolean
}

// Response
{
  clientSecret: string
  orderId: string
}
```

### POST /api/checkout/track-order-bump
Registrar decisión del order bump.

```typescript
// Request
{
  sessionId: string
  email?: string
  accepted: boolean
  timeSpent?: number
  variant?: string
}

// Response
{
  success: true
  stats: {
    acceptanceRate: number // %
    target: 40
    performance: 'on-target' | 'below-target'
  }
}
```

### GET /api/checkout/track-order-bump?days=30
Obtener estadísticas del order bump.

```json
{
  "period": "30 days",
  "total": 150,
  "accepted": 60,
  "rejected": 90,
  "acceptanceRate": 40.0,
  "target": 40,
  "performance": "on-target",
  "aov": {
    "base": 10,
    "withBump": 12.80,
    "lift": "28%"
  }
}
```

### POST /api/checkout/track-upsell
Registrar decisión del upsell.

```typescript
// Request
{
  sessionId: string
  email?: string
  accepted: boolean
  timeSpent?: number
  hadOrderBump?: boolean
}
```

### POST /api/checkout/track-funnel-event
Registrar cualquier evento del funnel.

```typescript
// Request
{
  eventType: 'landing_view' | 'diagnostic_started' | 'diagnostic_completed' | 
             'checkout_started' | 'order_bump_viewed' | 'payment_started' | 
             'upsell_viewed' | 'purchase_completed'
  sessionId: string
  email?: string
  metadata?: Record<string, any>
}
```

### GET /api/checkout/track-funnel-event?days=30
Obtener estadísticas del funnel completo.

```json
{
  "metrics": {
    "totalSessions": 1000,
    "landingViews": 1000,
    "checkoutStarts": 100,
    "purchases": 20
  },
  "conversionRates": {
    "landingToCheckout": "10.0%",
    "checkoutToPayment": "80.0%",
    "paymentToPurchase": "90.0%",
    "overallConversion": "2.0%"
  },
  "dropOffPoints": [
    {
      "stage": "Landing → Checkout",
      "dropOffRate": "90.0%",
      "potential": 900
    }
  ]
}
```

## Métricas

### KPIs Principales

| Métrica | Target | Fórmula |
|---------|--------|---------|
| **Overall Conversion Rate** | 2-3% | (Purchases / Landing Views) × 100 |
| **Order Bump Acceptance** | 40% | (Accepted / Viewed) × 100 |
| **Upsell Acceptance** | 25% | (Accepted / Viewed) × 100 |
| **AOV** | $18.50 | Total Revenue / Total Orders |
| **RPV** | $0.37 | (Conv Rate × AOV) / 100 |

### Proyección de Revenue (1,000 visitantes/mes)

| Escenario | AOV | Revenue |
|-----------|-----|---------|
| **Sin optimización** | $10 | $200 |
| **Con Order Bump (40%)** | $12.80 | $256 (+28%) |
| **Con Upsell (25%)** | $16.25 | $325 (+62%) |
| **Con ambos** | $18.50 | $370 (+85%) |

### Drop-off Points a Optimizar

1. **Landing → Checkout:** <50% drop-off
2. **Checkout → Payment:** <30% drop-off
3. **Payment → Complete:** <10% drop-off

## Archivos del Proyecto

```
app/
├── soft-skills-guide/
│   ├── page.tsx                 # Landing page
│   ├── checkout/
│   │   └── page.tsx            # Checkout flow (3 pasos)
│   └── success/
│       └── page.tsx            # Confirmation page
├── api/
│   └── checkout/
│       ├── create-order/
│       │   └── route.ts        # Stripe Payment Intent
│       ├── track-order-bump/
│       │   └── route.ts        # Order bump analytics
│       ├── track-upsell/
│       │   └── route.ts        # Upsell analytics
│       └── track-funnel-event/
│           └── route.ts        # General funnel tracking

components/
└── SoftSkillsDiagnostic.tsx    # Mini-diagnóstico interactivo

lib/
└── hooks/
    └── useFunnelTracking.ts    # Hook de tracking
```

## Soporte

Para preguntas o issues:
- Revisa el [SPRINT24.md](./SPRINT24.md) para documentación completa
- Consulta logs en Supabase y Stripe Dashboard
- Verifica variables de entorno

## Próximos Pasos

1. ✅ Testing completo en modo desarrollo
2. ⏳ Configurar Stripe en producción
3. ⏳ Crear productos físicos en Stripe
4. ⏳ Setup SendGrid para emails
5. ⏳ Generar PDF de la guía
6. ⏳ A/B testing del order bump copy
7. ⏳ Optimizar timer del upsell (5 vs 10 vs 15 min)
