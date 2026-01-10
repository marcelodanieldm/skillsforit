'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase, FaDollarSign, FaClock, FaLinkedin, FaCheckCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function BecomeMentorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    expertise: [] as string[],
    linkedinUrl: '',
    hourlyRate: 15,
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' }
    ]
  })

  const expertiseOptions = [
    'Frontend Development',
    'Backend Development',
    'Full Stack',
    'DevOps',
    'Cloud Architecture',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'Career Growth',
    'Technical Interviews',
    'System Design',
    'Code Review'
  ]

  const handleExpertiseToggle = (skill: string) => {
    if (formData.expertise.includes(skill)) {
      setFormData({
        ...formData,
        expertise: formData.expertise.filter(s => s !== skill)
      })
    } else {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, skill]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (formData.expertise.length === 0) {
        throw new Error('Selecciona al menos una área de expertise')
      }

      const response = await fetch('/api/mentors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar')
      }

      // Redirect to mentor dashboard
      router.push(`/mentor/dashboard?id=${data.mentorId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Conviértete en Mentor
          </h1>
          <p className="text-xl text-gray-300">
            Ayuda a otros profesionales IT mientras generas ingresos
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-slate-800 border border-purple-500/50 rounded-xl p-6 text-center">
            <FaDollarSign className="text-4xl text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gana Dinero</h3>
            <p className="text-gray-300 text-sm">Define tu tarifa por sesión de 10 minutos</p>
          </div>
          <div className="bg-slate-800 border border-blue-500/50 rounded-xl p-6 text-center">
            <FaClock className="text-4xl text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Flexibilidad Total</h3>
            <p className="text-gray-300 text-sm">Elige tu horario y disponibilidad</p>
          </div>
          <div className="bg-slate-800 border border-yellow-500/50 rounded-xl p-6 text-center">
            <FaBriefcase className="text-4xl text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Impacto Real</h3>
            <p className="text-gray-300 text-sm">Ayuda a crecer carreras en IT</p>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
        >
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaUser className="text-purple-400" />
                Información Personal
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-white font-semibold mb-2">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                />
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBriefcase className="text-blue-400" />
                Información Profesional
              </h3>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Bio profesional *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Cuéntanos sobre tu experiencia, logros y qué puedes aportar como mentor..."
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">LinkedIn URL</label>
                <div className="flex items-center gap-2">
                  <FaLinkedin className="text-blue-400 text-2xl" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
              </div>
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Áreas de Expertise * (selecciona al menos una)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {expertiseOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleExpertiseToggle(skill)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      formData.expertise.includes(skill)
                        ? 'bg-purple-500 text-white border-2 border-purple-400'
                        : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                    }`}
                  >
                    {formData.expertise.includes(skill) && <FaCheckCircle className="inline mr-2" />}
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaDollarSign className="text-green-400" />
                Tarifa por Sesión
              </h3>
              <div>
                <label className="block text-white font-semibold mb-2">
                  Precio por sesión de 10 minutos (USD) *
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="px-6 py-3 bg-green-500/20 border-2 border-green-500/50 rounded-lg">
                    <span className="text-3xl font-bold text-green-400">${formData.hourlyRate}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Recomendado: $15-$30 para mentores nuevos
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Registrando...
                </>
              ) : (
                <>
                  Convertirme en Mentor
                </>
              )}
            </button>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 mt-8"
        >
          Al registrarte, aceptas nuestros términos de servicio y política de mentorías
        </motion.p>
      </div>
    </div>
  )
}
