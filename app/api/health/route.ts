import { NextRequest, NextResponse } from 'next/server'
import { getLLMStrategyManager } from '@/lib/llm-strategy'

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
    // Get LLM Strategy Manager
    const llmManager = getLLMStrategyManager()

    // Run health checks (async, all in parallel)
    await llmManager.runHealthChecks()
    const llmStatus = await llmManager.getHealthStatus()

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
    const allLLMsHealthy = Object.values(llmStatus).some(status => status.isHealthy)
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
            isHealthy: status.isHealthy,
            lastCheck: status.lastCheck.toISOString()
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

/**
 * POST endpoint to manually trigger health checks
 */
export async function POST(request: NextRequest) {
  try {
    const llmManager = getLLMStrategyManager()
    await llmManager.runHealthChecks()

    return NextResponse.json({
      success: true,
      message: 'Health checks triggered successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
