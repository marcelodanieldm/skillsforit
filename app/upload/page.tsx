'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFilePdf, FaFileWord, FaTimes, FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'form'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    profession: ''
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Por favor, sube un archivo PDF o Word')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
      alert('El archivo es muy grande. Máximo 5MB')
      return
    }

    setFile(selectedFile)
  }

  const handleNext = () => {
    if (file) {
      setStep('form')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Create FormData
      const formDataToSend = new FormData()
      formDataToSend.append('file', file!)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('country', formData.country)
      formDataToSend.append('profession', formData.profession)

      // Upload CV and create analysis
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el CV')
      }

      // Redirect to checkout
      router.push(`/checkout?id=${data.analysisId}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al procesar tu CV')
      setUploading(false)
    }
  }

  const professions = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Data Engineer',
    'Machine Learning Engineer',
    'Software Architect',
    'QA Engineer',
    'Mobile Developer',
    'Cloud Engineer',
    'Security Engineer',
    'Product Manager',
    'Tech Lead',
    'Otro'
  ]

  const countries = [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador',
    'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
    'Uruguay', 'Venezuela', 'Otro'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {step === 'upload' ? 'Sube tu CV' : 'Cuéntanos sobre ti'}
          </h1>
          <p className="text-xl text-gray-300">
            {step === 'upload' 
              ? 'Arrastra tu CV o haz clic para seleccionarlo'
              : 'Completa estos datos para personalizar tu análisis'
            }
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-400' : 'text-green-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 'upload' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {step === 'form' ? <FaCheckCircle /> : '1'}
              </div>
              <span className="font-semibold">Subir CV</span>
            </div>
            <div className={`h-1 w-20 ${step === 'form' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 'form' ? 'bg-blue-500' : 'bg-slate-700'
              }`}>
                2
              </div>
              <span className="font-semibold">Tus datos</span>
            </div>
            <div className="h-1 w-20 bg-slate-700"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-semibold">Pago</span>
            </div>
          </div>
        </div>

        {step === 'upload' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-blue-500/50'
                }`}
              >
                <FaUpload className="text-6xl text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Arrastra tu CV aquí
                </h3>
                <p className="text-gray-400 mb-6">
                  o haz clic para seleccionar un archivo
                </p>
                <label className="cursor-pointer inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all">
                  Seleccionar archivo
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Formatos aceptados: PDF, Word • Máximo 5MB
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-6 bg-slate-700 rounded-xl mb-6">
                  <div className="flex items-center gap-4">
                    {file.type.includes('pdf') ? (
                      <FaFilePdf className="text-4xl text-red-500" />
                    ) : (
                      <FaFileWord className="text-4xl text-blue-500" />
                    )}
                    <div>
                      <h4 className="text-white font-semibold">{file.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                
                <button
                  onClick={handleNext}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-full transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <FaArrowRight />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="tu@email.com"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Enviaremos tu reporte de análisis a este email
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  País *
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona tu país</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Profesión/Rol *
                </label>
                <select
                  required
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona tu profesión</option>
                  {professions.map((profession) => (
                    <option key={profession} value={profession}>
                      {profession}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-400 mt-2">
                  Esto nos ayuda a personalizar las recomendaciones
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-all"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Ir al pago (USD 7)
                    <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-gray-400 text-sm"
        >
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            <span>Datos encriptados</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            <span>Pago seguro con Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            <span>Reporte en 2 minutos</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
