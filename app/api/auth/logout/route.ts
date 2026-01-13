import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * POST /api/auth/logout
 * 
 * Cierra sesión del usuario y destruye el token
 * 
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    const success = AuthService.logout(token)

    return NextResponse.json({
      success,
      message: success ? 'Sesión cerrada exitosamente' : 'Token no encontrado'
    })

  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
