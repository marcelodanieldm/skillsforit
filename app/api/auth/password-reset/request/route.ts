import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * POST /api/auth/password-reset/request
 * 
 * Solicita un reset de contraseña
 * 
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    const result = AuthService.requestPasswordReset(email)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // In production, send email with reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${result.token}`

    console.log(`[DEV] Password reset link: ${resetLink}`)

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un link de recuperación',
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && { 
        resetLink,
        token: result.token 
      })
    })

  } catch (error: any) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
