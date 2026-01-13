import { NextResponse } from 'next/server'
import {
  getActiveServices,
  updateServicePrice,
  getPriceHistory,
  estimatePriceChangeImpact,
  validatePrice,
  syncAllServicesWithStripe
} from '@/lib/price-manager'

// GET /api/ceo/services
// Obtiene todos los servicios activos con sus precios y estadísticas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const serviceId = searchParams.get('serviceId')

    // Acción: Obtener historial de precios
    if (action === 'history' && serviceId) {
      const history = await getPriceHistory(serviceId, 50)
      return NextResponse.json({
        success: true,
        data: { history }
      })
    }

    // Acción: Sincronizar con Stripe (útil para setup inicial)
    if (action === 'sync') {
      const result = await syncAllServicesWithStripe()
      return NextResponse.json({
        success: true,
        data: result,
        message: `${result.synced} servicios sincronizados`
      })
    }

    // Acción por defecto: Obtener todos los servicios
    const services = await getActiveServices()

    // Enriquecer con estadísticas adicionales
    const enrichedServices = await Promise.all(
      services.map(async (service) => {
        const history = await getPriceHistory(service.id, 5)
        
        return {
          ...service,
          priceChanges: history.length,
          lastPriceChange: history[0]?.changed_at || null,
          lowestPrice: history.length > 0
            ? Math.min(...history.map(h => h.new_price))
            : service.base_price,
          highestPrice: history.length > 0
            ? Math.max(...history.map(h => h.new_price))
            : service.base_price
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        services: enrichedServices,
        total: enrichedServices.length
      }
    })

  } catch (error) {
    console.error('Error in GET /api/ceo/services:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener servicios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/ceo/services
// Actualiza el precio de un servicio y sincroniza con Stripe
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { serviceId, newPrice, changedBy, reason } = body

    // Validaciones
    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId es requerido' },
        { status: 400 }
      )
    }

    if (typeof newPrice !== 'number' || newPrice < 0) {
      return NextResponse.json(
        { error: 'newPrice debe ser un número positivo' },
        { status: 400 }
      )
    }

    if (!changedBy) {
      return NextResponse.json(
        { error: 'changedBy (email del usuario) es requerido' },
        { status: 400 }
      )
    }

    // Obtener el servicio para validación
    const services = await getActiveServices()
    const service = services.find(s => s.id === serviceId)

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Validar que el precio sea razonable para el tipo de servicio
    const priceValidation = validatePrice(service.type, newPrice)
    if (!priceValidation.valid) {
      return NextResponse.json(
        {
          error: 'Precio fuera del rango recomendado',
          details: priceValidation.message,
          warning: true // Flag para que el frontend muestre advertencia
        },
        { status: 400 }
      )
    }

    // Calcular impacto estimado
    const impact = estimatePriceChangeImpact(
      service.base_price,
      newPrice,
      30 // Conversión promedio estimada (se puede hacer dinámica)
    )

    // Actualizar precio y sincronizar con Stripe
    const result = await updateServicePrice({
      serviceId,
      newPrice,
      changedBy,
      reason: reason || `Price updated from $${service.base_price} to $${newPrice}`
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        impact
      },
      message: `Precio actualizado exitosamente de $${result.oldPrice} a $${result.newPrice}`
    })

  } catch (error) {
    console.error('Error in PUT /api/ceo/services:', error)
    return NextResponse.json(
      {
        error: 'Error al actualizar precio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/ceo/services
// Calcula el impacto estimado de un cambio de precio sin aplicarlo
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serviceId, newPrice } = body

    if (!serviceId || typeof newPrice !== 'number') {
      return NextResponse.json(
        { error: 'serviceId y newPrice son requeridos' },
        { status: 400 }
      )
    }

    // Obtener el servicio
    const services = await getActiveServices()
    const service = services.find(s => s.id === serviceId)

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Calcular impacto sin aplicar el cambio
    const impact = estimatePriceChangeImpact(
      service.base_price,
      newPrice,
      30 // Conversión promedio (se puede hacer dinámica con analytics)
    )

    // Validar precio
    const priceValidation = validatePrice(service.type, newPrice)

    return NextResponse.json({
      success: true,
      data: {
        service: {
          id: service.id,
          name: service.name,
          currentPrice: service.base_price,
          proposedPrice: newPrice
        },
        impact,
        validation: priceValidation
      }
    })

  } catch (error) {
    console.error('Error in POST /api/ceo/services:', error)
    return NextResponse.json(
      {
        error: 'Error al calcular impacto',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
