import { NextRequest, NextResponse } from 'next/server'
import { queueManager } from '@/lib/queue-manager'

/**
 * Job Status API - Polling Endpoint
 * 
 * GET /api/jobs/:jobId
 * Returns current status of a job for client-side polling
 * 
 * Response:
 * {
 *   job: {
 *     id, type, status, priority,
 *     createdAt, startedAt, completedAt,
 *     processingTime, result, error
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get job status from queue manager
    const job = queueManager.getJobStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Calculate progress percentage
    let progress = 0
    if (job.status === 'queued') {
      progress = 0
    } else if (job.status === 'processing') {
      // Estimate progress based on elapsed time vs estimated time
      const elapsed = Date.now() - (job.startedAt?.getTime() || Date.now())
      const estimated = 15000 // Default 15 seconds
      progress = Math.min(Math.round((elapsed / estimated) * 100), 99)
    } else if (job.status === 'completed') {
      progress = 100
    } else if (job.status === 'failed') {
      progress = 0
    }

    // Return job status with additional metadata
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        priority: job.priority,
        progress,
        retries: job.retries,
        maxRetries: job.maxRetries,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        processingTime: job.processingTime,
        result: job.result,
        error: job.error,
      },
    })
  } catch (error: any) {
    console.error('Error getting job status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
