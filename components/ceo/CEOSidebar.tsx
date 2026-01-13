'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartLine, 
  FaChevronLeft, 
  FaChevronRight,
  FaStar,
  FaCog,
  FaHeartbeat,
  FaLayerGroup
} from 'react-icons/fa'

interface SidebarProps {
  onNavigate: (layer: number) => void
  currentLayer: number
}

export default function CEOSidebar({ onNavigate, currentLayer }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const layers = [
    {
      id: 1,
      name: 'North Star Metrics',
      icon: FaStar,
      color: 'text-emerald-400',
      description: 'KPIs Financieros'
    },
    {
      id: 2,
      name: 'Tablero de Comando',
      icon: FaChartLine,
      color: 'text-blue-400',
      description: 'Escenarios & Proyecciones'
    },
    {
      id: 3,
      name: 'Panel de Operaciones',
      icon: FaCog,
      color: 'text-purple-400',
      description: 'Gestión Dinámica'
    },
    {
      id: 4,
      name: 'Salud del Sistema',
      icon: FaHeartbeat,
      color: 'text-red-400',
      description: 'Uptime & Logs'
    }
  ]

  const scrollToLayer = (layerId: number) => {
    onNavigate(layerId)
    // Scroll smooth al elemento con id correspondiente
    const element = document.getElementById(`ceo-layer-${layerId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <FaLayerGroup className="text-emerald-400 text-xl" />
              <span className="text-white font-bold">Centro de Mando</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Navigation Layers */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {layers.map((layer, index) => {
          const Icon = layer.icon
          const isActive = currentLayer === layer.id

          return (
            <motion.button
              key={layer.id}
              onClick={() => scrollToLayer(layer.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-slate-800 border border-emerald-500/50 shadow-lg' 
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`text-2xl ${layer.color} ${isCollapsed ? 'mx-auto' : ''}`}>
                <Icon />
              </div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left"
                  >
                    <p className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {layer.name}
                    </p>
                    <p className="text-slate-500 text-xs">{layer.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isCollapsed && isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="w-1 h-8 bg-emerald-500 rounded-full"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer Info */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-slate-700"
          >
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Dashboard Version</p>
              <p className="text-white font-semibold">Sprint 29 - Optimizado</p>
              <p className="text-slate-500 text-xs mt-2">
                Vista SQL unificada + Escenarios en tiempo real
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
