import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!analysisId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing analysisId or paymentIntentId' },
        { status: 400 }
      )
    }

    // Verify payment was successful
    const { data: payment, error: paymentError } = await supabase
      .from('cv_audit_payments')
      .select('*')
      .eq('analysis_id', analysisId)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('status', 'completed')
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found or not completed' },
        { status: 403 }
      )
    }

    // Get the full analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('cv_analyses')
      .select('full_analysis')
      .eq('id', analysisId)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...analysis.full_analysis,
      analysisId,
      paymentIntentId
    })

  } catch (error: any) {
    console.error('[CV Full Report] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve full report' },
      { status: 500 }
    )
  }
}