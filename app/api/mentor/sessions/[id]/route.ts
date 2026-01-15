import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PUT: Actualizar estado de sesión (Start, Complete, Cancel)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase()
  
  try {
    const { id: sessionId } = await params
    const body = await req.json()
    const { action, notes, action_items, rating, renewal_sent } = body

    // Obtener sesión actual
    const { data: session, error: fetchError } = await supabase
      .from('mentor_bookings')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sesión no encontrada' 
      }, { status: 404 })
    }

    let updates: any = {}

    switch (action) {
      case 'start':
        // Validar que no esté ya en progreso
        if (session.status === 'in_progress') {
          return NextResponse.json({ 
            success: false, 
            error: 'La sesión ya está en progreso' 
          }, { status: 409 })
        }

        updates = {
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      case 'complete':
        // Validar que esté en progreso
        if (session.status !== 'in_progress') {
          return NextResponse.json({ 
            success: false, 
            error: 'La sesión debe estar en progreso para completarla' 
          }, { status: 400 })
        }

        const startedAt = new Date(session.started_at)
        const completedAt = new Date()
        const actualDuration = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000)

        updates = {
          status: 'completed',
          completed_at: completedAt.toISOString(),
          actual_duration_minutes: actualDuration,
          mentor_notes: notes || session.mentor_notes,
          action_items: action_items || session.action_items,
          rating: rating || session.rating,
          updated_at: new Date().toISOString()
        }
        break

      case 'cancel':
        updates = {
          status: 'cancelled',
          cancellation_reason: notes || 'Cancelled by mentor',
          updated_at: new Date().toISOString()
        }
        break

      case 'update_notes':
        // Autoguardado con debounce (solo actualizar notas)
        updates = {
          mentor_notes: notes,
          action_items: action_items,
          updated_at: new Date().toISOString()
        }
        break

      case 'send_renewal':
        // Marcar que se envió el link de renovación
        updates = {
          renewal_link_sent: true,
          renewal_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Acción no válida' 
        }, { status: 400 })
    }

    // Actualizar sesión
    const { data: updatedSession, error: updateError } = await supabase
      .from('mentor_bookings')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Si la sesión se completó, actualizar billetera del mentor
    if (action === 'complete') {
      await updateMentorWallet(session.mentor_id, session.amount)
    }

    return NextResponse.json({
      success: true,
      data: updatedSession
    })
  } catch (error: any) {
    console.error('Error updating session:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// DELETE: Cancelar sesión
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase()
  
  try {
    const { id: sessionId } = await params
    const { searchParams } = new URL(req.url)
    const reason = searchParams.get('reason') || 'Cancelled by mentor'

    const { data: session, error } = await supabase
      .from('mentor_bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: session
    })
  } catch (error: any) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Helper: Actualizar billetera del mentor
async function updateMentorWallet(mentorId: string, sessionAmount: number) {
  try {
    // Comisión del mentor: 70% del pago
    const mentorEarnings = sessionAmount * 0.7

    // Obtener o crear wallet del mentor
    const { data: wallet, error: walletError } = await supabase
      .from('mentor_wallets')
      .select('*')
      .eq('mentor_id', mentorId)
      .single()

    if (walletError || !wallet) {
      // Crear wallet si no existe
      await supabase
        .from('mentor_wallets')
        .insert({
          mentor_id: mentorId,
          balance: mentorEarnings,
          total_earned: mentorEarnings,
          sessions_completed: 1,
          last_payout_date: null,
          created_at: new Date().toISOString()
        })
    } else {
      // Actualizar wallet existente
      await supabase
        .from('mentor_wallets')
        .update({
          balance: wallet.balance + mentorEarnings,
          total_earned: wallet.total_earned + mentorEarnings,
          sessions_completed: wallet.sessions_completed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('mentor_id', mentorId)
    }

    // Registrar transacción
    await supabase
      .from('mentor_transactions')
      .insert({
        mentor_id: mentorId,
        type: 'session_completed',
        amount: mentorEarnings,
        description: `Sesión completada - Comisión 70%`,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error updating mentor wallet:', error)
  }
}
