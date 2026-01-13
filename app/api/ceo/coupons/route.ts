import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: List all coupons
export async function GET() {
  try {
    // Fetch coupons from Stripe
    const stripeCoupons = await stripe.coupons.list({ limit: 100 })
    
    // Fetch promotion codes with coupon details
    const promoCodes = await stripe.promotionCodes.list({ limit: 100 })

    // Transform to our format
    const coupons = promoCodes.data.map((promo) => {
      const coupon = promo.coupon
      
      return {
        id: promo.id,
        code: promo.code,
        discountType: coupon.percent_off ? 'percentage' : 'fixed',
        discountValue: coupon.percent_off || (coupon.amount_off ? coupon.amount_off / 100 : 0),
        expiresAt: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
        maxRedemptions: promo.max_redemptions,
        timesUsed: promo.times_redeemed,
        active: promo.active,
        createdAt: new Date(promo.created * 1000).toISOString()
      }
    })

    // Sort by created date (newest first)
    coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      coupons
    })

  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Create new coupon
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, discountType, discountValue, expiresAt, maxRedemptions } = body

    // Validate input
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create coupon in Stripe
    const couponData: Stripe.CouponCreateParams = {
      duration: 'once',
      name: code
    }

    if (discountType === 'percentage') {
      couponData.percent_off = discountValue
    } else {
      couponData.amount_off = Math.round(discountValue * 100) // Convert to cents
      couponData.currency = 'usd'
    }

    const stripeCoupon = await stripe.coupons.create(couponData)

    // Create promotion code
    const promoCodeData: Stripe.PromotionCodeCreateParams = {
      coupon: stripeCoupon.id,
      code: code.toUpperCase()
    }

    if (expiresAt) {
      promoCodeData.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000)
    }

    if (maxRedemptions) {
      promoCodeData.max_redemptions = maxRedemptions
    }

    const promoCode = await stripe.promotionCodes.create(promoCodeData)

    // Return created coupon
    return NextResponse.json({
      success: true,
      coupon: {
        id: promoCode.id,
        code: promoCode.code,
        discountType,
        discountValue,
        expiresAt: promoCode.expires_at ? new Date(promoCode.expires_at * 1000).toISOString() : null,
        maxRedemptions: promoCode.max_redemptions,
        timesUsed: 0,
        active: true,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
