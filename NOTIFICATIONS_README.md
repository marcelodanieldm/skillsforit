# Sistema de Notificaciones Inteligentes - SkillsForIT

## 🎯 Resumen

El sistema de notificaciones inteligentes está diseñado para mantener el engagement del usuario a través del **Ciclo Virtuoso** de SkillsForIT, enviando notificaciones automáticas por email en momentos clave del journey del usuario.

## 📧 Tipos de Notificaciones

### 1. Feedback de Mentor
- **Trigger**: Cuando un mentor deja notas y tareas en una sesión
- **Timing**: Inmediato (background)
- **Destinatario**: Usuario (mentee)
- **Propósito**: Mantener momentum después de la sesión

### 2. Recordatorio de Sesión
- **Trigger**: Automático al crear sesión + 15 minutos antes
- **Timing**: 15 minutos antes de la sesión programada
- **Destinatario**: Usuario (mentee) y Mentor
- **Propósito**: Reducir no-shows y mejorar asistencia

### 3. Actualización de Career Score
- **Trigger**: Cuando el Career Score aumenta ≥5 puntos
- **Timing**: Inmediato
- **Destinatario**: Usuario
- **Propósito**: Celebrar progreso y motivar continuación

## 🏗️ Arquitectura

### Componentes Principales

#### 1. Templates HTML (`lib/notifications.ts`)
- `MENTOR_FEEDBACK_TEMPLATE`: Email responsive con branding SkillsForIT
- `SESSION_REMINDER_TEMPLATE`: Recordatorio urgente con CTA para unirse
- `CAREER_SCORE_UPDATE_TEMPLATE`: Celebración de progreso con score visual

#### 2. Sistema de Cola (`lib/notifications.ts`)
- **In-memory queue**: Para notificaciones inmediatas
- **Scheduled reminders**: Para recordatorios programados
- **Background processor**: Cron job cada minuto

#### 3. API Endpoints
- `POST /api/sessions/reminders`: Programar recordatorios manuales
- `GET /api/sessions/reminders`: Ver estado de recordatorios

#### 4. Integraciones Automáticas
- **Creación de sesión** (`/api/mentor/sessions`): Auto-programa recordatorio
- **Feedback de mentor** (`/api/mentor/notes`): Envía notificación inmediata
- **Career Score** (`/api/user/roadmap`): Detecta aumentos y notifica

### Flujo de Datos

```
Creación de Sesión → scheduleSessionReminder() → scheduledReminders[]
                    ↓
Background Processor → processNotificationQueue() → sendEmail()
                    ↓
SendGrid API → Email al usuario
```

## ⚙️ Configuración

### Variables de Entorno
```env
SENDGRID_API_KEY=your_sendgrid_api_key
ENABLE_NOTIFICATIONS=true  # Solo en producción
NEXT_PUBLIC_APP_URL=https://skillsforit.com
```

### Inicialización
El procesador se inicia automáticamente en `app/layout.tsx` vía `NotificationInitializer`.

## 🧪 Testing

### Script de Prueba
```bash
npx tsx scripts/test-notifications.ts
```

### Verificación Manual
1. Crear sesión → Verificar recordatorio programado en logs
2. Dejar feedback → Verificar email enviado
3. Completar tareas → Verificar notificación de score

## 📊 Métricas de Éxito

- **Tasa de apertura**: >40% (emails atractivos)
- **Reducción de no-shows**: >30% (recordatorios efectivos)
- **Aumento de engagement**: +20% (notificaciones motivadoras)
- **Retención de usuarios**: +15% (ciclo virtuoso)

## 🔧 Mantenimiento

### Monitoreo
- Logs del procesador cada minuto
- Estado de colas en memoria
- Errores de envío de email

### Limpieza
- Recordatorios procesados se limpian automáticamente
- Scores anteriores se actualizan en cada consulta

### Escalabilidad
- Para producción real: Migrar a Redis/database para persistencia
- Implementar rate limiting para evitar spam
- Agregar preferencias de usuario (email frequency)

## 🎨 Diseño de Emails

### Principios
- **Responsive**: Funciona en móvil y desktop
- **Branded**: Colores y logo SkillsForIT
- **Action-oriented**: CTAs claras y directas
- **Personalizado**: Nombre del usuario y contexto específico

### Templates
Todos los templates usan CSS inline para compatibilidad máxima con clientes de email.

## 🚀 Próximas Mejoras

1. **Preferencias de usuario**: Permitir configurar frecuencia de emails
2. **Analytics**: Tracking de aperturas y clicks
3. **A/B Testing**: Probar diferentes diseños y mensajes
4. **Push notifications**: Complementar con notificaciones web/app
5. **Recordatorios inteligentes**: Basados en patrones de comportamiento

---

*Este sistema mantiene el momentum del usuario en el journey de SkillsForIT, convirtiendo interacciones puntuales en engagement continuo.*