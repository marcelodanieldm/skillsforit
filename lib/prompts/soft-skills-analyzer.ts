/**
 * Soft Skills Analyzer - STAR Method & Communication Patterns
 * 
 * Sprint 37: Simulador de Soft Skills con análisis psicológico
 * 
 * Analiza respuestas del usuario según:
 * 1. STAR Method (Situation, Task, Action, Result)
 * 2. Communication Style (Passive, Aggressive, Assertive)
 * 3. Leadership Indicators
 * 4. Conflict Resolution Patterns
 * 5. Red Flags (falta de ownership, victimización, etc.)
 */

// import { getLLMStrategyManager } from '../llm-strategy'

export interface STARMethodScore {
  situation: number      // 0-100: ¿Describe el contexto claramente?
  task: number          // 0-100: ¿Define el problema/objetivo?
  action: number        // 0-100: ¿Explica lo que HIZO específicamente?
  result: number        // 0-100: ¿Cuantifica el impacto?
  overall: number       // 0-100: Score general STAR
  missing: string[]     // Elementos faltantes ["No menciona resultados", etc.]
}

export interface CommunicationStyle {
  type: 'passive' | 'aggressive' | 'assertive' | 'passive-aggressive'
  confidence: number    // 0-100: Nivel de confianza detectado
  indicators: string[]  // Frases que delatan el estilo
  improvement: string   // Cómo mejorar
}

export interface SoftSkillsAnalysis {
  responseId: string
  timestamp: string
  questionNumber: 1 | 2 | 3
  questionText: string
  userResponse: string
  wordCount: number
  
  // STAR Method Analysis
  starScore: STARMethodScore
  
  // Communication Pattern
  communicationStyle: CommunicationStyle
  
  // Behavioral Indicators
  leadershipScore: number        // 0-100
  conflictResolutionScore: number // 0-100
  accountabilityScore: number     // 0-100
  
  // Red Flags
  redFlags: Array<{
    category: 'ownership' | 'blame' | 'vagueness' | 'passivity' | 'aggression'
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    example: string  // Frase específica del usuario
    fix: string      // Cómo reescribir
  }>
  
  // Strengths
  strengths: Array<{
    category: string
    description: string
    example: string
  }>
  
  // Overall Assessment
  overallLevel: 'Líder Estratégico' | 'Colaborador Proactivo' | 'Colaborador Reactivo' | 'Colaborador Pasivo'
  overallScore: number  // 0-100
  
  // Recommendations
  recommendations: Array<{
    priority: 1 | 2 | 3
    action: string
    impact: string
  }>
}

// === PREGUNTAS DEL SIMULADOR ===

export const SOFT_SKILLS_QUESTIONS = [
  {
    id: 1,
    text: "Cuéntame sobre una vez que tuviste un conflicto técnico con un compañero. ¿Cómo lo resolviste?",
    focus: "Conflict Resolution & Communication",
    idealAnswer: "Describe el conflicto específico, explica cómo escuchaste ambas perspectivas, propusiste una solución basada en datos, y el resultado fue positivo para el proyecto."
  },
  {
    id: 2,
    text: "¿Qué haces cuando un proyecto tiene un retraso crítico y el cliente está presionando?",
    focus: "Leadership & Accountability",
    idealAnswer: "Asume ownership, comunica proactivamente al cliente, propone un plan de acción con timeline realista, y lidera al equipo para ejecutar."
  },
  {
    id: 3,
    text: "Describe tu mayor error técnico y qué aprendiste de él.",
    focus: "Self-Awareness & Growth Mindset",
    idealAnswer: "Admite el error sin excusas, explica el impacto, describe qué hizo para solucionarlo, y qué sistema implementó para evitar que vuelva a pasar."
  }
] as const

// === PROMPT DE ANÁLISIS PSICOLÓGICO ===

const SOFT_SKILLS_ANALYSIS_PROMPT = `Eres un psicólogo organizacional experto en evaluación de competencias blandas para entrevistas técnicas.

Tu misión es analizar la respuesta del candidato a una pregunta de comportamiento (behavioral interview question) usando el método STAR (Situation, Task, Action, Result).

CRITERIOS DE EVALUACIÓN:

1. STAR METHOD (0-100 por componente):
   - Situation: ¿Describe el contexto y problema claramente?
   - Task: ¿Define qué tenía que lograr?
   - Action: ¿Explica específicamente lo que HIZO (no "decidimos", sino "yo hice X")?
   - Result: ¿Cuantifica el impacto? (mejora de X%, redujo tiempo en Y días, etc.)

2. COMMUNICATION STYLE:
   - Passive: Usa lenguaje vago, evita ownership ("se decidió", "hubo un problema")
   - Aggressive: Culpa a otros, lenguaje confrontacional
   - Assertive: Usa "yo" sin ser arrogante, admite errores, propone soluciones
   - Passive-Aggressive: Sarcasmo, víctima

3. LEADERSHIP INDICATORS:
   - Ownership: Usa "yo" en lugar de "nosotros" cuando habla de sus acciones
   - Proactividad: Anticipa problemas, no solo reacciona
   - Impacto: Habla de resultados, no solo de tareas

4. RED FLAGS:
   - Blame: Culpa a compañeros, managers, herramientas
   - Vagueness: No da ejemplos concretos, todo es abstracto
   - Passivity: Espera que otros resuelvan, no toma iniciativa
   - No Result: No menciona el resultado final

5. NIVELES DE COMPETENCIA:
   - Líder Estratégico (80-100): STAR completo, asertivo, ownership, impacto cuantificado
   - Colaborador Proactivo (60-79): STAR mayormente completo, buen ownership
   - Colaborador Reactivo (40-59): Falta claridad en STAR, ownership débil
   - Colaborador Pasivo (0-39): No usa STAR, pasivo, vago

IMPORTANTE:
- Sé específico en los red flags: cita frases exactas del usuario
- En "fix", muestra cómo reescribir la frase de forma asertiva
- Si la respuesta es corta (< 50 palabras), es automáticamente un red flag crítico

Devuelve SOLO JSON válido sin markdown.`

// === FUNCIÓN DE ANÁLISIS ===

export async function analyzeSoftSkillsResponse(
  questionNumber: 1 | 2 | 3,
  userResponse: string
): Promise<SoftSkillsAnalysis | null> {
  try {
    const question = SOFT_SKILLS_QUESTIONS[questionNumber - 1]
    const wordCount = userResponse.trim().split(/\s+/).length
    if (wordCount < 20) {
      // Respuesta muy corta → análisis predeterminado negativo
      return {
        responseId: `soft-skills-${Date.now()}`,
        timestamp: new Date().toISOString(),
        questionNumber,
        questionText: question.text,
        userResponse,
        wordCount,
        starScore: {
          situation: 0,
          task: 0,
          action: 0,
          result: 0,
          overall: 0,
          missing: ["Respuesta demasiado corta", "No describe situación", "No menciona acciones", "No cuantifica resultados"]
        },
        communicationStyle: {
          type: 'passive',
          confidence: 10,
          indicators: ["Respuesta mínima sin elaboración"],
          improvement: "Desarrolla tu respuesta usando el método STAR: describe la Situación, la Tarea, las Acciones específicas que tomaste, y los Resultados cuantificados."
        },
        leadershipScore: 10,
        conflictResolutionScore: 10,
        accountabilityScore: 10,
        redFlags: [
          {
            category: 'vagueness',
            severity: 'critical',
            description: 'Respuesta extremadamente corta sin detalles',
            example: userResponse,
            fix: 'Expande tu respuesta a al menos 100-150 palabras incluyendo contexto, acciones concretas y resultados medibles.'
          }
        ],
        strengths: [],
        overallLevel: 'Colaborador Pasivo',
        overallScore: 10,
        recommendations: [
          {
            priority: 1,
            action: 'Estudia el método STAR y practica respuestas estructuradas de 2-3 minutos',
            impact: 'Aumentarás tu credibilidad en entrevistas en un 200%'
          },
          {
            priority: 2,
            action: 'Usa ejemplos concretos con números y resultados específicos',
            impact: 'Los reclutadores podrán visualizar tu impacto real'
          }
        ]
      }
    }

    // Prompt con contexto
    const prompt = `
PREGUNTA DE ENTREVISTA:
"${question.text}"

ENFOQUE: ${question.focus}

RESPUESTA DEL CANDIDATO:
"""
${userResponse}
"""

ANÁLISIS REQUERIDO:
Analiza esta respuesta según los criterios de STAR Method, Communication Style, Leadership Indicators y Red Flags.

SCHEMA JSON:
{
  "starScore": {
    "situation": number (0-100),
    "task": number (0-100),
    "action": number (0-100),
    "result": number (0-100),
    "overall": number (0-100),
    "missing": string[]
  },
  "communicationStyle": {
    "type": "passive" | "aggressive" | "assertive" | "passive-aggressive",
    "confidence": number (0-100),
    "indicators": string[],
    "improvement": string
  },
  "leadershipScore": number (0-100),
  "conflictResolutionScore": number (0-100),
  "accountabilityScore": number (0-100),
  "redFlags": [
    {
      "category": "ownership" | "blame" | "vagueness" | "passivity" | "aggression",
      "severity": "critical" | "high" | "medium" | "low",
      "description": string,
      "example": string (cita exacta del usuario),
      "fix": string (cómo reescribir)
    }
  ],
  "strengths": [
    {
      "category": string,
      "description": string,
      "example": string
    }
  ],
  "overallLevel": "Líder Estratégico" | "Colaborador Proactivo" | "Colaborador Reactivo" | "Colaborador Pasivo",
  "overallScore": number (0-100),
  "recommendations": [
    {
      "priority": 1 | 2 | 3,
      "action": string,
      "impact": string
    }
  ]
}

Devuelve SOLO el JSON sin markdown.`

    // Llamada directa a Hugging Face Inference API (Mistral-7B-Instruct-v0.2)
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error('Falta la variable HUGGINGFACE_API_KEY en el entorno');

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 1024, temperature: 0.3 },
        options: { wait_for_model: true }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Hugging Face API error: ' + errorText);
    }
    const data = await response.json();
    // El modelo devuelve un array con un objeto { generated_text }
    const content = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    if (!content) throw new Error('La respuesta de Hugging Face no contiene texto generado');

    // Intentar parsear el JSON si el modelo lo devuelve como bloque de código
    let parsed: any;
    let clean = content.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Si no es JSON, devolver todo como recomendación
      parsed = { recommendations: [clean] };
    }

    const analysis: SoftSkillsAnalysis = {
      responseId: `soft-skills-${Date.now()}`,
      timestamp: new Date().toISOString(),
      questionNumber,
      questionText: question.text,
      userResponse,
      wordCount,
      ...parsed
    };
    return analysis;
  } catch (error) {
    console.error('[SoftSkills] Analysis error:', error);
    return null;
  }
}

// === FUNCIÓN DE ANÁLISIS COMPLETO (3 preguntas) ===

export interface CompleteSoftSkillsReport {
  sessionId: string
  timestamp: string
  analyses: SoftSkillsAnalysis[]
  
  // Agregados
  averageSTARScore: number
  averageLeadershipScore: number
  averageConflictResolutionScore: number
  averageAccountabilityScore: number
  overallScore: number
  
  // Patrón dominante
  dominantCommunicationStyle: 'passive' | 'aggressive' | 'assertive' | 'passive-aggressive'
  
  // Red flags consolidados
  totalRedFlags: number
  criticalRedFlags: number
  
  // Nivel final
  finalLevel: 'Líder Estratégico' | 'Colaborador Proactivo' | 'Colaborador Reactivo' | 'Colaborador Pasivo'
  
  // Recomendaciones prioritarias
  topRecommendations: Array<{
    priority: 1 | 2 | 3
    action: string
    impact: string
  }>
  
  // Radar Chart Data
  radarData: {
    labels: string[]
    scores: number[]
  }
}

export async function generateCompleteSoftSkillsReport(
  analyses: SoftSkillsAnalysis[]
): Promise<CompleteSoftSkillsReport> {
  // Cálculos agregados
  const avgSTAR = analyses.reduce((sum, a) => sum + a.starScore.overall, 0) / analyses.length
  const avgLeadership = analyses.reduce((sum, a) => sum + a.leadershipScore, 0) / analyses.length
  const avgConflict = analyses.reduce((sum, a) => sum + a.conflictResolutionScore, 0) / analyses.length
  const avgAccountability = analyses.reduce((sum, a) => sum + a.accountabilityScore, 0) / analyses.length
  const overallScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length
  
  // Communication style dominante
  const styles = analyses.map(a => a.communicationStyle.type)
  const styleCounts = styles.reduce((acc, style) => {
    acc[style] = (acc[style] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const dominantStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0][0] as any
  
  // Red flags
  const allRedFlags = analyses.flatMap(a => a.redFlags)
  const criticalCount = allRedFlags.filter(rf => rf.severity === 'critical').length
  
  // Nivel final
  let finalLevel: CompleteSoftSkillsReport['finalLevel']
  if (overallScore >= 80) finalLevel = 'Líder Estratégico'
  else if (overallScore >= 60) finalLevel = 'Colaborador Proactivo'
  else if (overallScore >= 40) finalLevel = 'Colaborador Reactivo'
  else finalLevel = 'Colaborador Pasivo'
  
  // Top 3 recomendaciones
  const allRecs = analyses.flatMap(a => a.recommendations)
  const topRecs = allRecs
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
  
  // Radar data
  const radarData = {
    labels: [
      'STAR Method',
      'Liderazgo',
      'Resolución de Conflictos',
      'Accountability',
      'Comunicación Asertiva'
    ],
    scores: [
      avgSTAR,
      avgLeadership,
      avgConflict,
      avgAccountability,
      analyses.reduce((sum, a) => sum + a.communicationStyle.confidence, 0) / analyses.length
    ]
  }
  
  return {
    sessionId: `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
    analyses,
    averageSTARScore: avgSTAR,
    averageLeadershipScore: avgLeadership,
    averageConflictResolutionScore: avgConflict,
    averageAccountabilityScore: avgAccountability,
    overallScore,
    dominantCommunicationStyle: dominantStyle,
    totalRedFlags: allRedFlags.length,
    criticalRedFlags: criticalCount,
    finalLevel,
    topRecommendations: topRecs,
    radarData
  }
}
