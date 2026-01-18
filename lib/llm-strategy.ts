
// === HUGGING FACE ONLY IMPLEMENTATION ===

export interface LLMResponse {
  content: string
  model: string
  provider: 'huggingface'
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

export class HuggingFaceProvider {
  name: 'huggingface' = 'huggingface'
  private apiKey: string
  private model: string
  private baseUrl: string = 'https://api-inference.huggingface.co/models/'

  constructor(apiKey: string, model: string = 'mistralai/Mistral-7B-Instruct-v0.2') {
    this.apiKey = apiKey
    this.model = model
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: request.prompt,
          parameters: {
            temperature: request.temperature ?? 0.7,
            max_new_tokens: request.maxTokens ?? 2000
          }
        })
      })
      const latencyMs = Date.now() - startTime
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
      }
      const data = await response.json()
      const content = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : ''
      // Hugging Face API does not return token usage in free tier
      return {
        content,
        model: this.model,
        provider: 'huggingface',
        tokensUsed: 0,
        latencyMs,
        success: true
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      return {
        content: '',
        model: this.model,
        provider: 'huggingface',
        tokensUsed: 0,
        latencyMs,
        success: false,
        error: error.message || 'Hugging Face API error'
      }
    }
  }
}

// Singleton instance
let huggingFaceProvider: HuggingFaceProvider | null = null

export function getHuggingFaceProvider(): HuggingFaceProvider {
  if (!huggingFaceProvider) {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set in environment variables')
    }
    huggingFaceProvider = new HuggingFaceProvider(process.env.HUGGINGFACE_API_KEY)
  }
  return huggingFaceProvider
}
