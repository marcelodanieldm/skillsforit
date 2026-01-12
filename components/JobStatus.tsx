'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaSpinner, FaClock, FaExclamationTriangle } from 'react-icons/fa'

/**
 * Job Status Component
 * 
 * Displays real-time job processing status with automatic polling.
 * 
 * Features:
 * - Automatic polling every 2 seconds while processing
 * - Visual progress indicator
 * - Status-based UI (queued, processing, completed, failed)
 * - Estimated time remaining
 * - Error messages with retry info
 * 
 * Usage:
 * ```tsx
 * <JobStatus 
 *   jobId="job_cv_analysis_1234"
 *   onComplete={(result) => console.log('Done!', result)}
 * />
 * ```
 */

interface JobStatusProps {
  jobId: string
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

interface Job {
  id: string
  type: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: string
  progress: number
  retries: number
  maxRetries: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  processingTime?: number
  result?: any
  error?: string
}

export default function JobStatus({ jobId, onComplete, onError }: JobStatusProps) {
  // Poll job status every 2 seconds
  const { data, isLoading, error } = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job status')
      }
      const result = await response.json()
      return result.job as Job
    },
    refetchInterval: (data) => {
      // Stop polling when job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        // Trigger callbacks
        if (data.status === 'completed' && onComplete) {
          onComplete(data.result)
        }
        if (data.status === 'failed' && onError) {
          onError(data.error || 'Job failed')
        }
        return false // Stop polling
      }
      return 2000 // Poll every 2 seconds
    },
    enabled: !!jobId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
        <FaSpinner className="animate-spin text-blue-400 text-2xl" />
        <div>
          <p className="text-white font-medium">Loading job status...</p>
          <p className="text-gray-400 text-sm">Job ID: {jobId}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500 rounded-lg">
        <FaExclamationTriangle className="text-red-400 text-2xl" />
        <div>
          <p className="text-red-400 font-medium">Error loading job status</p>
          <p className="text-gray-400 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const job = data

  // Status-based rendering
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700"
    >
      {/* Header with status icon */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {job.status === 'queued' && (
            <FaClock className="text-yellow-400 text-3xl" />
          )}
          {job.status === 'processing' && (
            <FaSpinner className="animate-spin text-blue-400 text-3xl" />
          )}
          {job.status === 'completed' && (
            <FaCheckCircle className="text-green-400 text-3xl" />
          )}
          {job.status === 'failed' && (
            <FaExclamationTriangle className="text-red-400 text-3xl" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-white text-xl font-bold mb-1">
            {job.status === 'queued' && 'Waiting in Queue'}
            {job.status === 'processing' && 'Processing Your Request'}
            {job.status === 'completed' && 'Analysis Complete!'}
            {job.status === 'failed' && 'Processing Failed'}
          </h3>
          <p className="text-gray-400 text-sm">
            {job.type.replace('_', ' ').toUpperCase()} • Priority: {job.priority}
          </p>
        </div>

        {/* Progress percentage */}
        {(job.status === 'processing' || job.status === 'completed') && (
          <div className="text-right">
            <p className="text-white text-2xl font-bold">{job.progress}%</p>
            <p className="text-gray-400 text-xs">Complete</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(job.status === 'queued' || job.status === 'processing') && (
        <div className="mb-4">
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                job.status === 'queued' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Status messages */}
      <div className="space-y-2 text-sm">
        {job.status === 'queued' && (
          <p className="text-gray-300">
            ⏳ Your request is in queue and will be processed shortly...
          </p>
        )}

        {job.status === 'processing' && (
          <div className="space-y-1">
            <p className="text-gray-300">
              🤖 Our AI is analyzing your CV with 50+ professional criteria...
            </p>
            <p className="text-gray-400 text-xs">
              This typically takes 10-30 seconds depending on CV length
            </p>
          </div>
        )}

        {job.status === 'completed' && (
          <div className="space-y-2">
            <p className="text-green-400 font-medium">
              ✅ Your CV analysis is ready!
            </p>
            {job.processingTime && (
              <p className="text-gray-400 text-xs">
                Completed in {(job.processingTime / 1000).toFixed(1)}s
              </p>
            )}
            {job.result && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Overall Score</p>
                    <p className="text-white text-2xl font-bold">{job.result.score || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">ATS Score</p>
                    <p className="text-white text-2xl font-bold">{job.result.atsScore || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {job.status === 'failed' && (
          <div className="space-y-2">
            <p className="text-red-400 font-medium">
              ❌ Analysis failed after {job.retries} attempts
            </p>
            {job.error && (
              <p className="text-gray-400 text-xs">
                Error: {job.error}
              </p>
            )}
            <p className="text-gray-400 text-xs">
              Please try again or contact support if the issue persists.
            </p>
          </div>
        )}

        {/* Retry information */}
        {job.status === 'processing' && job.retries > 0 && (
          <p className="text-yellow-400 text-xs">
            ⚠️ Retry attempt {job.retries}/{job.maxRetries}
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-xs text-gray-400">
        <div>
          <p className="font-medium">Created</p>
          <p>{new Date(job.createdAt).toLocaleTimeString()}</p>
        </div>
        {job.startedAt && (
          <div>
            <p className="font-medium">Started</p>
            <p>{new Date(job.startedAt).toLocaleTimeString()}</p>
          </div>
        )}
        {job.completedAt && (
          <div>
            <p className="font-medium">Completed</p>
            <p>{new Date(job.completedAt).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
