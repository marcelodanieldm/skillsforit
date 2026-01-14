/**
 * Event Tracking System
 * Tracks user behavior throughout the conversion funnel
 */

export type EventType = 
  | 'page_view'
  | 'form_start'
  | 'form_complete'
  | 'start_checkout'
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'cv_analysis_requested'
  | 'mentorship_session_booked'
  | 'pdf_downloaded'
  | 'email_opened'

export type UserSegment = 'Junior' | 'Transition' | 'Leadership' | 'Uncategorized'

export interface AnalyticsEvent {
  id: string
  eventType: EventType
  userId?: string
  sessionId: string
  timestamp: Date
  metadata: {
    page?: string
    service?: 'cv_analysis' | 'mentorship'
    country?: string
    profession?: string
    userSegment?: UserSegment
    referrer?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
    [key: string]: any
  }
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  country: string
  profession: string
  purpose?: string
  role: 'it_user' | 'mentor' | 'admin'
  segment: UserSegment
  createdAt: Date
  updatedAt: Date
  metadata: {
    yearsOfExperience?: number
    currentPosition?: string
    desiredPosition?: string
    skills?: string[]
  }
}

export interface FunnelMetrics {
  stage: 'landing' | 'form' | 'checkout' | 'payment' | 'completion'
  visitors: number
  conversions: number
  conversionRate: number
  dropOffRate: number
  avgTimeInStage: number
}

// In-memory stores (can be replaced with PostgreSQL later)
export const eventsDb = new Map<string, AnalyticsEvent>()
export const userProfilesDb = new Map<string, UserProfile>()

/**
 * Event Tracking Functions
 */
export const eventTracker = {
  // Track a new event
  track: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const analyticsEvent: AnalyticsEvent = {
      id,
      timestamp: new Date(),
      ...event
    }
    eventsDb.set(id, analyticsEvent)
    
    console.log('📊 Event tracked:', {
      type: analyticsEvent.eventType,
      service: analyticsEvent.metadata.service,
      segment: analyticsEvent.metadata.userSegment
    })
    
    return analyticsEvent
  },

  // Get events by type
  getEventsByType: (eventType: EventType) => {
    return Array.from(eventsDb.values()).filter(e => e.eventType === eventType)
  },

  // Get events by user
  getEventsByUser: (userId: string) => {
    return Array.from(eventsDb.values()).filter(e => e.userId === userId)
  },

  // Get events by session
  getEventsBySession: (sessionId: string) => {
    return Array.from(eventsDb.values()).filter(e => e.sessionId === sessionId)
  },

  // Get events in time range
  getEventsInRange: (startDate: Date, endDate: Date) => {
    return Array.from(eventsDb.values()).filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    )
  },

  // Calculate funnel metrics
  getFunnelMetrics: (): FunnelMetrics[] => {
    const allEvents = Array.from(eventsDb.values())
    
    // Group events by session
    const sessions = new Map<string, AnalyticsEvent[]>()
    allEvents.forEach(event => {
      const sessionEvents = sessions.get(event.sessionId) || []
      sessionEvents.push(event)
      sessions.set(event.sessionId, sessionEvents)
    })

    const metrics: { [key: string]: { count: number; time: number[] } } = {
      landing: { count: 0, time: [] },
      form: { count: 0, time: [] },
      checkout: { count: 0, time: [] },
      payment: { count: 0, time: [] },
      completion: { count: 0, time: [] }
    }

    // Analyze each session
    sessions.forEach(sessionEvents => {
      const sortedEvents = sessionEvents.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      )

      let hasVisited = false
      let hasStartedForm = false
      let hasCompletedForm = false
      let hasStartedCheckout = false
      let hasCompleted = false

      sortedEvents.forEach((event, index) => {
        const nextEvent = sortedEvents[index + 1]
        const timeToNext = nextEvent 
          ? (nextEvent.timestamp.getTime() - event.timestamp.getTime()) / 1000
          : 0

        if (event.eventType === 'page_view') {
          hasVisited = true
          metrics.landing.count++
          if (timeToNext) metrics.landing.time.push(timeToNext)
        }

        if (event.eventType === 'form_start') {
          hasStartedForm = true
          metrics.form.count++
        }

        if (event.eventType === 'form_complete') {
          hasCompletedForm = true
          if (timeToNext) metrics.form.time.push(timeToNext)
        }

        if (event.eventType === 'start_checkout') {
          hasStartedCheckout = true
          metrics.checkout.count++
          if (timeToNext) metrics.checkout.time.push(timeToNext)
        }

        if (event.eventType === 'payment_initiated') {
          metrics.payment.count++
          if (timeToNext) metrics.payment.time.push(timeToNext)
        }

        if (event.eventType === 'payment_success') {
          hasCompleted = true
          metrics.completion.count++
        }
      })
    })

    const totalSessions = sessions.size || 1

    return [
      {
        stage: 'landing',
        visitors: metrics.landing.count,
        conversions: metrics.form.count,
        conversionRate: (metrics.form.count / metrics.landing.count) * 100 || 0,
        dropOffRate: ((metrics.landing.count - metrics.form.count) / metrics.landing.count) * 100 || 0,
        avgTimeInStage: metrics.landing.time.length 
          ? metrics.landing.time.reduce((a, b) => a + b, 0) / metrics.landing.time.length
          : 0
      },
      {
        stage: 'form',
        visitors: metrics.form.count,
        conversions: metrics.checkout.count,
        conversionRate: (metrics.checkout.count / metrics.form.count) * 100 || 0,
        dropOffRate: ((metrics.form.count - metrics.checkout.count) / metrics.form.count) * 100 || 0,
        avgTimeInStage: metrics.form.time.length
          ? metrics.form.time.reduce((a, b) => a + b, 0) / metrics.form.time.length
          : 0
      },
      {
        stage: 'checkout',
        visitors: metrics.checkout.count,
        conversions: metrics.payment.count,
        conversionRate: (metrics.payment.count / metrics.checkout.count) * 100 || 0,
        dropOffRate: ((metrics.checkout.count - metrics.payment.count) / metrics.checkout.count) * 100 || 0,
        avgTimeInStage: metrics.checkout.time.length
          ? metrics.checkout.time.reduce((a, b) => a + b, 0) / metrics.checkout.time.length
          : 0
      },
      {
        stage: 'payment',
        visitors: metrics.payment.count,
        conversions: metrics.completion.count,
        conversionRate: (metrics.completion.count / metrics.payment.count) * 100 || 0,
        dropOffRate: ((metrics.payment.count - metrics.completion.count) / metrics.payment.count) * 100 || 0,
        avgTimeInStage: metrics.payment.time.length
          ? metrics.payment.time.reduce((a, b) => a + b, 0) / metrics.payment.time.length
          : 0
      },
      {
        stage: 'completion',
        visitors: metrics.completion.count,
        conversions: metrics.completion.count,
        conversionRate: 100,
        dropOffRate: 0,
        avgTimeInStage: 0
      }
    ]
  },

  // Get conversion rates by segment
  getConversionBySegment: () => {
    const allEvents = Array.from(eventsDb.values())
    const segments: { [key: string]: { total: number; converted: number } } = {
      Junior: { total: 0, converted: 0 },
      Transition: { total: 0, converted: 0 },
      Leadership: { total: 0, converted: 0 },
      Uncategorized: { total: 0, converted: 0 }
    }

    // Group by session and segment
    const sessionSegments = new Map<string, UserSegment>()
    const convertedSessions = new Set<string>()

    allEvents.forEach(event => {
      if (event.metadata.userSegment) {
        sessionSegments.set(event.sessionId, event.metadata.userSegment)
      }
      if (event.eventType === 'payment_success') {
        convertedSessions.add(event.sessionId)
      }
    })

    sessionSegments.forEach((segment, sessionId) => {
      segments[segment].total++
      if (convertedSessions.has(sessionId)) {
        segments[segment].converted++
      }
    })

    return Object.entries(segments).map(([segment, data]) => ({
      segment,
      total: data.total,
      converted: data.converted,
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0
    }))
  }
}

/**
 * User Segmentation / Clustering Functions
 */
export const userSegmentation = {
  // Categorize user based on their profession and metadata
  categorizeUser: (profession: string, metadata?: UserProfile['metadata']): UserSegment => {
    const lowerProfession = profession.toLowerCase()
    const yearsOfExp = metadata?.yearsOfExperience || 0

    // Junior: Entry-level roles or <3 years experience
    const juniorKeywords = ['junior', 'trainee', 'intern', 'entry', 'graduate', 'beginner']
    if (juniorKeywords.some(kw => lowerProfession.includes(kw)) || yearsOfExp < 3) {
      return 'Junior'
    }

    // Leadership: Senior/Lead/Management roles or >7 years experience
    const leadershipKeywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director', 'head', 'chief', 'cto', 'vp']
    if (leadershipKeywords.some(kw => lowerProfession.includes(kw)) || yearsOfExp > 7) {
      return 'Leadership'
    }

    // Transition: Mid-level or changing careers
    const transitionKeywords = ['transition', 'mid', 'intermediate', 'switching', 'changing']
    if (transitionKeywords.some(kw => lowerProfession.includes(kw)) || (yearsOfExp >= 3 && yearsOfExp <= 7)) {
      return 'Transition'
    }

    // Default to transition for mid-level
    if (yearsOfExp >= 3) {
      return 'Transition'
    }

    return 'Uncategorized'
  },

  // Get segment label for display
  getSegmentLabel: (segment: UserSegment): string => {
    const labels = {
      Junior: '👶 Junior (0-3 años)',
      Transition: '🔄 En Transición (3-7 años)',
      Leadership: '👔 Liderazgo (7+ años)',
      Uncategorized: '❓ Sin Categorizar'
    }
    return labels[segment]
  },

  // Get recommended services for segment
  getRecommendedServices: (segment: UserSegment) => {
    const recommendations = {
      Junior: {
        primary: 'cv_analysis',
        message: 'Tu CV es tu primera impresión. Optimízalo para pasar los ATS.',
        services: ['CV Analysis', 'Entry-Level Mentorship']
      },
      Transition: {
        primary: 'mentorship',
        message: 'Un mentor puede acelerar tu transición de carrera.',
        services: ['Career Mentorship', 'CV Analysis', 'Interview Prep']
      },
      Leadership: {
        primary: 'mentorship',
        message: 'Networking y mentoría de líderes senior.',
        services: ['Executive Mentorship', 'Leadership Coaching', 'Resume Review']
      },
      Uncategorized: {
        primary: 'cv_analysis',
        message: 'Comienza optimizando tu CV profesional.',
        services: ['CV Analysis', 'Career Consultation']
      }
    }
    return recommendations[segment]
  }
}

/**
 * User Profile Management
 */
export const userProfiles = {
  create: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'segment'>) => {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const segment = userSegmentation.categorizeUser(data.profession, data.metadata)
    
    const profile: UserProfile = {
      id,
      segment,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    }
    
    userProfilesDb.set(id, profile)
    
    console.log('👤 User profile created:', {
      email: profile.email,
      profession: profile.profession,
      segment: profile.segment
    })
    
    return profile
  },

  findByEmail: (email: string) => {
    return Array.from(userProfilesDb.values()).find(p => p.email === email)
  },

  update: (id: string, data: Partial<UserProfile>) => {
    const profile = userProfilesDb.get(id)
    if (!profile) return null

    const updated: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date(),
      // Recalculate segment if profession or metadata changed
      segment: data.profession || data.metadata
        ? userSegmentation.categorizeUser(
            data.profession || profile.profession,
            data.metadata || profile.metadata
          )
        : profile.segment
    }

    userProfilesDb.set(id, updated)
    return updated
  },

  getAll: () => {
    return Array.from(userProfilesDb.values())
  },

  getBySegment: (segment: UserSegment) => {
    return Array.from(userProfilesDb.values()).filter(p => p.segment === segment)
  },

  getSegmentDistribution: () => {
    const distribution: { [key in UserSegment]: number } = {
      Junior: 0,
      Transition: 0,
      Leadership: 0,
      Uncategorized: 0
    }

    userProfilesDb.forEach(profile => {
      distribution[profile.segment]++
    })

    return distribution
  }
}

// Basic event tracking function
export function trackEvent(eventType: EventType, metadata?: any) {
  console.log('Track event:', eventType, metadata)
  // In a real app, this would send to analytics service
}
