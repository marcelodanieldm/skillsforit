'use client'

import { useEffect } from 'react'

export function NotificationInitializer() {
  useEffect(() => {
    // Initialize notification processor on client-side
    // Note: Notifications are now handled server-side only
    console.log('Notification initializer loaded')
  }, [])

  // This component doesn't render anything
  return null
}