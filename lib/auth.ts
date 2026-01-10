// Sistema de Autenticación Simple y Roles
// En producción, usar NextAuth.js o Auth0

export type UserRole = 'ceo' | 'mentor' | 'user' | 'admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  lastLogin?: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  userId: string
  email: string
  role: UserRole
  token: string
  expiresAt: Date
}

// In-memory sessions storage (replace with Redis in production)
const sessions = new Map<string, AuthSession>()
const users = new Map<string, AuthUser & { password: string }>()

// Seed users for development
const seedUsers = () => {
  // CEO user
  users.set('ceo@skillsforit.com', {
    id: 'ceo_001',
    email: 'ceo@skillsforit.com',
    name: 'Daniel Mendoza (CEO)',
    role: 'ceo',
    password: 'ceo123', // In production, use bcrypt
    createdAt: new Date()
  })

  // Regular IT user
  users.set('user@example.com', {
    id: 'user_001',
    email: 'user@example.com',
    name: 'Juan Pérez',
    role: 'user',
    password: 'user123',
    createdAt: new Date()
  })

  // Mentor
  users.set('mentor@skillsforit.com', {
    id: 'mentor_001',
    email: 'mentor@skillsforit.com',
    name: 'María García (Mentor)',
    role: 'mentor',
    password: 'mentor123',
    createdAt: new Date()
  })

  console.log('✅ Seeded auth users')
}

// Initialize on import
seedUsers()

export class AuthService {
  /**
   * Login user and create session
   */
  static login(credentials: LoginCredentials): {
    success: boolean
    session?: AuthSession
    user?: Omit<AuthUser, 'password'>
    error?: string
  } {
    const user = users.get(credentials.email)

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    // Validate password (in production, use bcrypt.compare)
    if (user.password !== credentials.password) {
      return {
        success: false,
        error: 'Contraseña incorrecta'
      }
    }

    // Create session token
    const token = `token_${Date.now()}_${user.id}`
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      role: user.role,
      token,
      expiresAt
    }

    sessions.set(token, session)

    // Update last login
    user.lastLogin = new Date()

    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      session,
      user: userWithoutPassword
    }
  }

  /**
   * Logout user and destroy session
   */
  static logout(token: string): boolean {
    return sessions.delete(token)
  }

  /**
   * Validate session token
   */
  static validateSession(token: string): {
    valid: boolean
    session?: AuthSession
    error?: string
  } {
    const session = sessions.get(token)

    if (!session) {
      return {
        valid: false,
        error: 'Sesión no encontrada'
      }
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      sessions.delete(token)
      return {
        valid: false,
        error: 'Sesión expirada'
      }
    }

    return {
      valid: true,
      session
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(token: string, requiredRole: UserRole | UserRole[]): boolean {
    const validation = this.validateSession(token)

    if (!validation.valid || !validation.session) {
      return false
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(validation.session.role)
  }

  /**
   * Get user from session token
   */
  static getUserFromToken(token: string): AuthUser | null {
    const validation = this.validateSession(token)

    if (!validation.valid || !validation.session) {
      return null
    }

    const user = Array.from(users.values()).find(u => u.id === validation.session!.userId)

    if (!user) return null

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword as AuthUser
  }

  /**
   * Middleware function to protect routes
   */
  static requireRole(
    token: string | null | undefined,
    allowedRoles: UserRole | UserRole[]
  ): {
    authorized: boolean
    user?: AuthUser
    error?: string
  } {
    if (!token) {
      return {
        authorized: false,
        error: 'Token no proporcionado'
      }
    }

    const validation = this.validateSession(token)

    if (!validation.valid) {
      return {
        authorized: false,
        error: validation.error || 'Sesión inválida'
      }
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    if (!roles.includes(validation.session!.role)) {
      return {
        authorized: false,
        error: `Acceso denegado. Rol requerido: ${roles.join(' o ')}`
      }
    }

    const user = this.getUserFromToken(token)

    return {
      authorized: true,
      user: user || undefined
    }
  }

  /**
   * Get all active sessions (admin only)
   */
  static getActiveSessions(): AuthSession[] {
    const now = new Date()
    return Array.from(sessions.values()).filter(s => s.expiresAt > now)
  }

  /**
   * Clean expired sessions (cron job)
   */
  static cleanExpiredSessions(): number {
    const now = new Date()
    let cleaned = 0

    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(token)
        cleaned++
      }
    }

    return cleaned
  }
}

// Export types and service
export { sessions, users }
