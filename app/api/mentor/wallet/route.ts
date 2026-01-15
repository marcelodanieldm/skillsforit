import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: Obtener wallet del mentor
export async function GET(req: Request) {
  const supabase = getSupabase()
  
  try {
    const { searchParams } = new URL(req.url)
    const mentorId = searchParams.get('mentorId')

    if (!mentorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'mentorId es requerido' 
      }, { status: 400 })
    }

    // Obtener wallet
    const { data: wallet, error: walletError } = await supabase
      .from('mentor_wallets')
      .select('*')
      .eq('mentor_id', mentorId)
      .single()

    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError
    }

    // Si no existe, crear wallet inicial
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('mentor_wallets')
        .insert({
          mentor_id: mentorId,
          balance: 0,
          total_earned: 0,
          sessions_completed: 0,
          last_payout_date: null,
          next_payout_date: getNextPayoutDate(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError

      return NextResponse.json({
        success: true,
        data: {
          ...newWallet,
          transactions: []
        }
      })
    }

    // Obtener transacciones recientes
    const { data: transactions, error: txError } = await supabase
      .from('mentor_transactions')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (txError) throw txError

    return NextResponse.json({
      success: true,
      data: {
        ...wallet,
        transactions: transactions || []
      }
    })
  } catch (error: any) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// POST: Solicitar pago (payout)
export async function POST(req: Request) {
  const supabase = getSupabase()
  
  try {
    const body = await req.json()
    const { mentor_id, amount, bank_account } = body

    if (!mentor_id || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 })
    }

    // Obtener wallet
    const { data: wallet, error: walletError } = await supabase
      .from('mentor_wallets')
      .select('*')
      .eq('mentor_id', mentor_id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet no encontrado' 
      }, { status: 404 })
    }

    // Validar saldo suficiente
    if (wallet.balance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saldo insuficiente' 
      }, { status: 400 })
    }

    // Validar monto mínimo ($50)
    if (amount < 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'El monto mínimo de retiro es $50' 
      }, { status: 400 })
    }

    // Crear solicitud de pago
    const { data: payout, error: payoutError } = await supabase
      .from('mentor_payouts')
      .insert({
        mentor_id,
        amount,
        bank_account,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    if (payoutError) throw payoutError

    // Actualizar wallet (restar del balance)
    await supabase
      .from('mentor_wallets')
      .update({
        balance: wallet.balance - amount,
        last_payout_date: new Date().toISOString(),
        next_payout_date: getNextPayoutDate(),
        updated_at: new Date().toISOString()
      })
      .eq('mentor_id', mentor_id)

    // Registrar transacción
    await supabase
      .from('mentor_transactions')
      .insert({
        mentor_id,
        type: 'payout_requested',
        amount: -amount, // Negativo porque es un retiro
        description: `Solicitud de pago pendiente`,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: payout
    })
  } catch (error: any) {
    console.error('Error requesting payout:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Helper: Calcular próxima fecha de pago (cada 15 días)
function getNextPayoutDate(): string {
  const now = new Date()
  const nextPayout = new Date(now)
  nextPayout.setDate(now.getDate() + 15)
  return nextPayout.toISOString()
}
