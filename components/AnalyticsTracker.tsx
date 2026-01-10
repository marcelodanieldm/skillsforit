'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { EventType } from '@/lib/analytics'

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Get device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

interface AnalyticsTrackerProps {
  userId?: string
  userSegment?: string
  service?: 'cv_analysis' | 'mentorship'
}

export function AnalyticsTracker({ userId, userSegment, service }: AnalyticsTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasTrackedPageView = useRef(false)

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      trackEvent('page_view', {
        page: pathname,
        referrer: document.referrer,
        deviceType: getDeviceType()
      })
      hasTrackedPageView.current = true
    }
  }, [pathname, searchParams])

  const trackEvent = async (eventType: EventType, metadata: any = {}) => {
    try {
      const sessionId = getSessionId()
      
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          userId,
          sessionId,
          metadata: {
            ...metadata,
            userSegment,
            service,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  // This component doesn't render anything
  return null
}

// Hook for tracking events
export function useAnalytics(userId?: string, userSegment?: string) {
  const trackEvent = async (eventType: EventType, metadata: any = {}) => {
    try {
      const sessionId = getSessionId()
      
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          userId,
          sessionId,
          metadata: {
            ...metadata,
            userSegment,
            deviceType: getDeviceType(),
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  return { trackEvent, sessionId: getSessionId() }
}

// Helper function to track form events
export function trackFormEvent(stage: 'start' | 'complete' | 'abandon', metadata: any = {}) {
  const eventType: EventType = stage === 'start' ? 'form_start' : 'form_complete'
  const sessionId = getSessionId()
  
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      sessionId,
      metadata: {
        ...metadata,
        deviceType: getDeviceType(),
        timestamp: new Date().toISOString()
      }
    })
  }).catch(error => console.error('Error tracking form event:', error))
}

// Helper function to track checkout events
export function trackCheckoutEvent(stage: 'start' | 'initiated' | 'success' | 'failed', metadata: any = {}) {
  const eventTypeMap: { [key: string]: EventType } = {
    start: 'start_checkout',
    initiated: 'payment_initiated',
    success: 'payment_success',
    failed: 'payment_failed'
  }
  
  const sessionId = getSessionId()
  
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: eventTypeMap[stage],
      sessionId,
      metadata: {
        ...metadata,
        deviceType: getDeviceType(),
        timestamp: new Date().toISOString()
      }
    })
  }).catch(error => console.error('Error tracking checkout event:', error))
}
