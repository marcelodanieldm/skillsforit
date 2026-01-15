/**
 * Background Worker - Job Processors with Dependency Inversion
 * 
 * Implements SOLID principles:
 * - Single Responsibility: Each processor handles one job type
 * - Open/Closed: Easy to extend with new processors without modifying core
 * - Liskov Substitution: All processors implement IJobProcessor
 * - Interface Segregation: Minimal interface for processors
 * - Dependency Inversion: QueueManager depends on IJobProcessor interface, not concrete classes
 * 
 * This architecture allows:
 * - Easy testing with mock processors
 * - Hot-swapping processors without restarting
 * - Distributed processing across multiple workers
 */

import { Job, JobType } from './queue-manager'

/**
 * Job Processor Interface (Dependency Inversion Principle)
 * 
 * All job processors must implement this interface.
 * The queue manager depends on this abstraction, not concrete implementations.
 */
export interface IJobProcessor<TData = any, TResult = any> {
  /**
   * Job type this processor handles
   */
  readonly jobType: JobType

  /**
   * Process the job and return result
   * @throws Error if processing fails
   */
  process(job: Job<TData>): Promise<TResult>

  /**
   * Validate job data before processing
   * @returns true if valid, error message if invalid
   */
  validate(data: TData): true | string

  /**
   * Get estimated processing time in milliseconds
   */
  getEstimatedTime(data: TData): number
}

/**
 * Base Job Processor (Template Method Pattern)
 * 
 * Provides common functionality for all processors:
 * - Validation
 * - Error handling
 * - Logging
 * - Metrics
 */
export abstract class BaseJobProcessor<TData = any, TResult = any> implements IJobProcessor<TData, TResult> {
  abstract readonly jobType: JobType
  
  protected metrics = {
    totalProcessed: 0,
    totalFailed: 0,
    averageTime: 0,
  }

  /**
   * Process job with validation and error handling
   */
  async process(job: Job<TData>): Promise<TResult> {
    const startTime = Date.now()

    try {
      // Validate data
      const validationResult = this.validate(job.data)
      if (validationResult !== true) {
        throw new Error(`Validation failed: ${validationResult}`)
      }

      // Execute concrete implementation
      const result = await this.execute(job.data)

      // Update metrics
      const processingTime = Date.now() - startTime
      this.updateMetrics(processingTime, false)

      console.log(`✅ [${this.jobType}] Processed in ${processingTime}ms`)
      return result
    } catch (error: any) {
      this.updateMetrics(Date.now() - startTime, true)
      console.error(`❌ [${this.jobType}] Failed:`, error.message)
      throw error
    }
  }

  /**
   * Execute job logic (implemented by concrete processors)
   */
  protected abstract execute(data: TData): Promise<TResult>

  /**
   * Validate job data (implemented by concrete processors)
   */
  abstract validate(data: TData): true | string

  /**
   * Get estimated processing time
   */
  abstract getEstimatedTime(data: TData): number

  /**
   * Update processor metrics
   */
  protected updateMetrics(time: number, failed: boolean) {
    if (failed) {
      this.metrics.totalFailed++
    } else {
      this.metrics.totalProcessed++
      const total = this.metrics.averageTime * (this.metrics.totalProcessed - 1) + time
      this.metrics.averageTime = Math.round(total / this.metrics.totalProcessed)
    }
  }

  /**
   * Get processor metrics
   */
  getMetrics() {
    return { ...this.metrics }
  }
}

/**
 * CV Analysis Processor
 * 
 * Handles AI-powered CV analysis with OpenAI.
 * This is the most time-consuming job (10-30 seconds).
 */
export class CVAnalysisProcessor extends BaseJobProcessor {
  readonly jobType: JobType = 'cv_analysis'

  protected async execute(data: any): Promise<any> {
    const { analyzeCVWithAI } = await import('./ai-analysis')
    const { generatePDFReport } = await import('./pdf-generator')
    const { sendAnalysisReport } = await import('./email')
    const { db } = await import('./database')
    const path = await import('path')

    // Step 1: Analyze with AI (10-30 seconds)
    console.log(`🤖 [CV Analysis] Starting AI analysis for ${data.analysisId}`)
    const analysisResult = await analyzeCVWithAI(
      data.cvText,
      data.profession,
      data.country
    )

    // Step 2: Update database
    db.update(data.analysisId, {
      analysisResult,
      analysisStatus: 'completed',
    })

    // Step 3: Generate PDF report
    console.log(`📄 [CV Analysis] Generating PDF report`)
    const analysis = db.findById(data.analysisId)!
    const reportPath = await generatePDFReport(analysis, analysisResult)

    db.update(data.analysisId, {
      reportUrl: reportPath,
    })

    // Step 4: Send email with report
    console.log(`📧 [CV Analysis] Sending email to ${data.email}`)
    const fullReportPath = path.join(process.cwd(), 'public', reportPath)
    
    let ebookPath: string | undefined
    if (data.includeEbook) {
      ebookPath = await this.generateEbookFile()
    }

    await sendAnalysisReport(
      data.email,
      data.name,
      fullReportPath
    )

    return {
      analysisId: data.analysisId,
      reportPath,
      score: analysisResult.score,
      atsScore: analysisResult.atsScore,
      emailSent: true,
    }
  }

  validate(data: any): true | string {
    if (!data.analysisId) return 'Missing analysisId'
    if (!data.cvText || data.cvText.trim().length === 0) return 'Missing or empty cvText'
    if (!data.profession) return 'Missing profession'
    if (!data.country) return 'Missing country'
    if (!data.email) return 'Missing email'
    if (!data.name) return 'Missing name'
    return true
  }

  getEstimatedTime(data: any): number {
    // Base time: 15 seconds
    // Add time based on CV length
    const baseTime = 15000
    const cvLength = data.cvText?.length || 0
    const lengthFactor = Math.min(cvLength / 1000, 15) // Max +15s for long CVs
    return baseTime + lengthFactor * 1000
  }

  private async generateEbookFile(): Promise<string> {
    const { buildEbookContent } = await import('./cv-auditor')
    const fs = await import('fs/promises')
    const path = await import('path')

    const ebookContent = buildEbookContent()
    const ebookDir = path.join(process.cwd(), 'public', 'ebooks')
    const ebookPath = path.join(ebookDir, 'guia-cv-tech-it.md')

    await fs.mkdir(ebookDir, { recursive: true })
    await fs.writeFile(ebookPath, ebookContent, 'utf-8')

    return ebookPath
  }
}

/**
 * Mentorship Generation Processor
 * 
 * Generates mentorship content, session agendas, etc.
 */
export class MentorshipGenerationProcessor extends BaseJobProcessor {
  readonly jobType: JobType = 'mentorship_generation'

  protected async execute(data: any): Promise<any> {
    // TODO: Implement AI-powered mentorship content generation
    // For now, return mock data
    console.log(`💬 [Mentorship] Generating content for session ${data.sessionId}`)

    return {
      sessionId: data.sessionId,
      agenda: [
        'Introduction and goal setting',
        'Review of current situation',
        'Action plan discussion',
        'Q&A and next steps',
      ],
      suggestedTopics: [
        'Career progression strategies',
        'Technical skill development',
        'Interview preparation',
      ],
      resources: [
        'Recommended courses',
        'Industry insights',
        'Networking tips',
      ],
    }
  }

  validate(data: any): true | string {
    if (!data.sessionId) return 'Missing sessionId'
    if (!data.mentorId) return 'Missing mentorId'
    if (!data.menteeEmail) return 'Missing menteeEmail'
    return true
  }

  getEstimatedTime(data: any): number {
    return 5000 // 5 seconds for content generation
  }
}

/**
 * Email Delivery Processor
 * 
 * Handles email sending with attachments.
 */
export class EmailDeliveryProcessor extends BaseJobProcessor {
  readonly jobType: JobType = 'email_delivery'

  protected async execute(data: any): Promise<any> {
    const { sendAnalysisReport } = await import('./email')
    
    console.log(`📧 [Email] Sending to ${data.to}`)
    
    await sendAnalysisReport(
      data.to,
      data.name || 'User',
      data.reportPath,
      data.ebookPath
    )

    return {
      sent: true,
      recipient: data.to,
      attachments: data.ebookPath ? 2 : 1,
    }
  }

  validate(data: any): true | string {
    if (!data.to) return 'Missing recipient email'
    if (!data.reportPath) return 'Missing report path'
    return true
  }

  getEstimatedTime(data: any): number {
    // Base time: 2 seconds
    // Add 1 second per attachment
    const baseTime = 2000
    const attachmentTime = data.ebookPath ? 1000 : 0
    return baseTime + attachmentTime
  }
}

/**
 * PDF Generation Processor
 * 
 * Generates PDF reports from analysis results.
 */
export class PDFGenerationProcessor extends BaseJobProcessor {
  readonly jobType: JobType = 'pdf_generation'

  protected async execute(data: any): Promise<any> {
    const { generatePDFReport } = await import('./pdf-generator')
    const { db } = await import('./database')

    console.log(`📄 [PDF] Generating report for ${data.analysisId}`)

    const analysis = db.findById(data.analysisId)!
    const reportPath = await generatePDFReport(analysis, data.analysisResult)

    // Update database with report path
    db.update(data.analysisId, {
      reportUrl: reportPath,
    })

    return {
      reportPath,
      analysisId: data.analysisId,
    }
  }

  validate(data: any): true | string {
    if (!data.analysisId) return 'Missing analysisId'
    if (!data.analysisResult) return 'Missing analysis result'
    return true
  }

  getEstimatedTime(data: any): number {
    // PDF generation typically takes 3-5 seconds
    return 4000
  }
}

/**
 * Processor Registry (Factory Pattern)
 * 
 * Manages all available processors and provides lookup by job type.
 */
export class ProcessorRegistry {
  private static processors: Map<JobType, IJobProcessor> = new Map()

  /**
   * Register a processor
   */
  static register(processor: IJobProcessor) {
    this.processors.set(processor.jobType, processor)
    console.log(`🔌 Registered processor: ${processor.jobType}`)
  }

  /**
   * Get processor for job type
   */
  static getProcessor(jobType: JobType): IJobProcessor | undefined {
    return this.processors.get(jobType)
  }

  /**
   * Check if processor exists
   */
  static hasProcessor(jobType: JobType): boolean {
    return this.processors.has(jobType)
  }

  /**
   * Get all registered processors
   */
  static getAllProcessors(): IJobProcessor[] {
    return Array.from(this.processors.values())
  }

  /**
   * Get processor metrics
   */
  static getMetrics() {
    const metrics: Record<string, any> = {}
    this.processors.forEach((processor, type) => {
      if (processor instanceof BaseJobProcessor) {
        metrics[type] = processor.getMetrics()
      }
    })
    return metrics
  }
}

// Register default processors on module load
ProcessorRegistry.register(new CVAnalysisProcessor())
ProcessorRegistry.register(new MentorshipGenerationProcessor())
ProcessorRegistry.register(new EmailDeliveryProcessor())
ProcessorRegistry.register(new PDFGenerationProcessor())

console.log('🚀 Background Worker initialized with', ProcessorRegistry.getAllProcessors().length, 'processors')
