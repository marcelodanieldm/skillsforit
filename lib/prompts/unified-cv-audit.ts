/**
 * Unified CV Audit Prompt
 * 
 * Prompt unificado que produce el mismo esquema JSON en:
 * - GPT-4 (OpenAI)
 * - Claude 3 (Anthropic)
 * - Gemini Pro (Google)
 * 
 * Sprint 21: Homogeneización de outputs multi-LLM
 */

export interface CVAuditResult {
  // Metadata
  analysisId: string
  timestamp: string
  modelUsed: string
  
  // Score general (0-100)
  overallScore: number
  
  // Scores por categoría
  scores: {
    atsCompatibility: number  // 0-100
    contentQuality: number    // 0-100
    formatting: number        // 0-100
    keywords: number          // 0-100
    experience: number        // 0-100
  }
  
  // Hallazgos críticos
  criticalIssues: Array<{
    category: 'format' | 'content' | 'ats' | 'keywords' | 'grammar'
    severity: 'critical' | 'high' | 'medium' | 'low'
    issue: string
    suggestion: string
    location?: string
  }>
  
  // Fortalezas
  strengths: Array<{
    category: string
    description: string
  }>
  
  // Recomendaciones priorizadas
  recommendations: Array<{
    priority: 1 | 2 | 3  // 1=alta, 2=media, 3=baja
    category: string
    action: string
    expectedImpact: string
    estimatedTime: string  // "5 min", "30 min", "1 hour"
  }>
  
  // Keywords detectadas vs sugeridas
  keywords: {
    found: string[]
    missing: string[]
    industryRelevant: string[]
  }
  
  // Compatibilidad ATS
  atsAnalysis: {
    overallCompatibility: 'excellent' | 'good' | 'fair' | 'poor'
    issues: string[]
    passedChecks: string[]
  }
}

/**
 * System prompt común para todos los LLMs
 */
export const UNIFIED_SYSTEM_PROMPT = `You are an expert CV/Resume auditor with 15+ years of experience in recruitment, ATS systems, and career coaching.

Your task is to analyze CVs and provide actionable feedback in a structured JSON format.

CRITICAL RULES:
1. Always respond with valid JSON - no markdown, no explanations outside JSON
2. Use EXACTLY the schema provided in the user prompt
3. Be objective and data-driven
4. Prioritize recommendations by impact
5. Consider cultural context (Spain, LATAM, USA, etc.)
6. Check for ATS compatibility issues
7. Identify missing industry-relevant keywords
8. Evaluate formatting and readability
9. Assess content quality and achievements quantification

SCORING CRITERIA:
- ATS Compatibility (0-100): PDF compatibility, no images/tables in text, proper headings, standard fonts
- Content Quality (0-100): Achievements quantified, action verbs, clear impact, no generic statements
- Formatting (0-100): Consistent spacing, readable fonts, proper sections, visual hierarchy
- Keywords (0-100): Industry-relevant terms, role-specific skills, certifications
- Experience (0-100): Relevance to target role, career progression, depth of responsibilities

SEVERITY LEVELS:
- Critical: Blocks ATS parsing or immediate rejection
- High: Significantly reduces chances of interview
- Medium: Noticeable improvement opportunity
- Low: Minor polish for optimization

Always be constructive, specific, and actionable. Provide examples when possible.`

/**
 * Genera el prompt de usuario con el CV y configuración
 */
export function generateCVAuditPrompt(
  cvText: string,
  targetRole?: string,
  targetCountry?: string,
  targetIndustry?: string
): string {
  return `Analyze the following CV and provide a comprehensive audit in JSON format.

CV CONTENT:
"""
${cvText}
"""

CONTEXT:
- Target Role: ${targetRole || 'Not specified'}
- Target Country: ${targetCountry || 'Not specified'}
- Target Industry: ${targetIndustry || 'Not specified'}

REQUIRED JSON SCHEMA:
{
  "analysisId": "string (generate unique ID)",
  "timestamp": "string (ISO 8601 format)",
  "modelUsed": "string (your model name)",
  "overallScore": number (0-100),
  "scores": {
    "atsCompatibility": number (0-100),
    "contentQuality": number (0-100),
    "formatting": number (0-100),
    "keywords": number (0-100),
    "experience": number (0-100)
  },
  "criticalIssues": [
    {
      "category": "format|content|ats|keywords|grammar",
      "severity": "critical|high|medium|low",
      "issue": "string (clear description)",
      "suggestion": "string (actionable fix)",
      "location": "string (optional: where in CV)"
    }
  ],
  "strengths": [
    {
      "category": "string",
      "description": "string"
    }
  ],
  "recommendations": [
    {
      "priority": 1|2|3,
      "category": "string",
      "action": "string (specific action to take)",
      "expectedImpact": "string (what will improve)",
      "estimatedTime": "string (5 min, 30 min, 1 hour, etc.)"
    }
  ],
  "keywords": {
    "found": ["array of strings"],
    "missing": ["array of strings"],
    "industryRelevant": ["array of strings"]
  },
  "atsAnalysis": {
    "overallCompatibility": "excellent|good|fair|poor",
    "issues": ["array of strings"],
    "passedChecks": ["array of strings"]
  }
}

IMPORTANT:
1. Return ONLY valid JSON - no markdown code blocks, no extra text
2. Ensure all fields are present and correctly typed
3. Provide at least 5 recommendations sorted by priority
4. Include at least 3 critical/high severity issues if found
5. Suggest 10-15 missing keywords relevant to the role
6. Be specific in suggestions - avoid generic advice

Respond with the JSON now:`
}

/**
 * Valida que el response del LLM cumpla con el schema esperado
 */
export function validateCVAuditResult(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required top-level fields
  const requiredFields = [
    'analysisId',
    'timestamp',
    'modelUsed',
    'overallScore',
    'scores',
    'criticalIssues',
    'strengths',
    'recommendations',
    'keywords',
    'atsAnalysis'
  ]

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate scores
  if (data.scores) {
    const scoreFields = ['atsCompatibility', 'contentQuality', 'formatting', 'keywords', 'experience']
    for (const field of scoreFields) {
      if (typeof data.scores[field] !== 'number' || data.scores[field] < 0 || data.scores[field] > 100) {
        errors.push(`Invalid score.${field}: must be number 0-100`)
      }
    }
  }

  // Validate overallScore
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    errors.push('Invalid overallScore: must be number 0-100')
  }

  // Validate arrays
  if (!Array.isArray(data.criticalIssues)) {
    errors.push('criticalIssues must be array')
  }
  if (!Array.isArray(data.strengths)) {
    errors.push('strengths must be array')
  }
  if (!Array.isArray(data.recommendations)) {
    errors.push('recommendations must be array')
  }

  // Validate recommendations
  if (Array.isArray(data.recommendations)) {
    data.recommendations.forEach((rec: any, idx: number) => {
      if (![1, 2, 3].includes(rec.priority)) {
        errors.push(`recommendations[${idx}].priority must be 1, 2, or 3`)
      }
    })
  }

  // Validate ATS analysis
  if (data.atsAnalysis && data.atsAnalysis.overallCompatibility) {
    const validValues = ['excellent', 'good', 'fair', 'poor']
    if (!validValues.includes(data.atsAnalysis.overallCompatibility)) {
      errors.push('atsAnalysis.overallCompatibility must be: excellent, good, fair, or poor')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Normaliza el response de cualquier LLM al schema esperado
 */
export function normalizeCVAuditResult(rawResponse: string, provider: string): CVAuditResult | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = rawResponse.trim()
    
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    // Validate structure
    const validation = validateCVAuditResult(parsed)
    if (!validation.valid) {
      console.error('[CVAudit] Validation errors:', validation.errors)
      console.error('[CVAudit] Raw response:', rawResponse.substring(0, 500))
      return null
    }

    return parsed as CVAuditResult
  } catch (error) {
    console.error(`[CVAudit] Failed to parse ${provider} response:`, error)
    console.error('[CVAudit] Raw response:', rawResponse.substring(0, 500))
    return null
  }
}

/**
 * Ejemplo de uso con el LLM Strategy Manager
 */
export async function auditCVWithFallback(
  cvText: string,
  options?: {
    targetRole?: string
    targetCountry?: string
    targetIndustry?: string
  }
): Promise<{
  result: CVAuditResult | null
  provider: string
  latencyMs: number
  tokensUsed: number
  success: boolean
}> {
  // Hugging Face only implementation
  const prompt = generateCVAuditPrompt(
    cvText,
    options?.targetRole,
    options?.targetCountry,
    options?.targetIndustry
  )
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('Falta la variable HUGGINGFACE_API_KEY en el entorno');
  const start = Date.now();
  const hfResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 1500, temperature: 0.3 },
    })
  });
  const latencyMs = Date.now() - start;
  if (!hfResponse.ok) {
    return {
      result: null,
      provider: 'huggingface',
      latencyMs,
      tokensUsed: 0,
      success: false
    }
  }
  const data = await hfResponse.json();
  const content = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : (data.generated_text || '');
  const normalized = normalizeCVAuditResult(content, 'huggingface');
  return {
    result: normalized,
    provider: 'huggingface',
    latencyMs,
    tokensUsed: 0, // Hugging Face free API does not return token usage
    success: normalized !== null
  }
}
