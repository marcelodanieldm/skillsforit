import { NextRequest, NextResponse } from 'next/server'
import { ConsentManager, AuditLogger } from '@/lib/gdpr-compliance'

/**
 * POST /api/user/consent
 * 
 * Registra o actualiza el consentimiento del usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, consents, ipAddress, userAgent } = body

    // Validación
    if (!userId || !userEmail || !consents) {
      return NextResponse.json(
        { success: false, error: 'userId, userEmail, and consents are required' },
        { status: 400 }
      )
    }

    const grantedConsents: any[] = []
    const revokedConsents: string[] = []

    // Procesar cada consentimiento
    for (const [type, granted] of Object.entries(consents)) {
      if (granted) {
        const consent = ConsentManager.grantConsent({
          userId,
          userEmail,
          type: type as any,
          ipAddress,
          userAgent
        })
        grantedConsents.push(consent)
      } else {
        ConsentManager.revokeConsent(userId, type as any)
        revokedConsents.push(type)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Consents updated successfully',
      granted: grantedConsents.length,
      revoked: revokedConsents.length
    })
  } catch (error) {
    console.error('Error updating consents:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update consents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/consent?userId=xxx
 * 
 * Obtiene los consentimientos actuales del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includeHistory = searchParams.get('history') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      )
    }

    if (includeHistory) {
      // Incluir historial completo
      const history = ConsentManager.getConsentHistory(userId)
      
      return NextResponse.json({
        success: true,
        history: history.map(c => ({
          type: c.type,
          granted: c.granted,
          grantedAt: c.grantedAt,
          revokedAt: c.revokedAt
        }))
      })
    }

    // Solo consentimientos activos
    const activeConsents = {
      cookies: ConsentManager.hasConsent(userId, 'cookies'),
      analytics: ConsentManager.hasConsent(userId, 'analytics'),
      marketing: ConsentManager.hasConsent(userId, 'marketing'),
      ai_training: ConsentManager.hasConsent(userId, 'ai_training'),
      data_processing: ConsentManager.hasConsent(userId, 'data_processing')
    }

    return NextResponse.json({
      success: true,
      consents: activeConsents
    })
  } catch (error) {
    console.error('Error fetching consents:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch consents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
