// Sistema de Análisis de Sentimiento y Extracción de Problemas de Soft Skills
// Procesa comentarios de mentores para identificar patrones y problemas comunes

interface MentorComment {
  id: string
  sessionId: string
  mentorId: string
  menteeEmail: string
  comment: string
  createdAt: Date
}

interface SentimentScore {
  positive: number
  negative: number
  neutral: number
  overall: 'positive' | 'negative' | 'neutral'
  confidence: number
}

interface SoftSkillIssue {
  skill: string
  category: 'communication' | 'leadership' | 'teamwork' | 'time-management' | 'adaptability' | 'problem-solving' | 'emotional-intelligence' | 'other'
  severity: 'high' | 'medium' | 'low'
  mentions: number
  examples: string[]
  sentiment: SentimentScore
}

interface MonthlyAnalysis {
  month: string
  year: number
  totalComments: number
  top3Issues: SoftSkillIssue[]
  allIssues: SoftSkillIssue[]
  averageSentiment: SentimentScore
  insights: string[]
}

// Keywords para detectar problemas de soft skills
const SOFT_SKILL_KEYWORDS: Record<string, { category: string, keywords: string[], severity?: 'high' | 'medium' | 'low' }> = {
  communication: {
    category: 'communication',
    keywords: [
      'no comunica', 'mala comunicación', 'no explica bien', 'confuso al hablar',
      'no escucha', 'interrumpe', 'no pregunta', 'falta claridad', 'no articula',
      'comunicación deficiente', 'no se expresa', 'poor communication', 'unclear',
      'doesn\'t listen', 'vague', 'impreciso', 'no entiende', 'malinterpreta'
    ],
    severity: 'high'
  },
  confidence: {
    category: 'emotional-intelligence',
    keywords: [
      'inseguro', 'falta confianza', 'dudoso', 'insecurity', 'no confía en sí',
      'baja autoestima', 'miedo a preguntar', 'tímido', 'nervioso', 'ansioso',
      'no se atreve', 'temeroso', 'lacks confidence', 'self-doubt', 'afraid'
    ],
    severity: 'medium'
  },
  proactivity: {
    category: 'problem-solving',
    keywords: [
      'pasivo', 'espera que le digan', 'no toma iniciativa', 'reactivo',
      'falta proactividad', 'no propone', 'no innova', 'conformista',
      'lacks initiative', 'passive', 'waits for instructions', 'no busca soluciones'
    ],
    severity: 'high'
  },
  time_management: {
    category: 'time-management',
    keywords: [
      'desorganizado', 'llega tarde', 'no cumple plazos', 'mal manejo del tiempo',
      'procrastina', 'no prioriza', 'caótico', 'desorden', 'unpunctual',
      'misses deadlines', 'poor time management', 'disorganized', 'no planifica'
    ],
    severity: 'high'
  },
  teamwork: {
    category: 'teamwork',
    keywords: [
      'no trabaja en equipo', 'individualista', 'no colabora', 'aislado',
      'conflictivo', 'no comparte', 'egoísta', 'no coopera', 'poor teamwork',
      'doesn\'t collaborate', 'works alone', 'antisocial', 'difícil de trabajar'
    ],
    severity: 'medium'
  },
  adaptability: {
    category: 'adaptability',
    keywords: [
      'rígido', 'no se adapta', 'resistente al cambio', 'inflexible',
      'no aprende', 'cerrado', 'stuck in ways', 'not adaptable', 'stubborn',
      'no acepta feedback', 'defensivo', 'mente cerrada', 'no flexible'
    ],
    severity: 'medium'
  },
  english: {
    category: 'communication',
    keywords: [
      'inglés básico', 'no habla inglés', 'pobre inglés', 'poor english',
      'language barrier', 'no entiende inglés', 'inglés limitado',
      'struggles with english', 'needs english improvement', 'barrera idiomática'
    ],
    severity: 'high'
  },
  technical_communication: {
    category: 'communication',
    keywords: [
      'no explica técnicamente', 'no justifica decisiones', 'falta fundamento',
      'no articula soluciones técnicas', 'can\'t explain architecture',
      'poor technical explanation', 'no defiende su código', 'no argumenta'
    ],
    severity: 'high'
  },
  growth_mindset: {
    category: 'emotional-intelligence',
    keywords: [
      'fixed mindset', 'no busca aprender', 'conformista con conocimiento',
      'no estudia', 'estancado', 'no se actualiza', 'doesn\'t learn',
      'not curious', 'no investiga', 'falta curiosidad', 'no lee documentación'
    ],
    severity: 'medium'
  },
  interview_skills: {
    category: 'communication',
    keywords: [
      'nervioso en entrevistas', 'no sabe venderse', 'poor interview skills',
      'no destaca logros', 'no cuenta historias STAR', 'vago en respuestas',
      'no prepara entrevistas', 'undersells himself', 'doesn\'t sell achievements'
    ],
    severity: 'high'
  }
}

// Palabras de sentimiento
const SENTIMENT_WORDS = {
  positive: [
    'excelente', 'bueno', 'mejora', 'progreso', 'avanza', 'good', 'great',
    'excellent', 'improving', 'potential', 'smart', 'capable', 'strong',
    'capaz', 'inteligente', 'talentoso', 'prometedor', 'bien', 'positivo'
  ],
  negative: [
    'problema', 'difícil', 'lucha', 'falla', 'débil', 'mal', 'poor', 'weak',
    'struggles', 'fails', 'difficult', 'issue', 'challenge', 'deficient',
    'lacking', 'needs improvement', 'problemático', 'negativo', 'preocupante'
  ]
}

export class SentimentAnalyzer {
  
  /**
   * Analizar sentimiento de un comentario
   */
  static analyzeSentiment(text: string): SentimentScore {
    const lowerText = text.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0

    // Contar palabras positivas
    for (const word of SENTIMENT_WORDS.positive) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) positiveCount += matches.length
    }

    // Contar palabras negativas
    for (const word of SENTIMENT_WORDS.negative) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) negativeCount += matches.length
    }

    const total = positiveCount + negativeCount
    const positive = total > 0 ? positiveCount / total : 0.5
    const negative = total > 0 ? negativeCount / total : 0.5
    const neutral = 1 - (positive + negative) / 2

    let overall: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positive > 0.6) overall = 'positive'
    else if (negative > 0.6) overall = 'negative'

    return {
      positive: Math.round(positive * 100) / 100,
      negative: Math.round(negative * 100) / 100,
      neutral: Math.round(neutral * 100) / 100,
      overall,
      confidence: Math.round(Math.max(positive, negative, neutral) * 100) / 100
    }
  }

  /**
   * Extraer problemas de soft skills de un comentario
   */
  static extractSoftSkillIssues(comment: string): SoftSkillIssue[] {
    const lowerComment = comment.toLowerCase()
    const issues: SoftSkillIssue[] = []

    for (const [skillName, skillData] of Object.entries(SOFT_SKILL_KEYWORDS)) {
      for (const keyword of skillData.keywords) {
        if (lowerComment.includes(keyword.toLowerCase())) {
          // Extraer contexto (50 caracteres antes y después)
          const index = lowerComment.indexOf(keyword.toLowerCase())
          const start = Math.max(0, index - 50)
          const end = Math.min(comment.length, index + keyword.length + 50)
          const context = comment.substring(start, end).trim()

          issues.push({
            skill: skillName,
            category: skillData.category as any,
            severity: skillData.severity || 'medium',
            mentions: 1,
            examples: [context],
            sentiment: this.analyzeSentiment(context)
          })

          break // Solo contar una vez por comentario
        }
      }
    }

    return issues
  }

  /**
   * Analizar comentarios de un mes específico
   */
  static analyzeMonthlyComments(
    comments: MentorComment[],
    month: number,
    year: number
  ): MonthlyAnalysis {
    // Filtrar comentarios del mes
    const monthlyComments = comments.filter(c => {
      const date = new Date(c.createdAt)
      return date.getMonth() === month && date.getFullYear() === year
    })

    if (monthlyComments.length === 0) {
      return {
        month: new Date(year, month).toLocaleString('es', { month: 'long' }),
        year,
        totalComments: 0,
        top3Issues: [],
        allIssues: [],
        averageSentiment: {
          positive: 0,
          negative: 0,
          neutral: 1,
          overall: 'neutral',
          confidence: 0
        },
        insights: ['No hay suficientes comentarios para analizar este mes']
      }
    }

    // Extraer y agregar issues
    const issuesMap = new Map<string, SoftSkillIssue>()

    for (const comment of monthlyComments) {
      const issues = this.extractSoftSkillIssues(comment.comment)

      for (const issue of issues) {
        if (issuesMap.has(issue.skill)) {
          const existing = issuesMap.get(issue.skill)!
          existing.mentions += 1
          existing.examples.push(...issue.examples)
          // Actualizar sentimiento promedio
          existing.sentiment.positive = (existing.sentiment.positive + issue.sentiment.positive) / 2
          existing.sentiment.negative = (existing.sentiment.negative + issue.sentiment.negative) / 2
          existing.sentiment.neutral = (existing.sentiment.neutral + issue.sentiment.neutral) / 2
        } else {
          issuesMap.set(issue.skill, issue)
        }
      }
    }

    // Ordenar por menciones
    const allIssues = Array.from(issuesMap.values())
      .sort((a, b) => b.mentions - a.mentions)

    // Top 3
    const top3Issues = allIssues.slice(0, 3)

    // Sentimiento promedio
    const sentiments = monthlyComments.map(c => this.analyzeSentiment(c.comment))
    const averageSentiment: SentimentScore = {
      positive: sentiments.reduce((sum, s) => sum + s.positive, 0) / sentiments.length,
      negative: sentiments.reduce((sum, s) => sum + s.negative, 0) / sentiments.length,
      neutral: sentiments.reduce((sum, s) => sum + s.neutral, 0) / sentiments.length,
      overall: 'neutral',
      confidence: 0
    }

    if (averageSentiment.positive > 0.6) averageSentiment.overall = 'positive'
    else if (averageSentiment.negative > 0.6) averageSentiment.overall = 'negative'

    averageSentiment.confidence = Math.max(
      averageSentiment.positive,
      averageSentiment.negative,
      averageSentiment.neutral
    )

    // Generar insights
    const insights = this.generateInsights(top3Issues, monthlyComments.length)

    return {
      month: new Date(year, month).toLocaleString('es', { month: 'long' }),
      year,
      totalComments: monthlyComments.length,
      top3Issues,
      allIssues,
      averageSentiment,
      insights
    }
  }

  /**
   * Generar insights basados en los problemas detectados
   */
  private static generateInsights(top3: SoftSkillIssue[], totalComments: number): string[] {
    const insights: string[] = []

    if (top3.length === 0) {
      return ['No se detectaron problemas significativos de soft skills este mes']
    }

    // Insight 1: Problema #1
    const issue1 = top3[0]
    const percentage1 = Math.round((issue1.mentions / totalComments) * 100)
    insights.push(
      `🔴 **Problema Principal**: ${this.getSkillDisplayName(issue1.skill)} aparece en ${percentage1}% ` +
      `de los comentarios (${issue1.mentions} menciones). Categoría: ${issue1.category}. ` +
      `Severidad: ${issue1.severity}.`
    )

    // Insight 2: Top 3 categorías
    const categories = top3.map(i => i.category)
    const uniqueCategories = [...new Set(categories)]
    insights.push(
      `📊 **Categorías Afectadas**: ${uniqueCategories.join(', ')}. ` +
      `Se recomienda crear talleres específicos para estas áreas.`
    )

    // Insight 3: Severidad
    const highSeverity = top3.filter(i => i.severity === 'high')
    if (highSeverity.length > 0) {
      insights.push(
        `⚠️ **Atención Urgente**: ${highSeverity.length} de los top 3 problemas son de severidad ALTA. ` +
        `Requieren intervención inmediata: ${highSeverity.map(i => this.getSkillDisplayName(i.skill)).join(', ')}.`
      )
    }

    // Insight 4: Recomendación de contenido
    const recommendations = this.getContentRecommendations(top3)
    insights.push(
      `💡 **Recomendación**: Crear contenido sobre: ${recommendations.join(', ')}.`
    )

    return insights
  }

  /**
   * Obtener nombre legible de la skill
   */
  private static getSkillDisplayName(skill: string): string {
    const names: Record<string, string> = {
      communication: 'Comunicación',
      confidence: 'Confianza y Autoestima',
      proactivity: 'Proactividad',
      time_management: 'Gestión del Tiempo',
      teamwork: 'Trabajo en Equipo',
      adaptability: 'Adaptabilidad',
      english: 'Inglés Técnico',
      technical_communication: 'Comunicación Técnica',
      growth_mindset: 'Mentalidad de Crecimiento',
      interview_skills: 'Habilidades de Entrevista'
    }
    return names[skill] || skill
  }

  /**
   * Recomendar contenido basado en problemas
   */
  private static getContentRecommendations(issues: SoftSkillIssue[]): string[] {
    const recommendations: Record<string, string> = {
      communication: 'Curso de Comunicación Efectiva',
      confidence: 'Workshop de Confianza Profesional',
      proactivity: 'Taller de Iniciativa y Liderazgo',
      time_management: 'Programa de Productividad',
      teamwork: 'Taller de Colaboración',
      adaptability: 'Curso de Agilidad Mental',
      english: 'English for Tech Professionals',
      technical_communication: 'Arquitectura y Explicación Técnica',
      growth_mindset: 'Mentalidad de Aprendizaje Continuo',
      interview_skills: 'Mock Interviews y STAR Method'
    }

    return issues.map(i => recommendations[i.skill] || 'Coaching Individual')
  }
}

// Exportar tipos
export type { 
  MentorComment, 
  SentimentScore, 
  SoftSkillIssue, 
  MonthlyAnalysis 
}
