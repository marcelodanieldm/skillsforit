import { NextRequest, NextResponse } from 'next/server'
import { 
  analyzeMentorSaturation, 
  generateSaturationReport,
  getCEOMetrics 
} from '@/lib/mentor-saturation-analyzer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Generar análisis
    const analysis = analyzeMentorSaturation()
    const ceoMetrics = getCEOMetrics(analysis)

    // Devolver según formato solicitado
    if (format === 'text') {
      const report = generateSaturationReport(analysis)
      
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      ceoMetrics,
      summary: {
        status: analysis.urgency,
        message: analysis.needsHiring 
          ? `⚠️ Se recomienda contratar ${analysis.recommendedHires} mentor(es)`
          : '✅ Capacidad suficiente',
        utilizationRate: `${analysis.utilizationRate.toFixed(1)}%`,
        weeklyCapacity: analysis.totalWeeklyCapacity,
        currentDemand: analysis.currentWeekDemand,
        growthRate: `${analysis.growthRate > 0 ? '+' : ''}${analysis.growthRate.toFixed(1)}%`
      }
    })
  } catch (error) {
    console.error('Error analyzing saturation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze mentor saturation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
