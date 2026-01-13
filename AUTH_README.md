# 🔐 Sistema de Autenticación SkillsForIt

## ✨ Características Implementadas

### 1. **Login/Logout**
- ✅ Autenticación con email y contraseña
- ✅ Sesiones con tokens JWT
- ✅ Cierre de sesión seguro
- ✅ Validación de roles (CEO, Mentor, Usuario IT)

### 2. **Recuperación de Contraseña**
- ✅ Solicitud de recuperación por email
- ✅ Tokens temporales con expiración (1 hora)
- ✅ Cambio de contraseña seguro
- ✅ Invalidación de sesiones activas al cambiar contraseña

### 3. **Google OAuth**
- ✅ Inicio de sesión con cuenta de Google
- ✅ Creación automática de usuarios
- ✅ Sincronización de roles

### 4. **Gestión de Usuarios (CEO Dashboard)**
- ✅ Ver todos los usuarios
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Eliminar usuarios
- ✅ Filtrado por email, nombre y rol

## 🚀 Rutas de Autenticación

### API Endpoints

```
POST   /api/auth/login                    - Iniciar sesión
POST   /api/auth/logout                   - Cerrar sesión
POST   /api/auth/password-reset/request   - Solicitar recuperación
POST   /api/auth/password-reset/confirm   - Confirmar nueva contraseña
GET    /api/auth/[...nextauth]           - Google OAuth (NextAuth)
POST   /api/auth/[...nextauth]           - Google OAuth (NextAuth)

GET    /api/users/manage                 - Listar usuarios (CEO)
POST   /api/users/manage                 - Crear usuario (CEO)
PUT    /api/users/manage                 - Actualizar usuario (CEO)
DELETE /api/users/manage?email=xxx       - Eliminar usuario (CEO)
```

### Páginas

```
/auth/signin              - Página de login
/auth/forgot-password     - Solicitar recuperación
/reset-password?token=xxx - Restablecer contraseña
/ceo/login               - Login específico para CEO
/ceo/dashboard           - Dashboard CEO (con gestión de usuarios)
```

## 🔑 Configuración de Google OAuth

### Paso 1: Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "Google+ API" en APIs & Services

### Paso 2: Crear Credenciales OAuth 2.0
1. Ve a "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
2. Tipo de aplicación: "Web application"
3. **URIs autorizadas** (Authorized JavaScript origins):
   - `http://localhost:3000` (desarrollo)
   - `https://tu-dominio.com` (producción)
4. **URIs de redirección** (Authorized redirect URIs):
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (producción)

### Paso 3: Configurar Variables de Entorno
Copia `.env.example` a `.env.local` y completa:

```bash
NEXTAUTH_SECRET=tu-secreto-generado-aqui
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 👥 Tipos de Usuario

### CEO
- Acceso completo al dashboard ejecutivo
- Gestión de usuarios (CRUD)
- Métricas y análisis

### Mentor
- Dashboard de mentoría
- Gestión de sesiones
- Feedback de estudiantes

### Usuario IT
- Dashboard personal
- CV Auditor
- Acceso a mentorías

## 🔐 Seguridad

### Buenas Prácticas Implementadas
- ✅ Tokens con expiración
- ✅ Validación de roles en el servidor
- ✅ No revelar existencia de usuarios en recuperación
- ✅ Invalidación de sesiones al cambiar contraseña
- ✅ Headers de autenticación con Bearer tokens
- ✅ Contraseñas con longitud mínima

### ⚠️ Para Producción
- [ ] Implementar bcrypt para hashear contraseñas
- [ ] Usar Redis para almacenar sesiones
- [ ] Configurar rate limiting
- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] Logs de auditoría
- [ ] HTTPS obligatorio
- [ ] Políticas de contraseñas más estrictas

## 📝 Ejemplos de Uso

### Login con Credenciales
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password123' 
  })
})

const { success, user, token } = await response.json()
localStorage.setItem('token', token)
```

### Logout
```typescript
const token = localStorage.getItem('token')

await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})

localStorage.removeItem('token')
```

### Recuperar Contraseña
```typescript
// Paso 1: Solicitar recuperación
await fetch('/api/auth/password-reset/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})

// Paso 2: Usuario recibe email con token y lo usa
await fetch('/api/auth/password-reset/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: 'reset_token_from_email',
    newPassword: 'newPassword123'
  })
})
```

### Login con Google
```typescript
import { signIn } from 'next-auth/react'

// Redirige a Google OAuth
signIn('google', { 
  callbackUrl: '/dashboard' 
})
```

### Gestión de Usuarios (CEO)
```typescript
const token = localStorage.getItem('ceo_token')

// Listar usuarios
const response = await fetch('/api/users/manage', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Crear usuario
await fetch('/api/users/manage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'nuevo@example.com',
    name: 'Nuevo Usuario',
    role: 'user',
    password: 'password123'
  })
})

// Actualizar usuario
await fetch('/api/users/manage', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
    name: 'Nombre Actualizado',
    role: 'mentor'
  })
})

// Eliminar usuario
await fetch('/api/users/manage?email=usuario@example.com', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 🎨 Usuarios de Prueba

En modo desarrollo, puedes usar estas credenciales:

```
CEO:
Email: ceo@skillsforit.com
Password: ceo123

Mentor:
Email: mentor@skillsforit.com
Password: mentor123

Usuario IT:
Email: user@example.com
Password: user123
```

## 📦 Dependencias Instaladas

```json
{
  "next-auth": "^latest",
  "@auth/core": "^latest"
}
```

## 🐛 Troubleshooting

### Error: "Token no proporcionado"
- Verifica que estás enviando el header `Authorization: Bearer <token>`

### Error: "Acceso denegado"
- Verifica que el usuario tenga el rol correcto
- Verifica que el token no haya expirado

### Google OAuth no funciona
- Verifica que las URIs de redirección coincidan exactamente
- Verifica que Google+ API esté habilitada
- Revisa las credenciales en `.env.local`

### "Session expirada"
- Las sesiones duran 24 horas por defecto
- Solicita un nuevo login

## 📚 Referencias

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Implementado por:** GitHub Copilot  
**Fecha:** Enero 2026  
**Versión:** 1.0.0
