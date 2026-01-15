import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI()
  
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Convert Blob to File for Whisper API
    const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' })

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'es',
      response_format: 'text'
    })

    console.log('[Transcribe] Success:', {
      length: transcription.length,
      preview: transcription.substring(0, 50)
    })

    return NextResponse.json({
      transcription,
      wordCount: transcription.split(/\s+/).length
    })

  } catch (error: any) {
    console.error('[Transcribe] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}
