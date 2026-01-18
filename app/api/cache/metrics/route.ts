import { NextRequest, NextResponse } from 'next/server'
// import { semanticCache } from '@/lib/semantic-cache'
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

    // Semantic cache no longer available
    return NextResponse.json({
      success: false,
      error: 'Semantic cache has been removed. Metrics not available.',
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

    // Semantic cache no longer available
    return NextResponse.json({
      success: false,
      message: 'Semantic cache has been removed. No cache to clear.'
    })
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
