import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * Endpoint para validar sesiones activas
 * Usado por el HOC withAuth para verificar permisos
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { valid: false, error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const validation = AuthService.validateSession(token)

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      session: {
        userId: validation.session!.userId,
        email: validation.session!.email,
        role: validation.session!.role,
        expiresAt: validation.session!.expiresAt
      }
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Error validando sesión' },
      { status: 500 }
    )
  }
}
