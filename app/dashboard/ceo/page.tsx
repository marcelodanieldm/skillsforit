"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowUp, FaArrowDown, FaChartLine, FaTrophy, FaDollarSign, FaUsers, FaRocket, FaServer, FaCoins, FaStar, FaBriefcase, FaCalendar, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const defaultTemplates = {
  mentoriaWelcome: {
    subject: '¡Bienvenido a SkillsForIT Mentoría! 🎉',
    html: `<h2>¡Gracias por tu compra!</h2><p>Tu acceso al dashboard de mentoría ya está listo.</p>`
  },
  productDelivery: {
    subject: '¡Tu acceso a [PRODUCTO] está listo!',
    html: `<h2>¡Gracias por tu compra!</h2><p>Puedes descargar tu producto aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  cvAnalysisConfirmation: {
    subject: '¡Pago recibido! Tu análisis de CV está en proceso',
    html: `<h2>¡Gracias por confiar en SkillsForIT!</h2><p>Tu pago fue recibido correctamente. Estamos procesando tu análisis de CV.</p>`
  },
  cvAnalysisResult: {
    subject: '¡Tu análisis de CV está listo!',
    html: `<h2>¡Análisis completado!</h2><p>Puedes ver tu resultado aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  mentorshipSessionConfirmation: {
    subject: '¡Sesión de mentoría confirmada!',
    html: `<h2>¡Tu sesión está agendada!</h2><p>Mentor: <b>[MENTOR]</b><br/>Fecha y hora: <b>[FECHA]</b></p>`
  },
  cartRecovery: {
    subject: '¿Aún quieres [PRODUCTO]?',
    html: `<h2>¡No pierdas tu oportunidad!</h2><p>Puedes retomar tu compra aquí: <a href='[LINK]'>[LINK]</a></p>`
  }
};

function EmailTemplateEditor({ id, label, value, onChange, onReset }) {
  return (
    <div className="border rounded-lg p-4 mb-6 bg-white dark:bg-slate-800">
      <h3 className="font-bold mb-2">{label}</h3>
      <label className="block text-sm mb-1">Asunto</label>
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        value={value.subject}
        onChange={e => onChange({ ...value, subject: e.target.value })}
      />
      <label className="block text-sm mb-1">Cuerpo HTML</label>
      <textarea
        className="w-full border rounded px-2 py-1 mb-2 font-mono"
        rows={5}
        value={value.html}
        onChange={e => onChange({ ...value, html: e.target.value })}
      />
      <div className="flex gap-2 mb-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={onReset}>Restaurar default</button>
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="text-xs text-gray-500 mb-1">Vista previa:</div>
        <div className="p-2 border rounded bg-gray-50 dark:bg-slate-900" dangerouslySetInnerHTML={{ __html: value.html }} />
      </div>
    </div>
  );
}

export default function CEOPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [templates, setTemplates] = useState(() => ({ ...defaultTemplates }));
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Dummy data for demonstration
  const growthMetrics = {
    cac: 42.5,
    cacTrend: -3.2,
    ltv: 145.7,
    ltvTrend: 2.1,
    churn: 4.8,
    churnTrend: -0.7,
    viralKFactor: 1.3,
    viralTrend: 0.2,
  };
  const infraMetrics = {
    aiResponseTime: 850,
    aiResponseTrend: -15.0,
    edgeFunctionLatency: 120,
    edgeLatencyTrend: -5.0,
    costPerToken: 0.0004,
    costPerTokenTrend: -0.0001,
    infrastructureCost: 320,
    totalTokensUsed: 2_500_000,
  };
  const productMetrics = {
    mentorNPS: 58,
    mentorNPSTrend: 3.5,
    auditSuccessRate: 42.5,
    auditSuccessTrend: 1.2,
    avgTimeToInterview: 7,
    interviewTimeTrend: -0.5,
    userSatisfaction: 4.7,
    satisfactionTrend: 0.1,
  };
  const userSourceData = [
    { name: 'Orgánico', value: 42, color: '#7c3aed' },
    { name: 'Ads', value: 28, color: '#f59e42' },
    { name: 'Referidos', value: 18, color: '#10b981' },
    { name: 'Bootcamps', value: 12, color: '#6366f1' },
  ];
  const countryMetrics = [
    { country: 'España', users: 4500, revenue: 12500, satisfaction: 4.7 },
    { country: 'México', users: 3200, revenue: 8900, satisfaction: 4.5 },
    { country: 'Argentina', users: 2800, revenue: 7200, satisfaction: 4.6 },
    { country: 'Colombia', users: 2100, revenue: 5800, satisfaction: 4.4 },
    { country: 'Chile', users: 1800, revenue: 5200, satisfaction: 4.6 },
  ];

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  useEffect(() => {
    fetch('/api/email-templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoadingTemplates(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    await fetch('/api/email-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templates)
    });
    setSaving(false);
    setSaveMsg('Guardado correctamente');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo administradores pueden acceder al Dashboard Ejecutivo
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando métricas ejecutivas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ...existing dashboard content... */}
      <section className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Configuración de Emails</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Edita el asunto y cuerpo HTML de cada email transaccional. Puedes usar variables entre corchetes como [PRODUCTO], [LINK], [MENTOR], [FECHA], etc.</p>
        {loadingTemplates ? <div>Cargando plantillas...</div> : Object.entries(defaultTemplates).map(([id, def]) => (
          <EmailTemplateEditor
            key={id}
            id={id}
            label={id}
            value={templates[id]}
            onChange={val => setTemplates(t => ({ ...t, [id]: val }))}
            onReset={() => setTemplates(t => ({ ...t, [id]: def }))}
          />
        ))}
        <button className="px-4 py-2 bg-green-600 text-white rounded font-bold" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        {saveMsg && <span className="ml-4 text-green-600 font-semibold">{saveMsg}</span>}
      </section>
    </div>
  );
}

// COMPONENTES AUXILIARES
interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  iconColor: string;
  inverseGood?: boolean;
  highlight?: boolean;
}

function MetricCard({ title, subtitle, value, trend, icon, iconColor, inverseGood = false, highlight = false }: MetricCardProps) {
  const isPositive = inverseGood ? trend < 0 : trend > 0;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${highlight ? 'ring-2 ring-purple-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>{icon}</div>
        <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? <FaArrowUp /> : <FaArrowDown />}<span>{Math.abs(trend).toFixed(1)}%</span></div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </motion.div>
  );
}

interface UsageBarProps {
  label: string;
  percentage: number;
  color: string;
}

function UsageBar({ label, percentage, color }: UsageBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

interface PerformanceIndicatorProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  lowerIsBetter?: boolean;
}

function PerformanceIndicator({ label, current, target, unit, lowerIsBetter = false }: PerformanceIndicatorProps) {
  const percentage = lowerIsBetter ? Math.min((target / current) * 100, 100) : Math.min((current / target) * 100, 100);
  const isGood = lowerIsBetter ? current <= target : current >= target;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{current.toFixed(2)}{unit}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ {target}{unit}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
