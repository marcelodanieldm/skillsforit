import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Transcripción de audio no soportada actualmente (no hay endpoint Whisper gratuito en Hugging Face)
  return NextResponse.json({ error: 'Transcripción de audio no soportada actualmente. Usa un servicio externo o suscríbete a Hugging Face Inference Endpoints.' }, { status: 501 })
}
