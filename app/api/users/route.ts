import { NextRequest, NextResponse } from 'next/server'
import { userProfiles, userSegmentation } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, country, profession, purpose, role, metadata } = body

    // Validation
    if (!email || !country || !profession) {
      return NextResponse.json(
        { error: 'email, country, and profession are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = userProfiles.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      })
    }

    // Create new user profile
    const profile = userProfiles.create({
      email,
      name,
      country,
      profession,
      purpose,
      role: role || 'it_user',
      metadata: metadata || {}
    })

    // Get recommended services for this segment
    const recommendations = userSegmentation.getRecommendedServices(profile.segment)

    return NextResponse.json({
      success: true,
      user: profile,
      recommendations,
      segmentLabel: userSegmentation.getSegmentLabel(profile.segment)
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create user profile: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const segment = searchParams.get('segment')

    if (email) {
      const user = userProfiles.findByEmail(email)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const recommendations = userSegmentation.getRecommendedServices(user.segment)
      return NextResponse.json({
        user,
        recommendations,
        segmentLabel: userSegmentation.getSegmentLabel(user.segment)
      })
    }

    if (segment) {
      const users = userProfiles.getBySegment(segment as any)
      return NextResponse.json({ users, count: users.length })
    }

    // Return all users with segment distribution
    const users = userProfiles.getAll()
    const distribution = userProfiles.getSegmentDistribution()

    return NextResponse.json({
      users,
      totalUsers: users.length,
      segmentDistribution: distribution
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const updatedUser = userProfiles.update(userId, updateData)
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user: ' + error.message },
      { status: 500 }
    )
  }
}
