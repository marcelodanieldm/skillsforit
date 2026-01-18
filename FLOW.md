# 📊 Diagrama de Flujo del Servicio - SkillsForIT

## 🎯 Flujo Principal de Usuario

```mermaid
flowchart TD
    A[🏠 Landing Page] --> B{¿Qué servicio elige?}
    
    B -->|Auditoría de CV| C[📝 Formulario CV]
    B -->|Mentoría 1:1| D[👨‍🏫 Explorar Mentores]
    
    C --> E[Ingresa Datos]
    E --> E1[País: Dropdown]
    E --> E2[Rol IT: Dropdown]
    E --> E3[Propósito: Texto]
    E --> E4[📎 Subir archivo CV]
    
    E4 --> F[🛒 Carrito]
    F --> F1[💰 Precio: USD $7]
    F --> F2[📚 Upsell: E-book Sugerido]
    
    F2 --> G{¿Acepta E-book?}
    G -->|Sí| H[Total: $7 + E-book]
    G -->|No| I[Total: $7]
    
    H --> J[💳 Stripe Checkout]
    I --> J
    
    J --> K{¿Pago exitoso?}
    K -->|No| L[❌ Error de Pago]
    L --> F
    
    K -->|Sí| M[✅ Webhook Stripe]
    M --> N[💾 Registrar en BD]
    N --> N1[Guardar Email]
    N --> N2[Segmentar Servicio]
    N --> N3[Crear Registro CV]
    
    N3 --> O[🔄 Pantalla: Generando Reporte...]
    O --> P[🤖 OpenAI GPT-4]
    P --> P1[Analiza CV]
    P --> P2[Score ATS]
    P --> P3[Recomendaciones]
    
    P3 --> Q[📄 Generar PDF]
    Q --> R[📧 Enviar por Email]
    R --> S[✅ Descarga Disponible]
    S --> T[👤 Dashboard Usuario]
    T --> T1[Ver Análisis]
    T --> T2[Descargar PDF]
    T --> T3[Historial]
    
    D --> U[📋 Lista de Mentores]
    U --> V[Ver Perfil Mentor]
    V --> V1[Bio y Experiencia]
    V --> V2[Expertise Areas]
    V --> V3[⭐ Rating & Reviews]
    V --> V4[💵 Tarifa/hora]
    
    V4 --> W{¿Selecciona Mentor?}
    W -->|No| U
    W -->|Sí| X[📅 Ver Disponibilidad]
    
    X --> Y[Seleccionar Fecha/Hora]
    Y --> Z[🛒 Confirmar Reserva]
    Z --> AA[💳 Stripe Checkout]
    
    AA --> AB{¿Pago exitoso?}
    AB -->|No| AC[❌ Error de Pago]
    AC --> Z
    
    AB -->|Sí| AD[✅ Webhook Stripe]
    AD --> AE[💾 Registrar Sesión]
    AE --> AE1[Guardar Email]
    AE --> AE2[Crear Sesión]
    AE --> AE3[Generar Meeting Link]
    
    AE3 --> AF[📧 Email Confirmación]
    AF --> AF1[Link de Zoom/Meet]
    AF --> AF2[Fecha y Hora]
    AF --> AF3[Datos del Mentor]
    
    AF3 --> AG[👤 Dashboard Mentee]
    AG --> AG1[Sesiones Programadas]
    AG --> AG2[Unirse a Reunión]
    AG --> AG3[Historial]
    
    AF3 --> AH[👨‍🏫 Dashboard Mentor]
    AH --> AH1[Ver Sesiones]
    AH --> AH2[📝 Ver Notas Previas]
    AH --> AH3[Iniciar Reunión]
    
    AH3 --> AI[💬 Sesión 10 min]
    AI --> AJ[✍️ Tomar Notas]
    AJ --> AJ1[Temas Discutidos]
    AJ --> AJ2[Action Items]
    AJ --> AJ3[Próximos Pasos]
    
    AJ3 --> AK[💾 Guardar Notas]
    AK --> AL[✅ Sesión Completada]
    AL --> AG
    AL --> AH

    style A fill:#818cf8,stroke:#4f46e5,stroke-width:3px,color:#fff
    style B fill:#f59e0b,stroke:#d97706,stroke-width:2px
    style J fill:#10b981,stroke:#059669,stroke-width:2px
    style AA fill:#10b981,stroke:#059669,stroke-width:2px
    style P fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px
    style Q fill:#ec4899,stroke:#db2777,stroke-width:2px
    style S fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    style AL fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
```

## 🔄 Flujos Detallados por Servicio

### 1️⃣ Auditoría de CV (CV Analysis Flow)

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant LP as 🏠 Landing Page
    participant Form as 📝 Formulario
    participant Cart as 🛒 Carrito
    participant Stripe as 💳 Stripe
    participant Webhook as 🔔 Webhook
    participant DB as 💾 Database
    participant AI as 🤖 OpenAI
    participant PDF as 📄 PDF Gen
    participant Email as 📧 Email
    participant Dash as 👤 Dashboard

    U->>LP: Visita sitio
    LP->>U: Muestra servicios
    U->>Form: Selecciona "Auditoría CV"
    Form->>U: Solicita datos
    U->>Form: País, Rol IT, Propósito
    U->>Form: Sube archivo CV
    Form->>Cart: Crea carrito ($7)
    Cart->>U: Muestra upsell (E-book)
    U->>Cart: Decide sobre E-book
    Cart->>Stripe: Redirige a checkout
    U->>Stripe: Ingresa datos de pago
    Stripe->>Webhook: Envía evento (payment_success)
    Webhook->>DB: Registra email y servicio
    Webhook->>DB: Crea registro CV Analysis
    Webhook->>AI: Envía CV para análisis
    AI->>AI: Procesa con GPT-4
    AI->>Webhook: Retorna análisis
    Webhook->>PDF: Genera reporte PDF
    PDF->>Email: Envía PDF por correo
    Email->>U: Email con PDF adjunto
    Webhook->>Dash: Actualiza dashboard
    Dash->>U: Muestra análisis disponible
    U->>Dash: Descarga PDF / Ver análisis
```

### 2️⃣ Mentoría 1:1 (Mentorship Flow)

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant LP as 🏠 Landing Page
    participant ML as 📋 Lista Mentores
    participant MP as 👨‍🏫 Perfil Mentor
    participant Cal as 📅 Calendario
    participant Stripe as 💳 Stripe
    participant Webhook as 🔔 Webhook
    participant DB as 💾 Database
    participant Email as 📧 Email
    participant Meet as 🔗 Meeting Link
    participant MentorD as 🎯 Dashboard Mentor
    participant MenteeD as 👤 Dashboard Mentee

    U->>LP: Visita sitio
    LP->>U: Muestra servicios
    U->>ML: Selecciona "Mentoría"
    ML->>U: Lista de mentores disponibles
    U->>MP: Ve perfil de mentor
    MP->>U: Muestra bio, expertise, rating, tarifa
    U->>MP: Selecciona mentor
    MP->>Cal: Muestra disponibilidad
    U->>Cal: Selecciona fecha/hora
    Cal->>Stripe: Crea checkout (tarifa variable)
    U->>Stripe: Completa pago
    Stripe->>Webhook: Envía evento (payment_success)
    Webhook->>DB: Registra sesión
    Webhook->>Meet: Genera link de reunión
    Webhook->>Email: Envía confirmación
    Email->>U: Email con detalles y link
    Email->>MP: Email a mentor con detalles
    Webhook->>MenteeD: Actualiza dashboard
    Webhook->>MentorD: Actualiza dashboard
    
    Note over MentorD,MenteeD: Día de la sesión
    
    U->>MenteeD: Accede a dashboard
    MenteeD->>U: Muestra sesión programada
    MP->>MentorD: Accede a dashboard
    MentorD->>MP: Muestra notas previas
    MentorD->>MP: Muestra sesión actual
    U->>Meet: Inicia reunión (10 min)
    MP->>Meet: Se une a reunión
    
    Note over U,MP: Sesión de 10 minutos
    
    MP->>MentorD: Toma notas durante sesión
    MentorD->>DB: Guarda notas (temas, action items)
    DB->>MentorD: Confirma guardado
    MentorD->>MenteeD: Actualiza estado (completada)
    MenteeD->>U: Muestra sesión completada
```

## 🎨 Componentes del Sistema

### Frontend (Next.js 14)
```mermaid
graph LR
    A[Landing Page] --> B[CV Analysis Form]
    A --> C[Mentor Browse]
    B --> D[Stripe Checkout]
    C --> E[Mentor Profile]
    E --> F[Calendar]
    F --> D
    D --> G[Dashboard Usuario]
    G --> H[CV Results]
    G --> I[Mentorship Sessions]
```

### Backend (API Routes)
```mermaid
graph TD
    A[API Routes] --> B[/api/webhook]
    A --> C[/api/analyze]
    A --> D[/api/admin/analytics]
    A --> E[/api/mentors]
    A --> F[/api/sessions]
    
    B --> G[Stripe Events]
    C --> H[OpenAI Integration]
    D --> I[Revenue Analytics]
    E --> J[Mentor Management]
    F --> K[Session Management]
```

### Base de Datos (In-Memory)
```mermaid
erDiagram
    USER ||--o{ CV_ANALYSIS : has
    USER ||--o{ MENTORSHIP_SESSION : books
    MENTOR ||--o{ MENTORSHIP_SESSION : conducts
    MENTORSHIP_SESSION ||--o{ SESSION_NOTE : contains
    REVENUE_RECORD }|--|| USER : tracks
    REVENUE_RECORD }|--|| SERVICE : categorizes
    
    USER {
        string id PK
        string email UK
        string name
        string role
        datetime createdAt
    }
    
    CV_ANALYSIS {
        string id PK
        string userId FK
        string email
        string country
        string profession
        string cvFilePath
        string paymentStatus
        string analysisStatus
        json analysisResult
        datetime createdAt
    }
    
    MENTOR {
        string id PK
        string userId FK
        string name
        string email
        text bio
        array expertise
        string linkedinUrl
        number hourlyRate
        number totalSessions
        number rating
        array availability
    }
    
    MENTORSHIP_SESSION {
        string id PK
        string mentorId FK
        string menteeEmail
        string menteeName
        datetime scheduledAt
        number duration
        string status
        string meetingLink
        string paymentStatus
    }
    
    SESSION_NOTE {
        string id PK
        string sessionId FK
        string mentorId FK
        text content
        array topics
        array actionItems
        array nextSteps
        datetime createdAt
    }
    
    REVENUE_RECORD {
        string id PK
        string type
        number amount
        string currency
        string profession
        string country
        string userEmail
        datetime createdAt
    }
```

## 📊 Estados del Sistema

### Estados de CV Analysis
```mermaid
stateDiagram-v2
    [*] --> Pending: Usuario sube CV
    Pending --> Processing: Pago confirmado
    Processing --> Analyzing: Webhook recibido
    Analyzing --> Generating: AI completa análisis
    Generating --> Completed: PDF generado
    Completed --> Sent: Email enviado
    Sent --> [*]: Usuario descarga
    
    Pending --> Failed: Pago fallido
    Processing --> Failed: Error en webhook
    Analyzing --> Failed: Error en AI
    Failed --> [*]
```

### Estados de Mentorship Session
```mermaid
stateDiagram-v2
    [*] --> Scheduled: Reserva confirmada
    Scheduled --> Confirmed: Email enviado
    Confirmed --> InProgress: Mentor inicia sesión
    InProgress --> TakingNotes: Durante sesión
    TakingNotes --> Completed: Notas guardadas
    Completed --> [*]
    
    Scheduled --> Cancelled: Usuario cancela
    Confirmed --> NoShow: Mentee no asiste
    Cancelled --> [*]
    NoShow --> [*]
```

## 🔐 Seguridad y Validación

```mermaid
flowchart LR
    A[Request] --> B{¿Autenticado?}
    B -->|No| C[❌ 401 Unauthorized]
    B -->|Sí| D{¿Tiene permisos?}
    D -->|No| E[❌ 403 Forbidden]
    D -->|Sí| F{¿Datos válidos?}
    F -->|No| G[❌ 400 Bad Request]
    F -->|Sí| H[✅ Procesar Request]
    H --> I{¿Éxito?}
    I -->|Sí| J[✅ 200 OK]
    I -->|No| K[❌ 500 Server Error]
```

## 📈 Integración con Analytics (CEO Dashboard)

```mermaid
flowchart TD
    A[Eventos de Pago] --> B[Revenue Record]
    B --> C[Agregar Metadata]
    C --> C1[Profesión]
    C --> C2[País]
    C --> C3[Tipo de Servicio]
    C --> C4[Monto]
    C --> C5[Fecha]
    
    C5 --> D[Analytics API]
    D --> E[Calcular KPIs]
    E --> E1[Total Revenue]
    E --> E2[Avg per Customer]
    E --> E3[Revenue by Profession]
    E --> E4[Revenue by Country]
    E --> E5[Daily Trends]
    
    E5 --> F[CEO Dashboard]
    F --> G[Visualizaciones]
    G --> G1[📊 Bar Charts]
    G --> G2[📈 Line Charts]
    G --> G3[🥧 Pie Charts]
    G --> G4[🏆 Podium]
    G --> G5[🌍 Country Cards]
```

## 🎯 Rutas de Usuario

### Ruta: Nuevo Usuario → Análisis CV
```
1. / (Landing)
2. /upload (Formulario)
3. /checkout (Stripe)
4. /dashboard (Resultados)
5. /dashboard/download (Descargar PDF)
```

### Ruta: Nuevo Usuario → Mentoría
```
1. / (Landing)
2. /mentors (Browse)
3. /mentors/[id] (Perfil)
4. /mentors/[id]/book (Calendario)
5. /checkout (Stripe)
6. /dashboard (Sesiones)
7. /dashboard/sessions/[id] (Detalles)
```

### Ruta: Mentor
```
1. /mentor/register (Registro)
2. /mentor/dashboard (Dashboard)
3. /mentor/sessions (Lista)
4. /mentor/sessions/[id]/notes (Notas previas)
5. /mentor/sessions/[id]/start (Iniciar)
```

### Ruta: CEO/Admin
```
1. /admin/dashboard (Analytics)
2. /admin/dashboard?profession=Frontend (Filtrado)
3. /admin/users (Gestión)
4. /admin/revenue (Reportes)
```

## 🚀 Flujo de Despliegue

```mermaid
flowchart LR
    A[Desarrollador] --> B[Git Push]
    B --> C[GitHub]
    C --> D[CI/CD Pipeline]
    D --> E{Tests Pass?}
    E -->|No| F[❌ Build Failed]
    E -->|Sí| G[Build Success]
    G --> H[Deploy to Vercel]
    H --> I[Production]
    I --> J[Webhooks Configurados]
    J --> K[Stripe Connected]
    K --> L[OpenAI Connected]
    L --> M[✅ Live]
```

## 📝 Notas Técnicas

### Tecnologías Clave
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Serverless Functions
- **Payments**: Stripe Checkout + Webhooks
- **AI**: OpenAI GPT-4 para análisis de CV
- **PDF**: jsPDF para generación de reportes
- **Email**: Nodemailer para notificaciones

- **Database**: In-Memory (producción debería usar PostgreSQL/MongoDB)

### Variables de Entorno Requeridas
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**Documentación generada**: Enero 2026
**Versión**: 1.0.0
**Sprints completados**: 1-4
