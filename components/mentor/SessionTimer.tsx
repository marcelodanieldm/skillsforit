'use client'

import { FaClock } from 'react-icons/fa'

interface SessionTimerProps {
  elapsedSeconds: number
  maxSeconds: number
  isActive: boolean
  variant?: 'default' | 'floating'
}

export default function SessionTimer({ 
  elapsedSeconds, 
  maxSeconds, 
  isActive, 
  variant = 'default' 
}: SessionTimerProps) {
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const progress = (elapsedSeconds / maxSeconds) * 100

  // Estados del cronómetro:
  // Verde: 0-7 min (0-420s)
  // Amarillo: 7-9 min (420-540s)
  // Rojo: 9-10 min (540-600s)
  const getTimerColor = () => {
    if (elapsedSeconds < 420) return 'green'
    if (elapsedSeconds < 540) return 'yellow'
    return 'red'
  }

  const color = getTimerColor()
  const colorClasses = {
    green: 'bg-green-500 text-green-50 border-green-400',
    yellow: 'bg-yellow-500 text-yellow-50 border-yellow-400',
    red: 'bg-red-500 text-red-50 border-red-400'
  }

  const textColorClasses = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400'
  }

  if (variant === 'floating') {
    return (
      <div className={`${colorClasses[color]} rounded-full px-6 py-3 border-2 shadow-2xl flex items-center gap-3 animate-pulse`}>
        <FaClock className="text-2xl" />
        <div className="text-3xl font-mono font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* Cronómetro Digital */}
      <div className={`${colorClasses[color]} rounded-lg px-6 py-2 border-2 flex items-center gap-2`}>
        <FaClock className="text-xl" />
        <div className="text-2xl font-mono font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
              color === 'green' ? 'bg-green-500' :
              color === 'yellow' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span className={textColorClasses[color]}>
            {color === 'green' ? 'Exploración' :
             color === 'yellow' ? 'Pitch de Cierre' :
             '¡Tiempo Agotado!'}
          </span>
          <span className="text-slate-400">
            {maxSeconds / 60} min
          </span>
        </div>
      </div>
    </div>
  )
}
