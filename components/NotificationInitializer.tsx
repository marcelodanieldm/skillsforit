'use client'

import { useEffect } from 'react'
import { initializeNotifications } from '@/lib/notification-init'

export function NotificationInitializer() {
  useEffect(() => {
    // Initialize notification processor on client-side
    initializeNotifications()
  }, [])

  // This component doesn't render anything
  return null
}