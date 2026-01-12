'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCookie, FaChartBar, FaBullhorn, FaRobot, FaCheckCircle, FaTimes } from 'react-icons/fa'

interface CookiePreferences {
  necessary: boolean // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
  ai_training: boolean
}

interface CookieConsentProps {
  userId?: string
  userEmail?: string
  onConsentChange?: (preferences: CookiePreferences) => void
}

const STORAGE_KEY = 'skillsforit_cookie_consent'

export default function CookieConsent({ userId, userEmail, onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    ai_training: false
  })

  useEffect(() => {
    // Check if user has already consented
    const savedConsent = localStorage.getItem(STORAGE_KEY)
    
    if (!savedConsent) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      const parsed = JSON.parse(savedConsent)
      setPreferences(parsed)
    }
  }, [])

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      ai_training: true
    }

    await savePreferences(allAccepted)
  }

  const handleAcceptNecessary = async () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      ai_training: false
    }

    await savePreferences(necessaryOnly)
  }

  const handleSaveCustom = async () => {
    await savePreferences(preferences)
  }

  const savePreferences = async (prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setPreferences(prefs)

    // Send to backend if user is logged in
    if (userId && userEmail) {
      try {
        await fetch('/api/user/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userEmail,
            consents: {
              cookies: prefs.necessary,
              analytics: prefs.analytics,
              marketing: prefs.marketing,
              ai_training: prefs.ai_training,
              data_processing: true // Always required for service
            },
            ipAddress: await getClientIp(),
            userAgent: navigator.userAgent
          })
        })
      } catch (error) {
        console.error('Failed to save consents to backend:', error)
      }
    }

    // Notify parent component
    onConsentChange?.(prefs)

    // Close banner
    setShowBanner(false)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return // Cannot disable necessary cookies

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-purple-500/30">
          {!showDetails ? (
            // Simple Banner
            <div className="p-6">
              <div className="flex items-start gap-4">
                <FaCookie className="text-4xl text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🍪 We value your privacy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    We use cookies to enhance your experience, analyze site traffic, and improve our AI services. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <a 
                      href="/legal/privacy-policy" 
                      target="_blank"
                      className="text-purple-600 hover:underline font-semibold"
                    >
                      Learn more
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleAcceptNecessary}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={() => setShowDetails(true)}
                      className="px-6 py-2 border-2 border-gray-300 dark:border-slate-600 hover:border-purple-500 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                    >
                      Customize
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaCookie className="text-yellow-500" />
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-2 border-green-500/30">
                  <FaCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">Necessary Cookies</h4>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Essential for the website to function. Cannot be disabled. Includes authentication, security, and basic functionality.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <FaChartBar className="text-2xl text-blue-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">Analytics Cookies</h4>
                      <button
                        onClick={() => togglePreference('analytics')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          preferences.analytics
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {preferences.analytics ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Help us understand how visitors interact with our website. Includes Google Analytics and similar tools.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <FaBullhorn className="text-2xl text-orange-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">Marketing Cookies</h4>
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          preferences.marketing
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {preferences.marketing ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Used to deliver relevant advertisements and track campaign effectiveness. Includes Facebook Pixel, Google Ads.
                    </p>
                  </div>
                </div>

                {/* AI Training Cookies */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-2 border-purple-500/30">
                  <FaRobot className="text-2xl text-purple-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">AI Training & Improvement</h4>
                      <button
                        onClick={() => togglePreference('ai_training')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          preferences.ai_training
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {preferences.ai_training ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Allow us to use anonymized CV data to improve our AI models and provide better analysis for all users.
                      <span className="block mt-1 font-semibold text-purple-600 dark:text-purple-400">
                        🔒 Your personal information is never shared or sold.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveCustom}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                You can change your preferences at any time in{' '}
                <a href="/privacy" className="text-purple-600 hover:underline font-semibold">
                  Privacy Settings
                </a>.{' '}
                Read our{' '}
                <a href="/legal/privacy-policy" className="text-purple-600 hover:underline font-semibold">
                  Privacy Policy
                </a>.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Helper function to get client IP (requires server-side proxy)
async function getClientIp(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return undefined
  }
}

// Export helper to check if consent is given
export function hasConsent(type: keyof CookiePreferences): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return false
  
  try {
    const prefs = JSON.parse(saved) as CookiePreferences
    return prefs[type] === true
  } catch {
    return false
  }
}

// Export helper to get all preferences
export function getConsentPreferences(): CookiePreferences | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null
  
  try {
    return JSON.parse(saved) as CookiePreferences
  } catch {
    return null
  }
}
