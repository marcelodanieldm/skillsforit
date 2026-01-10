import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe'
import { db, revenueDb } from '@/lib/database'
import { extractTextFromPDF, analyzeCVWithAI } from '@/lib/ai-analysis'
import { generatePDFReport } from '@/lib/pdf-generator'
import { sendAnalysisReport } from '@/lib/email'
import { buildEbookContent } from '@/lib/cv-auditor'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

// Disable body parser for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature)

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const metadata = session.metadata

      // Handle CV Analysis Payment
      if (!metadata?.type || metadata.type === 'cv_analysis') {
        const analysisId = metadata?.analysisId

        if (!analysisId) {
          console.error('No analysisId in session metadata')
          return NextResponse.json({ error: 'No analysisId' }, { status: 400 })
        }

        // Get analysis from database
        const analysis = db.findById(analysisId)

        if (!analysis) {
          console.error('Analysis not found:', analysisId)
          return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
        }

        // Update payment status
        db.update(analysisId, {
          paymentStatus: 'completed',
          analysisStatus: 'processing',
        })

        // Check if E-book was included
        const includeEbook = metadata?.includeEbook === 'true'
        const totalAmount = includeEbook ? 12 : 7

        // Track revenue for analytics
        const revenueId = uuidv4()
        revenueDb.create({
          id: revenueId,
          type: 'cv_analysis',
          amount: totalAmount,
          currency: 'usd',
          userEmail: analysis.email,
          userName: analysis.name,
          profession: analysis.profession,
          country: analysis.country,
          stripeSessionId: session.id,
          createdAt: new Date()
        })

        // Process analysis asynchronously (includes E-book delivery if purchased)
        processAnalysis(analysisId, includeEbook).catch(error => {
          console.error('Error processing analysis:', error)
          db.update(analysisId, {
            analysisStatus: 'failed',
          })
        })
      }

      // Handle Mentorship Payment
      if (metadata?.type === 'mentorship') {
        const { sessionsDb } = require('@/lib/database')
        const sessionId = metadata.sessionId
        const mentorId = metadata.mentorId
        const menteeEmail = metadata.menteeEmail
        const menteeName = metadata.menteeName

        if (!sessionId) {
          console.error('No sessionId in session metadata')
          return NextResponse.json({ error: 'No sessionId' }, { status: 400 })
        }

        // Update session payment status
        sessionsDb.update(sessionId, {
          paymentStatus: 'completed'
        })

        // Track revenue for analytics
        const revenueId = uuidv4()
        const amount = session.amount_total ? session.amount_total / 100 : 0
        
        revenueDb.create({
          id: revenueId,
          type: 'mentorship',
          amount,
          currency: 'usd',
          userEmail: menteeEmail,
          userName: menteeName,
          stripeSessionId: session.id,
          createdAt: new Date()
        })

        console.log(`Mentorship payment completed for session: ${sessionId}`)
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 400 }
    )
  }
}

async function processAnalysis(analysisId: string, includeEbook: boolean = false) {
  try {
    const analysis = db.findById(analysisId)
    if (!analysis) return

    // Extract text from CV
    const cvPath = path.join(process.cwd(), 'public', analysis.cvFilePath)
    const cvText = await extractTextFromPDF(cvPath)

    // Analyze with AI using advanced 50-criteria prompt
    const analysisResult = await analyzeCVWithAI(
      cvText,
      analysis.profession,
      analysis.country
    )

    // Update analysis with results
    db.update(analysisId, {
      analysisResult,
      analysisStatus: 'completed',
    })

    // Generate PDF report
    const updatedAnalysis = db.findById(analysisId)!
    const reportPath = await generatePDFReport(updatedAnalysis, analysisResult)

    // Update with report URL
    db.update(analysisId, {
      reportUrl: reportPath,
    })

    // Send email with report
    const fullReportPath = path.join(process.cwd(), 'public', reportPath)
    
    // If E-book was purchased, include it in the email
    let ebookPath: string | undefined
    if (includeEbook) {
      ebookPath = await generateEbookFile()
    }

    await sendAnalysisReport(
      analysis.email,
      analysis.name,
      fullReportPath,
      ebookPath
    )

    console.log(`Analysis completed and sent for: ${analysis.email}${includeEbook ? ' (with E-book)' : ''}`)
  } catch (error) {
    console.error('Error in processAnalysis:', error)
    throw error
  }
}

async function generateEbookFile(): Promise<string> {
  try {
    const ebookContent = buildEbookContent()
    const ebookFileName = `ebook-cv-perfecto-${Date.now()}.txt`
    const ebookPath = path.join(process.cwd(), 'public', 'ebooks', ebookFileName)
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(ebookPath), { recursive: true })
    
    // Write E-book content
    await fs.writeFile(ebookPath, ebookContent, 'utf-8')
    
    return ebookPath
  } catch (error) {
    console.error('Error generating E-book:', error)
    throw error
  }
}
