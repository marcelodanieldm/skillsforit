'use client'

import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            ¿Listo para conseguir<br />
            <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              el trabajo que mereces?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            No dejes que tu CV sea el obstáculo entre tú y tu próximo gran trabajo.
            <br />
            <span className="font-semibold text-white">Optimízalo ahora en 2 minutos.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <button
              onClick={() => window.location.href = '/cv-audit'}
              className="group px-10 py-6 bg-white hover:bg-gray-100 text-slate-900 font-bold text-2xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center gap-3"
            >
              Optimizar mi cv ya
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>Análisis instantáneo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>Sin suscripción</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>Garantía 30 días</span>
            </div>
          </div>

          {/* Urgency element */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 inline-block px-6 py-3 bg-red-500/20 border border-red-400/30 rounded-full"
          >
            <p className="text-red-300 font-semibold">
              ⚠️ Oferta de lanzamiento: USD 7 (precio normal USD 25)
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
