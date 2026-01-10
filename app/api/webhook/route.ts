import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe'
import { db } from '@/lib/database'
import { extractTextFromPDF, analyzeCVWithAI } from '@/lib/ai-analysis'
import { generatePDFReport } from '@/lib/pdf-generator'
import { sendAnalysisReport } from '@/lib/email'
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
      const analysisId = session.metadata?.analysisId

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

      // Process analysis asynchronously
      processAnalysis(analysisId).catch(error => {
        console.error('Error processing analysis:', error)
        db.update(analysisId, {
          analysisStatus: 'failed',
        })
      })

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

async function processAnalysis(analysisId: string) {
  try {
    const analysis = db.findById(analysisId)
    if (!analysis) return

    // Extract text from CV
    const cvPath = path.join(process.cwd(), 'public', analysis.cvFilePath)
    const cvText = await extractTextFromPDF(cvPath)

    // Analyze with AI
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
    await sendAnalysisReport(
      analysis.email,
      analysis.name,
      fullReportPath
    )

    console.log(`Analysis completed and sent for: ${analysis.email}`)
  } catch (error) {
    console.error('Error in processAnalysis:', error)
    throw error
  }
}
