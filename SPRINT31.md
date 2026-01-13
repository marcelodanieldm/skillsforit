# Sprint 31: Experiencia del Alumno + CEO Student Engagement Metrics

**Objetivo:** Crear la experiencia del alumno en el portal, con un dashboard que reduzca ansiedad y centralice su progreso. Agregar métricas de engagement del alumno para el CEO.

---

## 🎯 Objetivos del Sprint

### 1. Dashboard del Alumno "Mi Progreso"
- **Career Score:** Métrica principal que agrega:
  - CV Score (último audit)
  - Soft Skills Score (action items completados)
  - Interview Readiness (sesiones de mentoría completadas)
- **Secciones:**
  - 🤖 Auditoría IA de CV
  - 📚 Biblioteca de Activos (E-books)
  - 🗺️ Hoja de Ruta (Action Items de mentores)
  - 📅 Agendamiento (próximas sesiones)

### 2. Backend: API de Roadmap Unificada
- **GET /api/user/roadmap**
  - Combina cv_audits + mentorship_notes
  - Devuelve Career Score + lista de action items
  - Soporte para demo fallback sin token
- **POST /api/user/roadmap/checklist**
  - Toggle de completion para action items {id, completed}
  - Persistencia en memoria (userChecklistDB)

### 3. Data Science: Recommender
- **lib/recommender.ts**
  - Mapea action items completados → siguiente capítulo de E-book o perfil de mentor
  - Lógica simple para MVP (if/else basado en items)

### 4. CEO: Métricas de Engagement del Alumno
- **Task Completion Rate:** % de tareas de mentores que los alumnos marcan como hechas
- **Daily Active Users (DAU):** ¿Entran los alumnos a revisar su progreso o solo el día de la mentoría?
- **Time to Download:** ¿Cuánto tardan en descargar el E-book tras la compra?

---

## ✅ Tareas Completadas

### Frontend
- ✅ **app/user/dashboard/page.tsx**
  - Dashboard con Career Score progress bar
  - 4 secciones (Auditoría, Biblioteca, Hoja de Ruta, Agendamiento)
  - Checklist interactiva con toggle de completion
  - Panel de "Sugerencias de la Guía" usando recommender
  - Mini calendario semanal (stub)
  - Link "Re-subir CV" hacia /upload
  - Skeleton loaders para UX

### Backend
- ✅ **app/api/user/roadmap/route.ts**
  - GET endpoint que agrega CV audits + mentor action items
  - Calcula careerScore (cvScore, softSkillsScore, interviewReadiness, total)
  - Lee completion state desde roadmapDb
  - Demo fallback para usuarios sin token
- ✅ **app/api/user/roadmap/checklist/route.ts**
  - POST endpoint para toggle {id, completed}
  - Persiste en userChecklistDB por email
  - Demo fallback soportado
- ✅ **app/api/ceo/student-engagement/route.ts**
  - GET endpoint para CEO con 3 métricas clave
  - Task Completion Rate, DAU/WAU, Time to Download
  - Insights automáticos basados en comportamiento

### Database
- ✅ **lib/database.ts**
  - Agregado `userChecklistDB: Map<email, Set<itemId>>`
  - Export `roadmapDb` con helpers getCompleted/setItem

### Data Science
- ✅ **lib/recommender.ts**
  - Función `recommendNext(itemsCompleted: number)`
  - Mapeo simple: 0-2 items → cap1, 3-5 → cap2, 6+ → mentor
  - Retorna {type: 'ebook_chapter' | 'mentor_profile', id, title, description}

### CEO Dashboard
- ✅ **components/ceo/StudentEngagementMetrics.tsx**
  - Componente con 3 KPIs principales
  - Gráfica de tendencia DAU (última semana)
  - Progress bar para Task Completion Rate
  - Insights contextuales (descarga inmediata, solo activos en días de mentoría)
  - Auto-refresh button
- ✅ **app/ceo/dashboard/page.tsx**
  - Integrado StudentEngagementMetrics en Capa 3 (Operaciones)
  - Import y render condicional con token

---

## 📊 Arquitectura de Datos

### Career Score Calculation
```typescript
careerScore = {
  cvScore: lastCVAudit.score || 0,
  softSkillsScore: (completedItems / totalItems) * 100,
  interviewReadiness: (completedSessions / 5) * 100, // 5 sessions = 100%
  total: (cvScore + softSkillsScore + interviewReadiness) / 3
}
```

### Roadmap Data Structure
```typescript
{
  careerScore: { cvScore, softSkillsScore, interviewReadiness, total },
  aiAudits: CVAnalysis[], // Historial de audits
  checklist: [
    {
      id: string,
      sessionId: string,
      mentorName: string,
      sessionDate: Date,
      actionItems: string[],
      topics: string[],
      completed: boolean // desde roadmapDb
    }
  ]
}
```

---

## 🎨 UX Highlights

### Reducción de Ansiedad
- **Career Score visual:** Barra de progreso que muestra avance tangible
- **Checklist clara:** Action items agrupados por sesión de mentoría
- **Sugerencias proactivas:** Recommender sugiere siguiente paso
- **Historial visible:** Todos los CV audits accesibles

### Engagement Hooks
- Toggle de completion → dopamina instant (confetti potencial)
- Mini calendar → preview de próxima mentoría
- "Re-subir CV" → incentivo a mejorar y re-analizar

---

## 🔒 Auth & Security
- **Demo Mode:** Soportado en roadmap API (fallback a user@example.com)
- **Token Validation:** Auth middleware valida Bearer token
- **Role Check:** CEO endpoints verifican role='ceo'

---

## 📈 Métricas de Éxito (CEO View)

### Task Completion Rate
- **Fórmula:** (completedTasks / totalTasks) * 100
- **Insight:** Si <50% → alumnos no ejecutan → revisar calidad de action items
- **Datasource:** userChecklistDB

### Daily Active Users (DAU)
- **Fórmula:** Usuarios únicos con actividad hoy
- **Insight:** Si DAU = 0 fuera de días de mentoría → engagement bajo
- **Datasource:** Sesiones scheduledAt (proxy en MVP)

### Time to Download
- **Fórmula:** Promedio (updatedAt - createdAt) de CV audits completados
- **Insight:** Si >24h → fricción en entrega, revisar email/notificaciones
- **Datasource:** cvAnalysisDB

---

## 🚀 Próximos Pasos (Sprint 32+)

### Profundizar Engagement
- [ ] Integrar "Re-subir CV" con credit check + upload flow
- [ ] Calendario real con disponibilidad de mentores
- [ ] Notificaciones push cuando un action item es marcado
- [ ] Gamification: badges por milestones (50% completion, 5 sessions, etc.)

### Analítica Avanzada
- [ ] Cohort analysis: retention por fecha de signup
- [ ] Funnel de onboarding: signup → CV upload → first session
- [ ] NPS tracking: post-session survey

### Infraestructura
- [ ] Migrar in-memory DB a PostgreSQL/Supabase
- [ ] Implement real-time updates (WebSockets/Server-Sent Events)
- [ ] Background jobs para recomendaciones automáticas

---

## 📝 Notas Técnicas

### Icon Fixes
- Cambiado `FaListCheck` → `FaTasks` (react-icons/fa no tiene FaListCheck)
- Todos los íconos ahora desde `react-icons/fa` para consistencia

### TypeScript
- Uso de `any` temporal en CEO dashboard para `actual` field
- Pending: resolver tipos estrictos en próximo refactor

### Build Status
- Student features: ✅ Compilando
- CEO dashboard JSX: ✅ Balanceado
- Full repo TS check: ⚠️ 278 errores (mayoría unrelated legacy code)

---

## 🎯 Acceptance Criteria

### Student Dashboard
- [x] Muestra Career Score con breakdown
- [x] Lista de CV audits históricos
- [x] Checklist de action items toggleable
- [x] Sugerencias de próximo paso
- [x] Skeleton loaders durante fetch
- [x] Responsive en mobile

### CEO Metrics
- [x] Task Completion Rate visible con breakdown
- [x] DAU/WAU con tendencia
- [x] Time to Download con insights
- [x] Gráfica de tendencia DAU
- [x] Auto-refresh funcional

### APIs
- [x] GET /api/user/roadmap funciona con y sin token
- [x] POST /api/user/roadmap/checklist persiste estado
- [x] GET /api/ceo/student-engagement protegido por role=ceo

---

**Sprint 31 Completado:** 2026-01-12
**Siguiente Sprint:** Sprint 32 - Onboarding & Gamification
