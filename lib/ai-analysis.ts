import OpenAI from 'openai'
import { AnalysisResult } from './database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeCVWithAI(
  cvText: string,
  profession: string,
  country: string
): Promise<AnalysisResult> {
  const prompt = `
Eres un experto en reclutamiento IT y optimización de CVs. Analiza el siguiente CV de un profesional de ${profession} ubicado en ${country}.

CV:
${cvText}

Proporciona un análisis completo en formato JSON con la siguiente estructura:

{
  "score": <número del 0-100 basado en la calidad general>,
  "atsScore": <número del 0-100 basado en compatibilidad con ATS>,
  "problems": [
    {
      "category": "<categoría del problema>",
      "severity": "<high|medium|low>",
      "description": "<descripción del problema>",
      "impact": "<impacto en la búsqueda laboral>"
    }
  ],
  "improvements": [
    {
      "category": "<categoría de la mejora>",
      "before": "<texto actual del CV>",
      "after": "<texto mejorado>",
      "explanation": "<por qué esta mejora es importante>",
      "impact": "<cómo mejora las posibilidades>"
    }
  ],
  "strengths": [
    "<fortalezas identificadas>"
  ],
  "recommendations": [
    "<recomendaciones específicas>"
  ]
}

Criterios de evaluación:
1. Keywords relevantes para ATS
2. Formato y estructura
3. Cuantificación de logros
4. Skills técnicas específicas
5. Experiencia relevante
6. Sección de resumen profesional
7. Proyectos con impacto medible

Asegúrate de:
- Identificar al menos 5 problemas específicos
- Proporcionar al menos 8 mejoras concretas con ejemplos antes/después
- Dar al menos 5 recomendaciones accionables
- Usar métricas y porcentajes cuando sea posible
- Adaptar las recomendaciones a ${profession} y al mercado de ${country}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en reclutamiento IT y optimización de CVs. Siempre respondes en JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    })

    const result = completion.choices[0].message.content
    if (!result) {
      throw new Error('No se recibió respuesta de OpenAI')
    }

    const analysis: AnalysisResult = JSON.parse(result)
    
    // Validate the structure
    if (!analysis.score || !analysis.atsScore || !analysis.problems || !analysis.improvements) {
      throw new Error('Respuesta de IA incompleta')
    }

    return analysis
  } catch (error: any) {
    console.error('Error analyzing CV with AI:', error)
    
    // Fallback to mock analysis if AI fails
    return getMockAnalysis()
  }
}

// Mock analysis for development/fallback
export function getMockAnalysis(): AnalysisResult {
  return {
    score: 65,
    atsScore: 58,
    problems: [
      {
        category: 'Keywords ATS',
        severity: 'high',
        description: 'Falta de keywords específicas para sistemas ATS',
        impact: 'Tu CV puede ser filtrado automáticamente antes de llegar a un recruiter'
      },
      {
        category: 'Formato',
        severity: 'medium',
        description: 'Estructura poco optimizada para lectura rápida',
        impact: 'Los recruiters dedican solo 6 segundos al primer vistazo'
      },
      {
        category: 'Logros',
        severity: 'high',
        description: 'Falta de métricas cuantificables en experiencia',
        impact: 'Dificulta demostrar el impacto real de tu trabajo'
      },
      {
        category: 'Skills',
        severity: 'medium',
        description: 'Skills técnicas sin nivel de expertise',
        impact: 'No transmite confianza en tus capacidades técnicas'
      },
      {
        category: 'Resumen',
        severity: 'low',
        description: 'Resumen profesional genérico o ausente',
        impact: 'Pierdes la oportunidad de destacar tu propuesta de valor'
      }
    ],
    improvements: [
      {
        category: 'Resumen Profesional',
        before: 'Desarrollador con experiencia en programación.',
        after: 'Full Stack Developer con 3+ años optimizando aplicaciones web de alto tráfico. Especializado en React, Node.js y arquitecturas cloud. Reducción del 40% en tiempos de carga mediante implementación de best practices.',
        explanation: 'Incluye años de experiencia, tecnologías específicas y logros medibles',
        impact: 'Captura la atención del recruiter en los primeros segundos'
      },
      {
        category: 'Skills Técnicas',
        before: 'JavaScript, Python, Git',
        after: 'JavaScript (ES6+) - Expert | React & Next.js - Advanced | Node.js - Advanced | Python & Django - Intermediate | Git/GitHub - Advanced | Docker & Kubernetes - Intermediate',
        explanation: 'Añade nivel de expertise y versiones específicas',
        impact: 'Transmite confianza y permite al ATS identificar mejor tus skills'
      },
      {
        category: 'Experiencia - Logros',
        before: 'Trabajé en varios proyectos de desarrollo web usando JavaScript y React.',
        after: '• Desarrollé 15+ aplicaciones web usando React y Node.js, alcanzando 50K+ usuarios activos\n• Optimicé rendimiento reduciendo tiempo de respuesta en 40% (800ms → 480ms)\n• Implementé CI/CD pipeline reduciendo deployment time en 60%',
        explanation: 'Usa bullets, métricas específicas y verbos de acción',
        impact: 'Demuestra impacto cuantificable y resultados medibles'
      },
      {
        category: 'Proyectos',
        before: 'E-commerce con React',
        after: 'E-commerce Platform | React, Node.js, PostgreSQL, AWS\n• Sistema de pagos con Stripe procesando USD 50K+ mensuales\n• Implementé búsqueda con Elasticsearch mejorando conversión en 25%\n• 10K+ usuarios activos con 99.9% uptime',
        explanation: 'Incluye stack tecnológico, métricas de negocio y escala',
        impact: 'Muestra capacidad de trabajar en proyectos de producción reales'
      },
      {
        category: 'Keywords ATS',
        before: 'Experiencia en desarrollo',
        after: 'Experiencia en: Full Stack Development, Frontend Development, Backend Development, Web Applications, RESTful APIs, Microservices, Cloud Computing, Agile/Scrum, CI/CD',
        explanation: 'Incluye keywords específicas que buscan los ATS',
        impact: 'Aumenta un 95% la probabilidad de pasar filtros automáticos'
      },
      {
        category: 'Logros Destacados',
        before: 'No tiene sección de logros',
        after: '🏆 Incrementé conversión de landing pages en 30% mediante A/B testing\n🚀 Reduje costos de infraestructura en USD 2,400/año optimizando AWS\n⭐ Mentoré a 3 developers junior mejorando productividad del equipo en 20%',
        explanation: 'Crea una sección específica para logros cuantificables',
        impact: 'Diferencia tu perfil de otros candidatos con achievements concretos'
      },
      {
        category: 'Contacto',
        before: 'Email: juan@email.com',
        after: 'Email: juan@email.com | LinkedIn: linkedin.com/in/juandev | GitHub: github.com/juandev | Portfolio: juandev.com',
        explanation: 'Añade múltiples formas de contacto y presencia online',
        impact: 'Facilita que recruiters vean tu trabajo y código'
      },
      {
        category: 'Certificaciones',
        before: 'No menciona certificaciones',
        after: 'Certificaciones:\n• AWS Certified Developer Associate (2023)\n• Professional Scrum Master I (2022)\n• MongoDB Certified Developer (2022)',
        explanation: 'Añade certificaciones relevantes con año de obtención',
        impact: 'Valida tus skills y muestra compromiso con aprendizaje continuo'
      }
    ],
    strengths: [
      'Experiencia técnica en tecnologías modernas',
      'Conocimiento de múltiples lenguajes de programación',
      'Capacidad de trabajo en proyectos completos',
      'Base sólida en desarrollo',
      'Disposición para aprender'
    ],
    recommendations: [
      'Cuantifica todos tus logros con métricas específicas (%, números, tiempo)',
      'Añade enlaces a GitHub con proyectos representativos de tu trabajo',
      'Incluye palabras clave específicas de tu rol objetivo en los primeros párrafos',
      'Reorganiza tu CV priorizando experiencia más reciente y relevante',
      'Crea una sección de "Proyectos Destacados" con impacto medible',
      'Optimiza para ATS: usa formato simple, evita tablas/gráficos complejos',
      'Actualiza tu LinkedIn para que coincida con tu CV optimizado',
      'Considera obtener certificaciones relevantes para tu stack tecnológico'
    ]
  }
}

// Extract text from PDF (simplified version)
export async function extractTextFromPDF(filePath: string): Promise<string> {
  // In production, use pdf-parse or similar library
  // For now, return mock text
  return `
    Juan Pérez
    Desarrollador
    Email: juan@email.com
    
    RESUMEN
    Desarrollador con experiencia en programación.
    
    SKILLS
    - JavaScript
    - Python
    - HTML/CSS
    - Git
    
    EXPERIENCIA
    Desarrollador en Tech Corp (2021-2024)
    Trabajé en varios proyectos de desarrollo web. Usé JavaScript y React para crear aplicaciones.
    
    EDUCACIÓN
    Ingeniería en Sistemas - Universidad Nacional
  `
}
