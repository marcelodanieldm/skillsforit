'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Maximize2, Minimize2, AlertCircle } from 'lucide-react'

interface PDFViewerProps {
  url: string
  filename?: string
  onClose?: () => void
}

export function PDFViewer({ url, filename = 'document.pdf', onClose }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const handleDownload = () => {
    window.open(url, '_blank')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${
          isFullscreen ? 'p-0' : 'p-4 sm:p-8'
        }`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden mx-auto ${
            isFullscreen ? 'w-full h-full' : 'max-w-6xl h-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {filename}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Descargar PDF"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Visor de PDF */}
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {!loadError ? (
              <iframe
                src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={filename}
                onError={() => setLoadError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No se pudo cargar el PDF
                  </h3>
                  <p className="text-gray-600 mb-6">
                    El visor no está disponible en tu navegador. Puedes descargar
                    el archivo para verlo en tu dispositivo.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer con instrucciones */}
          {!loadError && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600">
                💡 Tip: Usa las herramientas del visor para navegar, hacer zoom y
                buscar en el documento
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
