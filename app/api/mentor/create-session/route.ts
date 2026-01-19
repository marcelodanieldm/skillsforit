import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const plans = {
  aceleracion: {
    amount: 2500, // $25 USD
    name: 'Mentoría Aceleración',
    description: '1 Mes · 4 sesiones de mentoría',
  },
  transformacion: {
    amount: 4000, // $40 USD
    name: 'Mentoría Transformación',
    description: '2 Meses · 8 sesiones de mentoría',
  },
};

export async function POST(req: Request) {
  const { plan } = await req.json();
  const planInfo = plans[plan] || plans['aceleracion'];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planInfo.name,
              description: planInfo.description,
            },
            unit_amount: planInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/mentorias/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/mentorias/checkout?plan=${plan}`,
      metadata: {
        plan,
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
