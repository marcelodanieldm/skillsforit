/**
 * Queue Manager - Background Job Processing System
 * 
 * Implements asynchronous job processing to prevent API timeouts
 * during long-running AI operations (OpenAI calls).
 * 
 * Architecture:
 * - Producer: Enqueue jobs and return immediately
 * - Consumer: Background worker processes jobs from queue
 * - Storage: In-memory queue (MVP) → Migrate to Redis for production
 * 
 * Benefits:
 * - No user-facing timeouts (returns job ID immediately)
 * - Retry logic for failed jobs
 * - Priority queue support
 * - Status tracking and polling
 */

export type JobType = 
  | 'cv_analysis'           // AI analysis of CV (10-30s)
  | 'mentorship_generation' // Generate mentorship content
  | 'email_delivery'        // Send report emails
  | 'pdf_generation'        // Generate PDF reports

export type JobStatus = 
  | 'queued'      // Waiting to be processed
  | 'processing'  // Currently being processed
  | 'completed'   // Successfully completed
  | 'failed'      // Failed after retries

export type JobPriority = 'high' | 'normal' | 'low'

export interface Job<T = any> {
  id: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  data: T
  result?: any
  error?: string
  retries: number
  maxRetries: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  processingTime?: number // milliseconds
}

// Specific job data types for type safety
export interface CVAnalysisJobData {
  analysisId: string
  cvText: string
  profession: string
  country: string
  email: string
  name: string
  includeEbook?: boolean
}

export interface MentorshipGenerationJobData {
  sessionId: string
  mentorId: string
  menteeEmail: string
  context: string
}

export interface EmailDeliveryJobData {
  to: string
  subject: string
  reportPath: string
  ebookPath?: string
}

export interface PDFGenerationJobData {
  analysisId: string
  analysisResult: any
}

/**
 * Queue Manager - Singleton Pattern
 * 
 * Manages job queue with priority support and automatic processing.
 * Uses Dependency Inversion Principle: depends on Job interface, not concrete implementations.
 */
export class QueueManager {
  private static instance: QueueManager
  private queue: Job[] = []
  private processingJobs: Map<string, Job> = new Map()
  private completedJobs: Map<string, Job> = new Map()
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null

  // Metrics
  private metrics = {
    totalEnqueued: 0,
    totalProcessed: 0,
    totalFailed: 0,
    averageProcessingTime: 0,
  }

  private constructor() {
    // Singleton: private constructor
  }

  /**
   * Get singleton instance
   */
  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager()
    }
    return QueueManager.instance
  }

  /**
   * Enqueue a new job
   * Returns job ID immediately for polling
   */
  enqueue<T>(
    type: JobType,
    data: T,
    priority: JobPriority = 'normal',
    maxRetries: number = 3
  ): string {
    const jobId = this.generateJobId(type)

    const job: Job<T> = {
      id: jobId,
      type,
      status: 'queued',
      priority,
      data,
      retries: 0,
      maxRetries,
      createdAt: new Date(),
    }

    this.queue.push(job)
    this.metrics.totalEnqueued++

    // Sort by priority (high → normal → low)
    this.sortQueue()

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing()
    }

    console.log(`📥 Job enqueued: ${jobId} (${type}) - Priority: ${priority}`)
    return jobId
  }

  /**
   * Get job status by ID
   */
  getJobStatus(jobId: string): Job | null {
    // Check processing jobs
    if (this.processingJobs.has(jobId)) {
      return this.processingJobs.get(jobId)!
    }

    // Check completed jobs
    if (this.completedJobs.has(jobId)) {
      return this.completedJobs.get(jobId)!
    }

    // Check queue
    const queuedJob = this.queue.find(job => job.id === jobId)
    if (queuedJob) {
      return queuedJob
    }

    return null
  }

  /**
   * Get job result (only if completed)
   */
  getJobResult(jobId: string): any | null {
    const job = this.completedJobs.get(jobId)
    return job?.result || null
  }

  /**
   * Get queue statistics
   */
  getMetrics() {
    return {
      ...this.metrics,
      queuedJobs: this.queue.length,
      processingJobs: this.processingJobs.size,
      completedJobs: this.completedJobs.size,
    }
  }

  /**
   * Start background processing
   */
  startProcessing() {
    if (this.isProcessing) return

    this.isProcessing = true
    console.log('🔄 Queue processing started')

    // Process jobs every 100ms
    this.processingInterval = setInterval(() => {
      this.processNextJob()
    }, 100)
  }

  /**
   * Stop background processing
   */
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    this.isProcessing = false
    console.log('⏸️ Queue processing stopped')
  }

  /**
   * Process next job in queue
   */
  private async processNextJob() {
    if (this.queue.length === 0) {
      return
    }

    // Dequeue highest priority job
    const job = this.queue.shift()
    if (!job) return

    // Mark as processing
    job.status = 'processing'
    job.startedAt = new Date()
    this.processingJobs.set(job.id, job)

    console.log(`⚙️ Processing job: ${job.id} (${job.type})`)

    try {
      // Process job based on type
      const result = await this.executeJob(job)

      // Mark as completed
      job.status = 'completed'
      job.completedAt = new Date()
      job.processingTime = job.completedAt.getTime() - job.startedAt!.getTime()
      job.result = result

      this.processingJobs.delete(job.id)
      this.completedJobs.set(job.id, job)
      this.metrics.totalProcessed++

      // Update average processing time
      this.updateAverageProcessingTime(job.processingTime)

      console.log(`✅ Job completed: ${job.id} (${job.processingTime}ms)`)
    } catch (error: any) {
      console.error(`❌ Job failed: ${job.id}`, error.message)

      job.error = error.message
      job.retries++

      if (job.retries < job.maxRetries) {
        // Retry: re-enqueue with same priority
        console.log(`🔄 Retrying job: ${job.id} (Attempt ${job.retries + 1}/${job.maxRetries})`)
        job.status = 'queued'
        this.queue.push(job)
        this.processingJobs.delete(job.id)
      } else {
        // Failed permanently
        console.log(`💀 Job failed permanently: ${job.id}`)
        job.status = 'failed'
        this.processingJobs.delete(job.id)
        this.completedJobs.set(job.id, job)
        this.metrics.totalFailed++
      }
    }
  }

  /**
   * Execute job using registered processor (Dependency Inversion)
   * 
   * QueueManager depends on IJobProcessor interface, not concrete implementations.
   * This allows easy testing, hot-swapping, and distributed processing.
   */
  private async executeJob(job: Job): Promise<any> {
    const { ProcessorRegistry } = await import('./background-worker')
    
    const processor = ProcessorRegistry.getProcessor(job.type)
    
    if (!processor) {
      throw new Error(`No processor registered for job type: ${job.type}`)
    }

    // Validate job data before processing
    const validationResult = processor.validate(job.data)
    if (validationResult !== true) {
      throw new Error(`Validation failed: ${validationResult}`)
    }

    // Process job using registered processor
    return await processor.process(job)
  }

  /**
   * Sort queue by priority
   */
  private sortQueue() {
    const priorityOrder = { high: 0, normal: 1, low: 2 }
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(type: JobType): string {
    return `job_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update average processing time metric
   */
  private updateAverageProcessingTime(newTime: number) {
    const total = this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) + newTime
    this.metrics.averageProcessingTime = Math.round(total / this.metrics.totalProcessed)
  }

  /**
   * Clean up old completed jobs (keep last 1000)
   */
  cleanupOldJobs() {
    const maxCompleted = 1000
    if (this.completedJobs.size > maxCompleted) {
      const oldestJobs = Array.from(this.completedJobs.entries())
        .sort((a, b) => a[1].completedAt!.getTime() - b[1].completedAt!.getTime())
        .slice(0, this.completedJobs.size - maxCompleted)

      oldestJobs.forEach(([jobId]) => {
        this.completedJobs.delete(jobId)
      })

      console.log(`🧹 Cleaned up ${oldestJobs.length} old jobs`)
    }
  }
}

// Export singleton instance
export const queueManager = QueueManager.getInstance()

// Start processing automatically when module loads
queueManager.startProcessing()

// Cleanup old jobs every hour
setInterval(() => {
  queueManager.cleanupOldJobs()
}, 60 * 60 * 1000)
