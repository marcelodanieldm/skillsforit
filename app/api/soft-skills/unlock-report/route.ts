import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Soft Skills Unlock Report API
 * 
 * Sprint 37: Captura lead + envía reporte completo por email + redirige a funnel de ventas
 * 
 * POST /api/soft-skills/unlock-report
 * Body: { email: string, responses: string[], analyses: any[] }
 * 
 * Actions:
 * 1. Guarda lead en DB con tag "soft-skills-simulator"
 * 2. Guarda análisis completo en DB
 * 3. Envía email con reporte PDF (opcional)
 * 4. Registra evento en analytics
 * 5. Retorna success + sessionId para página de resultados
 */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body = await request.json()
    const { email, responses, analyses } = body

    // Validación
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!responses || !Array.isArray(responses) || responses.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid responses. Must be an array of 3 strings.' },
        { status: 400 }
      )
    }

    if (!analyses || !Array.isArray(analyses) || analyses.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid analyses. Must be an array of 3 results.' },
        { status: 400 }
      )
    }

    const sessionId = `soft-skills-${Date.now()}`

    // 1. Verificar si el lead ya existe
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email')
      .eq('email', email)
      .single()

    let leadId: string

    if (existingLead) {
      // Lead existente - actualizar metadata
      leadId = existingLead.id
      
      await supabase
        .from('leads')
        .update({
          soft_skills_completed: true,
          soft_skills_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
      
    } else {
      // Nuevo lead - crear
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          email,
          source: 'soft-skills-simulator',
          status: 'qualified',  // Lead calificado porque completó el simulador
          soft_skills_completed: true,
          soft_skills_completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (leadError || !newLead) {
        console.error('[SoftSkills Unlock] Lead creation failed:', leadError)
        return NextResponse.json(
          { error: 'Failed to save lead' },
          { status: 500 }
        )
      }

      leadId = newLead.id
    }

    // 2. Guardar análisis completo en DB
    const avgScore = analyses.reduce((sum: number, a: any) => sum + (a.overallScore || 0), 0) / 3
    const totalRedFlags = analyses.reduce((sum: number, a: any) => sum + (a.redFlags?.length || 0), 0)
    
    const { error: analysisError } = await supabase
      .from('soft_skills_analyses')
      .insert({
        lead_id: leadId,
        session_id: sessionId,
        responses: JSON.stringify(responses),
        analyses: JSON.stringify(analyses),
        overall_score: avgScore,
        total_red_flags: totalRedFlags,
        created_at: new Date().toISOString()
      })

    if (analysisError) {
      console.error('[SoftSkills Unlock] Analysis save failed:', analysisError)
      // No bloqueamos el flujo si falla el guardado
    }

    // 3. Registrar evento de conversión en funnel tracking
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/funnel/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          event: 'soft_skills_completed',
          metadata: {
            avgScore,
            totalRedFlags,
            completedAt: new Date().toISOString()
          }
        })
      })
    } catch (trackError) {
      console.error('[SoftSkills Unlock] Tracking failed:', trackError)
      // No bloqueamos
    }

    // 4. TODO: Enviar email con reporte (opcional)
    // Podemos implementar con SendGrid o Resend
    
    /*
    try {
      await fetch('/api/email/send-soft-skills-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sessionId,
          analyses
        })
      })
    } catch (emailError) {
      console.error('[SoftSkills Unlock] Email send failed:', emailError)
    }
    */

    // 5. Retornar success con sessionId
    return NextResponse.json({
      success: true,
      sessionId,
      leadId,
      message: 'Report unlocked successfully',
      redirectUrl: `/soft-skills/report?sessionId=${sessionId}&email=${encodeURIComponent(email)}`
    })

  } catch (error: any) {
    console.error('[SoftSkills Unlock API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET method not allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
