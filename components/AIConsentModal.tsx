'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaShieldAlt, FaLock, FaChartLine, FaCheckCircle } from 'react-icons/fa'

interface AIConsentModalProps {
  isOpen: boolean
  onConsent: (granted: boolean) => void
  onClose: () => void
}

export default function AIConsentModal({ isOpen, onConsent, onClose }: AIConsentModalProps) {
  const [understood, setUnderstood] = useState(false)

  const handleAccept = () => {
    if (!understood) {
      alert('Please confirm that you understand how your data will be used.')
      return
    }
    onConsent(true)
    onClose()
  }

  const handleDecline = () => {
    onConsent(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FaRobot className="text-4xl" />
              <h2 className="text-2xl font-bold">AI Data Usage Consent</h2>
            </div>
            <p className="text-purple-100">
              Help us improve our AI analysis for everyone
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-slate-700/50 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Before we analyze your CV, we'd like to explain how your data can help improve our AI service 
                for you and other users worldwide.
              </p>
            </div>

            {/* What We Do */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FaChartLine className="text-green-500" />
                What We Do With Your Data
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Anonymize your CV:</strong> We remove all personal identifiers (name, email, phone, address) 
                    before using it for training.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Improve AI models:</strong> Anonymized data helps our AI learn to identify more issues and 
                    provide better recommendations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Enhance analysis quality:</strong> More diverse training data means more accurate ATS score 
                    predictions and better insights.
                  </span>
                </li>
              </ul>
            </div>

            {/* Privacy Guarantees */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FaShieldAlt className="text-purple-500" />
                Privacy Guarantees
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FaLock className="text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Never Shared</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Your data is never sold or shared with third parties
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FaLock className="text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Fully Anonymized</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      All personal information is removed before AI training
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaLock className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Encrypted Storage</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Data is encrypted both in transit and at rest
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <FaLock className="text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Your Control</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You can withdraw consent anytime in privacy settings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Concrete Examples
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-purple-600 dark:text-purple-400">Before:</strong> "John Smith worked at Google as Senior Engineer"
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <strong className="text-green-600 dark:text-green-400">After:</strong> "[NAME] worked at [COMPANY] as Senior Engineer"
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-purple-600 dark:text-purple-400">Before:</strong> "Contact: john@example.com, +1-555-0123"
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <strong className="text-green-600 dark:text-green-400">After:</strong> "Contact: [EMAIL], [PHONE]"
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  <strong>I understand</strong> that my CV data will be anonymized and used to improve AI models, 
                  and I consent to this usage. I can withdraw my consent at any time.
                </span>
              </label>
            </div>

            {/* GDPR/LGPD Notice */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="mb-1">
                <strong>Your Rights:</strong> Under GDPR (EU), LGPD (Brazil), and CCPA (California), you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access your data at any time</li>
                <li>Request data deletion (Right to be Forgotten)</li>
                <li>Export your data (Data Portability)</li>
                <li>Withdraw consent anytime</li>
              </ul>
              <p className="mt-2">
                Learn more in our{' '}
                <a href="/legal/privacy-policy" target="_blank" className="text-purple-600 hover:underline font-semibold">
                  Privacy Policy
                </a>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                disabled={!understood}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  understood
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✅ I Consent - Analyze My CV
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
              >
                ❌ No Thanks - Analyze Only
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              <strong>Note:</strong> You can still use our service if you decline. Your CV will be analyzed normally, 
              but not used for AI training.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
