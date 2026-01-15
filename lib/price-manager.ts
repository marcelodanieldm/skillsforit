import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =====================================================
// TIPOS Y INTERFACES
// =====================================================

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  currency: string
  type: 'ebook' | 'order_bump' | 'upsell'
  stripe_product_id: string | null
  stripe_price_id: string | null
  is_active: boolean
  display_order: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PriceChangeRequest {
  serviceId: string
  newPrice: number
  changedBy: string // Email del CEO
  reason?: string
}

export interface PriceChangeResult {
  success: boolean
  service: Service
  oldPrice: number
  newPrice: number
  stripePrice: Stripe.Price
  historyId: string
  message: string
}

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Actualiza el precio de un servicio y sincroniza con Stripe
 * @param request Información del cambio de precio
 * @returns Resultado de la operación
 */
export async function updateServicePrice(
  request: PriceChangeRequest
): Promise<PriceChangeResult> {
  const { serviceId, newPrice, changedBy, reason } = request

  // 1. Obtener servicio actual
  const { data: service, error: fetchError } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (fetchError || !service) {
    throw new Error(`Servicio no encontrado: ${serviceId}`)
  }

  const oldPrice = service.base_price

  // Validar que el precio sea diferente
  if (oldPrice === newPrice) {
    throw new Error('El nuevo precio es igual al actual')
  }

  // Validar que el precio sea válido
  if (newPrice < 0) {
    throw new Error('El precio no puede ser negativo')
  }

  try {
    // 2. Crear nuevo precio en Stripe
    const stripePrice = await createStripePrice(service, newPrice)

    // 3. Configurar contexto para el trigger de price_history
    try {
      await supabase.rpc('exec_sql', {
        query: `
          SELECT set_config('app.user_email', '${changedBy}', false);
          SELECT set_config('app.change_reason', '${reason || 'Manual price update'}', false);
        `
      })
    } catch (error) {
      // Si falla, continuamos igual (el trigger usará valores por defecto)
      console.warn('No se pudo configurar el contexto del usuario para el trigger')
    }

    // 4. Actualizar servicio en la base de datos
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        base_price: newPrice,
        stripe_price_id: stripePrice.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single()

    if (updateError || !updatedService) {
      // Si falla la actualización, intentar archivar el precio de Stripe
      await stripe.prices.update(stripePrice.id, { active: false }).catch(() => {})
      throw new Error(`Error al actualizar servicio: ${updateError?.message}`)
    }

    // 5. Obtener ID del registro de historial creado por el trigger
    const { data: historyRecord } = await supabase
      .from('price_history')
      .select('id')
      .eq('service_id', serviceId)
      .eq('new_price', newPrice)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single()

    // 6. Desactivar precio anterior en Stripe (si existe)
    if (service.stripe_price_id && service.stripe_price_id !== stripePrice.id) {
      await stripe.prices.update(service.stripe_price_id, {
        active: false
      }).catch(err => {
        console.warn('No se pudo desactivar el precio anterior en Stripe:', err)
      })
    }

    return {
      success: true,
      service: updatedService as Service,
      oldPrice,
      newPrice,
      stripePrice,
      historyId: historyRecord?.id || '',
      message: `Precio actualizado de $${oldPrice} a $${newPrice}`
    }

  } catch (error) {
    console.error('Error en updateServicePrice:', error)
    throw error
  }
}

/**
 * Crea un nuevo precio en Stripe para un servicio
 * @param service Servicio para el cual crear el precio
 * @param price Precio en dólares
 * @returns Objeto Price de Stripe
 */
export async function createStripePrice(
  service: Service,
  price: number
): Promise<Stripe.Price> {
  try {
    // 1. Asegurar que existe el producto en Stripe
    let productId = service.stripe_product_id

    if (!productId) {
      const product = await createStripeProduct(service)
      productId = product.id

      // Actualizar el servicio con el product_id
      await supabase
        .from('services')
        .update({ stripe_product_id: productId })
        .eq('id', service.id)
    }

    // 2. Crear el nuevo precio
    const stripePrice = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(price * 100), // Convertir a centavos
      currency: service.currency.toLowerCase(),
      active: true,
      metadata: {
        service_id: service.id,
        service_slug: service.slug,
        service_type: service.type,
        updated_at: new Date().toISOString()
      }
    })

    return stripePrice

  } catch (error) {
    console.error('Error al crear precio en Stripe:', error)
    throw new Error(`Error en Stripe API: ${error instanceof Error ? error.message : 'Unknown'}`)
  }
}

/**
 * Crea un producto en Stripe si no existe
 * @param service Servicio a crear como producto
 * @returns Objeto Product de Stripe
 */
export async function createStripeProduct(
  service: Service
): Promise<Stripe.Product> {
  try {
    const product = await stripe.products.create({
      name: service.name,
      description: service.description,
      active: true,
      metadata: {
        service_id: service.id,
        service_slug: service.slug,
        service_type: service.type
      }
    })

    return product

  } catch (error) {
    console.error('Error al crear producto en Stripe:', error)
    throw new Error(`Error creando producto: ${error instanceof Error ? error.message : 'Unknown'}`)
  }
}

/**
 * Sincroniza todos los servicios con Stripe
 * Útil para migraciones o recuperación de errores
 */
export async function syncAllServicesWithStripe(): Promise<{
  synced: number
  errors: string[]
}> {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)

  if (error || !services) {
    throw new Error('Error al obtener servicios')
  }

  const errors: string[] = []
  let synced = 0

  for (const service of services) {
    try {
      // Crear precio en Stripe si no existe
      if (!service.stripe_price_id) {
        const stripePrice = await createStripePrice(service, service.base_price)
        
        await supabase
          .from('services')
          .update({ stripe_price_id: stripePrice.id })
          .eq('id', service.id)

        synced++
      }
    } catch (err) {
      errors.push(`${service.slug}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return { synced, errors }
}

/**
 * Obtiene todos los servicios activos
 */
export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Error al obtener servicios: ${error.message}`)
  }

  return data as Service[]
}

/**
 * Obtiene un servicio por slug
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return data as Service
}

/**
 * Obtiene el historial de cambios de precio de un servicio
 */
export async function getPriceHistory(
  serviceId: string,
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await supabase
    .from('price_history_detailed')
    .select('*')
    .eq('service_id', serviceId)
    .order('changed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error al obtener historial:', error)
    return []
  }

  return data || []
}

/**
 * Calcula el impacto estimado de un cambio de precio
 * Basado en elasticidad de precio (reglas simples)
 */
export function estimatePriceChangeImpact(
  oldPrice: number,
  newPrice: number,
  currentConversionRate: number = 30 // Por defecto 30%
): {
  priceChangePercentage: number
  estimatedConversionRate: number
  estimatedRevenueChange: number
  severity: 'minor' | 'moderate' | 'major'
  recommendation: string
} {
  const priceChangePercentage = ((newPrice - oldPrice) / oldPrice) * 100

  // Elasticidad simplificada:
  // - Aumento de 10% en precio → -3% en conversión
  // - Reducción de 10% en precio → +2% en conversión
  const elasticity = priceChangePercentage > 0 ? -0.3 : 0.2
  const conversionChange = priceChangePercentage * elasticity

  const estimatedConversionRate = Math.max(
    0,
    Math.min(100, currentConversionRate + conversionChange)
  )

  // Revenue = Price × Conversion Rate
  const oldRevenue = oldPrice * currentConversionRate
  const newRevenue = newPrice * estimatedConversionRate
  const estimatedRevenueChange = ((newRevenue - oldRevenue) / oldRevenue) * 100

  // Determinar severidad
  let severity: 'minor' | 'moderate' | 'major' = 'minor'
  if (Math.abs(priceChangePercentage) >= 20) severity = 'major'
  else if (Math.abs(priceChangePercentage) >= 10) severity = 'moderate'

  // Recomendación
  let recommendation = ''
  if (priceChangePercentage > 20) {
    recommendation = '⚠️ Aumento significativo. Monitorea de cerca la conversión.'
  } else if (priceChangePercentage > 10) {
    recommendation = '📊 Aumento moderado. Considera hacer A/B testing.'
  } else if (priceChangePercentage < -20) {
    recommendation = '💡 Reducción importante. Espera un aumento en volumen.'
  } else if (priceChangePercentage < -10) {
    recommendation = '✓ Reducción moderada. Puede mejorar la conversión.'
  } else {
    recommendation = '✓ Ajuste menor. Impacto mínimo esperado.'
  }

  return {
    priceChangePercentage,
    estimatedConversionRate,
    estimatedRevenueChange,
    severity,
    recommendation
  }
}

/**
 * Valida que un precio sea razonable para un tipo de servicio
 */
export function validatePrice(
  serviceType: 'ebook' | 'order_bump' | 'upsell',
  price: number
): { valid: boolean; message?: string } {
  const ranges = {
    ebook: { min: 5, max: 50 },
    order_bump: { min: 3, max: 20 },
    upsell: { min: 10, max: 100 }
  }

  const range = ranges[serviceType]

  if (price < range.min) {
    return {
      valid: false,
      message: `El precio mínimo recomendado para ${serviceType} es $${range.min}`
    }
  }

  if (price > range.max) {
    return {
      valid: false,
      message: `El precio máximo recomendado para ${serviceType} es $${range.max}`
    }
  }

  return { valid: true }
}
