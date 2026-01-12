'use client'

import { ComponentType, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/auth'

interface WithAuthOptions {
  requiredRoles?: UserRole[]
  redirectTo?: string
}

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * Higher Order Component (HOC) para proteger rutas con autenticación
 * 
 * Uso:
 * ```tsx
 * export default withAuth(MyComponent, { 
 *   requiredRoles: ['ceo', 'admin'],
 *   redirectTo: '/ceo/login'
 * })
 * ```
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P & { user: AuthUser }>,
  options: WithAuthOptions = {}
) {
  const {
    requiredRoles = ['ceo', 'admin'],
    redirectTo = '/ceo/login'
  } = options

  return function WithAuthComponent(props: P) {
    const router = useRouter()
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Get token from localStorage
          const token = localStorage.getItem('ceo_token')
          const storedUser = localStorage.getItem('ceo_user')

          if (!token || !storedUser) {
            router.push(redirectTo)
            return
          }

          const userData: AuthUser = JSON.parse(storedUser)

          // Check if user has required role
          if (!requiredRoles.includes(userData.role)) {
            console.error('Access denied: User role not authorized')
            router.push(redirectTo)
            return
          }

          // Validate session with backend
          const response = await fetch('/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            console.error('Session validation failed')
            localStorage.removeItem('ceo_token')
            localStorage.removeItem('ceo_user')
            router.push(redirectTo)
            return
          }

          const data = await response.json()

          if (!data.valid) {
            console.error('Invalid session')
            localStorage.removeItem('ceo_token')
            localStorage.removeItem('ceo_user')
            router.push(redirectTo)
            return
          }

          // User is authorized
          setUser(userData)
          setAuthorized(true)
        } catch (error) {
          console.error('Auth check failed:', error)
          router.push(redirectTo)
        } finally {
          setLoading(false)
        }
      }

      checkAuth()
    }, [router, redirectTo])

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Verificando permisos...</p>
          </div>
        </div>
      )
    }

    if (!authorized || !user) {
      return null
    }

    return <WrappedComponent {...props} user={user} />
  }
}

/**
 * Hook personalizado para acceder al usuario autenticado en componentes protegidos
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('ceo_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return user
}
