import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch mentors with their stats
    const { data: mentors, error: mentorsError } = await supabase
      .from('mentors')
      .select(`
        *,
        mentor_bookings (
          id,
          status,
          amount,
          rating,
          nps_score,
          created_at
        )
      `)

    if (mentorsError) throw mentorsError

    // Calculate stats for each mentor
    const mentorsWithStats = mentors?.map((mentor) => {
      const bookings = mentor.mentor_bookings || []
      const completedBookings = bookings.filter((b: any) => b.status === 'completed')
      const ratedBookings = completedBookings.filter((b: any) => b.rating)
      
      // Calculate average rating
      const avgRating = ratedBookings.length > 0
        ? ratedBookings.reduce((sum: number, b: any) => sum + b.rating, 0) / ratedBookings.length
        : 0

      // Calculate NPS (Net Promoter Score)
      // NPS = (% Promoters - % Detractors)
      // Promoters: rating >= 4, Detractors: rating <= 2, Passives: rating = 3
      const promoters = ratedBookings.filter((b: any) => b.rating >= 4).length
      const detractors = ratedBookings.filter((b: any) => b.rating <= 2).length
      const npsScore = ratedBookings.length > 0
        ? ((promoters - detractors) / ratedBookings.length) * 100
        : 0

      // Calculate renewal rate (users who book again)
      const uniqueUsers = new Set(bookings.map((b: any) => b.user_id))
      const repeatUsers = Array.from(uniqueUsers).filter((userId) => {
        const userBookings = bookings.filter((b: any) => b.user_id === userId && b.status === 'completed')
        return userBookings.length > 1
      })
      const renewalRate = uniqueUsers.size > 0
        ? (repeatUsers.length / uniqueUsers.size) * 100
        : 0

      // Calculate total revenue
      const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

      return {
        id: mentor.id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        email: mentor.email,
        specialty: mentor.specialty || 'General',
        totalSessions: bookings.length,
        completedSessions: completedBookings.length,
        averageRating: avgRating,
        npsScore,
        renewalRate,
        totalRevenue,
        active: mentor.active || false
      }
    }) || []

    // Sort by NPS score (highest first)
    mentorsWithStats.sort((a, b) => b.npsScore - a.npsScore)

    return NextResponse.json({
      success: true,
      mentors: mentorsWithStats
    })

  } catch (error) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
