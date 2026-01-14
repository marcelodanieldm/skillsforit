import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

// PATCH: Update coupon status (activate/deactivate)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { active } = await req.json()
    const couponId = params.id

    // Update promotion code in Stripe
    const promoCode = await stripe.promotionCodes.update(couponId, {
      active
    })

    return NextResponse.json({
      success: true,
      coupon: {
        id: promoCode.id,
        active: promoCode.active
      }
    })

  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete coupon
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = params.id

    // Retrieve promo code to get coupon ID
    const promoCode = await stripe.promotionCodes.retrieve(couponId)
    
    // Delete promotion code first
    await stripe.promotionCodes.update(couponId, { active: false })
    
    // Delete the coupon
    const couponRef = (promoCode as any).coupon
    const stripeCouponId: string | undefined =
      typeof couponRef === 'string' ? couponRef : couponRef?.id

    if (stripeCouponId) {
      await stripe.coupons.del(stripeCouponId)
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
