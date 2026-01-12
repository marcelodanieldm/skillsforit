import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe'
import { db, revenueDb } from '@/lib/database'
import { extractTextFromPDF } from '@/lib/ai-analysis'
import { queueManager } from '@/lib/queue-manager'
import type { CVAnalysisJobData } from '@/lib/queue-manager'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

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
          analysisStatus: 'queued', // Changed from 'processing' to 'queued'
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

        // Extract CV text
        const cvPath = path.join(process.cwd(), 'public', analysis.cvFilePath)
        const cvText = await extractTextFromPDF(cvPath)

        // Enqueue analysis job (returns immediately with job ID)
        const jobId = queueManager.enqueue<CVAnalysisJobData>(
          'cv_analysis',
          {
            analysisId,
            cvText,
            profession: analysis.profession,
            country: analysis.country,
            email: analysis.email,
            name: analysis.name,
            includeEbook,
          },
          'high', // High priority for paid customers
          3 // Max 3 retries
        )

        // Store job ID for tracking
        db.update(analysisId, {
          jobId, // Store job ID for polling
        })

        console.log(`✅ CV Analysis enqueued: ${analysisId} → Job: ${jobId}`)
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
