import { NextRequest, NextResponse } from 'next/server'
import { getHuggingFaceProvider } from '@/lib/llm-strategy'

/**
 * Health Check API
 * 
 * Endpoint para verificar el estado de salud de:
 * - LLM Providers (OpenAI, Anthropic, Google)
 * - Database (Supabase)
 * - Sistema general
 * 
 * Sprint 21: Disaster Recovery Plan
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {

    // Health check for Hugging Face provider
    const huggingface = getHuggingFaceProvider()
    let hfHealthy = true
    let hfLatency = 0
    try {
      const hfStart = Date.now()
      // Simple prompt to check health
      const result = await huggingface.complete({ prompt: 'ping', maxTokens: 5 })
      hfLatency = Date.now() - hfStart
      if (!result.success) hfHealthy = false
    } catch (e) {
      hfHealthy = false
    }

    // Database health check (simple query)
    let databaseHealthy = true
    let databaseLatency = 0
    try {
      const dbStart = Date.now()
      // TODO: Replace with actual Supabase health check
      // const { data, error } = await supabase.from('health_check').select('*').limit(1)
      // if (error) throw error
      databaseLatency = Date.now() - dbStart
    } catch (error) {
      databaseHealthy = false
      console.error('[Health] Database check failed:', error)
    }

    // Overall system status
    const llmStatus = {
      huggingface: {
        healthy: hfHealthy,
        latencyMs: hfLatency
      }
    }
    const allLLMsHealthy = Object.values(llmStatus).some(status => status.healthy)
    const overallHealthy = allLLMsHealthy && databaseHealthy

    const totalLatency = Date.now() - startTime

    const response = {
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
      services: {
        llm: {
          status: allLLMsHealthy ? 'healthy' : 'degraded',
          providers: Object.entries(llmStatus).map(([name, status]) => ({
            name,
            isHealthy: status.healthy,
            // lastCheck: status.lastCheck.toISOString() // Remove or update if not present
          }))
        },
        database: {
          status: databaseHealthy ? 'healthy' : 'degraded',
          latencyMs: databaseLatency
        }
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(response, {
      status: overallHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message || 'Health check failed'
      },
      { status: 500 }
    )
  }
}


