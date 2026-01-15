import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Stripe and Supabase lazily
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * PATCH /api/admin/update-price
 * 
 * Actualiza el precio de un servicio y sincroniza con Stripe
 * 
 * Body:
 * {
 *   serviceId: string,
 *   newPrice: number,
 *   reason?: string (opcional)
 * }
 * 
 * Flujo:
 * 1. Validar permisos de CEO
 * 2. Validar que el servicio existe
 * 3. Crear nuevo Price en Stripe
 * 4. Actualizar services.base_price y stripe_price_id
 * 5. Trigger automático registra en price_log
 * 6. Invalidar cache de Landing Page
 * 
 * Response:
 * {
 *   success: true,
 *   service: { ... },
 *   impact: { ... }
 * }
 */
export async function PATCH(request: Request) {
  try {
    // 1. Validar permisos de CEO (simplificado para desarrollo)
    const authHeader = request.headers.get('authorization')
    
    // En producción, validar token JWT o session
    // Por ahora, permitimos si hay auth header
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de CEO.' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { serviceId, newPrice, reason } = body

    if (!serviceId || typeof newPrice !== 'number') {
      return NextResponse.json(
        { error: 'serviceId y newPrice son requeridos' },
        { status: 400 }
      )
    }

    // Validar rango de precio
    if (newPrice < 0 || newPrice > 1000) {
      return NextResponse.json(
        { error: 'Precio debe estar entre $0 y $1000' },
        { status: 400 }
      )
    }

    // 3. Obtener servicio actual
    const supabase = getSupabase()
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (fetchError || !service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // 4. Validar que el precio cambió
    if (service.base_price === newPrice) {
      return NextResponse.json(
        { error: 'El precio nuevo es igual al actual' },
        { status: 400 }
      )
    }

    // 5. Calcular impacto estimado
    const priceChangePercent = ((newPrice - service.base_price) / service.base_price) * 100
    const elasticity = priceChangePercent > 0 ? -0.3 : 0.2 // -0.3 para incremento, 0.2 para reducción
    const estimatedConversionChange = priceChangePercent * elasticity
    const estimatedRevenueChange = (
      (1 + estimatedConversionChange / 100) * newPrice / service.base_price - 1
    ) * 100

    const impact = {
      currentPrice: service.base_price,
      proposedPrice: newPrice,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      estimatedConversionChange: Math.round(estimatedConversionChange * 100) / 100,
      estimatedRevenueChange: Math.round(estimatedRevenueChange * 100) / 100,
      severity: 
        Math.abs(priceChangePercent) < 10 ? 'minor' :
        Math.abs(priceChangePercent) < 20 ? 'moderate' : 'major'
    }

    // 6. Crear/obtener producto en Stripe
    let stripeProductId = service.stripe_product_id

    if (!stripeProductId) {
      // Crear producto en Stripe si no existe
      const stripe = getStripe()
      const product = await stripe.products.create({
        name: service.name,
        description: service.description || undefined,
        metadata: {
          serviceId: service.id,
          slug: service.slug,
          type: service.type
        }
      })
      stripeProductId = product.id

      // Actualizar en BD
      await supabase
        .from('services')
        .update({ stripe_product_id: stripeProductId })
        .eq('id', serviceId)
    }

    // 7. Crear nuevo precio en Stripe
    const stripe = getStripe()
    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: Math.round(newPrice * 100), // Convertir a centavos
      currency: 'usd',
      metadata: {
        serviceId: service.id,
        serviceName: service.name,
        previousPrice: service.base_price.toString(),
        changedReason: reason || 'Manual price update'
      }
    })

    // 8. Desactivar precio anterior si existe
    if (service.stripe_price_id) {
      try {
        await stripe.prices.update(service.stripe_price_id, {
          active: false
        })
      } catch (error) {
        console.error('Error desactivando precio anterior:', error)
        // No es crítico, continuar
      }
    }

    // 9. Actualizar servicio en BD
    // Set session variables para el trigger
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        base_price: newPrice,
        stripe_price_id: stripePrice.id,
        last_updated_by: 'ceo_001', // En producción, usar user.id real
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single()

    if (updateError) {
      // Rollback: desactivar el precio nuevo que creamos
      await stripe.prices.update(stripePrice.id, { active: false })
      
      return NextResponse.json(
        { error: 'Error actualizando servicio en base de datos' },
        { status: 500 }
      )
    }

    // 10. Registrar manualmente en price_log con contexto adicional
    // (El trigger ya lo hace, pero podemos agregar metadata extra)
    await supabase
      .from('price_log')
      .insert({
        service_id: serviceId,
        old_price: service.base_price,
        new_price: newPrice,
        old_stripe_price_id: service.stripe_price_id,
        new_stripe_price_id: stripePrice.id,
        changed_by: 'ceo_001', // En producción, user.id
        change_reason: reason || 'Actualización manual de precio',
        expected_impact: JSON.stringify(impact)
      })

    // 11. Invalidar cache (opcional)
    // revalidatePath('/') // Landing page
    // revalidatePath('/checkout') // Checkout page

    // 12. Return success response
    return NextResponse.json({
      success: true,
      message: 'Precio actualizado y sincronizado con Stripe',
      service: updatedService,
      impact,
      stripe: {
        productId: stripeProductId,
        priceId: stripePrice.id
      }
    })

  } catch (error: any) {
    console.error('Error en update-price:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/update-price?serviceId=xxx
 * 
 * Obtiene el historial de cambios de precio de un servicio
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId es requerido' },
        { status: 400 }
      )
    }

    // Obtener historial desde la vista
    const supabase = getSupabase()
    const { data: history, error } = await supabase
      .from('price_log')
      .select('*')
      .eq('service_id', serviceId)
      .order('changed_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json(
        { error: 'Error obteniendo historial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      history
    })

  } catch (error: any) {
    console.error('Error en GET update-price:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
