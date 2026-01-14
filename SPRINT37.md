# Sprint 37: Simulador de Soft Skills - Auditoría Flash de Entrevistas

## 🎯 Objetivo del Sprint
Capturar leads calificados que tienen problemas para comunicar su valor técnico, a través de un simulador interactivo que evalúa sus respuestas a preguntas de entrevistas comportamentales estilo FAANG.

## 📋 Resumen de Implementación

### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `lib/soft-skills-analyzer.ts` | Motor de análisis IA con STAR Method Scorer, detección de patrones de comunicación y generación de Red Flags |
| `app/api/soft-skills/route.ts` | API REST para gestionar sesiones del simulador, análisis y desbloqueo de reportes |
| `app/soft-skills-simulator/page.tsx` | Landing page interactiva con chat, gráfica radar (Canvas) y funnel de conversión |
| `app/api/ceo/soft-skills-metrics/route.ts` | Métricas del simulador para el CEO Dashboard |

---

## 🚀 Flujo de Usuario

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                                │
│  "¿Superarías la entrevista de comportamiento en Google/Amazon?"   │
│                                                                     │
│  [🚀 Iniciar Simulación Gratis]                                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CHAT INTERACTIVO                               │
│                                                                     │
│  🎤 Pregunta 1: "Cuéntame sobre un conflicto técnico..."           │
│     Usuario responde → Feedback inmediato (word count, métricas)   │
│                                                                     │
│  🎤 Pregunta 2: "¿Qué haces con retraso crítico y cliente?"        │
│     Usuario responde → Análisis de tono y estructura                │
│                                                                     │
│  🎤 Pregunta 3: "Tu mayor error técnico y qué aprendiste"          │
│     Usuario responde → Genera reporte completo                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REPORTE CENSURADO                                │
│                                                                     │
│  📊 Gráfica Radar: Liderazgo, Comunicación, Conflictos, etc.       │
│  📈 Nivel General: "Colaborador Reactivo"                           │
│  🚨 Red Flags: "Tu respuesta mostró falta de liderazgo..." 🔒      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │  🔒 Ingresa tu email para desbloquear el análisis       │       │
│  │     [         tu@email.com         ] [Ver Reporte]      │       │
│  └─────────────────────────────────────────────────────────┘       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   REPORTE COMPLETO + UPSELLS                        │
│                                                                     │
│  ✅ Recomendaciones desbloqueadas                                   │
│  ✅ Soluciones para cada Red Flag                                   │
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┐                    │
│  │ Guía Soft    │ Auditoría CV │ Mentoría     │                    │
│  │ Skills $10   │ Premium $7   │ Express $15  │                    │
│  │ [47% OFF]    │              │              │                    │
│  └──────────────┴──────────────┴──────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### POST `/api/soft-skills`

| Action | Descripción | Params |
|--------|-------------|--------|
| `start` | Inicia nueva sesión del simulador | - |
| `answer` | Envía respuesta a una pregunta | `sessionId`, `questionId`, `answer` |
| `unlock` | Desbloquea reporte con email | `sessionId`, `email` |
| `analyze-single` | Análisis individual (debug) | `questionId`, `answer` |

### GET `/api/soft-skills`

| Action | Descripción |
|--------|-------------|
| `questions` | Lista de preguntas del simulador |
| `stats` | Estadísticas globales |

### GET `/api/ceo/soft-skills-metrics`

Métricas para el CEO Dashboard con KPIs del simulador.

---

## 📊 Métricas del Tablero de Comando (CEO)

| Métrica | Target | Significado |
|---------|--------|-------------|
| Response Depth | > 100 palabras | Usuario comprometido con el test |
| Red Flag Detection Rate | 60% | IA encuentra áreas de mejora (impulsa venta) |
| Lead-to-Ebook Conversion | > 12% | Usuarios que compran la guía tras ver fallos |
| Completion Rate | > 75% | Usuarios que terminan las 3 preguntas |

---

## 🧠 Análisis IA

### STAR Method Scoring
Evalúa si la respuesta contiene:
- **S**ituación: Contexto claro (cuándo, dónde, con quién)
- **T**area: Responsabilidad específica del candidato
- **A**cción: Pasos concretos en primera persona
- **R**esultado: Outcome medible o aprendizaje demostrable

### Patrones de Comunicación
- **Pasivo**: Evita conflicto, lenguaje tentativo ("creo que...")
- **Agresivo**: Culpa a otros, falta de autocrítica
- **Asertivo**: Toma responsabilidad, busca soluciones
- **Pasivo-Agresivo**: Crítica indirecta, evade responsabilidad

### Red Flags Detectados
- Culpar sistemáticamente a otros
- No mostrar aprendizaje de errores
- Falta de métricas o resultados concretos
- Respuestas genéricas sin ejemplos reales

---

## 🔄 Funnel de Ventas Integrado

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. SIMULADOR FREE                                                  │
│     Usuario descubre que comunica mal sus ideas                     │
│                           │                                         │
│                           ▼                                         │
│  2. CONVERSIÓN INMEDIATA                                           │
│     Guía de Soft Skills $10 (47% OFF)                              │
│     "Corrige tus Red Flags"                                        │
│                           │                                         │
│                           ▼                                         │
│  3. ORDER BUMP                                                      │
│     Auditoría de CV $7                                             │
│     "Alinea lo que dices con lo que escribes"                      │
│                           │                                         │
│                           ▼                                         │
│  4. UPSELL FINAL                                                   │
│     Mentoría Express 10 min $15                                    │
│     "Practica con un humano"                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes UI

### Gráfica Radar (Canvas)
- 6 dimensiones: Liderazgo, Comunicación, Conflictos, Resolución, EQ, Adaptabilidad
- Renderizado dinámico con Canvas API
- Animaciones suaves con Framer Motion

### Chat Interactivo
- Diseño tipo messenger
- Feedback inmediato por respuesta
- Indicadores de progreso
- Soporte Ctrl+Enter para enviar

### Estados del Simulador
1. `landing` - Landing page con CTA
2. `chat` - Interfaz de chat con preguntas
3. `results` - Reporte censurado (pre-email)
4. `unlock` - Reporte completo + upsells

---

## 🚦 Próximos Pasos

- [ ] Conectar con Supabase para persistir sesiones
- [ ] Implementar envío de email con resultados
- [ ] Agregar voice-to-text para respuestas
- [ ] A/B testing en copy del email wall
- [ ] Integrar con Stripe para checkout directo

---

## 📝 Testing

```bash
# Probar inicio de simulación
curl -X POST http://localhost:3000/api/soft-skills \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Probar envío de respuesta
curl -X POST http://localhost:3000/api/soft-skills \
  -H "Content-Type: application/json" \
  -d '{
    "action": "answer",
    "sessionId": "sim_xxx",
    "questionId": "q1_conflict",
    "answer": "En mi último proyecto tuve un desacuerdo con un compañero sobre la arquitectura..."
  }'

# Obtener métricas CEO
curl http://localhost:3000/api/ceo/soft-skills-metrics
```

---

## ✅ Criterios de Aceptación

- [x] Landing page con CTA "Iniciar Simulación Gratis"
- [x] 3 preguntas de entrevista comportamental
- [x] Análisis IA con STAR Method
- [x] Gráfica radar de competencias
- [x] Email wall para desbloquear reporte
- [x] Upsells integrados (Ebook, CV Audit, Mentoría)
- [x] Métricas para CEO Dashboard
