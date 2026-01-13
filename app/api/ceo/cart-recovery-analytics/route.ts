import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/ceo/cart-recovery-analytics
 * 
 * Endpoint para obtener métricas de recuperación de carritos
 * Usa las vistas SQL creadas en la migración
 */
export async function GET(request: Request) {
  try {
    // Obtener analytics desde la vista
    const { data: analytics, error: analyticsError } = await supabase
      .from('cart_recovery_analytics')
      .select('*')
      .single()

    if (analyticsError) {
      console.error('Error fetching cart recovery analytics:', analyticsError)
      return NextResponse.json(
        { success: false, error: 'Error al cargar analytics' },
        { status: 500 }
      )
    }

    // Obtener timeline de recuperaciones recientes
    const { data: timeline, error: timelineError } = await supabase
      .from('recovery_timeline')
      .select('*')
      .limit(20)

    if (timelineError) {
      console.error('Error fetching recovery timeline:', timelineError)
    }

    return NextResponse.json({
      success: true,
      analytics,
      timeline: timeline || []
    })

  } catch (error: any) {
    console.error('Error in cart-recovery-analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
