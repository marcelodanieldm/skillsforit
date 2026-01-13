import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * GET /api/users/manage
 * 
 * Lista todos los usuarios (requiere rol CEO)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea CEO
    const authCheck = AuthService.requireRole(token, 'ceo')

    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 403 }
      )
    }

    const users = AuthService.getAllUsers()

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users/manage
 * 
 * Crea un nuevo usuario (requiere rol CEO)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea CEO
    const authCheck = AuthService.requireRole(token, 'ceo')

    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, role, password } = body

    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, name, role y password requeridos' },
        { status: 400 }
      )
    }

    const result = AuthService.createUser({ email, name, role, password })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user
    })

  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/manage
 * 
 * Actualiza un usuario (requiere rol CEO)
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea CEO
    const authCheck = AuthService.requireRole(token, 'ceo')

    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, role, password } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    const result = AuthService.updateUser(email, { name, role, password })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/manage?email=xxx
 * 
 * Elimina un usuario (requiere rol CEO)
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea CEO
    const authCheck = AuthService.requireRole(token, 'ceo')

    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    const result = AuthService.deleteUser(email)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
