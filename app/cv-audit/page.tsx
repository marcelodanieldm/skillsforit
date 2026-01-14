'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFilePdf, FaRobot, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import PreAuditReport from '@/components/cv-audit/PreAuditReport'

interface PreAuditResult {
  analysisId: string
  score: number
  atsScore: number
  problems: Array<{
    category: string
    severity: 'high' | 'medium' | 'low'
    description: string
    impact: string
  }>
  improvements: Array<{
    category: string
    before: string
    after: string
    explanation: string
    impact: string
  }>
  strengths: string[]
  recommendations: string[]
  isPreview: boolean
}

export default function CVAuditPage() {
  const [file, setFile] = useState<File | null>(null)
  const [profession, setProfession] = useState('')
  const [country, setCountry] = useState('Spain')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<PreAuditResult | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor, sube un archivo PDF')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('El archivo no puede superar 5MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !profession) return

    setAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('cv', file)
      formData.append('profession', profession)
      formData.append('country', country)

      const response = await fetch('/api/cv-audit/pre-audit', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al analizar el CV')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al procesar el CV')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleUnlock = async () => {
    if (!result) return

    // Redirect to payment page with analysis ID
    window.location.href = `/cv-audit/payment?analysisId=${result.analysisId}`
  }

  if (result) {
    return <PreAuditReport result={result} onUnlock={handleUnlock} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Auditoría Gratuita de CV con IA
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Analiza tu CV contra 50+ criterios profesionales para roles IT 2026
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <FaRobot className="text-3xl text-blue-500 mx-auto mb-2" />
                <div className="text-sm text-gray-600">IA Avanzada</div>
              </div>
              <div className="text-center">
                <FaCheck className="text-3xl text-green-500 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Gratis</div>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-purple-600">50+</span>
                <div className="text-sm text-gray-600">Criterios</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sube tu CV (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FaFilePdf className="text-3xl text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-600">
                        Haz clic para seleccionar tu CV
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        PDF hasta 5MB
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol IT que buscas
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona un rol...</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UX/UI Designer">UX/UI Designer</option>
                <option value="Other">Otro</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País donde buscas trabajo
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Spain">España</option>
                <option value="Mexico">México</option>
                <option value="Argentina">Argentina</option>
                <option value="Colombia">Colombia</option>
                <option value="Chile">Chile</option>
                <option value="Peru">Perú</option>
                <option value="United States">Estados Unidos</option>
                <option value="United Kingdom">Reino Unido</option>
                <option value="Germany">Alemania</option>
                <option value="France">Francia</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || !profession || analyzing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analizando tu CV...
                </>
              ) : (
                <>
                  <FaRobot />
                  Analizar CV Gratis
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaCheck className="text-green-500 text-2xl mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Score General</h3>
              <p className="text-sm text-gray-600">Evaluación completa de tu CV</p>
            </div>
            <div className="text-center">
              <FaCheck className="text-green-500 text-2xl mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Errores Críticos</h3>
              <p className="text-sm text-gray-600">Problemas que afectan tu contratación</p>
            </div>
            <div className="text-center">
              <FaCheck className="text-green-500 text-2xl mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Fortalezas</h3>
              <p className="text-sm text-gray-600">Lo que haces bien</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}