import { NextRequest, NextResponse } from 'next/server'
import { queueManager } from '@/lib/queue-manager'
import { ProcessorRegistry } from '@/lib/background-worker'

/**
 * Queue Metrics API
 * 
 * GET /api/queue/metrics
 * Returns queue performance metrics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get queue metrics
    const queueMetrics = queueManager.getMetrics()

    // Get processor metrics
    const processorMetrics = ProcessorRegistry.getMetrics()

    return NextResponse.json({
      success: true,
      metrics: {
        queue: queueMetrics,
        processors: processorMetrics,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error getting queue metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}
