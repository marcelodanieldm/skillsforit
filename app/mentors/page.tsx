'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaBriefcase, FaDollarSign, FaCalendar, FaLinkedin } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface Mentor {
  id: string
  name: string
  bio: string
  expertise: string[]
  linkedinUrl?: string
  hourlyRate: number
  rating: number
  totalSessions: number
  reviewCount: number
}

export default function MentorsPage() {
  const router = useRouter()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExpertise, setSelectedExpertise] = useState<string>('')

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/mentors/list')
      const data = await response.json()
      
      if (data.success) {
        setMentors(data.mentors)
      }
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const allExpertise = Array.from(
    new Set(mentors.flatMap(m => m.expertise))
  ).sort()

  const filteredMentors = selectedExpertise
    ? mentors.filter(m => m.expertise.includes(selectedExpertise))
    : mentors

  const handleBookSession = (mentorId: string) => {
    router.push(`/mentors/book?mentorId=${mentorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Encuentra tu Mentor Ideal
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Sesiones de 10 minutos con expertos en IT
          </p>

          {/* Expertise Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedExpertise('')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedExpertise === ''
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Todos
            </button>
            {allExpertise.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedExpertise(skill)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedExpertise === skill
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">No hay mentores disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border-2 border-slate-700 hover:border-purple-500/50 rounded-xl p-6 transition-all"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                    {mentor.linkedinUrl && (
                      <a
                        href={mentor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <FaLinkedin className="text-2xl" />
                      </a>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-white font-bold">{mentor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      ({mentor.reviewCount} reviews)
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">
                      {mentor.totalSessions} sesiones
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-green-400" />
                      <span className="text-2xl font-bold text-green-400">
                        ${mentor.hourlyRate}
                      </span>
                      <span className="text-gray-400 text-sm">/10 min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookSession(mentor.id)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FaCalendar />
                    Reservar Sesión
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA to become mentor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-purple-500/20 to-blue-600/20 border-2 border-purple-500/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Quieres ser Mentor?
          </h3>
          <p className="text-gray-300 mb-6">
            Ayuda a otros profesionales IT y genera ingresos con sesiones de 10 minutos
          </p>
          <button
            onClick={() => router.push('/mentor/register')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all transform hover:scale-105"
          >
            Conviértete en Mentor
          </button>
        </motion.div>
      </div>
    </div>
  )
}
