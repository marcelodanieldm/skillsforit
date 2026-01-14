'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts'

interface PriceElasticityData {
  price: number
  volume: number // Ventas mensuales estimadas
  revenue: number // Revenue mensual
  scenario: 'pessimistic' | 'current' | 'optimistic'
  conversionRate: number
}

interface Service {
  id: string
  name: string
  slug: string
  base_price: number
}

export function PriceElasticityWidget() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [chartData, setChartData] = useState<PriceElasticityData[]>([])
  const [loading, setLoading] = useState(true)

  // Volumen mensual promedio (datos mock, en producción vendría de analytics)
  const avgMonthlyVolume = {
    ebook: 50,
    order_bump: 30,
    upsell: 20
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) {
      calculateElasticity(selectedService)
    }
  }, [selectedService])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ceo/services')
      const data = await response.json()

      if (data.success) {
        const servicesList = data.data.services
        setServices(servicesList)
        
        // Seleccionar primer servicio por defecto
        if (servicesList.length > 0) {
          setSelectedService(servicesList[0])
        }
      }
    } catch (err) {
      console.error('Error cargando servicios:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateElasticity = (service: Service) => {
    const currentPrice = service.base_price
    const slug = service.slug as keyof typeof avgMonthlyVolume
    const baseVolume = avgMonthlyVolume[slug] || 30

    // Generar datos para diferentes puntos de precio
    const pricePoints: PriceElasticityData[] = []

    // Rango de precios: -50% a +50% del precio actual
    const minPrice = Math.max(1, currentPrice * 0.5)
    const maxPrice = currentPrice * 1.5
    const step = (maxPrice - minPrice) / 10

    for (let price = minPrice; price <= maxPrice; price += step) {
      const priceChangePercent = ((price - currentPrice) / currentPrice) * 100
      
      // Modelo de elasticidad
      const elasticity = priceChangePercent > 0 ? -0.3 : 0.2
      const conversionChange = priceChangePercent * elasticity
      const newVolume = Math.round(baseVolume * (1 + conversionChange / 100))
      const revenue = price * newVolume

      // Determinar escenario
      let scenario: 'pessimistic' | 'current' | 'optimistic'
      if (Math.abs(price - currentPrice) < 0.1) {
        scenario = 'current'
      } else if (price < currentPrice) {
        scenario = 'optimistic' // Precio bajo = más optimista para volumen
      } else {
        scenario = 'pessimistic' // Precio alto = pesimista para volumen
      }

      pricePoints.push({
        price: Math.round(price * 100) / 100,
        volume: newVolume,
        revenue: Math.round(revenue * 100) / 100,
        scenario,
        conversionRate: Math.round((100 + conversionChange) * 10) / 10
      })
    }

    setChartData(pricePoints)
  }

  // Encontrar punto actual
  const currentPoint = chartData.find(d => d.scenario === 'current')
  
  // Encontrar mejor revenue
  const bestRevenuePoint = chartData.reduce((best, current) => 
    current.revenue > best.revenue ? current : best
  , chartData[0])

  // Calcular escenarios clave
  const scenarios = {
    optimistic: {
      price: selectedService ? selectedService.base_price * 0.8 : 0,
      description: 'Reducir precio 20%',
      impact: '+15% en volumen, -4% en revenue',
      icon: TrendingUp,
      color: 'text-emerald-400'
    },
    pessimistic: {
      price: selectedService ? selectedService.base_price * 1.2 : 0,
      description: 'Aumentar precio 20%',
      impact: '-6% en volumen, +13% en revenue',
      icon: TrendingDown,
      color: 'text-red-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            Elasticidad de Precio
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Simulación: Precio vs. Volumen de Ventas
          </p>
        </div>

        {/* Service Selector */}
        <select
          value={selectedService?.id || ''}
          onChange={(e) => {
            const service = services.find(s => s.id === e.target.value)
            setSelectedService(service || null)
          }}
          className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-indigo-500/30 focus:border-indigo-500 focus:outline-none"
        >
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} (${service.base_price})
            </option>
          ))}
        </select>
      </div>

      {/* Scenarios Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Scenario */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">Precio Actual</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            ${selectedService?.base_price.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">
            {currentPoint?.volume || 0} ventas/mes
          </p>
          <p className="text-xs text-slate-400">
            ${(currentPoint?.revenue || 0).toFixed(0)} revenue/mes
          </p>
        </div>

        {/* Optimistic Scenario */}
        <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <scenarios.optimistic.icon className={`w-5 h-5 ${scenarios.optimistic.color}`} />
            <span className="text-sm font-semibold text-emerald-400">Escenario Optimista</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            ${scenarios.optimistic.price.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-400">
            {scenarios.optimistic.description}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {scenarios.optimistic.impact}
          </p>
        </div>

        {/* Pessimistic Scenario */}
        <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <scenarios.pessimistic.icon className={`w-5 h-5 ${scenarios.pessimistic.color}`} />
            <span className="text-sm font-semibold text-red-400">Escenario Pesimista</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            ${scenarios.pessimistic.price.toFixed(2)}
          </p>
          <p className="text-xs text-red-400">
            {scenarios.pessimistic.description}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {scenarios.pessimistic.impact}
          </p>
        </div>
      </div>

      {/* Chart: Price vs Volume */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Comparativa: Precio vs. Volumen de Ventas
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="price" 
              stroke="#94a3b8"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis 
              stroke="#94a3b8"
              tickFormatter={(value) => `${value} ventas`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #4f46e5',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'volume') return [`${value} ventas`, 'Volumen']
                return [value, name]
              }}
              labelFormatter={(label) => `Precio: $${label}`}
            />
            <ReferenceLine 
              x={selectedService?.base_price || 0} 
              stroke="#6366f1" 
              strokeDasharray="3 3"
              label={{ value: 'Actual', fill: '#6366f1', fontSize: 12 } as any}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#volumeGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart: Price vs Revenue */}
      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Comparativa: Precio vs. Revenue Mensual
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="price" 
              stroke="#94a3b8"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis 
              stroke="#94a3b8"
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #10b981',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [`$${value.toFixed(0)}`, 'Revenue']}
              labelFormatter={(label) => `Precio: $${label}`}
            />
            <ReferenceLine 
              x={selectedService?.base_price || 0} 
              stroke="#10b981" 
              strokeDasharray="3 3"
              label={{ value: 'Actual', fill: '#10b981', fontSize: 12 }}
            />
            <ReferenceLine 
              x={bestRevenuePoint?.price || 0} 
              stroke="#fbbf24" 
              strokeDasharray="5 5"
              label={{ value: 'Óptimo', fill: '#fbbf24', fontSize: 12 }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-indigo-300 mb-1">Insights</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• El precio óptimo para maximizar revenue es <span className="text-amber-400 font-semibold">${bestRevenuePoint?.price.toFixed(2)}</span></li>
              <li>• Subir precio +20%: Conversión baja -6%, pero revenue sube +13%</li>
              <li>• Bajar precio -20%: Conversión sube +4%, pero revenue baja -16%</li>
              <li>• El modelo asume elasticidad constante (-0.3 para incrementos, 0.2 para reducciones)</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
