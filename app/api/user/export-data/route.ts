import { NextRequest, NextResponse } from 'next/server'
import { DataExporter } from '@/lib/gdpr-compliance'

/**
 * POST /api/user/export-data
 * 
 * Exporta todos los datos del usuario en formato JSON según GDPR/LGPD
 * 
 * Derecho de portabilidad de datos:
 * - GDPR Article 20
 * - LGPD Article 18, III
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail } = body

    // Validación
    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'userId and userEmail are required' },
        { status: 400 }
      )
    }

    // Crear solicitud de exportación
    const exportRequest = await DataExporter.requestExport(userId, userEmail)

    return NextResponse.json({
      success: true,
      message: 'Data export request created successfully',
      requestId: exportRequest.id,
      status: exportRequest.status,
      requestedAt: exportRequest.requestedAt,
      estimatedTime: '2-5 minutes'
    })
  } catch (error) {
    console.error('Error creating export request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create export request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/export-data?requestId=xxx
 * 
 * Obtiene el estado de una solicitud de exportación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const userId = searchParams.get('userId')

    if (!requestId && !userId) {
      return NextResponse.json(
        { success: false, error: 'requestId or userId required' },
        { status: 400 }
      )
    }

    // Buscar por requestId específico
    if (requestId) {
      const exportRequest = DataExporter.getExportRequest(requestId)

      if (!exportRequest) {
        return NextResponse.json(
          { success: false, error: 'Export request not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        exportRequest: {
          id: exportRequest.id,
          status: exportRequest.status,
          requestedAt: exportRequest.requestedAt,
          completedAt: exportRequest.completedAt,
          downloadUrl: exportRequest.downloadUrl,
          expiresAt: exportRequest.expiresAt
        }
      })
    }

    // Buscar todas las solicitudes del usuario
    if (userId) {
      const exportRequests = DataExporter.getUserExportRequests(userId)

      return NextResponse.json({
        success: true,
        exportRequests: exportRequests.map(req => ({
          id: req.id,
          status: req.status,
          requestedAt: req.requestedAt,
          completedAt: req.completedAt,
          downloadUrl: req.status === 'completed' ? req.downloadUrl : undefined,
          expiresAt: req.expiresAt
        }))
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching export request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch export request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
