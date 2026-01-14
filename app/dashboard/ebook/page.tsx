'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaDownload, FaEye, FaRobot, FaCheck, FaLock } from 'react-icons/fa'
import Link from 'next/link'

interface UserAsset {
  asset_type: 'ebook' | 'cv_audit' | 'mentorship'
  asset_id: string
  granted_at: string
  metadata?: any
}

export default function EbookDashboard() {
  const [assets, setAssets] = useState<UserAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadUserAssets()
  }, [])

  const loadUserAssets = async () => {
    try {
      // In a real app, this would get the user from auth context
      // For now, we'll simulate with localStorage or URL params
      const userEmail = localStorage.getItem('user_email') || 'demo@skillsforit.com'
      setEmail(userEmail)

      // Mock data - in real app, this would come from Supabase
      const mockAssets: UserAsset[] = [
        {
          asset_type: 'ebook',
          asset_id: 'soft-skills-guide',
          granted_at: new Date().toISOString(),
          metadata: {
            payment_intent_id: 'pi_mock_123',
            base_price: '7',
            purchase_date: new Date().toISOString()
          }
        },
        {
          asset_type: 'cv_audit',
          asset_id: 'cv-audit-service',
          granted_at: new Date().toISOString(),
          metadata: {
            payment_intent_id: 'pi_mock_123',
            price: '7',
            purchase_date: new Date().toISOString()
          }
        },
        {
          asset_type: 'mentorship',
          asset_id: 'mentorship-1-month',
          granted_at: new Date().toISOString(),
          metadata: {
            payment_intent_id: 'pi_mock_456',
            price: '25',
            sessions_remaining: 4,
            purchase_date: new Date().toISOString()
          }
        }
      ]

      setAssets(mockAssets)
    } catch (error) {
      console.error('Error loading user assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasEbookAccess = assets.some(asset => asset.asset_type === 'ebook')
  const hasCVAuditAccess = assets.some(asset => asset.asset_type === 'cv_audit')
  const hasMentorshipAccess = assets.some(asset => asset.asset_type === 'mentorship')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Biblioteca Digital</h1>
              <p className="text-gray-600">Accede a todo tu contenido exclusivo</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Usuario</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">¡Bienvenido a tu Dashboard!</h2>
          <p className="text-blue-100">
            Aquí encontrarás todos los recursos que has adquirido. Tu viaje hacia el éxito en IT comienza ahora.
          </p>
        </motion.div>

        {/* Assets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* E-book Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden ${
              hasEbookAccess ? 'border-2 border-green-200' : 'border-2 border-gray-200'
            }`}
          >
            <div className={`p-6 ${hasEbookAccess ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  hasEbookAccess ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {hasEbookAccess ? <FaBook /> : <FaLock />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Guía de Soft Skills IT</h3>
                  <p className="text-sm text-gray-600">8 capítulos completos</p>
                </div>
              </div>

              {hasEbookAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <FaCheck />
                    <span>Acceso completo concedido</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <FaEye />
                      Leer Online
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <FaDownload />
                      Descargar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">Contenido no disponible</p>
                  <Link
                    href="/ebook"
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors inline-block"
                  >
                    Comprar Ahora
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* CV Audit Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden ${
              hasCVAuditAccess ? 'border-2 border-blue-200' : 'border-2 border-gray-200'
            }`}
          >
            <div className={`p-6 ${hasCVAuditAccess ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  hasCVAuditAccess ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {hasCVAuditAccess ? <FaRobot /> : <FaLock />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Auditoría CV con IA</h3>
                  <p className="text-sm text-gray-600">Análisis inteligente de tu CV</p>
                </div>
              </div>

              {hasCVAuditAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <FaCheck />
                    <span>Servicio disponible</span>
                  </div>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaRobot />
                    Iniciar Auditoría
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Sube tu CV y recibe feedback en minutos
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">Servicio no disponible</p>
                  <Link
                    href="/ebook"
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block"
                  >
                    Añadir por $7
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mentorship Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden ${
              hasMentorshipAccess ? 'border-2 border-purple-200' : 'border-2 border-gray-200'
            }`}
          >
            <div className={`p-6 ${hasMentorshipAccess ? 'bg-purple-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  hasMentorshipAccess ? 'bg-purple-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {hasMentorshipAccess ? <FaCheck /> : <FaLock />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Mentoría Personalizada</h3>
                  <p className="text-sm text-gray-600">4 sesiones de 10 minutos</p>
                </div>
              </div>

              {hasMentorshipAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-600 text-sm">
                    <FaCheck />
                    <span>Mentoría activa</span>
                  </div>
                  <Link
                    href="/dashboard/mentorship"
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Agendar Sesión
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Selecciona tu mentor preferido
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">Servicio premium</p>
                  <Link
                    href="/ebook/success?upsell=true"
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors inline-block"
                  >
                    Añadir por $25
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* CV Audit Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <FaRobot />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Auditoría CV con IA</h3>
                  <p className="text-sm text-gray-600">Análisis inteligente de tu CV</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <FaCheck />
                  <span>Herramienta disponible</span>
                </div>
                <Link
                  href="/cv-audit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaRobot />
                  Analizar mi CV
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  Primer análisis gratis • Reporte completo por $7
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Usage Stats */}
        {hasEbookAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 mb-4">Tu Progreso de Lectura</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0%</div>
                <div className="text-sm text-gray-600">Completado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Capítulos leídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Ejercicios completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <div className="text-sm text-gray-600">Acceso restante</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gray-100 rounded-xl p-6 text-center"
        >
          <h3 className="font-bold text-gray-900 mb-2">¿Necesitas Ayuda?</h3>
          <p className="text-gray-600 mb-4">
            Nuestro equipo de soporte está aquí para ayudarte con cualquier duda sobre tu contenido.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@skillsforit.com"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors"
            >
              Contactar Soporte
            </a>
            <Link
              href="/community"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors"
            >
              Unirse a Comunidad
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}