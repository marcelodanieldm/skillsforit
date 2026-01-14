# Sprint 39: Bio-Feedback y Captura de Leads - Documentación

## 📋 Overview

**Objetivo**: Recolectar datos del usuario (Email, Rol, País, Experiencia) tras la simulación de audio y entregar un reporte de feedback detallado gratuito con upsell de E-book.

**Flujo**:
1. Usuario completa simulación de 3 respuestas de audio
2. IA analiza tono, muletillas y estructura STAR
3. Aparece formulario de captura de datos
4. Usuario completa formulario para desbloquear reporte
5. Reporte enviado por email + página de éxito con upsell

---

## 🏗️ Arquitectura

### Frontend Components

#### `LeadCaptureForm.tsx`
**Ubicación**: `/components/LeadCaptureForm.tsx`

**Props**:
```typescript
interface LeadCaptureFormProps {
  sessionId: string
  analysisResults: {
    toneScore: number
    fillerWordsCount: number
    starCompliance: number
    transcriptions: string[]
  }
  onSuccess: () => void
}
```

**Features**:
- Validación de email en tiempo real (regex)
- Dropdowns para Rol (13 opciones) y País (21 países)
- Input numérico para años de experiencia (0-50)
- Vista previa borrosa del reporte para generar curiosidad
- Detección automática de nivel (Junior/Mid/Senior/Staff)
- Envío a `/api/audio-feedback/generate-report`

**Estados**:
```typescript
const [formData, setFormData] = useState({
  email: '',
  role: '',
  country: '',
  experienceYears: ''
})

const [emailValid, setEmailValid] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
```

#### `AudioFeedbackSuccessPage.tsx`
**Ubicación**: `/app/audio-feedback/success/page.tsx`

**Features**:
- Confetti animation (5 segundos)
- Confirmación de envío de reporte
- Métricas visuales (nivel, tono, muletillas)
- Detección de área de mejora para upsell personalizado
- CTA de Guía de Soft Skills (USD 10, 65% OFF)
- Social proof (4.9/5 stars, 500+ descargas, 94% tasa de éxito)

**Query Params**:
```
?email=user@example.com
&level=Mid
&toneScore=70
&fillerCount=5
```

---

### Backend APIs

#### `/api/audio-feedback/generate-report/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "sessionId": "abc-123",
  "email": "user@example.com",
  "role": "Backend Developer",
  "country": "México",
  "experienceYears": 3,
  "analysisResults": {
    "toneScore": 75,
    "fillerWordsCount": 5,
    "starCompliance": 65,
    "transcriptions": ["...", "...", "..."]
  }
}
```

**Actions**:
1. Valida campos requeridos
2. Determina nivel (Junior/Mid/Senior/Staff) según años
3. Guarda/actualiza lead en Supabase `leads` table
4. Guarda análisis en `audio_feedback_analyses` table
5. Genera reporte HTML personalizado por nivel
6. Envía email con reporte (Resend/SendGrid)
7. Registra evento `audio_feedback_completed` en funnel tracking

**Response**:
```json
{
  "success": true,
  "leadId": "uuid",
  "sessionId": "abc-123",
  "experienceLevel": "Mid",
  "message": "Report generated and sent successfully"
}
```

**Personalización por Nivel**:
- **Junior**: Enfoque en estructura STAR básica, ejemplos de proyectos personales
- **Mid**: Cuantificación de resultados, lenguaje de liderazgo
- **Senior**: Decisiones arquitectónicas, mentoría, impacto en negocio
- **Staff**: Influencia cross-team, visión técnica, RFCs/ADRs

#### `/api/ceo/audio-feedback-metrics/route.ts`

**Method**: GET

**Query Params**:
- `period`: 7d | 30d | 90d (default: 7d)

**Response**:
```json
{
  "period": "7d",
  "overview": {
    "totalLeads": 127,
    "leadCaptureRate": 68,
    "targetCaptureRate": 60,
    "optionalConversion": 7.2,
    "targetOptionalConversion": 7,
    "totalSessions": 187,
    "ebookPurchases": 9
  },
  "experienceDistribution": {
    "Junior": 45,
    "Mid": 58,
    "Senior": 21,
    "Staff": 3
  },
  "avgMetricsByLevel": [
    {
      "level": "Junior",
      "avgTone": 62,
      "avgFillerWords": 8,
      "count": 45
    }
  ],
  "topCountries": [
    { "country": "México", "count": 42 },
    { "country": "Colombia", "count": 28 }
  ],
  "topRoles": [
    { "role": "Backend Developer", "count": 35 },
    { "role": "Full Stack Developer", "count": 29 }
  ],
  "trendData": [
    { "date": "2026-01-06", "leadsGenerated": 18, "conversions": 1 }
  ]
}
```

---

## 💾 Database Schema

### Tabla `leads` (Modificaciones)

```sql
ALTER TABLE leads 
ADD COLUMN role VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN experience_years INTEGER,
ADD COLUMN experience_level VARCHAR(20), -- Junior, Mid, Senior, Staff
ADD COLUMN audio_feedback_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN audio_feedback_completed_at TIMESTAMP;
```

### Tabla `audio_feedback_analyses` (Nueva)

```sql
CREATE TABLE audio_feedback_analyses (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  session_id VARCHAR(255) UNIQUE,
  
  tone_score INTEGER, -- 0-100
  filler_words_count INTEGER,
  star_compliance INTEGER, -- 0-100
  
  transcriptions JSONB, -- ["...", "...", "..."]
  experience_level VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `idx_leads_audio_feedback`: (audio_feedback_completed, audio_feedback_completed_at)
- `idx_leads_experience_level`: (experience_level)
- `idx_leads_country`: (country)
- `idx_leads_role`: (role)
- `idx_audio_analyses_lead`: (lead_id)
- `idx_audio_analyses_session`: (session_id)

---

## 📧 Email Template

### Estructura HTML

1. **Header**: Gradiente purple-blue, título "Tu Reporte de Feedback de Audio"
2. **Métricas Clave**: Cards con toneScore, fillerWordsCount, starCompliance
3. **Transcripciones**: Muestra las 3 respuestas completas
4. **Detección de Muletillas**: Alerta + consejo de mejora
5. **Análisis de Tono**: Feedback específico + tip
6. **Consejos Personalizados**: Según nivel (Junior/Mid/Senior/Staff)
7. **Consejo de Oro**: Ejemplo de "Escucha Activa" con fraseo mejorado
8. **CTA Upsell** (Condicional): Solo si toneScore < 70 OR fillerCount > 5 OR starCompliance < 60
   - Precio: USD 10 (65% OFF de USD 29)
   - Link con tracking: `?email=X&source=audio-feedback`

---

## 🎯 CEO Metrics

### KPIs Sprint 39

| Métrica | Meta | Definición | Valor para Negocio |
|---------|------|------------|-------------------|
| **Lead Capture Rate** | > 60% | % que completan formulario tras simulación | Base de datos de profesionales IT cualificados |
| **Experience Distribution** | Equilibrada | Mix de Junior/Mid/Senior/Staff | Ajustar contenido de E-book según audiencia dominante |
| **Optional Conversion** | 5-8% | % que compran E-book desde email | Ingresos pasivos sin presión de venta |

### Métricas Secundarias
- **Avg Tone Score por Nivel**: Detectar patrones (Seniors deberían tener >75%)
- **Avg Filler Words por Nivel**: Juniors típicamente 8-12, Seniors 3-5
- **Top Countries**: Para localizar contenido futuro
- **Top Roles**: Para crear E-books especializados (DevOps, Data Science, etc.)

---

## 🚀 Integración con Simulador Existente

### Modificar `/app/soft-skills/simulator/page.tsx`

```typescript
import LeadCaptureForm from '@/components/LeadCaptureForm'

const [showLeadCapture, setShowLeadCapture] = useState(false)
const [analysisResults, setAnalysisResults] = useState(null)

// Tras completar 3 respuestas de audio:
const handleSimulationComplete = (results) => {
  setAnalysisResults(results)
  setShowLeadCapture(true)
}

// En el render:
{showLeadCapture && (
  <LeadCaptureForm
    sessionId={sessionId}
    analysisResults={analysisResults}
    onSuccess={() => {
      router.push(`/audio-feedback/success?email=${email}&level=${level}&toneScore=${toneScore}&fillerCount=${fillerCount}`)
    }}
  />
)}
```

---

## 📊 Dashboard CEO

### Visualización Recomendada

#### Panel 1: Overview
- **Card 1**: Lead Capture Rate (68% / 60% target) 🟢
- **Card 2**: Optional Conversion (7.2% / 7% target) 🟢
- **Card 3**: Total Leads (127)
- **Card 4**: E-book Purchases (9)

#### Panel 2: Experience Distribution (Donut Chart)
```
Junior: 35%
Mid: 46%
Senior: 17%
Staff: 2%
```

#### Panel 3: Avg Metrics by Level (Bar Chart)
- X-axis: Junior, Mid, Senior, Staff
- Y-axis Dual:
  - Tone Score (línea azul)
  - Filler Words (barras rojas)

#### Panel 4: Geography & Roles (Tables)
- Top 5 Countries con count
- Top 5 Roles con count

#### Panel 5: Trend (Line Chart últimos 7 días)
- Leads Generated (línea verde)
- Conversions (línea purple)

---

## 🔧 Variables de Entorno Necesarias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Email Service (Resend o SendGrid)
RESEND_API_KEY=re_xxx...

# App URL
NEXT_PUBLIC_APP_URL=https://skillsforit.com

# Stripe (para checkout de E-book)
STRIPE_SECRET_KEY=sk_live_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
```

---

## 🧪 Testing

### Test Cases

#### 1. Formulario de Captura
- [ ] Email inválido muestra error
- [ ] Email válido muestra checkmark verde
- [ ] Dropdowns de Rol y País funcionan
- [ ] Años de experiencia acepta 0-50
- [ ] Nivel se detecta automáticamente (Junior < 2, Mid 2-4, Senior 5-9, Staff 10+)
- [ ] Botón submit deshabilitado hasta completar todo
- [ ] Loading state durante envío

#### 2. API Generate Report
- [ ] Validación de campos requeridos retorna 400
- [ ] Lead nuevo se crea correctamente
- [ ] Lead existente se actualiza
- [ ] Análisis se guarda en audio_feedback_analyses
- [ ] Email se genera con contenido personalizado por nivel
- [ ] Evento funnel tracking se registra
- [ ] Response retorna 200 con leadId y sessionId

#### 3. Página de Éxito
- [ ] Confetti animation dura 5 segundos
- [ ] Query params se leen correctamente
- [ ] Métricas visuales se muestran (nivel, tono, muletillas)
- [ ] Área de mejora se detecta según scores
- [ ] CTA de E-book redirige a /checkout con params correctos
- [ ] Social proof muestra stats

#### 4. CEO Metrics API
- [ ] Period 7d/30d/90d funciona
- [ ] Lead Capture Rate calcula correctamente
- [ ] Experience Distribution suma 100%
- [ ] Optional Conversion se calcula bien
- [ ] Trend data tiene 7 puntos
- [ ] Top Countries y Roles ordenados descendente

---

## 📦 Deployment Checklist

- [ ] Ejecutar migration SQL en Supabase
- [ ] Verificar indexes creados correctamente
- [ ] Configurar Resend API key en variables de entorno
- [ ] Crear producto "soft-skills-guide" en Stripe
- [ ] Configurar webhook de Stripe para purchases
- [ ] Testear email delivery en staging
- [ ] Verificar RLS policies en Supabase
- [ ] Setup monitoring de Lead Capture Rate (alertas si cae < 50%)
- [ ] A/B test de timing de formulario (inmediato vs 3s delay)

---

## 💰 Business Model

### Revenue Projections

**Assumptions**:
- 100 sessions/day
- 65% Lead Capture Rate = 65 leads/day
- 7% Optional Conversion = 4.5 E-books/day
- Price: USD 10

**Monthly Revenue**:
```
65 leads/day × 30 days = 1,950 leads/month
1,950 × 7% conversion = 136.5 E-book sales/month
136.5 × USD 10 = USD 1,365/month
```

**Annual Revenue**: USD 16,380 (solo de este funnel)

### Upsell Path
```
Free Audio Feedback → E-book USD 10 → CV Audit USD 7 → Mentoría USD 15
```

**LTV Potential**: USD 32 por lead (10 + 7 + 15)

---

## 🔄 Next Sprints

### Sprint 40: Email Automation (Drip Campaign)
- Email 1 (D+0): Reporte + Upsell E-book
- Email 2 (D+2): Testimonial + Case study
- Email 3 (D+5): Descuento 50% OFF E-book (urgencia)

### Sprint 41: Segmentación Avanzada
- Landing pages específicas por rol (DevOps, Data Science, Frontend)
- Recomendaciones de mejora por país (cultural differences)
- Benchmarking: "Tu tono está 15% abajo del promedio de Seniors en México"

### Sprint 42: A/B Testing
- Timing del formulario (inmediato vs 3s vs post-vista previa)
- Copy del CTA ("Obtener Guía" vs "Mejorar mi Negociación")
- Precio del E-book (USD 10 vs USD 15 vs USD 7)

---

**Documentado por**: Sprint 39 Implementation
**Fecha**: Enero 2026
**Versión**: 1.0
