/**
 * LLM Strategy Pattern - Sistema de Fallback Multi-Provider
 * 
 * Implementa el patrón Strategy para permitir cambio automático entre
 * OpenAI, Anthropic (Claude) y Google Gemini en caso de fallos.
 * 
 * Sprint 21: Disaster Recovery Plan
 */

import OpenAI from 'openai'

// === INTERFACES ===

export interface LLMResponse {
  content: string
  model: string
  provider: 'openai' | 'anthropic' | 'google'
  tokensUsed: number
  latencyMs: number
  success: boolean
  error?: string
}

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface LLMProvider {
  name: 'openai' | 'anthropic' | 'google'
  isAvailable(): Promise<boolean>
  complete(request: LLMRequest): Promise<LLMResponse>
  estimatedCost(tokens: number): number
}

export interface FallbackConfig {
  primaryProvider: 'openai' | 'anthropic' | 'google'
  fallbackOrder: ('openai' | 'anthropic' | 'google')[]
  maxRetries: number
  timeoutMs: number
  enableCache: boolean
}

// === IMPLEMENTACIÓN DE PROVEEDORES ===

/**
 * OpenAI Provider (GPT-4, GPT-3.5)
 */
export class OpenAIProvider implements LLMProvider {
  name: 'openai' = 'openai'
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model: string = 'gpt-4-turbo-preview') {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Health check: intentar listar modelos
      await this.client.models.list()
      return true
    } catch (error) {
      console.error('[OpenAI] Health check failed:', error)
      return false
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const messages: any[] = []
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        })
      }
      
      messages.push({
        role: 'user',
        content: request.prompt
      })

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        response_format: request.jsonMode ? { type: 'json_object' } : undefined
      })

      const latencyMs = Date.now() - startTime
      const content = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || 0

      return {
        content,
        model: this.model,
        provider: 'openai',
        tokensUsed,
        latencyMs,
        success: true
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      
      return {
        content: '',
        model: this.model,
        provider: 'openai',
        tokensUsed: 0,
        latencyMs,
        success: false,
        error: error.message || 'OpenAI API error'
      }
    }
  }

  estimatedCost(tokens: number): number {
    // GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
    // Asumimos 60% input, 40% output
    const inputTokens = tokens * 0.6
    const outputTokens = tokens * 0.4
    return (inputTokens * 0.01 / 1000) + (outputTokens * 0.03 / 1000)
  }
}

/**
 * Anthropic Provider (Claude 3)
 */
export class AnthropicProvider implements LLMProvider {
  name: 'anthropic' = 'anthropic'
  private apiKey: string
  private model: string
  private baseUrl: string = 'https://api.anthropic.com/v1'

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey
    this.model = model
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Health check simple con timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }]
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.error('[Anthropic] Health check failed:', error)
      return false
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const messages: any[] = [
        {
          role: 'user',
          content: request.prompt
        }
      ]

      const body: any = {
        model: this.model,
        max_tokens: request.maxTokens ?? 2000,
        messages,
        temperature: request.temperature ?? 0.7
      }

      if (request.systemPrompt) {
        body.system = request.systemPrompt
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      })

      const latencyMs = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const content = data.content[0]?.text || ''
      const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)

      return {
        content,
        model: this.model,
        provider: 'anthropic',
        tokensUsed,
        latencyMs,
        success: true
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      
      return {
        content: '',
        model: this.model,
        provider: 'anthropic',
        tokensUsed: 0,
        latencyMs,
        success: false,
        error: error.message || 'Anthropic API error'
      }
    }
  }

  estimatedCost(tokens: number): number {
    // Claude 3 Sonnet: $0.003 per 1K input tokens, $0.015 per 1K output tokens
    const inputTokens = tokens * 0.6
    const outputTokens = tokens * 0.4
    return (inputTokens * 0.003 / 1000) + (outputTokens * 0.015 / 1000)
  }
}

/**
 * Google Gemini Provider
 */
export class GoogleGeminiProvider implements LLMProvider {
  name: 'google' = 'google'
  private apiKey: string
  private model: string
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.apiKey = apiKey
    this.model = model
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'ping' }] }]
          }),
          signal: controller.signal
        }
      )

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.error('[Google Gemini] Health check failed:', error)
      return false
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const prompt = request.systemPrompt 
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt

      const body: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2000
        }
      }

      if (request.jsonMode) {
        body.generationConfig.responseMimeType = 'application/json'
      }

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      )

      const latencyMs = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const tokensUsed = (data.usageMetadata?.promptTokenCount || 0) + 
                        (data.usageMetadata?.candidatesTokenCount || 0)

      return {
        content,
        model: this.model,
        provider: 'google',
        tokensUsed,
        latencyMs,
        success: true
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      
      return {
        content: '',
        model: this.model,
        provider: 'google',
        tokensUsed: 0,
        latencyMs,
        success: false,
        error: error.message || 'Google Gemini API error'
      }
    }
  }

  estimatedCost(tokens: number): number {
    // Gemini Pro: $0.00025 per 1K input tokens, $0.0005 per 1K output tokens
    const inputTokens = tokens * 0.6
    const outputTokens = tokens * 0.4
    return (inputTokens * 0.00025 / 1000) + (outputTokens * 0.0005 / 1000)
  }
}

// === STRATEGY MANAGER CON FALLBACK ===

export class LLMStrategyManager {
  private providers: Map<string, LLMProvider> = new Map()
  private config: FallbackConfig
  private cache: Map<string, LLMResponse> = new Map()
  private healthStatus: Map<string, { isHealthy: boolean; lastCheck: number }> = new Map()

  constructor(config: FallbackConfig) {
    this.config = config
  }

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider)
    this.healthStatus.set(provider.name, { isHealthy: true, lastCheck: Date.now() })
  }

  async complete(request: LLMRequest, options?: { 
    skipCache?: boolean 
    preferredProvider?: 'openai' | 'anthropic' | 'google'
  }): Promise<LLMResponse> {
    // Check cache first
    if (this.config.enableCache && !options?.skipCache) {
      const cacheKey = this.getCacheKey(request)
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.log('[LLMStrategy] Cache hit')
        return { ...cached, latencyMs: 0 }
      }
    }

    // Determine provider order
    const providerOrder = this.getProviderOrder(options?.preferredProvider)

    // Try each provider with fallback
    let lastError: string | undefined
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      for (const providerName of providerOrder) {
        const provider = this.providers.get(providerName)
        if (!provider) continue

        // Skip if provider is known to be unhealthy
        const health = this.healthStatus.get(providerName)
        if (health && !health.isHealthy && Date.now() - health.lastCheck < 60000) {
          console.log(`[LLMStrategy] Skipping unhealthy provider: ${providerName}`)
          continue
        }

        console.log(`[LLMStrategy] Attempt ${attempt + 1}/${this.config.maxRetries} with ${providerName}`)

        try {
          // Set timeout for request
          const response = await Promise.race([
            provider.complete(request),
            this.timeout(this.config.timeoutMs)
          ])

          if (response.success) {
            // Update health status
            this.healthStatus.set(providerName, { isHealthy: true, lastCheck: Date.now() })
            
            // Cache successful response
            if (this.config.enableCache) {
              const cacheKey = this.getCacheKey(request)
              this.cache.set(cacheKey, response)
              
              // Clean old cache entries (keep last 100)
              if (this.cache.size > 100) {
                const firstKey = this.cache.keys().next().value
                this.cache.delete(firstKey)
              }
            }

            // Log usage
            console.log(`[LLMStrategy] Success with ${providerName} - ${response.tokensUsed} tokens in ${response.latencyMs}ms`)
            
            return response
          } else {
            lastError = response.error
            console.warn(`[LLMStrategy] ${providerName} failed: ${response.error}`)
            
            // Mark as unhealthy
            this.healthStatus.set(providerName, { isHealthy: false, lastCheck: Date.now() })
          }
        } catch (error: any) {
          lastError = error.message
          console.error(`[LLMStrategy] ${providerName} threw error:`, error)
          
          // Mark as unhealthy
          this.healthStatus.set(providerName, { isHealthy: false, lastCheck: Date.now() })
        }
      }
    }

    // All providers failed
    return {
      content: '',
      model: 'none',
      provider: 'openai',
      tokensUsed: 0,
      latencyMs: 0,
      success: false,
      error: `All providers failed after ${this.config.maxRetries} retries. Last error: ${lastError}`
    }
  }

  private getProviderOrder(preferred?: 'openai' | 'anthropic' | 'google'): string[] {
    if (preferred && this.providers.has(preferred)) {
      // Put preferred first, then fallbacks
      return [
        preferred,
        ...this.config.fallbackOrder.filter(p => p !== preferred)
      ]
    }
    
    // Default order: primary + fallbacks
    return [
      this.config.primaryProvider,
      ...this.config.fallbackOrder.filter(p => p !== this.config.primaryProvider)
    ]
  }

  private getCacheKey(request: LLMRequest): string {
    return `${request.prompt.substring(0, 100)}_${request.temperature}_${request.maxTokens}`
  }

  private timeout(ms: number): Promise<LLMResponse> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${ms}ms`))
      }, ms)
    })
  }

  async getHealthStatus(): Promise<Record<string, { isHealthy: boolean; lastCheck: Date }>> {
    const status: Record<string, { isHealthy: boolean; lastCheck: Date }> = {}
    
    for (const [name, health] of this.healthStatus.entries()) {
      status[name] = {
        isHealthy: health.isHealthy,
        lastCheck: new Date(health.lastCheck)
      }
    }
    
    return status
  }

  async runHealthChecks(): Promise<void> {
    console.log('[LLMStrategy] Running health checks...')
    
    const checks = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      try {
        const isHealthy = await provider.isAvailable()
        this.healthStatus.set(name, { isHealthy, lastCheck: Date.now() })
        console.log(`[LLMStrategy] ${name}: ${isHealthy ? '✅' : '❌'}`)
      } catch (error) {
        this.healthStatus.set(name, { isHealthy: false, lastCheck: Date.now() })
        console.error(`[LLMStrategy] ${name} health check failed:`, error)
      }
    })
    
    await Promise.all(checks)
  }

  clearCache(): void {
    this.cache.clear()
    console.log('[LLMStrategy] Cache cleared')
  }

  getProviderStats(): Record<string, { cost: number }> {
    const stats: Record<string, { cost: number }> = {}
    
    for (const [name, provider] of this.providers.entries()) {
      stats[name] = {
        cost: provider.estimatedCost(1000) // Cost per 1K tokens
      }
    }
    
    return stats
  }
}

// === FACTORY FUNCTION ===

export function createLLMStrategyManager(): LLMStrategyManager {
  const config: FallbackConfig = {
    primaryProvider: 'openai',
    fallbackOrder: ['anthropic', 'google', 'openai'],
    maxRetries: 2,
    timeoutMs: 30000, // 30 seconds
    enableCache: true
  }

  const manager = new LLMStrategyManager(config)

  // Register providers (keys from env)
  if (process.env.OPENAI_API_KEY) {
    manager.registerProvider(
      new OpenAIProvider(process.env.OPENAI_API_KEY, 'gpt-4-turbo-preview')
    )
  }

  if (process.env.ANTHROPIC_API_KEY) {
    manager.registerProvider(
      new AnthropicProvider(process.env.ANTHROPIC_API_KEY, 'claude-3-sonnet-20240229')
    )
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    manager.registerProvider(
      new GoogleGeminiProvider(process.env.GOOGLE_AI_API_KEY, 'gemini-pro')
    )
  }

  return manager
}

// Singleton instance
let managerInstance: LLMStrategyManager | null = null

export function getLLMStrategyManager(): LLMStrategyManager {
  if (!managerInstance) {
    managerInstance = createLLMStrategyManager()
  }
  return managerInstance
}
