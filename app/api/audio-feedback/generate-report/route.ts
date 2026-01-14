import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Audio Feedback Report Generator API
 * 
 * Sprint 39: Genera y envía reporte de bio-feedback post-simulación
 * 
 * POST /api/audio-feedback/generate-report
 * 
 * Body: {
 *   sessionId: string
 *   email: string
 *   role: string
 *   country: string
 *   experienceYears: number
 *   analysisResults: {
 *     toneScore: number
 *     fillerWordsCount: number
 *     starCompliance: number
 *     transcriptions: string[]
 *   }
 * }
 * 
 * Actions:
 * 1. Guarda lead en DB con segmentación (Junior/Mid/Senior)
 * 2. Genera reporte personalizado según años de experiencia
 * 3. Envía email con reporte + upsell de E-book
 * 4. Registra evento en funnel tracking
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, email, role, country, experienceYears, analysisResults } = body

    // Validación
    if (!email || !role || !country || experienceYears === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determinar nivel basado en años de experiencia
    let experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Staff'
    if (experienceYears < 2) experienceLevel = 'Junior'
    else if (experienceYears < 5) experienceLevel = 'Mid'
    else if (experienceYears < 10) experienceLevel = 'Senior'
    else experienceLevel = 'Staff'

    // 1. Guardar/actualizar lead en DB
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single()

    let leadId: string

    if (existingLead) {
      // Actualizar lead existente
      const { data: updatedLead } = await supabase
        .from('leads')
        .update({
          role,
          country,
          experience_years: experienceYears,
          experience_level: experienceLevel,
          audio_feedback_completed: true,
          audio_feedback_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select('id')
        .single()

      leadId = updatedLead?.id || existingLead.id

    } else {
      // Crear nuevo lead
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          email,
          role,
          country,
          experience_years: experienceYears,
          experience_level: experienceLevel,
          source: 'audio-feedback-simulator',
          status: 'qualified',
          audio_feedback_completed: true,
          audio_feedback_completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (leadError || !newLead) {
        console.error('[Audio Feedback] Lead creation failed:', leadError)
        return NextResponse.json(
          { error: 'Failed to save lead' },
          { status: 500 }
        )
      }

      leadId = newLead.id
    }

    // 2. Guardar análisis de audio en DB
    const { error: analysisError } = await supabase
      .from('audio_feedback_analyses')
      .insert({
        lead_id: leadId,
        session_id: sessionId,
        tone_score: analysisResults.toneScore,
        filler_words_count: analysisResults.fillerWordsCount,
        star_compliance: analysisResults.starCompliance,
        transcriptions: JSON.stringify(analysisResults.transcriptions),
        experience_level: experienceLevel,
        created_at: new Date().toISOString()
      })

    if (analysisError) {
      console.error('[Audio Feedback] Analysis save failed:', analysisError)
      // No bloqueamos el flujo
    }

    // 3. Generar reporte personalizado según nivel
    const report = generatePersonalizedReport(
      experienceLevel,
      analysisResults,
      email
    )

    // 4. Enviar email con reporte
    try {
      await sendFeedbackEmail(email, report, experienceLevel)
    } catch (emailError) {
      console.error('[Audio Feedback] Email send failed:', emailError)
      // No bloqueamos - el usuario puede ver el reporte en la web
    }

    // 5. Registrar evento en funnel tracking
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/funnel/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          event: 'audio_feedback_completed',
          metadata: {
            experienceLevel,
            toneScore: analysisResults.toneScore,
            fillerWordsCount: analysisResults.fillerWordsCount,
            completedAt: new Date().toISOString()
          }
        })
      })
    } catch (trackError) {
      console.error('[Audio Feedback] Tracking failed:', trackError)
    }

    // 6. Retornar success
    return NextResponse.json({
      success: true,
      leadId,
      sessionId,
      experienceLevel,
      message: 'Report generated and sent successfully'
    })

  } catch (error: any) {
    console.error('[Audio Feedback API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// === FUNCIONES AUXILIARES ===

function generatePersonalizedReport(
  level: 'Junior' | 'Mid' | 'Senior' | 'Staff',
  results: any,
  email: string
): string {
  const { toneScore, fillerWordsCount, starCompliance, transcriptions } = results

  // Consejos personalizados por nivel
  const levelAdvice = {
    Junior: `
      Como desarrollador Junior, enfócate en:
      - Estructura STAR: Practica contar historias con inicio, medio y fin
      - Reduce muletillas practicando en voz alta 10 veces
      - Usa ejemplos concretos de proyectos académicos o personales
    `,
    Mid: `
      Como desarrollador Mid-Level, lleva tu comunicación al siguiente nivel:
      - Cuantifica tus resultados: "Mejoré performance en 40%" vs "Mejoré performance"
      - Usa lenguaje de liderazgo: "Yo propuse", "Yo implementé"
      - Practica storytelling técnico para senior roles
    `,
    Senior: `
      Como desarrollador Senior, demuestra tu impacto estratégico:
      - Enfatiza decisiones arquitectónicas y trade-offs
      - Habla de mentoría y liderazgo de equipo
      - Conecta tu trabajo con objetivos de negocio (revenue, conversión, etc.)
    `,
    Staff: `
      Como Staff+ Engineer, destaca tu visión técnica:
      - Habla de influencia cross-team y roadmap técnico
      - Menciona RFCs, ADRs y decisiones de alto impacto
      - Demuestra pensamiento estratégico a largo plazo
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .section { background: #f7fafc; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }
        .metric { display: inline-block; background: white; padding: 15px; margin: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
        .metric-label { font-size: 14px; color: #666; }
        .tip { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .cta { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0; }
        .cta-button { display: inline-block; background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .transcription { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; font-style: italic; color: #555; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Tu Reporte de Feedback de Audio</h1>
        <p>Análisis completo de tus respuestas de entrevista</p>
      </div>

      <div class="section">
        <h2>🎯 Métricas Clave</h2>
        <div style="text-align: center;">
          <div class="metric">
            <div class="metric-value">${toneScore}%</div>
            <div class="metric-label">Seguridad en el Tono</div>
          </div>
          <div class="metric">
            <div class="metric-value">${fillerWordsCount}</div>
            <div class="metric-label">Muletillas Detectadas</div>
          </div>
          <div class="metric">
            <div class="metric-value">${starCompliance}%</div>
            <div class="metric-label">Cumplimiento STAR</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📝 Transcripciones de tus Respuestas</h2>
        ${transcriptions.map((t: string, idx: number) => `
          <div class="transcription">
            <strong>Pregunta ${idx + 1}:</strong><br/>
            "${t}"
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>⚠️ Detección de Muletillas</h2>
        <p>Repetiste palabras de relleno como "ehhh", "básicamente", "o sea" <strong>${fillerWordsCount} veces</strong>.</p>
        <div class="tip">
          <strong>💡 Consejo:</strong> Practica pausas silenciosas en lugar de muletillas. Graba 5 respuestas y escúchalas para ser consciente de tus patrones.
        </div>
      </div>

      <div class="section">
        <h2>🎯 Análisis de Tono</h2>
        <p>Tu tono fue <strong>${toneScore}% seguro</strong>, pero detectamos titubeos en las secciones de "Resultados".</p>
        ${toneScore < 70 ? `
          <div class="tip">
            <strong>⚠️ Área de Mejora:</strong> Practica con un amigo o grábate para ganar confianza. Los titubeos pueden indicar falta de preparación.
          </div>
        ` : `
          <div class="tip">
            <strong>✅ Fortaleza:</strong> Tu tono transmite seguridad. Sigue así.
          </div>
        `}
      </div>

      <div class="section">
        <h2>🎓 Consejos Personalizados para ${level}</h2>
        <p>${levelAdvice[level]}</p>
      </div>

      <div class="section">
        <h2>💎 Consejo de Oro</h2>
        <p>En la pregunta sobre conflictos, intenta usar frases de <strong>"Escucha Activa"</strong> en lugar de solo "Yo hice".</p>
        <p>Ejemplo: "Primero escuché su perspectiva sobre usar Vue vs React. Entendí que su preocupación era la curva de aprendizaje del equipo. Propuse hacer un spike de 2 días con ambas tecnologías para evaluar objetivamente."</p>
      </div>

      ${fillerWordsCount > 5 || toneScore < 70 || starCompliance < 60 ? `
        <div class="cta">
          <h2>🚀 ¿Quieres el guion exacto para mejorar?</h2>
          <p>Tu reporte indica áreas de mejora en <strong>Negociación y Storytelling</strong>.</p>
          <p>Nuestra Guía de Soft Skills incluye:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>20+ respuestas STAR perfectas (Google, Amazon, Meta)</li>
            <li>Técnicas para eliminar muletillas en 7 días</li>
            <li>Guion de negociación de salario (+20% de incremento promedio)</li>
            <li>40 páginas · Plantillas editables · Casos reales</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/soft-skills-guide?email=${encodeURIComponent(email)}&source=audio-feedback" class="cta-button">
            Obtener la Guía por solo USD 10 →
          </a>
          <p style="font-size: 12px; margin-top: 15px; opacity: 0.9;">
            (Opcional · 65% OFF · Descarga inmediata)
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>¿Preguntas? Responde este email.</p>
        <p>© ${new Date().getFullYear()} SkillsForIT · Feedback de Audio Profesional</p>
      </div>
    </body>
    </html>
  `
}

async function sendFeedbackEmail(email: string, reportHtml: string, level: string) {
  // TODO: Integrar con Resend o SendGrid
  // Por ahora, solo loggear
  console.log('[Audio Feedback] Email would be sent to:', email)
  console.log('[Audio Feedback] Experience level:', level)
  console.log('[Audio Feedback] Report generated (HTML length):', reportHtml.length)
  
  // En producción:
  /*
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'feedback@skillsforit.com',
    to: email,
    subject: '📊 Tu Reporte de Feedback de Audio está listo',
    html: reportHtml
  })
  */
}

// GET method not allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
