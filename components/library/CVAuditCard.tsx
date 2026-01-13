'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CVAuditCardProps {
  id: string
  balance: number
  used: boolean
  purchasedAt: string
}

export function CVAuditCard({ balance, used, purchasedAt }: CVAuditCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleUploadClick = () => {
    router.push('/upload')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header con ícono */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Auditoría de CV con IA
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Análisis profesional instantáneo
              </p>
            </div>
          </div>
          
          {/* Badge de estado */}
          {used ? (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              Usado
            </span>
          ) : (
            <span className="px-3 py-1 bg-white backdrop-blur-sm rounded-full text-xs font-medium text-blue-600 animate-pulse">
              Disponible
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Créditos disponibles */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div>
            <p className="text-sm text-gray-600 mb-1">Créditos disponibles</p>
            <p className="text-3xl font-bold text-blue-600">{balance}</p>
          </div>
          {balance > 0 ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Información de compra */}
        <div className="text-sm text-gray-600">
          Comprado el{' '}
          {new Date(purchasedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>

        {/* Características */}
        <div className="space-y-2 py-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Qué incluye tu auditoría:
          </h4>
          {[
            'Análisis completo con IA avanzada',
            'Puntuación de 0-100 en múltiples criterios',
            'Recomendaciones específicas y accionables',
            'Informe descargable en PDF'
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Botón de acción */}
        {balance > 0 ? (
          <motion.button
            onClick={handleUploadClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Subir Mi CV Ahora
          </motion.button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Crédito usado.</strong> Revisa tu análisis previo o compra
                otro crédito para un nuevo CV.
              </p>
            </div>
            <button
              onClick={() => router.push('/soft-skills-guide')}
              className="w-full px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
            >
              Comprar Otro Crédito
            </button>
          </div>
        )}

        {/* Animación de hover */}
        {isHovered && balance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-center text-gray-500"
          >
            👆 Sube tu CV en formato PDF para análisis instantáneo
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
