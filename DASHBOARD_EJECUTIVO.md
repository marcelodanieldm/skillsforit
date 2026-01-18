# Dashboard Ejecutivo de 360° - SkillsForIT

## 📊 Vista General

El **Dashboard Ejecutivo** proporciona una visión completa y en tiempo real de los tres pilares fundamentales del negocio:

1. **Métricas de Crecimiento** - Salud financiera y adquisición de usuarios
2. **Métricas de Infraestructura** - Performance técnico y costos operativos
3. **Métricas de Producto** - Satisfacción y éxito del usuario

**Ruta:** `/dashboard/ceo`  
**Acceso:** Solo administradores (role='admin')

---

## 🎯 Pilar 1: Métricas de Crecimiento

### CAC (Customer Acquisition Cost)

**Definición:** Costo promedio para adquirir un nuevo cliente pagador.

**Cálculo:**
```
CAC = (Gastos de Marketing + Gastos de Ventas) / Número de Clientes Adquiridos
```

**Valor Actual:** $45.50  
**Tendencia:** -12.5% (mejora vs mes anterior)

**Interpretación:**
- **< $50:** Excelente - adquisición eficiente
- **$50-$100:** Bueno - sostenible con márgenes saludables
- **> $100:** Atención - revisar estrategia de marketing

**Acciones:**
- Optimizar campañas de paid ads
- Aumentar tráfico orgánico (SEO, contenido)
- Programa de referidos

---

### LTV (Lifetime Value)

**Definición:** Valor total que genera un cliente durante toda su relación con la empresa.

**Cálculo:**
```
LTV = (Ingresos Mensuales por Cliente × Margen de Beneficio) × Tiempo de Vida Promedio
```

**Valor Actual:** $380.00  
**Tendencia:** +18.3% (crecimiento vs mes anterior)

**Interpretación:**
- **LTV/CAC Ratio:**
  - **< 1x:** Negocio insostenible
  - **1-3x:** Crecimiento lento
  - **> 3x:** Crecimiento saludable ✅ (Actual: **8.35x**)

**Acciones:**
- Aumentar retención de clientes
- Upselling de planes premium
- Reducir churn con mejor onboarding

---

### Churn Rate (Tasa de Cancelación)

**Definición:** Porcentaje de clientes que cancelan su suscripción cada mes.

**Cálculo:**
```
Churn = (Clientes Cancelados / Total Clientes al Inicio del Mes) × 100
```

**Valor Actual:** 4.2%  
**Tendencia:** -8.7% (reducción es positivo)

**Interpretación:**
- **< 5%:** Excelente retención ✅
- **5-7%:** Aceptable para SaaS B2C
- **> 7%:** Problema - investigar causas

**Causas Comunes de Churn:**
1. Falta de valor percibido
2. Problemas de usabilidad
3. Precio alto vs competencia
4. Falta de engagement

**Acciones:**
- Encuestas de cancelación
- Win-back campaigns
- Mejorar onboarding (reducir "time to value")

---

### Viral K-Factor

**Definición:** Número de nuevos usuarios que cada usuario existente invita exitosamente.

**Cálculo:**
```
K-Factor = (Invitaciones por Usuario) × (Tasa de Conversión de Invitación)
```

**Valor Actual:** 1.3  
**Tendencia:** +22.1% (crecimiento viral acelerado)

**Interpretación:**
- **K < 1:** Crecimiento no viral (necesita inversión continua)
- **K = 1:** Crecimiento lineal (cada usuario trae 1 nuevo)
- **K > 1:** Crecimiento exponencial ✅ (Actual: **1.3**)

**Ejemplo:**
- 1000 usuarios iniciales
- Mes 1: 1000 × 1.3 = 1300 nuevos = 2300 totales
- Mes 2: 2300 × 1.3 = 2990 nuevos = 5290 totales
- Mes 3: 5290 × 1.3 = 6877 nuevos = 12,167 totales

**Acciones:**
- Incentivar compartir (descuentos por referidos)
- Mejorar flujo de invitación (1-click invite)
- Gamificación de referidos

---

## 🖥️ Pilar 2: Métricas de Infraestructura

### AI Response Time (Tiempo de Respuesta de IA)

**Definición:** Tiempo promedio desde que el usuario hace una pregunta hasta que recibe la respuesta de la IA.

**Valor Actual:** 850ms  
**Tendencia:** -15.2% (mejora en velocidad)

**Objetivos:**
- **< 1000ms:** Aceptable ✅
- **< 500ms:** Excelente
- **> 2000ms:** Problema - frustración del usuario

**Componentes del Tiempo:**
```
Total = Network Latency + Queue Time + Model Inference + Post-processing
       (50ms)         + (100ms)     + (650ms)        + (50ms)
```

**Optimizaciones:**
- Usar modelos más rápidos (GPT-3.5 vs GPT-4)
- Caching de respuestas comunes
- Streaming de respuestas (mostrar tokens progresivamente)
- Edge functions más cerca del usuario

---

### Edge Function Latency (Latencia de Edge Functions)

**Definición:** Tiempo de respuesta de las funciones serverless desplegadas en el edge (cerca del usuario).

**Valor Actual:** 120ms  
**Tendencia:** -8.5% (mejora)

**Objetivos:**
- **< 150ms:** Excelente ✅
- **150-300ms:** Aceptable
- **> 300ms:** Problema - considerar CDN

**Distribución Global:**
- Europa: 90ms
- América del Norte: 110ms
- América Latina: 150ms
- Asia: 200ms

**Acciones:**
- Aumentar regiones de edge deployment
- Optimizar cold start (pre-warming)
- Reducir tamaño de bundles

---

### Cost Per Token (Costo por Token)

**Definición:** Costo promedio en USD por cada 1,000 tokens procesados por la IA.

**Valor Actual:** $0.0012 por token ($1.20 por 1k tokens)  
**Tendencia:** -3.2% (reducción de costos)

**Cálculo de Costo Mensual:**
```
Costo Total = Tokens Usados × Costo por Token
            = 2,500,000 × $0.0012
            = $3,000
```

**Distribución por Servicio:**
- **CV Analysis (45%):** 1,125,000 tokens = $1,350
- **Mentorship (30%):** 750,000 tokens = $900
- **Interview Prep (15%):** 375,000 tokens = $450
- **Other (10%):** 250,000 tokens = $300

**Optimizaciones:**
- Usar modelos más baratos cuando sea apropiado
- Prompt engineering (menos tokens por request)
- Caching de respuestas repetidas
- Batching de requests

---

### Infrastructure Cost (Costo Total de Infraestructura)

**Definición:** Costo mensual total de infraestructura cloud (hosting, base de datos, CDN, etc).

**Valor Actual:** $3,200/mes  
**Tendencia:** -2.5% (optimización continua)

**Desglose:**
```
AI Tokens:        $3,000 (93.75%)
Hosting (Vercel): $100   (3.13%)
Database:         $50    (1.56%)
CDN/Storage:      $30    (0.94%)
Monitoring:       $20    (0.62%)
```

**Costo por Usuario:**
```
Costo por Usuario Activo = $3,200 / 14,400 usuarios = $0.22/usuario/mes
```

**Margen Operativo:**
```
Ingreso promedio:  $12/usuario/mes
Costo variable:    $0.22/usuario/mes
Margen bruto:      $11.78 (98.2%) ✅
```

---

## ⭐ Pilar 3: Métricas de Producto

### Mentor NPS (Net Promoter Score)

**Definición:** Métrica de lealtad que mide qué tan probable es que un usuario recomiende el servicio de mentoría.

**Cálculo:**
```
NPS = % Promotores (9-10) - % Detractores (0-6)
    = 58% - 10%
    = 68
```

**Valor Actual:** 68  
**Tendencia:** +12.5%

**Interpretación:**
- **< 0:** Más detractores que promotores - problema serio
- **0-30:** Zona de mejora
- **30-70:** Bueno - usuarios satisfechos ✅
- **> 70:** Excelente - clase mundial

**Distribución:**
- **Promotores (9-10):** 58% - usuarios leales que recomiendan activamente
- **Pasivos (7-8):** 32% - satisfechos pero no entusiastas
- **Detractores (0-6):** 10% - insatisfechos, pueden dañar reputación

**Acciones:**
- Convertir pasivos en promotores (gamificación, incentivos)
- Reducir detractores (encuestas, mejoras de UX)
- Amplificar voz de promotores (testimonios, casos de éxito)

---

### Audit Success Rate (Tasa de Éxito de Auditoría)

**Definición:** Porcentaje de usuarios que consiguen al menos una entrevista después de usar el servicio de auditoría de CV.

**Valor Actual:** 42.5%  
**Tendencia:** +15.8% (mejora significativa)

**Interpretación:**
- **< 20%:** Producto no validado - revisar propuesta de valor
- **20-40%:** Bueno - producto funciona
- **> 40%:** Excelente - fuerte product-market fit ✅

**Funnel de Conversión:**
```
100 usuarios completan auditoría
  ↓
85 aplican a trabajos (85%)
  ↓
52 reciben respuesta (61%)
  ↓
42.5 consiguen entrevista (50% de los que reciben respuesta)
  ↓
18 reciben oferta (42% de los entrevistados)
```

**Factores de Éxito:**
- Calidad de recomendaciones de IA
- Personalización por industria/país
- Follow-up con mentores
- Red de empresas partners

**Acciones:**
- A/B testing de recomendaciones
- Mejorar algoritmo de matching
- Expandir red de empresas partners
- Seguimiento automatizado (email nurturing)

---

### Average Time to Interview (Tiempo Promedio a Entrevista)

**Definición:** Número de días promedio desde que un usuario completa la auditoría hasta que consigue su primera entrevista.

**Valor Actual:** 18 días  
**Tendencia:** -22.3% (reducción es positivo)

**Interpretación:**
- **< 14 días:** Excelente velocidad ✅ (objetivo)
- **14-30 días:** Aceptable
- **> 30 días:** Lento - frustración del usuario

**Benchmark por Industria:**
- **Tech/Startup:** 12 días
- **Corporativo:** 25 días
- **Gobierno:** 45 días

**Acciones:**
- Fast-track con empresas partners
- Automatizar aplicaciones (bot de LinkedIn)
- Notificaciones de nuevas ofertas
- Webinars de preparación grupal

---

### User Satisfaction (Satisfacción General del Usuario)

**Definición:** Calificación promedio de satisfacción general con toda la plataforma (escala 1-5).

**Valor Actual:** 4.6/5.0  
**Tendencia:** +8.2%

**Interpretación:**
- **< 3.5:** Problema serio de producto
- **3.5-4.0:** Aceptable - hay margen de mejora
- **4.0-4.5:** Bueno - usuarios satisfechos
- **> 4.5:** Excelente - producto de calidad ✅

**Desglose por Componente:**
```
CV Analysis:      4.8/5.0 ⭐⭐⭐⭐⭐
Mentorship:       4.7/5.0 ⭐⭐⭐⭐⭐
Interview Prep:   4.5/5.0 ⭐⭐⭐⭐
Platform UX:      4.4/5.0 ⭐⭐⭐⭐
Support:          4.2/5.0 ⭐⭐⭐⭐
```

**Factores de Satisfacción:**
1. Velocidad de respuesta de IA
2. Calidad de recomendaciones
3. Disponibilidad de mentores
4. Facilidad de uso
5. Precio/valor percibido

---

## 📈 Resumen Ejecutivo

### Fuentes de Adquisición

**Distribución de Usuarios por Canal:**

1. **Orgánico (45%)** - SEO, contenido, palabra de boca
   - Costo: $0
   - CAC: $0
   - LTV: $420
   - ROI: ∞

2. **Referidos (30%)** - Programa de referidos
   - Costo: $5/referido (descuento)
   - CAC: $5
   - LTV: $380
   - ROI: 76x

3. **Paid Ads (15%)** - Google Ads, Facebook Ads
   - Costo: $150/cliente
   - CAC: $150
   - LTV: $320
   - ROI: 2.13x

4. **Partnerships (10%)** - Bootcamps, universidades
   - Costo: $80/cliente (comisión)
   - CAC: $80
   - LTV: $400
   - ROI: 5x

**Recomendación:** Duplicar inversión en canales orgánicos y de referidos (ROI alto), optimizar paid ads (ROI bajo).

---

### Top 5 Países por Revenue

| País | Usuarios | Revenue Mensual | Satisfacción | CAC | LTV |
|------|----------|-----------------|--------------|-----|-----|
| 🇪🇸 España | 4,500 | $12,500 | 4.7 | $42 | $380 |
| 🇲🇽 México | 3,200 | $8,900 | 4.5 | $38 | $350 |
| 🇦🇷 Argentina | 2,800 | $7,200 | 4.6 | $35 | $320 |
| 🇨🇴 Colombia | 2,100 | $5,800 | 4.4 | $40 | $340 |
| 🇨🇱 Chile | 1,800 | $5,200 | 4.6 | $45 | $370 |

**Total:** 14,400 usuarios | $39,600 revenue mensual

**Insights:**
- España es el mercado más maduro (mayor ARPU: $2.78/usuario)
- México tiene mejor CAC ($38) pero menor LTV
- Argentina tiene alto engagement pero menor poder adquisitivo

**Expansión Recomendada:**
1. Perú (8M población target, mercado sub-servido)
2. Brasil (20M población target, necesita LGPD compliance ✅)
3. Portugal (similar a España, menor competencia)

---

## 💡 Insights Clave y Recomendaciones

### 🚀 Crecimiento Viral (K-Factor 1.3)

**Situación Actual:**
- Cada usuario trae 1.3 nuevos usuarios
- Crecimiento exponencial sin aumentar marketing spend
- Período de duplicación: ~2.5 meses

**Cálculo de Proyección:**
```
Mes 0:  14,400 usuarios
Mes 1:  14,400 × 1.3 = 18,720 (+ 4,320)
Mes 2:  18,720 × 1.3 = 24,336 (+ 5,616)
Mes 3:  24,336 × 1.3 = 31,637 (+ 7,301)
```

**Acciones para Aumentar K-Factor:**
1. **Gamificación de Referidos:**
   - Badge especial "Talent Scout" por 5 referidos
   - Leaderboard mensual con premios
   
2. **Incentivos de Doble Cara:**
   - Referidor: 1 mes gratis
   - Nuevo usuario: 50% descuento primer mes
   
3. **Compartir Resultados:**
   - LinkedIn share de CV score mejorado
   - "Mi CV mejoró 35 puntos con @SkillsForIT"

---

### ⚡ Infraestructura Optimizada

**Situación Actual:**
- AI Response Time: 850ms (-15.2%)
- Edge Latency: 120ms (-8.5%)
- Costo/Token: $0.0012 (-3.2%)

**Impacto en Negocio:**
- **Velocidad = Satisfacción:** Cada 100ms de reducción = +2% conversión
- **Costo Optimizado:** Ahorro de $100/mes permite 83 usuarios gratis

**Próximas Optimizaciones:**
1. **Streaming Responses:**
   - Mostrar tokens progresivamente
   - Percepción de velocidad +40%
   
2. **Smart Caching:**
   - Cache respuestas comunes (reduce tokens 20%)
   - Invalidación inteligente por contexto
   
3. **Model Switching:**
   - GPT-3.5 para queries simples (70% más barato)
   - GPT-4 solo para análisis complejos

---

### ✅ Producto Validado (42.5% Success Rate)

**Situación Actual:**
- 42.5% de usuarios consiguen entrevista
- Tiempo promedio: 18 días
- NPS: 68 (clase mundial)

**Validación de Product-Market Fit:**
- **> 40% success rate** indica fuerte valor percibido
- **NPS > 50** indica usuarios promotores activos
- **LTV/CAC > 3x** indica negocio sostenible

**Casos de Éxito Documentados:**
```
María (España): CV score 72 → 94 → 3 entrevistas → Hired en 12 días
Juan (México): CV score 68 → 89 → 2 entrevistas → Hired en 15 días
Laura (Chile): CV score 75 → 92 → 4 entrevistas → Hired en 10 días
```

**Expansión Recomendada:**
1. **B2B para Bootcamps:**
   - Licencia por alumno: $5/mes
   - Target: 50 bootcamps × 200 alumnos = 10,000 usuarios
   - MRR: $50,000
   
2. **White Label para Universidades:**
   - Customización de marca
   - Integración con LMS
   - Precio: $15,000/año por universidad

3. **Enterprise para RR.HH.:**
   - Herramienta de screening de candidatos
   - API para ATS integration
   - Precio: $500/mes + $0.50/análisis

---

## 🎯 OKRs (Objectives and Key Results)

### Q1 2026

**Objective 1: Acelerar Crecimiento Viral**
- KR1: Aumentar K-Factor de 1.3 a 1.5 (+15%)
- KR2: Implementar programa de referidos gamificado
- KR3: Reducir CAC de $45 a $35 (-22%)

**Objective 2: Optimizar Infraestructura**
- KR1: Reducir AI Response Time de 850ms a 700ms (-18%)
- KR2: Reducir Costo/Token de $0.0012 a $0.0010 (-17%)
- KR3: Mantener Uptime > 99.9%

**Objective 3: Mejorar Producto**
- KR1: Aumentar Success Rate de 42.5% a 50% (+18%)
- KR2: Reducir Time to Interview de 18 a 14 días (-22%)
- KR3: Aumentar NPS de 68 a 75 (+10%)

**Objective 4: Expansión B2B**
- KR1: Firmar 5 bootcamps partners (pilot)
- KR2: $25,000 MRR de B2B
- KR3: 2,500 usuarios B2B activos

---

## 📊 Uso del Dashboard

### Acceso

**URL:** `/dashboard/ceo`

**Requisitos:**
- Usuario autenticado con `role='admin'`
- Permisos de administrador en la plataforma

### Filtros de Tiempo

El dashboard permite filtrar métricas por período:

- **7 días:** Vista semanal para decisiones tácticas
- **30 días:** Vista mensual para análisis de tendencias (por defecto)
- **90 días:** Vista trimestral para OKRs
- **1 año:** Vista anual para estrategia

### Exportación

**Botón "Exportar PDF":**
- Genera reporte ejecutivo en PDF
- Incluye todos los gráficos y métricas actuales
- Útil para compartir con inversores o board

**Contenido del PDF:**
1. Resumen ejecutivo (1 página)
2. Métricas de crecimiento (2 páginas)
3. Métricas de infraestructura (1 página)
4. Métricas de producto (2 páginas)
5. Insights y recomendaciones (1 página)

### Actualización de Datos

**Frecuencia:**
- Métricas de crecimiento: Actualización diaria (4am UTC)
- Métricas de infraestructura: Tiempo real
- Métricas de producto: Actualización cada 6 horas

**Fuentes de Datos:**
```typescript
// Growth Metrics
fetch('/api/analytics/growth')

// Infrastructure Metrics
fetch('/api/analytics/infrastructure')

// Product Metrics
fetch('/api/analytics/product')
```

---

## 🔧 Implementación Técnica

### Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS

- **Animaciones:** Framer Motion
- **Iconos:** React Icons
- **Datos:** APIs RESTful (real-time + cache)

### Componentes Reutilizables

```typescript
// MetricCard - Tarjeta de métrica individual
<MetricCard
  title="CAC"
  subtitle="Customer Acquisition Cost"
  value="$45.50"
  trend={-12.5}
  icon={<FaDollarSign />}
  iconColor="bg-green-100 text-green-600"
  inverseGood={true}
/>

// UsageBar - Barra de uso/progreso
<UsageBar
  label="CV Analysis"
  percentage={45}
  color="bg-blue-500"
/>

// PerformanceIndicator - Indicador de performance vs objetivo
<PerformanceIndicator
  label="AI Response Time"
  current={850}
  target={1000}
  unit="ms"
  lowerIsBetter={true}
/>
```

### APIs Necesarias

**1. Growth Metrics API**
```typescript
// GET /api/analytics/growth?timeRange=30d
{
  cac: 45.50,
  cacTrend: -12.5,
  ltv: 380.00,
  ltvTrend: 18.3,
  churn: 4.2,
  churnTrend: -8.7,
  viralKFactor: 1.3,
  viralTrend: 22.1
}
```

**2. Infrastructure Metrics API**
```typescript
// GET /api/analytics/infrastructure?timeRange=30d
{
  aiResponseTime: 850,
  aiResponseTrend: -15.2,
  edgeFunctionLatency: 120,
  edgeLatencyTrend: -8.5,
  costPerToken: 0.0012,
  costPerTokenTrend: -3.2,
  totalTokensUsed: 2500000,
  infrastructureCost: 3200
}
```

**3. Product Metrics API**
```typescript
// GET /api/analytics/product?timeRange=30d
{
  mentorNPS: 68,
  mentorNPSTrend: 12.5,
  auditSuccessRate: 42.5,
  auditSuccessTrend: 15.8,
  avgTimeToInterview: 18,
  interviewTimeTrend: -22.3,
  userSatisfaction: 4.6,
  satisfactionTrend: 8.2
}
```

**4. Historical Data API**
```typescript
// GET /api/analytics/historical?timeRange=90d
[
  {
    month: 'Jul',
    cac: 65,
    ltv: 280,
    churn: 6.5,
    nps: 52,
    successRate: 28
  },
  // ...
]
```

---

## 📱 Responsive Design

El dashboard es completamente responsive:

- **Desktop (> 1024px):** Layout de 4 columnas, gráficos grandes
- **Tablet (768-1024px):** Layout de 2 columnas, gráficos medianos
- **Mobile (< 768px):** Layout de 1 columna, gráficos compactos

**Optimizaciones Móviles:**
- Scroll horizontal en tablas
- Gráficos con tooltips táctiles
- Botones grandes para touch
- Filtros de tiempo apilados verticalmente

---

## 🚀 Próximos Pasos

### Fase 2: Predictive Analytics

1. **Forecasting de Métricas:**
   - Predicción de CAC para próximos 3 meses
   - Proyección de churn con ML
   - Forecast de revenue con Prophet/ARIMA

2. **Alertas Inteligentes:**
   - Email/Slack cuando métrica cruza umbral
   - Notificación de anomalías (spike de churn)
   - Sugerencias automáticas de acción

3. **Cohort Analysis:**
   - Retención por cohorte de registro
   - LTV por canal de adquisición
   - Segmentación por comportamiento

### Fase 3: Benchmarking

1. **Comparación con Industria:**
   - CAC vs promedio SaaS B2C ($50-$200)
   - NPS vs competidores (Talent Hackers, Torre)
   - Success Rate vs bootcamps tradicionales

2. **Competencia:**
   - Monitor de precios de competidores
   - Feature comparison matrix
   - Market share analysis

---

## 📚 Referencias

- [SaaS Metrics 2.0 - David Skok](https://www.forentrepreneurs.com/saas-metrics-2/)
- [The Ultimate Guide to SaaS Metrics - ChartMogul](https://chartmogul.com/saas-metrics)
- [Product-Market Fit Survey - Sean Ellis](https://pmfsurvey.com/)
- [NPS Benchmarks by Industry - Retently](https://www.retently.com/nps-benchmarks/)

---

## 🎓 Glosario

- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value
- **Churn:** Tasa de cancelación
- **K-Factor:** Coeficiente viral (usuarios generados por usuario)
- **NPS:** Net Promoter Score
- **MRR:** Monthly Recurring Revenue
- **ARPU:** Average Revenue Per User
- **Cohort:** Grupo de usuarios con característica común
- **Funnel:** Embudo de conversión
- **OKR:** Objectives and Key Results
