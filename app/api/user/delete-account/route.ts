import { NextRequest, NextResponse } from 'next/server'
import { AccountDeleter } from '@/lib/gdpr-compliance'

/**
 * POST /api/user/delete-account
 * 
 * Solicita el borrado de cuenta con período de gracia de 30 días
 * 
 * Derecho al olvido:
 * - GDPR Article 17 (Right to erasure)
 * - LGPD Article 18, VI
 * - CCPA Section 1798.105
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, reason } = body

    // Validación
    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'userId and userEmail are required' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = AccountDeleter.getUserDeletionRequest(userId)
    
    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'Deletion request already exists',
        existingRequest: {
          id: existingRequest.id,
          status: existingRequest.status,
          requestedAt: existingRequest.requestedAt,
          scheduledFor: existingRequest.scheduledFor,
          canRestore: existingRequest.canRestore
        }
      }, { status: 409 })
    }

    // Crear solicitud de borrado
    const deletionRequest = await AccountDeleter.requestDeletion(
      userId,
      userEmail,
      reason
    )

    return NextResponse.json({
      success: true,
      message: 'Account deletion scheduled. You have 30 days to cancel this request.',
      deletionRequest: {
        id: deletionRequest.id,
        status: deletionRequest.status,
        requestedAt: deletionRequest.requestedAt,
        scheduledFor: deletionRequest.scheduledFor,
        canRestore: deletionRequest.canRestore
      },
      gracePeriod: {
        days: 30,
        expiresAt: deletionRequest.scheduledFor,
        canCancel: true
      }
    })
  } catch (error) {
    console.error('Error creating deletion request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create deletion request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/delete-account?userId=xxx
 * 
 * Obtiene el estado de una solicitud de borrado
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      )
    }

    const deletionRequest = AccountDeleter.getUserDeletionRequest(userId)

    if (!deletionRequest) {
      return NextResponse.json({
        success: true,
        hasPendingDeletion: false
      })
    }

    return NextResponse.json({
      success: true,
      hasPendingDeletion: true,
      deletionRequest: {
        id: deletionRequest.id,
        status: deletionRequest.status,
        requestedAt: deletionRequest.requestedAt,
        scheduledFor: deletionRequest.scheduledFor,
        canRestore: deletionRequest.canRestore,
        daysRemaining: Math.ceil(
          (new Date(deletionRequest.scheduledFor).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      }
    })
  } catch (error) {
    console.error('Error fetching deletion request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch deletion request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/delete-account?requestId=xxx
 * 
 * Cancela una solicitud de borrado (restaura la cuenta)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'requestId required' },
        { status: 400 }
      )
    }

    const restored = await AccountDeleter.restoreAccount(requestId)

    if (!restored) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot restore account. Either request not found or grace period expired.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account restored successfully',
      restored: true
    })
  } catch (error) {
    console.error('Error restoring account:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to restore account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
