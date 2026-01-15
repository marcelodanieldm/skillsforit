import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/cart/recover
 * 
 * Magic Link handler que:
 * 1. Valida el token
 * 2. Obtiene el carrito abandonado
 * 3. Verifica cupón activo
 * 4. Retorna datos para pre-cargar checkout
 * 
 * Body:
 * {
 *   token: string
 * }
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    // Buscar email con este token
    const supabase = getSupabase()
    const { data: email, error: emailError } = await supabase
      .from('recovery_emails')
      .select(`
        *,
        abandoned_carts (*)
      `)
      .eq('magic_token', token)
      .single()

    if (emailError || !email) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 404 }
      )
    }

    const cart = email.abandoned_carts

    // Validar que el carrito no esté ya recuperado o expirado
    if (cart.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          error: cart.status === 'recovered' 
            ? 'Este carrito ya fue recuperado' 
            : 'Este carrito ha expirado' 
        },
        { status: 400 }
      )
    }

    // Verificar si hay un cupón activo asociado
    const { data: coupon } = await supabase
      .from('recovery_coupons')
      .select('*')
      .eq('code', email.coupon_code)
      .eq('status', 'active')
      .single()

    // Validar expiración del cupón
    if (coupon && new Date(coupon.valid_until) < new Date()) {
      await supabase
        .from('recovery_coupons')
        .update({ status: 'expired' })
        .eq('id', coupon.id)
      
      // Continuar sin cupón
      return NextResponse.json({
        success: true,
        cart,
        coupon: null,
        message: 'Carrito recuperado, pero el cupón ha expirado'
      })
    }

    return NextResponse.json({
      success: true,
      cart,
      coupon,
      message: 'Carrito recuperado exitosamente'
    })

  } catch (error: any) {
    console.error('Error recovering cart:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cart/recover?token=xxx
 * 
 * Alternativa GET para testing
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token requerido' },
      { status: 400 }
    )
  }

  // Reutilizar lógica del POST
  return POST(request)
}
