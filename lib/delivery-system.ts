/**
 * Sprint 24: Delivery System Client Library
 * 
 * Biblioteca cliente para interactuar con el sistema de entrega
 * de productos digitales desde el frontend/backend de Next.js.
 */

export interface DeliveryRequest {
  userId: string
  email: string
  orderId: string
  purchaseItems: Array<{
    id: string
    name: string
    type: 'ebook' | 'cv_audit' | 'mentorship'
  }>
  orderBumpAccepted: boolean
  upsellAccepted: boolean
}

export interface DeliveryResult {
  success: boolean
  message: string
  deliveryResults: {
    ebook?: {
      success: boolean
      downloadUrl: string
    }
    cv_audit?: {
      success: boolean
      creditsGranted: number
    }
    mentorship?: {
      success: boolean
      subscriptionId: string
      sessionsGranted: number
    }
  }
  errors?: Array<{
    product: string
    error: string
  }>
}

/**
 * Trigger product delivery after successful payment
 */
export async function triggerDelivery(request: DeliveryRequest): Promise<DeliveryResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL not configured')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/deliver-purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Delivery failed: ${error}`)
  }

  const result: DeliveryResult = await response.json()
  return result
}

/**
 * Map cart items to delivery format
 */
export function mapCartToDeliveryItems(cart: Array<{ id: string, name: string }>) {
  return cart.map(item => {
    let type: 'ebook' | 'cv_audit' | 'mentorship'
    
    switch (item.id) {
      case 'soft-skills-guide':
        type = 'ebook'
        break
      case 'cv-audit-ai':
        type = 'cv_audit'
        break
      case 'mentorship-month':
        type = 'mentorship'
        break
      default:
        type = 'ebook' // fallback
    }

    return {
      id: item.id,
      name: item.name,
      type
    }
  })
}

/**
 * Send confirmation email to user
 * (Backup method if Supabase function fails)
 */
export async function sendDeliveryEmail(
  email: string,
  products: string[],
  downloadLinks?: Record<string, string>
) {
  // This would integrate with your email service (SendGrid, etc.)
  console.log('[Delivery] Sending confirmation email to:', email)
  console.log('[Delivery] Products:', products)
  console.log('[Delivery] Links:', downloadLinks)

  // Implementation would go here
  // await sendEmail({ to: email, template: 'delivery', ... })
}

/**
 * Check delivery status for an order
 */
export async function checkDeliveryStatus(orderId: string): Promise<{
  delivered: boolean
  deliveredAt?: string
  errors?: any[]
}> {
  const response = await fetch(`/api/orders/${orderId}/delivery-status`)
  
  if (!response.ok) {
    throw new Error('Failed to check delivery status')
  }

  return response.json()
}

/**
 * Retry failed delivery for specific products
 */
export async function retryDelivery(
  orderId: string,
  failedProducts: string[]
): Promise<DeliveryResult> {
  const response = await fetch('/api/orders/retry-delivery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId,
      products: failedProducts
    })
  })

  if (!response.ok) {
    throw new Error('Failed to retry delivery')
  }

  return response.json()
}
