'use client'

import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/database'
import dynamic from 'next/dynamic'
const UserMentorias = dynamic(() => import('@/components/UserMentorias'), { ssr: false })
import { motion } from 'framer-motion'
import { FaBook, FaCalendar, FaCheckCircle, FaCloudUploadAlt, FaTasks, FaUserGraduate } from 'react-icons/fa'

type MentorTask = { id: number; task: string; completed: boolean }
type CareerScore = { cv_score: number; soft_skills_score: number; interview_readiness: number; total: number }
type ActionPlanResponse = { roadmap_status: string; career_score: CareerScore; mentor_tasks: MentorTask[]; ai_recommendations: string[] }

type UserReport = {
  id: string;
  createdAt: string;
  reportUrl: string;
}

export default function UserDashboardPage() {
    // Logout handler
    const handleLogout = () => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_email');
      window.location.href = '/user/login';
    };
  const [data, setData] = useState<ActionPlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useState<UserReport[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/user/roadmap', { headers: { Authorization: 'Bearer token_user_001' } })
        if (!res.ok) throw new Error('No se pudo cargar tu roadmap')
        const json = await res.json()
        setData(json)
        // Obtener email del usuario (mock)
        const email = localStorage.getItem('user_email') || 'usuario@example.com'
        // Buscar reportes en la "base de datos" (solo en el cliente para MVP)
        // En producción, esto sería una llamada a la API
        // @ts-ignore
        const all = db?.all ? db.all() : []
        const userReports = all.filter((r: any) => r.email === email && r.reportUrl).map((r: any) => ({
          id: r.id,
          createdAt: r.createdAt?.toISOString?.() || '',
          reportUrl: r.reportUrl
        }))
        setReports(userReports)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const refetch = async () => {
    try {
      const res = await fetch('/api/user/roadmap', { headers: { Authorization: 'Bearer token_user_001' } })
      if (!res.ok) throw new Error('No se pudo cargar tu roadmap')
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const onToggle = async (id: number, next: boolean) => {
    // Optimistic update
    setData(prev => prev ? ({
      ...prev,
      mentor_tasks: prev.mentor_tasks.map(task => task.id === id ? { ...task, completed: next } : task)
    }) : prev)
    try {
      await fetch('/api/user/roadmap/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token_user_001' },
        body: JSON.stringify({ id, completed: next })
      })
      // Re-sync data to update career score
      await refetch()
    } catch (e) {
      // rollback on error
      setData(prev => prev ? ({
        ...prev,
        mentor_tasks: prev.mentor_tasks.map(task => task.id === id ? { ...task, completed: !next } : task)
      }) : prev)
    }
  }

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )

  const skeleton = (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="grid md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Hola, Usuario! 👋
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          >
            Cerrar sesión
          </button>
        </div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6">Mi Progreso</h2>

        {/* Career Score - Key Motivator for Virtuous Cycle */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">🏆 Career Score</h3>
              <p className="text-blue-100">¡Llega al 100% para dominar tu carrera!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">{data?.career_score.total || 0}%</div>
              <div className="text-sm text-blue-200">Progreso Total</div>
            </div>
          </div>
          {loading || !data ? (
            <div className="animate-pulse h-4 bg-white/20 rounded" />
          ) : (
            <>
              <ProgressBar value={data.career_score.total} />
              <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="font-semibold text-lg">{data.career_score.cv_score}%</div>
                  <div className="text-blue-200">CV Score</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="font-semibold text-lg">{data.career_score.soft_skills_score}%</div>
                  <div className="text-blue-200">Soft Skills</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="font-semibold text-lg">{data.career_score.interview_readiness}%</div>
                  <div className="text-blue-200">Interview Ready</div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? skeleton : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mi Auditoría IA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaCloudUploadAlt className="text-blue-500" />
                <h2 className="text-xl font-bold">Mi Auditoría IA</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Re-subí tu CV si tenés créditos y revisá tus reportes anteriores.</p>
              <a href="/upload" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Re-subir CV</a>

              {/* Reportes generados */}
              {reports.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Mis Informes Generados</h3>
                  <ul className="space-y-2">
                    {reports.map(r => (
                      <li key={r.id} className="flex items-center gap-2">
                        <a href={r.reportUrl} target="_blank" rel="noopener" className="text-blue-600 hover:underline font-mono text-sm">
                          📄 Informe {r.id.slice(-6)} ({r.createdAt?.slice(0,10)})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Biblioteca de Activos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBook className="text-purple-500" />
                <h2 className="text-xl font-bold">Biblioteca de Activos</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Acceso a la Guía de Soft Skills y materiales que tu mentor te asignó.</p>
              <ul className="list-disc ml-6 text-sm text-slate-700 dark:text-slate-300">
                <li><a href="/soft-skills-guide" className="text-purple-600 hover:underline">Guía de Soft Skills</a></li>
                <li>Material extra: Plantillas de CV, scripts de entrevista</li>
              </ul>
            </motion.div>

            {/* Hoja de Ruta */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaTasks className="text-emerald-500" />
                <h2 className="text-xl font-bold">Hoja de Ruta (Action Items)</h2>
              </div>
              <ul className="space-y-3">
                {data?.mentor_tasks?.map(task => (
                  <li key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={e => onToggle(task.id, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{task.task}</span>
                  </li>
                ))}
                {(!data || data.mentor_tasks.length === 0) && (
                  <li className="text-slate-500 dark:text-slate-400">Aún no tenés tareas asignadas.</li>
                )}
              </ul>
            </motion.div>

            {/* Agendamiento y Sesiones */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaCalendar className="text-orange-500" />
                <h2 className="text-xl font-bold">Agendamiento y Sesiones</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-3">Elegí horarios y accedé a la sala de video cuando sea el momento.</p>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <a href="/mentors" className="px-3 py-2 bg-orange-600 text-white rounded-lg">Reservar mentoría</a>
                  <a href="/mentor/dashboard" className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg">Ver mis sesiones</a>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d,i)=> (
                    <div key={i} className="text-center text-slate-500 dark:text-slate-400">{d}</div>
                  ))}
                  {[...Array(7)].map((_,i)=> (
                    <div key={i} className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                      <div className="h-full flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400">09:00</span>
                        <span className="text-[10px] text-slate-400">13:00</span>
                        <span className="text-[10px] text-slate-400">18:00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Recomendaciones de la IA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="text-emerald-500" />
                <h2 className="text-xl font-bold">Recomendaciones de la IA</h2>
              </div>
              {(!data || data.ai_recommendations.length === 0) ? (
                <p className="text-slate-500 dark:text-slate-400">No hay recomendaciones disponibles en este momento.</p>
              ) : (
                <ul className="list-disc ml-6 text-slate-700 dark:text-slate-300">
                  {data.ai_recommendations.map((rec, i) => (
                    <li key={i} className="mb-2">{rec}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        )}

        <UserMentorias />
        <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
          <FaUserGraduate />
          Interfaz diseñada para reducir ansiedad y centralizar tu estrategia de carrera.
        </div>
      </div>
    </div>
  )
}
