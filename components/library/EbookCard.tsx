'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download, Eye, Clock, ExternalLink } from 'lucide-react'
import { PDFViewer } from './PDFViewer'

interface EbookCardProps {
  id: string
  productId: string
  productName: string
  downloadUrl: string
  downloadCount: number
  expiresAt: string
  purchasedAt: string
  onView?: () => void
}

export function EbookCard({
  productId,
  productName,
  downloadUrl,
  downloadCount,
  expiresAt,
  purchasedAt,
  onView
}: EbookCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Abrir en nueva pestaña
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Error downloading:', error)
    } finally {
      setTimeout(() => setIsDownloading(false), 2000)
    }
  }

  const handleView = () => {
    if (onView) {
      onView()
    } else {
      setShowViewer(true)
    }
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Visor de PDF */}
      {showViewer && (
        <PDFViewer
          url={downloadUrl}
          filename={`${productName}.pdf`}
          onClose={() => setShowViewer(false)}
        />
      )}

      {/* Header con ícono */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{productName}</h3>
              <p className="text-purple-100 text-sm mt-1">E-book Digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Estado de acceso */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Acceso válido por{' '}
            <span className="font-semibold text-purple-600">
              {daysUntilExpiry} días
            </span>
          </span>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Descargas
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {downloadCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Comprado
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {new Date(purchasedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            Ver Ahora
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </button>
        </div>

        {/* Nota de expiración */}
        {daysUntilExpiry <= 3 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              <strong>¡Importante!</strong> El link de descarga expira pronto.
              Descarga tu e-book antes de que caduque.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
