
# SkillsForIT

Plataforma SaaS para auditoría de CV, mentoría profesional y entrega de productos digitales, con automatización de pagos, análisis, email y dashboard ejecutivo. Escalable, segura y personalizable, integrando IA, pagos y gestión de usuarios en un solo flujo.

---

## 📋 Tabla de Contenidos

1. [Características](#características)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Uso Rápido](#uso-rápido)
4. [Dashboards y Flujos](#dashboards-y-flujos)
5. [QA y Casos de Prueba](#qa-y-casos-de-prueba)
6. [Documentación Técnica y Sprints](#documentación-técnica-y-sprints)
7. [Contribución](#contribución)
8. [Licencia](#licencia)
9. [Créditos](#créditos)

---

## ✨ Características

- Auditoría automática de CV con IA (OpenAI GPT-4, Hugging Face)
- Mentoría 1:1 con agenda, pagos y feedback
- Entrega de productos digitales y e-books
- Dashboard CEO con analíticas, KPIs y filtros por profesión
- Segmentación automática de usuarios (Junior, Transition, Leadership)
- Email transaccional con plantillas dinámicas y editor en dashboard
- Recuperación de carrito y upsell automatizado
- Sistema de autenticación completo (NextAuth, JWT, Google OAuth)
- Gestión de usuarios y roles (CEO, Mentor, Usuario IT, Admin)
- Integración Stripe para pagos y webhooks
- PDF automático y entrega por email
- Arquitectura modular y escalable
- Simulador de entrevista técnica con IA (OpenAI GPT-4):
  - Selección de tipo de entrevista (Frontend, Backend, DevOps, QA, Data, Soft Skills)
  - Preguntas dinámicas y adaptativas
  - Feedback inmediato y detallado (puntuación, recomendaciones, áreas de mejora)
  - Historial de simulaciones en dashboard

---

## ⚙️ Instalación y Configuración

1. Clona el repositorio:
       ```bash
       git clone https://github.com/marcelodanieldm/skillsforit.git
       cd skillsforit
       npm install
       ```
2. Copia y configura variables de entorno:
       ```bash
       cp .env.local.example .env.local
       # Edita .env.local con tus credenciales
       ```
3. Ejecuta el servidor:
       ```bash
       npm run dev
       ```

---

## 🚀 Uso Rápido

Accede a la app en `http://localhost:3000` tras la instalación. Consulta la guía de instalación completa en [SETUP.md](SETUP.md).

---

## 📊 Dashboards y Flujos

### 👤 Dashboard User IT
- Ver historial de análisis de CV y mentorías
- Descargar reportes PDF
- Estado de cada análisis y sesión
- Acceso a productos adquiridos
- Career Score y recomendaciones personalizadas

### 🏆 Dashboard CEO
- KPIs: ingresos, clientes, ticket promedio, proyección mensual
- Filtros por profesión, país y tipo de servicio
- Gráficos: bar, pie, línea, podium de profesiones
- Gestión de usuarios y roles
- Editor de plantillas de email y prueba de envíos
- Visualización de embudo de conversión y segmentación

### 🎓 Dashboard Mentor
- Agenda de sesiones y disponibilidad
- Historial de mentees y notas de sesiones
- Gestión de perfil y especialidades
- Visualización de ratings y feedback
- Acceso a pagos y balance de mentoría
- Herramientas para dejar tareas y feedback personalizado

### 🚦 Flujos de Productos
- Auditoría de CV: Upload → Pago → Análisis IA → PDF → Email → Dashboard
- Mentoría: Registro → Selección mentor → Agenda → Pago → Google Meet → Feedback → Historial
- Entrega de productos: Compra → Pago → Email con link de descarga
- Upsell: Email y dashboard sugieren productos relevantes tras cada compra
- Simulador de entrevista: Acceso → Selección de tipo → Simulación con IA → Feedback inmediato (puntuación, recomendaciones, áreas de mejora) → Historial en dashboard

---

## 🧪 QA y Casos de Prueba

Esta sección documenta los principales casos de prueba automatizados E2E (Playwright) ubicados en `tests/e2e`.

| Caso de Prueba | Feature | Épica | Summary | Resultado Esperado | Asserts |
|---|---|---|---|---|---|
| API Endpoints Validation<br/>(api-validation.spec.ts) | API REST, Validación de flujos | Auditoría de CV, Checkout, Analytics | Valida endpoints críticos: upload, checkout, webhook, events, users. | Rechazo de archivos inválidos, creación de sesión de pago, tracking de eventos, segmentación de usuario, validación de errores. | Status HTTP, contenido de respuesta, segmentación correcta, errores controlados |
| CEO - CRUD Mentor y Acceso<br/>(ceo-crud-mentor-access.spec.ts) | Gestión de Mentores | Dashboard CEO | Crear mentor, validar persistencia, login y acceso de mentor. | Mentor creado, listado, acceso exitoso y logout. | Visibilidad en lista, acceso a dashboard, logout exitoso |
| CEO - Edición y Eliminación de Mentor<br/>(ceo-crud-mentor-edit-delete.spec.ts) | Gestión de Mentores | Dashboard CEO | Crear, editar y eliminar mentor desde dashboard CEO. | Edición persistente, mentor eliminado de la lista. | Nombre editado visible, mentor no visible tras eliminar |
| CEO - Seguridad y Acceso<br/>(ceo-security.spec.ts) | Seguridad, Roles | Dashboard CEO | Valida acceso a endpoints y dashboard CEO según rol/token. | Usuarios no autorizados reciben 403, CEO accede correctamente, datos sensibles protegidos. | Status 403/200, estructura de respuesta, visibilidad de dashboard |
| CEO - Subida y Descarga de PDF<br/>(ceo-upload-download-guide-skills.spec.ts) | Gestión de Assets | Dashboard CEO | Subir y descargar PDF de Guide Skills, validar reemplazo. | PDF subido, descargado, reemplazado correctamente. | Mensaje de éxito, nombre de archivo, reemplazo efectivo |
| ...otros casos en tests/e2e | Flujos completos | Todas las épicas | Cada archivo cubre un flujo E2E: pagos, login, reservas, emails, etc. | Flujo exitoso, errores controlados, integración real. | Status, contenido, side effects (emails, archivos, dashboard) |

**Cómo ejecutar:**

```bash
npx playwright test tests/e2e
```

**Resultado esperado:** Todos los asserts deben cumplirse y los flujos reflejarse en el dashboard y logs del sistema.

---

## 📚 Documentación Técnica y Sprints

- [Guía de instalación](SETUP.md)
- [Guía de despliegue](DEPLOYMENT.md)
- [Diagramas de flujo y arquitectura](FLOW.md)
- [User Journey](USER_JOURNEY.md)
- [DER y modelo de datos](DATABASE_SCHEMA_README.md)
- [Casos de prueba y QA](tests/email-templates.test.js), [tests/e2e/email-templates.e2e.spec.ts]
- [Diagrama visual de flujo de usuario](docs/diagramas-flujo.md)
- [DER de la base de datos](docs/der-base-datos.md)
- [Ejemplos de UI de dashboards](docs/ui-ejemplos.md)
- [Flujo CEO](docs/flujo-ceo.md)
- [Flujo Usuario IT](docs/flujo-user-it.md)
- [Flujo Mentor](docs/flujo-mentor.md)
- [Flujo Simulador de Entrevista](docs/flujo-simulador-entrevista.md)
- [Envío de email transaccional](docs/proceso-interno-email.md)
- [Pago y webhook Stripe](docs/proceso-interno-pago.md)
- [Análisis de CV con IA](docs/proceso-interno-analisis-cv.md)
- [Onboarding de usuario](docs/proceso-interno-onboarding.md)
- [Seguridad y autenticación](docs/proceso-interno-seguridad.md)
- [CI/CD y despliegue](docs/proceso-interno-cicd.md)
- [Integración Stripe](docs/integracion-stripe.md)
- [Integración OpenAI](docs/integracion-openai.md)
- [Integración Supabase](docs/integracion-supabase.md)

### Sprints y Documentación de Releases
- **[📝 Sprint 4 Documentation](SPRINT4.md)** - CEO Dashboard & Analytics
- **[📊 Sprint 5 Documentation](SPRINT5.md)** - Event Tracking & User Segmentation
- **[🎯 Sprint 8 Documentation](SPRINT8.md)** - Dashboard CEO con LTV, Proyecciones y Seguridad
- **[👥 Sprint 31 Documentation](SPRINT31.md)** - Sistema de Autenticación & Experiencia del Alumno

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias, mejoras o reportar bugs.

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

---

## 👥 Créditos

Desarrollado por Marcelo Daniel y colaboradores. Consulta el historial de commits y la sección de autores para más información.

       ### 🆕 Características de Autenticación

       #### Login/Logout ✅
       - **Email/Password**: Autenticación tradicional con validación de roles
       - **Google OAuth**: Inicio de sesión con cuenta de Google (NextAuth.js)
       - **Sesiones JWT**: Tokens seguros con expiración de 24 horas
       - **Multi-rol**: Soporte para CEO, Mentor, Usuario IT y Admin
       - **Página de Login**: `/auth/signin` con diseño moderno

       #### Recuperación de Contraseña ✅
       - **Request Reset**: Solicitud de recuperación con envío de token
       - **Token Temporal**: Validez de 1 hora con expiración automática
       - **Confirm Reset**: Interfaz para establecer nueva contraseña
       - **Invalidación**: Cierra todas las sesiones activas al cambiar contraseña
       - **UI Amigable**: Páginas `/auth/forgot-password` y `/reset-password`

       #### Gestión de Usuarios (CEO) ✅
       - **CRUD Completo**: Create, Read, Update, Delete usuarios
       - **API Endpoints**: `/api/users/manage` con autenticación por token
       - **Búsqueda y Filtros**: Filtrado por email, nombre y rol
       - **Validación de Roles**: Solo CEO puede gestionar usuarios
       - **UI Moderna**: Componente con modales, animaciones y diseño profesional

       #### Integración en Landing ✅
       - **Navbar Superior**: Dropdown discreto con accesos rápidos
       - **Botón Flotante**: Aparece al scroll en móviles (FloatingAuthButton)
       - **Footer Actualizado**: Enlaces de cuenta y login
       - **No Invasivo**: Diseño que no interfiere con la experiencia del usuario

       ### 📁 Estructura de Archivos

       ```
       app/
              ├── api/auth/
              │   ├── login/route.ts          - Login endpoint
              │   ├── logout/route.ts         - Logout endpoint
              │   ├── password-reset/
              │   │   ├── request/route.ts    - Solicitar reset
              │   │   └── confirm/route.ts    - Confirmar reset
              │   └── [...nextauth]/route.ts  - Google OAuth (NextAuth)
              ├── api/users/manage/route.ts   - CRUD usuarios (CEO)
              ├── auth/
              │   ├── signin/page.tsx         - Página de login
              │   └── forgot-password/page.tsx - Recuperar contraseña
              └── reset-password/page.tsx     - Restablecer contraseña

       components/
              ├── Navbar.tsx                  - Navbar con auth dropdown
              ├── FloatingAuthButton.tsx      - Botón flotante móvil
              └── ceo/UserManagement.tsx      - Gestión de usuarios

       lib/
              └── auth.ts                     - AuthService (lógica completa)
       ```

       ### 🔑 Configuración Necesaria

       ```bash
       # .env.local
       NEXTAUTH_SECRET=your-secret-here
       GOOGLE_CLIENT_ID=your-google-client-id
       GOOGLE_CLIENT_SECRET=your-google-client-secret
       NEXT_PUBLIC_APP_URL=http://localhost:3000
       ```

       ### 👤 Usuarios de Prueba

       ```
       CEO: ceo@skillsforit.com / ceo123
       Mentor: mentor@skillsforit.com / mentor123
       Usuario IT: user@example.com / user123
       ```

       ---
- Seguridad: .env en gitignore, roles, validación de sesión
- [Diagramas de flujo y arquitectura](FLOW.md)

---
## ⚡ Características Técnicas
- Modularidad y escalabilidad
- Plantillas de email editables desde dashboard CEO
- Segmentación y personalización de flujos
- Webhooks Stripe para automatización
- Integración IA para análisis de CV
- PDF automático y entrega por email
- Dashboard CEO con KPIs y filtros avanzados
- Pruebas unitarias y E2E para todos los flujos
- Variables de entorno seguras y documentadas
- Soporte para migración a PostgreSQL y S3

---
- [Guía de instalación](SETUP.md)
- [Diagrama de flujo](FLOW.md)
- [User Journey](USER_JOURNEY.md)
- [DER y modelo de datos](DATABASE_SCHEMA_README.md)
- [Casos de prueba y QA](tests/email-templates.test.js), [tests/e2e/email-templates.e2e.spec.ts]
- [Guía de despliegue](DEPLOYMENT.md)
- [Diagrama visual de flujo de usuario](docs/diagramas-flujo.md)
- [DER de la base de datos](docs/der-base-datos.md)
- [Ejemplos de UI de dashboards](docs/ui-ejemplos.md)
  
- [Flujo CEO](docs/flujo-ceo.md)
- [Flujo Usuario IT](docs/flujo-user-it.md)
- [Flujo Mentor](docs/flujo-mentor.md)

### Diagrama de flujo del simulador de entrevista
- [Flujo Simulador de Entrevista](docs/flujo-simulador-entrevista.md)

- [Envío de email transaccional](docs/proceso-interno-email.md)
- [Pago y webhook Stripe](docs/proceso-interno-pago.md)
- [Análisis de CV con IA](docs/proceso-interno-analisis-cv.md)
- [Onboarding de usuario](docs/proceso-interno-onboarding.md)
- [Seguridad y autenticación](docs/proceso-interno-seguridad.md)
- [CI/CD y despliegue](docs/proceso-interno-cicd.md)

### Diagramas de integraciones externas
- [Integración Stripe](docs/integracion-stripe.md)
- [Integración OpenAI](docs/integracion-openai.md)
- [Integración Supabase](docs/integracion-supabase.md)
- [Envío de email transaccional](docs/proceso-interno-email.md)
- [Pago y webhook Stripe](docs/proceso-interno-pago.md)
- [Análisis de CV con IA](docs/proceso-interno-analisis-cv.md)
- [Onboarding de usuario](docs/proceso-interno-onboarding.md)
- [Seguridad y autenticación](docs/proceso-interno-seguridad.md)
- [CI/CD y despliegue](docs/proceso-interno-cicd.md)
- [Guía de instalación](SETUP.md)
- [Diagrama de flujo](FLOW.md)
- [User Journey](USER_JOURNEY.md)
- [DER y modelo de datos](DATABASE_SCHEMA_README.md)
- [Casos de prueba y QA](tests/email-templates.test.js), [tests/e2e/email-templates.e2e.spec.ts]
- [Guía de despliegue](DEPLOYMENT.md)
- [Diagrama visual de flujo de usuario](docs/diagramas-flujo.md)
- [DER de la base de datos](docs/der-base-datos.md)
- [Ejemplos de UI de dashboards](docs/ui-ejemplos.md)

<<<<<<< HEAD
- **[📖 Setup Guide](SETUP.md)** - Guía completa de instalación y configuración
- **[🔐 Auth System](AUTH_README.md)** - Sistema de autenticación completo (Login, OAuth, Recovery)
- **[🔄 Flow Diagrams](FLOW.md)** - Diagramas de flujo del servicio y arquitectura
- **[🚀 User Journey](USER_JOURNEY.md)** - Flujo completo del proceso de usuario (Landing → Compra → Post-Compra)
- **[📝 Sprint 4 Documentation](SPRINT4.md)** - CEO Dashboard & Analytics
- **[📊 Sprint 5 Documentation](SPRINT5.md)** - Event Tracking & User Segmentation
- **[🎯 Sprint 8 Documentation](SPRINT8.md)** - Dashboard CEO con LTV, Proyecciones y Seguridad
- **[👥 Sprint 31 Documentation](SPRINT31.md)** - Sistema de Autenticación & Experiencia del Alumno

## 🔐 Sprint 31: Sistema de Autenticación Completo ✅ COMPLETED

Sistema completo de autenticación con login/logout, recuperación de contraseña, Google OAuth y gestión de usuarios.

### 🆕 Características de Autenticación

#### Login/Logout ✅
- **Email/Password**: Autenticación tradicional con validación de roles
- **Google OAuth**: Inicio de sesión con cuenta de Google (NextAuth.js)
- **Sesiones JWT**: Tokens seguros con expiración de 24 horas
- **Multi-rol**: Soporte para CEO, Mentor, Usuario IT y Admin
- **Página de Login**: `/auth/signin` con diseño moderno

#### Recuperación de Contraseña ✅
- **Request Reset**: Solicitud de recuperación con envío de token
- **Token Temporal**: Validez de 1 hora con expiración automática
- **Confirm Reset**: Interfaz para establecer nueva contraseña
- **Invalidación**: Cierra todas las sesiones activas al cambiar contraseña
- **UI Amigable**: Páginas `/auth/forgot-password` y `/reset-password`

#### Gestión de Usuarios (CEO) ✅
- **CRUD Completo**: Create, Read, Update, Delete usuarios
- **API Endpoints**: `/api/users/manage` con autenticación por token
- **Búsqueda y Filtros**: Filtrado por email, nombre y rol
- **Validación de Roles**: Solo CEO puede gestionar usuarios
- **UI Moderna**: Componente con modales, animaciones y diseño profesional

#### Integración en Landing ✅
- **Navbar Superior**: Dropdown discreto con accesos rápidos
- **Botón Flotante**: Aparece al scroll en móviles (FloatingAuthButton)
- **Footer Actualizado**: Enlaces de cuenta y login
- **No Invasivo**: Diseño que no interfiere con la experiencia del usuario

### 📁 Estructura de Archivos

```
app/
  ├── api/auth/
  │   ├── login/route.ts          - Login endpoint
  │   ├── logout/route.ts         - Logout endpoint
  │   ├── password-reset/
  │   │   ├── request/route.ts    - Solicitar reset
  │   │   └── confirm/route.ts    - Confirmar reset
  │   └── [...nextauth]/route.ts  - Google OAuth (NextAuth)
  ├── api/users/manage/route.ts   - CRUD usuarios (CEO)
  ├── auth/
  │   ├── signin/page.tsx         - Página de login
  │   └── forgot-password/page.tsx - Recuperar contraseña
  └── reset-password/page.tsx     - Restablecer contraseña

components/
  ├── Navbar.tsx                  - Navbar con auth dropdown
  ├── FloatingAuthButton.tsx      - Botón flotante móvil
  └── ceo/UserManagement.tsx      - Gestión de usuarios

lib/
  └── auth.ts                     - AuthService (lógica completa)
```

### 🔑 Configuración Necesaria

```bash
# .env.local
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 👤 Usuarios de Prueba

```
CEO: ceo@skillsforit.com / ceo123
Mentor: mentor@skillsforit.com / mentor123
Usuario IT: user@example.com / user123
```

---
=======
>>>>>>> 6fdef37b2622f0e56f15e40bd8ae234a9308454a

## 🚀 Sprint 5: Arquitectura Base y Analytics Avanzados ✅ COMPLETED

Event tracking system, automatic user segmentation, and conversion funnel analytics.

### 🆕 New Features (Sprint 5)

#### Event Tracking System ✅
- **10+ Event Types**: page_view, form_start, form_complete, checkout, payment events
- **Session Tracking**: Automatic session ID generation and management
- **Metadata Capture**: Device type, referrer, page, service, user segment
- **Analytics API**: `/api/events` for tracking and metrics retrieval

#### User Segmentation ✅
- **Automatic Clustering**: Users categorized into Junior, Transition, Leadership
- **Smart Algorithm**: Based on profession keywords + years of experience
- **Personalized Recommendations**: Different services suggested per segment
- **Segment Distribution**: Real-time metrics on user distribution

#### Conversion Funnel Analytics ✅
- **5-Stage Funnel**: Landing → Form → Checkout → Payment → Completion
- **Drop-off Analysis**: Calculate abandonment rates at each stage
- **Conversion Rates**: Per-stage and global conversion metrics
- **Time in Stage**: Average time users spend in each funnel stage
- **Segment Performance**: Conversion rates compared across segments

#### Analytics Dashboard ✅
- **Route**: `/analytics`
- **KPI Cards**: Total users, visitors, checkouts, conversion rate
- **Funnel Visualization**: Bar charts showing visitor flow and drop-offs
- **Segment Distribution**: Pie chart with percentage breakdown
- **Conversion by Segment**: Comparative bar chart with progress bars
- **Insights & Recommendations**: Automated strategy suggestions

### Previous Sprints

## �🚀 Sprint 4: CEO Dashboard & Analytics ✅ COMPLETED

Comprehensive analytics dashboard with revenue insights and profession-based filtering.

### ✨ Features Implemented

#### Sprint 1: MVP & Landing Page ✅
- **Hero Section with AIDA Framework**
- **Before/After CV Comparison** (Interactive toggle)
- **Benefits, How It Works, Pricing, Testimonials**
- **Responsive Design with Framer Motion animations**

#### Sprint 2: Core SaaS Features ✅

**🔄 Complete User Flow:**
1. **Landing Page** → User sees value proposition
2. **Upload CV** → Drag & drop or file selector
3. **User Form** → Collects name, email, country, profession
4. **Checkout** → Secure Stripe payment ($7 USD)
5. **Processing** → AI analyzes CV automatically
6. **Email Delivery** → PDF report sent automatically
7. **Dashboard** → Access to all analyses

**💳 Payment Integration:**
- ✅ Stripe Checkout Session
- ✅ Secure payment processing
- ✅ Webhook handler for payment confirmation
- ✅ Automatic fulfillment after payment

**🤖 AI Analysis:**
- ✅ OpenAI GPT-4 integration
- ✅ CV text extraction
- ✅ Personalized analysis based on profession/country
- ✅ 15+ specific improvements
- ✅ ATS score calculation
- ✅ Problems identification with severity levels
- ✅ Strengths and recommendations

- ✅ Hugging Face Inference API (Mistral-7B-Instruct-v0.2) integration
- Hugging Face API key required for AI analysis

# Required API Keys:
# - STRIPE_SECRET_KEY (from https://stripe.com)
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET
# - HUGGINGFACE_API_KEY (from https://huggingface.co/settings/tokens)
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD
# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
- ✅ Rating and review system
- ✅ LinkedIn profile integration
- ✅ Mentor dashboard with upcoming/completed sessions
- ✅ **Session notes system** - Add notes after each session
- ✅ **Previous session history** - View mentee's last session notes before new meeting
- ✅ Session status tracking (scheduled/completed/cancelled/no-show)

**📅 Booking System (Calendly-like):**
- ✅ Browse mentors by expertise
# Email
- ✅ View mentor ratings and reviews
- ✅ 7-day calendar view
- ✅ 10-minute time slot selection
- ✅ Availability validation
- ✅ Booking form with mentee details
- ✅ Stripe payment for mentorship sessions
- ✅ Google Meet link generation
- ✅ Confirmation page with meeting details
3. **AI analyzes CV** → Hugging Face Inference API processes content
│ AI Analysis │ ◄───► Hugging Face Inference API (Mistral-7B-Instruct-v0.2)
- Hugging Face API key required for AI analysis
- ✅ Add session notes with:
  - Content summary
  - Topics discussed
  - Action items
  - Next steps
- ✅ Notes displayed to mentor before next session with same mentee
- ✅ Full session history tracking

**💰 Mentorship Pricing:**
- Flexible pricing: $10-$100 per 10-min session
- Default rate slider in registration
- Separate Stripe checkout for mentorships
- Payment required before booking confirmation

#### Sprint 4: CEO Dashboard & Analytics ✅

**📊 Analytics Dashboard (Core User Story):**
- ✅ **Profession filter dropdown** - Filter all data by user profession
- ✅ **Revenue by Profession chart** - Identify most profitable niches
- ✅ **Top 3 professions podium** (🥇🥈🥉) - Quick visual reference
- ✅ Real-time data filtering and refresh
- ✅ Visual indicator for active filter

**📈 KPIs & Metrics:**
- ✅ Total Revenue - Overall business performance
- ✅ Total Customers - Unique customer count
- ✅ Avg Revenue Per Customer - Customer value metric
- ✅ Projected Monthly Revenue - Growth forecasting

**📉 Data Visualizations:**
- ✅ **Bar Chart** - Revenue & customer count by profession
- ✅ **Pie Chart** - CV Analysis vs Mentorship revenue split
- ✅ **Line Chart** - Daily revenue trend (30 days)
- ✅ **Grid Cards** - Top countries by revenue

**💾 Revenue Tracking:**
- ✅ Automatic tracking on all Stripe payments
- ✅ CV Analysis payments ($7 USD) with profession/country
- ✅ Mentorship payments (variable) tracked
- ✅ RevenueRecord model with full metadata

**🔍 Analytics Queries:**
- ✅ Revenue by profession (with filter)
- ✅ Revenue by service type
- ✅ Revenue by country
- ✅ Daily revenue time series
- ✅ Aggregate calculations (totals, averages, percentages)

**🎨 Dashboard Features:**

- ✅ Responsive grid layouts
- ✅ Color-coded KPIs (green=$, blue=users, purple=avg, yellow=projection)
- ✅ Hover tooltips with formatted data
- ✅ Loading states and error handling

**👤 Dashboard:**
- ✅ Email-based access (MVP authentication)
- ✅ View all analyses
- ✅ Download PDF reports
- ✅ Status tracking (pending/processing/completed)
- ✅ Score visualization

### 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Icons

**Backend:**
- Next.js API Routes
- Stripe (Payments & Webhooks)
- OpenAI GPT-4 (AI Analysis)
- Nodemailer (Email)
- jsPDF (PDF Generation)

**Storage (MVP):**
- In-memory database (for MVP)
- File system for uploads/reports
- Ready to migrate to PostgreSQL/MongoDB

### 📦 Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Required API Keys:
# - STRIPE_SECRET_KEY (from https://stripe.com)
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET
# - OPENAI_API_KEY (from https://openai.com)
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD

# Run development server
npm run dev
```

### 🌐 Routes

- `/` - Landing page
- `/upload` - CV upload & form
- `/checkout?id={analysisId}` - Stripe checkout
- `/success?session_id={sessionId}` - Payment confirmation
- `/dashboard` - User dashboard
- `/api/upload` - Upload CV endpoint
- `/api/checkout` - Create Stripe session
- `/api/webhook` - Stripe webhook handler
- `/api/dashboard` - Get user analyses

### 🔐 Environment Variables

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app_specific_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PRODUCT_PRICE=7.00
```

### 💳 Configuración de Stripe en Modo de Prueba

#### 1. Obtener Claves de Prueba

1. Ve a tu [Dashboard de Stripe](https://dashboard.stripe.com/)
2. Asegúrate de que el **modo de prueba** esté activado (toggle en la esquina superior derecha)
3. Navega a **Developers** → **API keys**
4. Copia tus claves:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

#### 2. Configurar Webhooks para Desarrollo Local

**Opción A: Stripe CLI (Recomendado)**

```bash
# Instalar Stripe CLI
# Windows (con Scoop):
scoop install stripe

# Alternativamente, descarga desde:
# https://github.com/stripe/stripe-cli/releases

# Iniciar sesión
stripe login

# Escuchar webhooks y reenviar a tu servidor local
stripe listen --forward-to localhost:3000/api/webhook

# Copia el webhook signing secret que aparece (whsec_...)
# y agrégalo a tu .env.local
```

**Opción B: ngrok (Alternativa)**

```bash
# Instalar ngrok
# https://ngrok.com/download

# Crear túnel público
ngrok http 3000

# Configura el webhook en Stripe Dashboard:
# 1. Ve a Developers → Webhooks
# 2. Agrega endpoint: https://tu-url.ngrok.io/api/webhook
# 3. Selecciona eventos: checkout.session.completed, payment_intent.succeeded
# 4. Copia el webhook signing secret
```

#### 3. Archivo .env.local

Crea el archivo `.env.local` en la raíz del proyecto:

```env
# STRIPE (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Resto de variables...
```

#### 4. Tarjetas de Prueba de Stripe

Usa estas tarjetas para probar diferentes escenarios:

| Escenario | Número de Tarjeta | Resultado |
|-----------|-------------------|-----------|
| ✅ Pago exitoso | `4242 4242 4242 4242` | Pago aprobado |
| ❌ Pago rechazado | `4000 0000 0000 0002` | Tarjeta declinada |
| 🔒 3D Secure | `4000 0025 0000 3155` | Requiere autenticación |
| 💰 Fondos insuficientes | `4000 0000 0000 9995` | Fondos insuficientes |
| ⚠️ Tarjeta expirada | `4000 0000 0000 0069` | Tarjeta expirada |

**Detalles para todas las tarjetas:**
- **Fecha de expiración**: Cualquier fecha futura (ej: 12/34)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera

#### 5. Probar el Flujo Completo

```bash
# Terminal 1: Iniciar servidor de desarrollo
npm run dev

# Terminal 2: Escuchar webhooks de Stripe (si usas Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhook

# Ahora ve a http://localhost:3000 y:
# 1. Sube un CV
# 2. Completa el formulario
# 3. Procede al checkout
# 4. Usa tarjeta de prueba: 4242 4242 4242 4242
# 5. Verifica el pago en Dashboard de Stripe
```

#### 6. Verificar Pagos en el Dashboard

Después de cada prueba, verifica:
- [Pagos en modo test](https://dashboard.stripe.com/test/payments)
- [Eventos de webhook](https://dashboard.stripe.com/test/webhooks)
- [Logs del Stripe CLI](terminal donde corre `stripe listen`)

#### 7. Eventos de Webhook Configurados

El proyecto escucha estos eventos de Stripe:

- `checkout.session.completed` - Checkout completado
- `checkout.session.expired` - Sesión expirada (carrito abandonado)
- `payment_intent.succeeded` - Pago exitoso
- `payment_intent.payment_failed` - Pago fallido

#### 🚨 Importante: Seguridad

- ✅ **NUNCA** subas tu `.env.local` a Git (ya está en `.gitignore`)
- ✅ Las claves de **test** (`sk_test_...`) solo funcionan en modo prueba
- ✅ Para producción, necesitarás claves **live** (`sk_live_...`)
- ✅ Stripe requiere verificación de cuenta para usar claves live
- ✅ Los webhooks de producción deben usar HTTPS (no HTTP)

#### 📋 Checklist de Configuración

- [ ] Cuenta de Stripe creada
<<<<<<< HEAD
- [ ] Modo de prueba activado en Dashboard
=======
- [ ] Modo de prueba activado en Stripe Dashboard
>>>>>>> 6fdef37b2622f0e56f15e40bd8ae234a9308454a
- [ ] Claves API copiadas a `.env.local`
- [ ] Stripe CLI instalado y autenticado
- [ ] Webhook local configurado y funcionando
- [ ] Pago de prueba completado exitosamente
- [ ] Email de confirmación recibido
- [ ] Dashboard de Stripe muestra el pago

### 🔄 User Flow Diagram

```
┌─────────────┐
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Upload CV  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  User Form  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Checkout   │ ◄───► Stripe
└──────┬──────┘
       │ (Payment Success)
       ▼
┌─────────────┐
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI Analysis │ ◄───► OpenAI GPT-4
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Generate PDF │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Send Email  │ ◄───► Nodemailer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### 🧪 Solución de Problemas Comunes

#### El webhook no recibe eventos

```bash
# Verifica que Stripe CLI esté corriendo
stripe listen --forward-to localhost:3000/api/webhook

# Verifica que el servidor Next.js esté corriendo
npm run dev

# Revisa los logs en ambos terminales
```

#### Error: "Webhook signature verification failed"

- Verifica que `STRIPE_WEBHOOK_SECRET` en `.env.local` coincida con el mostrado en Stripe CLI
- Reinicia el servidor después de cambiar variables de entorno
- Asegúrate de usar el secreto correcto (empieza con `whsec_`)

#### El pago se completa pero no recibo el email

- Verifica las credenciales de email en `.env.local`
- Revisa la consola del servidor para errores
- Verifica que el webhook se ejecutó correctamente en los logs

#### No puedo ver los pagos en el Dashboard

- Asegúrate de estar en **modo de prueba** en Stripe Dashboard
- Ve a [Pagos en test](https://dashboard.stripe.com/test/payments)
- Verifica que estés usando claves `pk_test_` y `sk_test_`

### 📊 Data Flow

**CV Analysis Flow:**
1. **User uploads CV** → Stored in `/public/uploads/`
2. **Payment confirmed** → Webhook triggers analysis
3. **AI analyzes CV** → OpenAI processes content
4. **PDF generated** → Saved in `/public/reports/`
5. **Email sent** → PDF attached automatically
6. **Dashboard updated** → User can download report

**Mentorship Flow:**
1. **Mentor registers** → Profile created with availability
2. **User browses mentors** → Filters by expertise
3. **User selects time slot** → From mentor's availability
4. **Payment processed** → Stripe checkout for mentorship
5. **Session booked** → Google Meet link generated
6. **Before session** → Mentor views previous session notes
7. **After session** → Mentor adds notes for next time

### 🎯 Next Steps (Sprint 4 - Future Enhancements)

**Authentication & Security:**
- [ ] Implement proper authentication (JWT/NextAuth)
- [ ] Password hashing with bcrypt
- [ ] Email verification
- [ ] OAuth integration (Google/LinkedIn)

**Database & Storage:**
- [ ] Migrate to PostgreSQL database
- [ ] Move files to S3/Cloud Storage
- [ ] Database backups and recovery

**Mentorship Enhancements:**
- [ ] Mentee session history dashboard
- [ ] Video call integration (Zoom API)
- [ ] Calendar sync (Google Calendar)
- [ ] Automated reminder emails
- [ ] Rescheduling functionality
- [ ] Mentor availability bulk update
- [ ] Group mentorship sessions

**Payment & Billing:**
- [ ] Payment history and invoices
- [ ] Refund system
- [ ] Subscription model for unlimited mentorships
- [ ] Multiple payment methods (PayPal, etc.)
- [ ] Mentor payout system

**Analytics & Admin:**
- [ ] Admin dashboard
- [ ] Analytics for CV analysis
- [ ] Mentorship session analytics
- [ ] Revenue tracking
- [ ] User behavior tracking

**Additional Features:**
- [ ] A/B testing for landing page
- [ ] CV templates download
- [ ] LinkedIn profile optimization service
- [ ] Interview preparation module
- [ ] Career path recommendations

### 🐛 Known Limitations (MVP)

**General:**
- In-memory database (resets on server restart)
- Files stored locally (should use S3/Cloud Storage)
- Simple auth system (no password hashing yet)

**CV Analysis:**
- Mock PDF extraction (needs proper PDF parsing in production)
- No admin panel yet

**Mentorship:**
- No real video integration (using mock Google Meet links)
- Availability doesn't check for time zone conflicts
- No notification system for upcoming sessions
- No cancellation/rescheduling feature yet
- No mentor verification process

### 📝 Notes

**CV Analysis:**
- All CTAs on landing page redirect to `/upload`
- Email delivery requires valid SMTP credentials
- OpenAI API key required for AI analysis
- Stripe webhook must be configured for production
- PDF reports are automatically attached to emails

**Mentorship:**
- Mentors can set custom hourly rates ($10-$100)
- Sessions are fixed at 10 minutes
- **Previous session notes** automatically shown to mentor before new session with same mentee
- Session notes include: content, topics, action items, next steps
- All bookings require Stripe payment confirmation
- Meeting links are generated automáticamente
