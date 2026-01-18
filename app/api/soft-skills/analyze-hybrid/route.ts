import { NextRequest, NextResponse } from 'next/server'
import { SOFT_SKILLS_QUESTIONS } from '@/lib/prompts/soft-skills-analyzer'
import { getHuggingFaceProvider } from '@/lib/llm-strategy'

// function getOpenAI() {
//   return new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
//   })
// }

export async function POST(request: NextRequest) {
  const huggingface = getHuggingFaceProvider()
  
  try {
    const formData = await request.formData()
    
    const questionNumber = parseInt(formData.get('questionNumber') as string)
    const userResponse = formData.get('userResponse') as string
    const channel = formData.get('channel') as 'text' | 'voice'
    const audioFile = formData.get('audio') as Blob | null

    if (!questionNumber || !userResponse || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const question = SOFT_SKILLS_QUESTIONS[questionNumber - 1]

    // Word count
    const wordCount = userResponse.split(/\s+/).filter(w => w.length > 0).length

    // Build analysis prompt based on channel
    let analysisPrompt = ''
    
    if (channel === 'text') {
      analysisPrompt = `
Eres un experto en entrevistas técnicas. Analiza esta respuesta ESCRITA a una pregunta de comportamiento.

PREGUNTA: ${question.text}

RESPUESTA DEL CANDIDATO (ESCRITA):
"""
${userResponse}
"""

Evalúa específicamente para comunicación ESCRITA:

1. **Gramática y Ortografía** (0-100):
   - Errores de ortografía, puntuación, acentuación
   - Concordancia verbal y nominal
   - Estructura de oraciones

2. **Vocabulario Técnico** (0-100):
   - Uso apropiado de terminología IT
   - Precisión en términos técnicos
   - Nivel de sofisticación del lenguaje

3. **Estructura STAR** (0-100):
   - Situación: ¿Establece el contexto?
   - Tarea: ¿Define su responsabilidad?
   - Acción: ¿Describe pasos concretos?
   - Resultado: ¿Cuantifica el impacto?

4. **Red Flags**:
   - Respuestas vagas o genéricas
   - Falta de ejemplos concretos
   - Longitud inadecuada (muy corta o muy larga)

Responde en JSON:
{
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "starCompliance": 0-100,
  "overallScore": 0-100,
  "redFlags": [
    { "category": "string", "severity": "low|medium|high", "description": "string" }
  ],
  "strengths": ["string"],
  "improvements": ["string"]
}
`
    } else {
      // Voice analysis
      analysisPrompt = `
Eres un experto en entrevistas técnicas. Analiza esta respuesta HABLADA (transcrita) a una pregunta de comportamiento.

PREGUNTA: ${question.text}

TRANSCRIPCIÓN DE AUDIO:
"""
${userResponse}
"""

Evalúa específicamente para comunicación VERBAL:

1. **Tono y Confianza** (0-100):
   - Analiza el lenguaje usado (¿suena seguro o dubitativo?)
   - Palabras como "creo", "tal vez", "no sé" indican baja confianza
   - Oraciones afirmativas indican alta confianza

2. **Muletillas y Pausas**:
   - Cuenta palabras como: "este", "eh", "o sea", "entonces", "bueno", "pues"
   - Repeticiones innecesarias
   - Fragmentación excesiva

3. **Estructura STAR** (0-100):
   - Situación: ¿Establece el contexto?
   - Tarea: ¿Define su responsabilidad?
   - Acción: ¿Describe pasos concretos?
   - Resultado: ¿Cuantifica el impacto?

4. **Claridad Verbal**:
   - Coherencia del discurso
   - Fluidez narrativa
   - Capacidad de síntesis

Responde en JSON:
{
  "toneScore": 0-100,
  "fillerWordsCount": number,
  "starCompliance": 0-100,
  "overallScore": 0-100,
  "redFlags": [
    { "category": "string", "severity": "low|medium|high", "description": "string" }
  ],
  "strengths": ["string"],
  "improvements": ["string"]
}
`
    }

    // Call Hugging Face for analysis
    const { content, error } = await huggingface.complete({
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 512
    })
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    let parsed: any = {}
    try {
      parsed = JSON.parse(content || '{}')
    } catch {}

    // Build response based on channel
    const response = {
      wordCount,
      channel,
      ...(channel === 'text' ? {
        grammarScore: parsed.grammarScore || 70,
        vocabularyScore: parsed.vocabularyScore || 70,
        starCompliance: parsed.starCompliance || 65,
        overallScore: parsed.overallScore || 70
      } : {
        toneScore: parsed.toneScore || 70,
        fillerWordsCount: parsed.fillerWordsCount || 5,
        starCompliance: parsed.starCompliance || 65,
        overallScore: parsed.overallScore || 70
      }),
      redFlags: parsed.redFlags || [],
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || []
    }

    console.log('[Hybrid Analysis] Success:', {
      questionNumber,
      channel,
      wordCount,
      overallScore: response.overallScore
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('[Hybrid Analysis] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}
