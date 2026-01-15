import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

export const createCheckoutSession = async ({
  email,
  analysisId,
  successUrl,
  cancelUrl,
}: {
  email: string
  analysisId: string
  successUrl: string
  cancelUrl: string
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Análisis de CV con IA',
            description: 'Análisis completo de tu CV con recomendaciones personalizadas',
            images: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400'],
          },
          unit_amount: 700, // $7.00 in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    metadata: {
      analysisId,
    },
    allow_promotion_codes: true,
  })

  return session
}

export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string
) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
