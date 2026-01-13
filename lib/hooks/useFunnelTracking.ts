import { useEffect, useRef } from 'react'

/**
 * Sprint 24: Funnel Tracking Hook
 * 
 * Hook personalizado para rastrear eventos del funnel
 * de manera consistente en toda la aplicación.
 * 
 * Uso:
 * const { trackEvent, sessionId } = useFunnelTracking()
 * trackEvent('landing_view')
 * trackEvent('checkout_started', { email: 'user@example.com' })
 */

export interface TrackEventOptions {
  email?: string
  metadata?: Record<string, any>
}

export function useFunnelTracking() {
  const sessionIdRef = useRef<string>()

  // Generate or retrieve session ID
  useEffect(() => {
    if (typeof window === 'undefined') return

    let sessionId = sessionStorage.getItem('funnel_session_id')
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('funnel_session_id', sessionId)
    }

    sessionIdRef.current = sessionId
  }, [])

  const trackEvent = async (
    eventType: string,
    options: TrackEventOptions = {}
  ) => {
    if (!sessionIdRef.current) {
      console.warn('[Funnel Tracking] Session ID not initialized yet')
      return
    }

    try {
      const response = await fetch('/api/checkout/track-funnel-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          sessionId: sessionIdRef.current,
          email: options.email,
          metadata: options.metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to track event: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Funnel Tracking] Event tracked:', eventType, data)
    } catch (error) {
      console.error('[Funnel Tracking] Error:', error)
    }
  }

  return {
    trackEvent,
    sessionId: sessionIdRef.current
  }
}

// Helper hook para auto-track page views
export function useFunnelPageView(eventType: string, options?: TrackEventOptions) {
  const { trackEvent } = useFunnelTracking()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      trackEvent(eventType, options)
      hasTracked.current = true
    }
  }, [eventType, trackEvent, options])
}
