'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFilePdf, FaBook, FaCheckCircle, FaSpinner } from 'react-icons/fa'

interface UploadedAsset {
  name: string
  url: string
  type: 'pdf' | 'epub'
  size: number
  uploadedAt: string
}

export function AssetUploader() {
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [recentUploads, setRecentUploads] = useState<UploadedAsset[]>([])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/epub+zip']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.epub')) {
      alert('Solo se permiten archivos PDF o EPUB')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 50MB')
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type.includes('pdf') ? 'pdf' : 'epub')

      const response = await fetch('/api/ceo/upload-asset', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadSuccess(true)
        setRecentUploads([
          {
            name: file.name,
            url: result.url,
            type: file.type.includes('pdf') ? 'pdf' : 'epub',
            size: file.size,
            uploadedAt: new Date().toISOString()
          },
          ...recentUploads
        ])

        setTimeout(() => setUploadSuccess(false), 3000)
      } else {
        alert(result.error || 'Error al subir archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir archivo')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-500/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
          <FaUpload className="text-cyan-400" />
          Carga de Activos Digitales
        </h2>
        <p className="text-slate-400 text-sm">
          Sube nuevas versiones de la Guía de Soft Skills (PDF/EPUB)
        </p>
      </div>

      {/* Upload Area */}
      <label className="block">
        <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          uploading
            ? 'border-cyan-500 bg-cyan-500/10'
            : uploadSuccess
            ? 'border-green-500 bg-green-500/10'
            : 'border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/5'
        }`}>
          {uploading ? (
            <div className="space-y-3">
              <FaSpinner className="text-5xl text-cyan-400 mx-auto animate-spin" />
              <p className="text-white font-semibold">Subiendo archivo...</p>
              <p className="text-slate-400 text-sm">Por favor espera</p>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-3">
              <FaCheckCircle className="text-5xl text-green-400 mx-auto" />
              <p className="text-white font-semibold">¡Archivo subido exitosamente!</p>
              <p className="text-green-400 text-sm">El archivo está disponible en la biblioteca</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-4">
                <FaFilePdf className="text-5xl text-red-400" />
                <FaBook className="text-5xl text-cyan-400" />
              </div>
              <p className="text-white font-semibold text-lg">Arrastra un archivo aquí</p>
              <p className="text-slate-400 text-sm">o haz clic para seleccionar</p>
              <p className="text-slate-500 text-xs">PDF o EPUB • Máx. 50MB</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept=".pdf,.epub,application/pdf,application/epub+zip"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Subidas Recientes</h3>
          <div className="space-y-2">
            {recentUploads.map((asset, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {asset.type === 'pdf' ? (
                    <FaFilePdf className="text-2xl text-red-400" />
                  ) : (
                    <FaBook className="text-2xl text-cyan-400" />
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{asset.name}</p>
                    <p className="text-slate-400 text-xs">
                      {formatFileSize(asset.size)} • {new Date(asset.uploadedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                >
                  Ver →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
