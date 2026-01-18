import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { generatePDFReport } from '@/lib/pdf-generator'
import { sendAnalysisReport } from '@/lib/email'
import { SOFT_SKILLS_QUESTIONS } from '@/lib/prompts/soft-skills-analyzer'

/**
 * POST /api/soft-skills/send-report
 * Body: { sessionId: string, premiumAnswers?: string[] }
 * Returns: { success: boolean, url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, premiumAnswers } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
    }
    // Buscar análisis en la base de datos (simulador o CV)
    const analysis = db.findById(sessionId);
    if (!analysis || !analysis.analysisResult) {
      return NextResponse.json({ error: 'Análisis no encontrado o incompleto' }, { status: 404 });
    }

    // --- IT USER CREATION & TEMP PASSWORD LOGIC ---
    // Buscar usuario IT, si no existe, crearlo con password temporal
    const { usersDb } = await import('@/lib/database');
    let tempPassword: string | undefined = undefined;
    let user = usersDb.findByEmail(analysis.email);
    if (!user) {
      // Generar password temporal seguro
      tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2);
      // Crear usuario IT
      user = usersDb.create({
        id: sessionId,
        name: analysis.name,
        email: analysis.email,
        password: tempPassword,
        role: 'mentee',
        createdAt: new Date(),
      });
    }

    // Generar PDF
    const pdfUrl = await generatePDFReport(analysis, analysis.analysisResult, premiumAnswers);
    // Enviar por email, pasando la contraseña temporal si corresponde
    await sendAnalysisReport(analysis.email, analysis.name, `./public${pdfUrl}`, tempPassword);
    // Guardar URL del reporte en el análisis para dashboard
    db.update(sessionId, { reportUrl: pdfUrl });
    return NextResponse.json({ success: true, url: pdfUrl });
  } catch (error) {
    console.error('[PDF EMAIL] Error:', error);
    return NextResponse.json({ error: 'Error enviando PDF por email' }, { status: 500 });
  }
}
