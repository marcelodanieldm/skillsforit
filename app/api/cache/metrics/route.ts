import { NextRequest, NextResponse } from 'next/server'
import { semanticCache } from '@/lib/semantic-cache'
import { AuthService } from '@/lib/auth'

/**
 * Semantic Cache Metrics API
 * 
 * GET /api/cache/metrics
 * Returns semantic cache performance metrics
 * 
 * Protected: CEO/Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate CEO
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const auth = AuthService.validateSession(token || '')

    if (!auth.valid || !['ceo', 'admin'].includes(auth.session!.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get cache metrics
    const metrics = semanticCache.getMetrics()

    return NextResponse.json({
      success: true,
      metrics,
      insights: [
        metrics.hitRate > 30
          ? `🎯 Cache is performing well (${metrics.hitRate.toFixed(1)}% hit rate)`
          : `⚠️ Cache hit rate is low (${metrics.hitRate.toFixed(1)}%)`,
        `💰 Saved $${metrics.costSavings.toFixed(2)} in API costs`,
        `⚡ Cache hits are ${Math.round(metrics.averageMissTime / metrics.averageHitTime)}x faster than API calls`,
        `📊 ${metrics.cacheSize} unique CV patterns cached`,
      ],
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error getting cache metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}

/**
 * Clear cache (for testing/maintenance)
 * 
 * DELETE /api/cache/metrics
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate CEO
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const auth = AuthService.validateSession(token || '')

    if (!auth.valid || auth.session!.role !== 'ceo') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - CEO only' },
        { status: 401 }
      )
    }

    // Clear cache
    semanticCache.clearCache()

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
