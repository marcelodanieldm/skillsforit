'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFilePdf, FaFile, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'

export default function EbookAssetManager() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleFileSelect = (file: File, type: 'pdf' | 'epub') => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = type === 'pdf' ? ['application/pdf'] : ['application/epub+zip']

    if (file.size > maxSize) {
      setUploadStatus({
        type: 'error',
        message: `El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB permitido.`
      })
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: `Tipo de archivo no válido. Solo se permiten archivos ${type.toUpperCase()}.`
      })
      return
    }

    if (type === 'pdf') {
      setPdfFile(file)
    } else {
      setEpubFile(file)
    }

    setUploadStatus({ type: null, message: '' })
  }

  const handleUpload = async () => {
    if (!pdfFile && !epubFile) {
      setUploadStatus({
        type: 'error',
        message: 'Selecciona al menos un archivo para subir.'
      })
      return
    }

    setUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      const formData = new FormData()

      if (pdfFile) {
        formData.append('pdf', pdfFile)
      }

      if (epubFile) {
        formData.append('epub', epubFile)
      }

      const response = await fetch('/api/admin/ebook-assets/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir archivos')
      }

      setUploadStatus({
        type: 'success',
        message: 'Archivos subidos exitosamente. Los usuarios ahora pueden descargar el contenido.'
      })

      // Clear files
      setPdfFile(null)
      setEpubFile(null)

    } catch (error: any) {
      setUploadStatus({
        type: 'error',
        message: error.message || 'Error al subir los archivos.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gestión de Assets del E-book
          </h1>
          <p className="text-gray-600">
            Sube los archivos PDF y EPUB de la Guía de Soft Skills IT para distribución automática
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-red-500" />
            )}
            <p className={`text-sm ${
              uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadStatus.message}
            </p>
          </motion.div>
        )}

        {/* File Upload Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* PDF Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaFilePdf className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Archivo PDF</h3>
                <p className="text-sm text-gray-600">Para lectura en desktop y móvil</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file, 'pdf')
                  }}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <FaUpload className="text-gray-400 text-2xl mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    {pdfFile ? pdfFile.name : 'Haz clic para seleccionar PDF'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Máximo 50MB • Solo archivos PDF
                  </p>
                </label>
              </div>

              {pdfFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span className="text-sm text-green-800">
                      {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* EPUB Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaFile className="text-blue-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Archivo EPUB</h3>
                <p className="text-sm text-gray-600">Para e-readers y apps de lectura</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".epub"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file, 'epub')
                  }}
                  className="hidden"
                  id="epub-upload"
                />
                <label htmlFor="epub-upload" className="cursor-pointer">
                  <FaUpload className="text-gray-400 text-2xl mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    {epubFile ? epubFile.name : 'Haz clic para seleccionar EPUB'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Máximo 50MB • Solo archivos EPUB
                  </p>
                </label>
              </div>

              {epubFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span className="text-sm text-green-800">
                      {epubFile.name} ({(epubFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Upload Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button
            onClick={handleUpload}
            disabled={uploading || (!pdfFile && !epubFile)}
            className={`font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
              uploading || (!pdfFile && !epubFile)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105'
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                Subiendo archivos...
              </>
            ) : (
              <>
                <FaUpload />
                Subir Assets del E-book
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Los archivos serán almacenados de forma segura y distribuidos automáticamente a los compradores
          </p>
        </motion.div>

        {/* Asset Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4">Información de Assets</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📄 Archivo PDF</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Optimizado para impresión y lectura en pantalla</li>
                <li>• Compatible con Adobe Reader, Chrome, etc.</li>
                <li>• Incluye marcadores de navegación</li>
                <li>• Tamaño recomendado: &lt; 20MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📖 Archivo EPUB</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Optimizado para e-readers (Kindle, Apple Books)</li>
                <li>• Diseño responsivo y adaptable</li>
                <li>• Navegación por capítulos</li>
                <li>• Tamaño recomendado: &lt; 10MB</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Consideraciones de Seguridad</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Los archivos son accesibles solo con tokens temporales (24 horas)</li>
                <li>• Cada usuario tiene máximo 3 descargas por token</li>
                <li>• Los archivos se sirven con headers de no-cache</li>
                <li>• Se registra cada descarga para auditoría</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}