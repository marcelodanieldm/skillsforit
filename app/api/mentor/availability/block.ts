import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/mentor/availability/block
 * Bloquear días completos, fines de semana o semanas completas para un mentor
 * Body: { mentorId, blockType: 'day' | 'week' | 'weekend', days?: number[] }
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { mentorId, blockType, days } = body

    if (!mentorId || !blockType) {
      return NextResponse.json({ success: false, error: 'mentorId y blockType requeridos' }, { status: 400 })
    }

    let daysToBlock: number[] = []
    if (blockType === 'day' && Array.isArray(days)) {
      daysToBlock = days
    } else if (blockType === 'week') {
      daysToBlock = [0,1,2,3,4,5,6]
    } else if (blockType === 'weekend') {
      daysToBlock = [0,6]
    } else {
      return NextResponse.json({ success: false, error: 'blockType o days inválidos' }, { status: 400 })
    }

    // Desactivar todos los slots activos para esos días
    const { error } = await supabase
      .from('mentor_availability')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('mentor_id', mentorId)
      .in('day_of_week', daysToBlock)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Días bloqueados correctamente' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
