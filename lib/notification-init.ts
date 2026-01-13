import { startNotificationProcessor } from './notifications'

// Initialize notification processor when the app starts
// This should be called once when the application boots up
export const initializeNotifications = () => {
  // Only start in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NOTIFICATIONS === 'true') {
    startNotificationProcessor()
  } else {
    console.log('Notification processor disabled in development. Set ENABLE_NOTIFICATIONS=true to enable.')
  }
}