'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { motion } from 'framer-motion'

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

/**
 * Soft Skills Radar Chart
 * 
 * Sprint 37: Visualización impactante de fortalezas y debilidades
 * 
 * Muestra 5 dimensiones:
 * - STAR Method
 * - Liderazgo
 * - Resolución de Conflictos
 * - Accountability
 * - Comunicación Asertiva
 */

interface SoftSkillsRadarChartProps {
  labels: string[]
  scores: number[]  // 0-100
  level?: string
  showLegend?: boolean
  animate?: boolean
}

export default function SoftSkillsRadarChart({
  labels,
  scores,
  level = 'Colaborador Reactivo',
  showLegend = false,
  animate = true
}: SoftSkillsRadarChartProps) {
  const chartRef = useRef<ChartJS<'radar'>>(null)

  // Animación progresiva de los scores
  useEffect(() => {
    if (animate && chartRef.current) {
      const chart = chartRef.current
      const originalScores = [...scores]
      
      // Animar desde 0 hasta los valores reales
      let frame = 0
      const totalFrames = 60
      
      const interval = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        const easeOutQuad = 1 - (1 - progress) * (1 - progress)
        
        chart.data.datasets[0].data = originalScores.map(
          score => score * easeOutQuad
        )
        chart.update('none')
        
        if (frame >= totalFrames) {
          clearInterval(interval)
        }
      }, 16)
      
      return () => clearInterval(interval)
    }
  }, [scores, animate])

  const data = {
    labels,
    datasets: [
      {
        label: 'Tu nivel actual',
        data: animate ? new Array(scores.length).fill(0) : scores,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(139, 92, 246)',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  }

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => {
            if (value === 0) return '0'
            if (value === 20) return '20'
            if (value === 40) return '40'
            if (value === 60) return '60'
            if (value === 80) return '80'
            if (value === 100) return '100'
            return ''
          },
          font: {
            size: 11
          },
          color: 'rgba(156, 163, 175, 0.8)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 600
          },
          color: 'rgb(55, 65, 81)',
          padding: 15
        }
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 600
          },
          color: 'rgb(55, 65, 81)',
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const score = context.parsed.r
            let assessment = ''
            
            if (score >= 80) assessment = 'Excelente'
            else if (score >= 60) assessment = 'Bueno'
            else if (score >= 40) assessment = 'Mejorable'
            else assessment = 'Crítico'
            
            return `Score: ${Math.round(score)}/100 (${assessment})`
          }
        }
      }
    }
  }

  // Color del nivel
  const getLevelColor = (level: string) => {
    if (level.includes('Líder')) return 'text-green-600 bg-green-100'
    if (level.includes('Proactivo')) return 'text-blue-600 bg-blue-100'
    if (level.includes('Reactivo')) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg"
    >
      {/* Header con nivel */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tu Perfil de Soft Skills
        </h3>
        <div className={`inline-block px-6 py-2 rounded-full ${getLevelColor(level)}`}>
          <span className="font-bold text-lg">
            Nivel: {level}
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="relative h-[400px] flex items-center justify-center">
        <Radar ref={chartRef} data={data} options={options} />
      </div>

      {/* Legend personalizada */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">
            80-100: Excelente
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-700 dark:text-gray-300">
            60-79: Bueno
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-700 dark:text-gray-300">
            40-59: Mejorable
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-700 dark:text-gray-300">
            0-39: Crítico
          </span>
        </div>
      </div>

      {/* Insight rápido */}
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-bold text-purple-700 dark:text-purple-400">💡 Insight:</span>{' '}
          {scores.every(s => s >= 80) && 'Excelente perfil completo. Estás listo para entrevistas senior.'}
          {scores.some(s => s < 40) && 'Detectamos áreas críticas que podrían bloquearte en entrevistas. Ingresa tu email para ver cómo mejorarlas.'}
          {!scores.every(s => s >= 80) && !scores.some(s => s < 40) && 'Tienes un buen perfil base, pero hay áreas específicas que podrían ser la diferencia entre conseguir la oferta o no.'}
        </p>
      </div>
    </motion.div>
  )
}
