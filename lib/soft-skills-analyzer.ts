/**
 * Sprint 37: Soft Skills Analyzer
 * 
 * Analiza respuestas de entrevistas comportamentales usando:
 * 1. STAR Method Scoring (Situación, Tarea, Acción, Resultado)
 * 2. Communication Pattern Detection (Pasivo, Agresivo, Asertivo)
 * 3. Leadership & Conflict Resolution Indicators
 */


// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface SoftSkillQuestion {
  id: string
  category: 'conflict_resolution' | 'leadership' | 'error_learning'
  question: string
  followUp?: string
}

export interface STARAnalysis {
  situation: { present: boolean; score: number; feedback: string }
  task: { present: boolean; score: number; feedback: string }
  action: { present: boolean; score: number; feedback: string }
  result: { present: boolean; score: number; feedback: string }
  overallScore: number
  narrativeClarity: number
}

export interface CommunicationPattern {
  style: 'passive' | 'aggressive' | 'assertive' | 'passive-aggressive'
  confidence: number
  indicators: string[]
  recommendation: string
}

export interface SoftSkillScore {
  category: string
  score: number // 0-100
  level: 'beginner' | 'developing' | 'competent' | 'proficient' | 'expert'
  insights: string[]
}

export interface RedFlag {
  category: string
  severity: 'low' | 'medium' | 'high'
  description: string
  solution: string // Bloqueado hasta registro
}

export interface SoftSkillsReport {
  sessionId: string
  overallLevel: string
  overallScore: number
  radarData: {
    leadership: number
    communication: number
    conflictResolution: number
    problemSolving: number
    emotionalIntelligence: number
    adaptability: number
  }
  starAnalysis: Record<string, STARAnalysis>
  communicationPattern: CommunicationPattern
  scores: SoftSkillScore[]
  redFlags: RedFlag[]
  strengths: string[]
  responseDepth: number // Promedio de palabras por respuesta
  engagementLevel: 'low' | 'medium' | 'high'
  recommendations: string[] // Bloqueadas hasta registro
  createdAt: Date
}

// =====================================================
// PREGUNTAS DEL SIMULADOR
// =====================================================

export const SOFT_SKILL_QUESTIONS: SoftSkillQuestion[] = [
  {
    id: 'q1_conflict',
    category: 'conflict_resolution',
    question: 'Cuéntame sobre una vez que tuviste un conflicto técnico con un compañero. ¿Cómo lo resolviste?',
    followUp: '¿Qué aprendiste de esa experiencia?'
  },
  {
    id: 'q2_pressure',
    category: 'leadership',
    question: '¿Qué haces cuando un proyecto tiene un retraso crítico y el cliente está presionando?',
    followUp: '¿Cómo comunicas las malas noticias?'
  },
  {
    id: 'q3_error',
    category: 'error_learning',
    question: 'Describe tu mayor error técnico y qué aprendiste de él.',
    followUp: '¿Cómo evitaste que se repitiera?'
  }
]

// =====================================================
// PROMPT DE ANÁLISIS PSICOLÓGICO-ORGANIZACIONAL
// =====================================================

const ANALYSIS_SYSTEM_PROMPT = `Eres un experto en Psicología Organizacional e Inteligencia Emocional especializado en evaluar candidatos IT para empresas FAANG (Google, Amazon, Meta, Apple, Netflix).

Tu tarea es analizar respuestas de entrevistas comportamentales con precisión clínica.

## Metodología de Análisis

### 1. STAR Method Scoring
Evalúa si la respuesta contiene:
- **Situación (S)**: Contexto claro del escenario (cuándo, dónde, con quién)
- **Tarea (T)**: Responsabilidad específica del candidato
- **Acción (A)**: Pasos concretos que tomó (en primera persona)
- **Resultado (R)**: Outcome medible o aprendizaje demostrable

### 2. Patrón de Comunicación
Clasifica el estilo:
- **Pasivo**: Evita conflicto, culpa externa, lenguaje tentativo ("creo que...", "tal vez...")
- **Agresivo**: Culpa a otros, lenguaje confrontacional, falta de autocrítica
- **Asertivo**: Toma responsabilidad, comunica claramente, busca soluciones
- **Pasivo-Agresivo**: Crítica indirecta, sarcasmo, evade responsabilidad

### 3. Indicadores de Liderazgo
Busca señales de:
- Iniciativa propia vs. esperar instrucciones
- Pensamiento sistémico vs. reactivo
- Empatía y colaboración
- Capacidad de influencia sin autoridad formal

### 4. Red Flags Críticos
Detecta banderas rojas que descalificarían al candidato:
- Culpar sistemáticamente a otros
- No mostrar aprendizaje de errores
- Falta de métricas o resultados concretos
- Respuestas genéricas sin ejemplos reales

## Formato de Respuesta
Responde ÚNICAMENTE en JSON válido con esta estructura exacta.`

const ANALYSIS_USER_PROMPT = (question: string, answer: string, category: string) => `
Analiza esta respuesta de entrevista comportamental:

**Categoría**: ${category}
**Pregunta**: ${question}
**Respuesta del candidato**: ${answer}

Responde en JSON con esta estructura exacta:
{
  "starAnalysis": {
    "situation": { "present": true/false, "score": 0-100, "feedback": "..." },
    "task": { "present": true/false, "score": 0-100, "feedback": "..." },
    "action": { "present": true/false, "score": 0-100, "feedback": "..." },
    "result": { "present": true/false, "score": 0-100, "feedback": "..." },
    "overallScore": 0-100,
    "narrativeClarity": 0-100
  },
  "communicationPattern": {
    "style": "passive|aggressive|assertive|passive-aggressive",
    "confidence": 0-100,
    "indicators": ["indicador1", "indicador2"],
    "recommendation": "..."
  },
  "scores": {
    "leadership": 0-100,
    "communication": 0-100,
    "conflictResolution": 0-100,
    "problemSolving": 0-100,
    "emotionalIntelligence": 0-100,
    "adaptability": 0-100
  },
  "redFlags": [
    {
      "category": "...",
      "severity": "low|medium|high",
      "description": "...",
      "impact": "...",
      "solution": "..."
    }
  ],
  "strengths": ["fortaleza1", "fortaleza2"],
  "insights": ["insight1", "insight2"]
}`

// =====================================================
// FUNCIONES DE ANÁLISIS
// =====================================================

/**
 * Analiza una respuesta individual
 */
// Deprecated: analyzeResponse is no longer used. All analysis is now handled by Hugging Face in prompts/soft-skills-analyzer.ts
// export async function analyzeResponse(...) { ... }

/**
 * Genera reporte completo de todas las respuestas
 */
export async function generateFullReport(
  responses: Array<{ questionId: string; answer: string }>
): Promise<SoftSkillsReport> {
  const sessionId = `ss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const analyses: Record<string, any> = {}
  let totalLeadership = 0
  let totalCommunication = 0
  let totalConflict = 0
  let totalProblem = 0
  let totalEQ = 0
  let totalAdaptability = 0
  let totalWords = 0
  const allRedFlags: RedFlag[] = []
  const allStrengths: string[] = []
  const allRecommendations: string[] = []
  let dominantPattern: CommunicationPattern | null = null

  for (const response of responses) {
    const question = SOFT_SKILL_QUESTIONS.find(q => q.id === response.questionId)
    if (!question) continue

    const wordCount = response.answer.split(/\s+/).length
    totalWords += wordCount

    // Migrated: Use Hugging Face-based analysis
    // Import analyzeSoftSkillsResponse from prompts/soft-skills-analyzer
    const { analyzeSoftSkillsResponse } = await import('./prompts/soft-skills-analyzer');
    const analysis = await analyzeSoftSkillsResponse(
      SOFT_SKILL_QUESTIONS.find(q => q.id === response.questionId)?.id === 'q1_conflict' ? 1 :
      SOFT_SKILL_QUESTIONS.find(q => q.id === response.questionId)?.id === 'q2_pressure' ? 2 : 3,
      response.answer
    );
    if (!analysis) continue;
    analyses[response.questionId] = analysis.starScore;

    // Agregar scores
    totalLeadership += analysis.leadershipScore || 0;
    totalCommunication += analysis.communicationStyle.confidence || 0;
    totalConflict += analysis.conflictResolutionScore || 0;
    totalProblem += 0; // Not available in new schema
    totalEQ += 0; // Not available in new schema
    totalAdaptability += 0; // Not available in new schema

    // Agregar red flags y fortalezas
    // Map Hugging Face red flags to local RedFlag type
    if (analysis.redFlags && Array.isArray(analysis.redFlags)) {
      for (const rf of analysis.redFlags) {
        allRedFlags.push({
          category: rf.category || '',
          severity: rf.severity === 'critical' ? 'high' : (rf.severity || 'low'),
          description: rf.description || '',
          // impact removed to match schema
          solution: rf.fix || ''
        });
      }
    }
    allStrengths.push(...(analysis.strengths?.map(s => s.description) || []));

    // Guardar patrón de comunicación dominante
    if (!dominantPattern || analysis.communicationStyle.confidence > dominantPattern.confidence) {
      dominantPattern = {
        style: analysis.communicationStyle.type,
        confidence: analysis.communicationStyle.confidence,
        indicators: analysis.communicationStyle.indicators,
        recommendation: analysis.communicationStyle.improvement
      };
    }

    // Generar recomendaciones basadas en análisis
    if ((analysis.starScore?.overall || 0) < 60) {
      allRecommendations.push(`Mejora tu respuesta sobre "${question.category}" usando la estructura STAR completa`);
    }
  }

  const numResponses = responses.length || 1
  const avgWords = Math.round(totalWords / numResponses)

  // Calcular promedios para radar
  const radarData = {
    leadership: Math.round(totalLeadership / numResponses),
    communication: Math.round(totalCommunication / numResponses),
    conflictResolution: Math.round(totalConflict / numResponses),
    problemSolving: Math.round(totalProblem / numResponses),
    emotionalIntelligence: Math.round(totalEQ / numResponses),
    adaptability: Math.round(totalAdaptability / numResponses)
  }

  // Calcular score general
  const overallScore = Math.round(
    (radarData.leadership + radarData.communication + radarData.conflictResolution +
     radarData.problemSolving + radarData.emotionalIntelligence + radarData.adaptability) / 6
  )

  // Determinar nivel general
  const overallLevel = getOverallLevel(overallScore, allRedFlags.length)

  // Determinar engagement
  const engagementLevel = avgWords > 150 ? 'high' : avgWords > 80 ? 'medium' : 'low'

  // Generar scores detallados
  const scores: SoftSkillScore[] = [
    {
      category: 'Liderazgo',
      score: radarData.leadership,
      level: getSkillLevel(radarData.leadership),
      insights: getLeadershipInsights(radarData.leadership)
    },
    {
      category: 'Comunicación',
      score: radarData.communication,
      level: getSkillLevel(radarData.communication),
      insights: getCommunicationInsights(radarData.communication)
    },
    {
      category: 'Resolución de Conflictos',
      score: radarData.conflictResolution,
      level: getSkillLevel(radarData.conflictResolution),
      insights: getConflictInsights(radarData.conflictResolution)
    }
  ]

  return {
    sessionId,
    overallLevel,
    overallScore,
    radarData,
    starAnalysis: analyses,
    communicationPattern: dominantPattern || {
      style: 'passive',
      confidence: 50,
      indicators: [],
      recommendation: 'Completa el simulador para obtener tu análisis'
    },
    scores,
    redFlags: allRedFlags,
    strengths: [...new Set(allStrengths)].slice(0, 5),
    responseDepth: avgWords,
    engagementLevel,
    recommendations: allRecommendations,
    createdAt: new Date()
  }
}

// =====================================================
// HELPERS
// =====================================================

function getOverallLevel(score: number, redFlagCount: number): string {
  if (redFlagCount >= 3) return 'Comunicador en Riesgo'
  if (score >= 85) return 'Líder Estratégico'
  if (score >= 70) return 'Colaborador Proactivo'
  if (score >= 55) return 'Colaborador Reactivo'
  if (score >= 40) return 'Comunicador en Desarrollo'
  return 'Necesita Coaching Urgente'
}

function getSkillLevel(score: number): 'beginner' | 'developing' | 'competent' | 'proficient' | 'expert' {
  if (score >= 90) return 'expert'
  if (score >= 75) return 'proficient'
  if (score >= 60) return 'competent'
  if (score >= 40) return 'developing'
  return 'beginner'
}

function getLeadershipInsights(score: number): string[] {
  if (score >= 75) return ['Demuestra iniciativa clara', 'Toma decisiones bajo presión']
  if (score >= 50) return ['Potencial de liderazgo visible', 'Necesita más ejemplos de influencia']
  return ['Falta demostrar iniciativa propia', 'Respuestas más reactivas que proactivas']
}

function getCommunicationInsights(score: number): string[] {
  if (score >= 75) return ['Estructura clara en narrativa', 'Usa ejemplos concretos']
  if (score >= 50) return ['Comunicación aceptable', 'Puede mejorar claridad']
  return ['Falta estructura STAR', 'Respuestas vagas o genéricas']
}

function getConflictInsights(score: number): string[] {
  if (score >= 75) return ['Maneja conflictos constructivamente', 'Busca soluciones win-win']
  if (score >= 50) return ['Evita escalamiento', 'Puede mejorar asertividad']
  return ['Tiende a evitar conflictos', 'Falta demostrar resolución activa']
}

function getMockAnalysis(category: string) {
  return {
    starAnalysis: {
      situation: { present: true, score: 65, feedback: 'Contexto presente pero podría ser más específico' },
      task: { present: true, score: 60, feedback: 'Responsabilidad implícita, no explícita' },
      action: { present: true, score: 70, feedback: 'Acciones claras mencionadas' },
      result: { present: false, score: 40, feedback: 'Falta resultado medible o aprendizaje concreto' },
      overallScore: 59,
      narrativeClarity: 62
    },
    communicationPattern: {
      style: 'passive' as const,
      confidence: 72,
      indicators: ['Uso de "creo que"', 'Falta de métricas', 'Lenguaje tentativo'],
      recommendation: 'Practica respuestas más directas con resultados cuantificables'
    },
    scores: {
      leadership: 55,
      communication: 60,
      conflictResolution: 58,
      problemSolving: 62,
      emotionalIntelligence: 65,
      adaptability: 60
    },
    redFlags: [
      {
        category: 'Estructura Narrativa',
        severity: 'medium' as const,
        description: 'Tu respuesta carece de un resultado medible',
        impact: 'Los entrevistadores de FAANG esperan impacto cuantificable',
        solution: 'Incluye métricas: "Esto redujo bugs en 40%" o "El proyecto se entregó 2 semanas antes"'
      }
    ],
    strengths: ['Muestra disposición al trabajo en equipo'],
    insights: ['Considera agregar más contexto sobre tu rol específico']
  }
}

/**
 * Censura el reporte para usuarios no registrados
 */
export function censorReport(report: SoftSkillsReport): Partial<SoftSkillsReport> {
  return {
    sessionId: report.sessionId,
    overallLevel: report.overallLevel,
    overallScore: report.overallScore,
    radarData: report.radarData,
    responseDepth: report.responseDepth,
    engagementLevel: report.engagementLevel,
    // Censurar detalles sensibles
    redFlags: report.redFlags.map(rf => ({
      ...rf,
      solution: '🔒 Regístrate para ver la solución',
      description: rf.description.substring(0, 50) + '... 🔒'
    })),
    strengths: report.strengths.slice(0, 2),
    recommendations: ['🔒 Regístrate para ver recomendaciones personalizadas'],
    scores: report.scores.map(s => ({
      ...s,
      insights: ['🔒 Insights bloqueados']
    })),
    createdAt: report.createdAt
  }
}
