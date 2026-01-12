'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  FaShieldAlt, FaCookie, FaChartBar, FaBullhorn, FaRobot, 
  FaDownload, FaTrash, FaHistory, FaCheckCircle, FaTimesCircle,
  FaClock, FaExclamationTriangle, FaLock, FaKey
} from 'react-icons/fa'

interface ConsentPreferences {
  cookies: boolean
  analytics: boolean
  marketing: boolean
  ai_training: boolean
  data_processing: boolean
}

interface ConsentHistoryItem {
  id: string
  userId: string
  userEmail: string
  type: 'cookies' | 'analytics' | 'marketing' | 'ai_training' | 'data_processing'
  granted: boolean
  grantedAt: string
  revokedAt?: string
  ipAddress?: string
  userAgent?: string
}

interface ExportRequest {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  completedAt?: string
  downloadUrl?: string
  expiresAt?: string
}

interface DeletionRequest {
  id: string
  status: 'pending' | 'completed' | 'cancelled'
  requestedAt: string
  scheduledFor: string
  completedAt?: string
  canRestore: boolean
}

export default function PrivacyCenter() {
  const { user } = useAuth()
  const [activeConsents, setActiveConsents] = useState<ConsentPreferences | null>(null)
  const [consentHistory, setConsentHistory] = useState<ConsentHistoryItem[]>([])
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    if (user) {
      loadPrivacyData()
    }
  }, [user])

  const loadPrivacyData = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Load active consents
      const consentsRes = await fetch(`/api/user/consent?userId=${user.id}`)
      if (consentsRes.ok) {
        const data = await consentsRes.json()
        setActiveConsents(data.consents)
      }

      // Load consent history
      const historyRes = await fetch(`/api/user/consent?userId=${user.id}&history=true`)
      if (historyRes.ok) {
        const data = await historyRes.json()
        setConsentHistory(data.history || [])
      }

      // Load export requests
      const exportsRes = await fetch(`/api/user/export-data?userId=${user.id}`)
      if (exportsRes.ok) {
        const data = await exportsRes.json()
        setExportRequests(data.exportRequests || [])
      }

      // Load deletion request
      const deletionRes = await fetch(`/api/user/delete-account?userId=${user.id}`)
      if (deletionRes.ok) {
        const data = await deletionRes.json()
        if (data.hasPendingDeletion) {
          setDeletionRequest(data.deletionRequest)
        }
      }
    } catch (error) {
      console.error('Error loading privacy data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConsentToggle = async (type: keyof ConsentPreferences) => {
    if (!user || !activeConsents) return

    const newValue = !activeConsents[type]
    const newConsents = { ...activeConsents, [type]: newValue }
    setActiveConsents(newConsents)

    try {
      const res = await fetch('/api/user/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          consents: newConsents,
          ipAddress: await getClientIp(),
          userAgent: navigator.userAgent
        })
      })

      if (res.ok) {
        // Reload history
        const historyRes = await fetch(`/api/user/consent?userId=${user.id}&history=true`)
        if (historyRes.ok) {
          const data = await historyRes.json()
          setConsentHistory(data.history || [])
        }
      }
    } catch (error) {
      console.error('Error updating consent:', error)
    }
  }

  const handleExportData = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/user/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert('Export request created! Check back in 2-5 minutes.')
        loadPrivacyData()
      }
    } catch (error) {
      console.error('Error requesting export:', error)
    }
  }

  const handleDownloadExport = (downloadUrl: string) => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `skillsforit-data-export-${Date.now()}.json`
    link.click()
  }

  const handleDeleteAccount = async () => {
    if (!user || !deleteReason.trim()) {
      alert('Please provide a reason for deletion')
      return
    }

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          reason: deleteReason
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setShowDeleteConfirm(false)
        loadPrivacyData()
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleRestoreAccount = async () => {
    if (!user || !deletionRequest) return

    try {
      const res = await fetch(`/api/user/delete-account?requestId=${deletionRequest.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Account restored successfully!')
        loadPrivacyData()
      }
    } catch (error) {
      console.error('Error restoring account:', error)
    }
  }

  const getClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch {
      return '0.0.0.0'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaLock className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access your privacy settings
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading privacy data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <FaShieldAlt className="text-5xl" />
            <div>
              <h1 className="text-4xl font-bold">Privacy Center</h1>
              <p className="text-purple-100">Manage your data and privacy preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 inline-block">
            <FaCheckCircle />
            <span className="text-sm">GDPR, LGPD & CCPA Compliant</span>
          </div>
        </div>

        {/* Deletion Warning */}
        {deletionRequest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <FaExclamationTriangle className="text-3xl text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Account Deletion Scheduled
                </h3>
                <p className="text-red-800 mb-4">
                  Your account is scheduled for permanent deletion on{' '}
                  <strong>{new Date(deletionRequest.scheduledFor).toLocaleDateString()}</strong>.
                  You have {Math.ceil((new Date(deletionRequest.scheduledFor).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining to cancel.
                </p>
                {deletionRequest.canRestore && (
                  <button
                    onClick={handleRestoreAccount}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                  >
                    ✅ Cancel Deletion & Restore Account
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Consents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaKey className="text-purple-500" />
            Active Consents
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage your data usage preferences. Changes take effect immediately.
          </p>

          <div className="space-y-4">
            {/* Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCookie className="text-2xl text-yellow-500" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Essential Cookies</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Required for authentication and security
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">Always Active</span>
                <FaCheckCircle className="text-green-500" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaChartBar className="text-2xl text-blue-500" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand how you use our platform
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-14 h-7">
                <input
                  type="checkbox"
                  checked={activeConsents?.analytics || false}
                  onChange={() => handleConsentToggle('analytics')}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-checked:bg-blue-600 rounded-full peer transition-all cursor-pointer"></div>
                <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full peer-checked:translate-x-7 transition-transform"></div>
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaBullhorn className="text-2xl text-orange-500" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Marketing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive personalized recommendations and offers
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-14 h-7">
                <input
                  type="checkbox"
                  checked={activeConsents?.marketing || false}
                  onChange={() => handleConsentToggle('marketing')}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-checked:bg-orange-600 rounded-full peer transition-all cursor-pointer"></div>
                <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full peer-checked:translate-x-7 transition-transform"></div>
              </label>
            </div>

            {/* AI Training */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaRobot className="text-2xl text-purple-500" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Training</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use anonymized data to improve AI models
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-14 h-7">
                <input
                  type="checkbox"
                  checked={activeConsents?.ai_training || false}
                  onChange={() => handleConsentToggle('ai_training')}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-checked:bg-purple-600 rounded-full peer transition-all cursor-pointer"></div>
                <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full peer-checked:translate-x-7 transition-transform"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Consent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaHistory className="text-blue-500" />
            Consent History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete timeline of your consent changes
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {consentHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No consent history yet</p>
            ) : (
              consentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.granted ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {item.type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.granted ? 'Granted' : 'Revoked'} on {new Date(item.grantedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Export Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaDownload className="text-green-500" />
            Export Your Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Download all your data in JSON format (GDPR Article 20 - Right to Data Portability)
          </p>

          <button
            onClick={handleExportData}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all mb-6"
          >
            📦 Request New Export
          </button>

          <div className="space-y-3">
            {exportRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No export requests yet</p>
            ) : (
              exportRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {req.status === 'completed' && <FaCheckCircle className="text-green-500" />}
                      {req.status === 'processing' && <FaClock className="text-yellow-500 animate-spin" />}
                      {req.status === 'pending' && <FaClock className="text-blue-500" />}
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Requested: {new Date(req.requestedAt).toLocaleString()}
                    </p>
                    {req.expiresAt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Expires: {new Date(req.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {req.status === 'completed' && req.downloadUrl && (
                    <button
                      onClick={() => handleDownloadExport(req.downloadUrl!)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Delete Account */}
        {!deletionRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTrash className="text-red-500" />
              Delete Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Request permanent deletion of your account (GDPR Article 17 - Right to be Forgotten).
              You'll have 30 days to cancel before permanent deletion.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
              >
                🗑️ Delete My Account
              </button>
            ) : (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-900 mb-4">
                  ⚠️ Confirm Account Deletion
                </h3>
                <p className="text-red-800 mb-4">
                  This action will schedule your account for permanent deletion in 30 days.
                  You can cancel anytime during this period.
                </p>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please tell us why you're leaving (optional but appreciated)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 h-24"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteReason('')
                    }}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
