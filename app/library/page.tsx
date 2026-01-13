'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Library as LibraryIcon, 
  ShoppingBag, 
  TrendingUp,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { EbookCard } from '@/components/library/EbookCard'
import { CVAuditCard } from '@/components/library/CVAuditCard'
import { MentorshipCard } from '@/components/library/MentorshipCard'

interface UserProducts {
  ebooks: Array<{
    id: string
    productId: string
    productName: string
    downloadUrl: string
    downloadCount: number
    expiresAt: string
    purchasedAt: string
    type: 'ebook'
  }>
  cvAudit: {
    id: string
    balance: number
    used: boolean
    purchasedAt: string
    type: 'cv_audit'
  } | null
  mentorships: Array<{
    id: string
    mentorId: string | null
    mentor: {
      name: string
      email: string
      specialty: string
      bio: string
      availability: any
    } | null
    sessionsTotal: number
    sessionsLeft: number
    status: 'active' | 'scheduled' | 'completed' | 'cancelled'
    nextSessionAt: string | null
    expiresAt: string
    purchasedAt: string
    type: 'mentorship'
  }>
}

interface UserStats {
  totalProducts: number
  ebooksCount: number
  cvAuditAvailable: number
  mentorshipSessionsLeft: number
  activeMentorships: number
}

export default function LibraryPage() {
  const [products, setProducts] = useState<UserProducts | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: Obtener userId del contexto de autenticación
  const userId = 'demo-user-123' // Placeholder

  useEffect(() => {
    fetchUserProducts()
  }, [])

  const fetchUserProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/user/products?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const data = await response.json()
      setProducts(data.data.products)
      setStats(data.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando tu biblioteca...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops, algo salió mal
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProducts}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  const hasProducts = stats && stats.totalProducts > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <LibraryIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mi Biblioteca</h1>
                  <p className="text-sm text-gray-600">
                    Todos tus productos en un solo lugar
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/soft-skills-guide"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar Más
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasProducts ? (
          // Estado vacío
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LibraryIcon className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tu biblioteca está vacía
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Comienza tu viaje de crecimiento profesional con nuestra Guía de
              Soft Skills y servicios premium.
            </p>
            <Link
              href="/soft-skills-guide"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              Explorar Productos
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalProducts}
                    </p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-purple-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">E-books</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.ebooksCount}
                    </p>
                  </div>
                  <LibraryIcon className="w-10 h-10 text-purple-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Créditos CV</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.cvAuditAvailable}
                    </p>
                  </div>
                  <Sparkles className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sesiones</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.mentorshipSessionsLeft}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-emerald-500 opacity-50" />
                </div>
              </div>
            </motion.div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* E-books */}
              {products?.ebooks.map((ebook) => (
                <EbookCard key={ebook.id} {...ebook} />
              ))}

              {/* CV Audit */}
              {products?.cvAudit && (
                <CVAuditCard {...products.cvAudit} />
              )}

              {/* Mentorías */}
              {products?.mentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} {...mentorship} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
