'use client'

import { FaCheckSquare } from 'react-icons/fa'

interface ActionItemsPanelProps {
  selectedItems: string[]
  onToggle: (item: string, checked: boolean) => void
}

const PREDEFINED_ACTION_ITEMS = [
  'Mejorar Storytelling del perfil',
  'Revisar Stack Técnico',
  'Agregar métricas de impacto',
  'Optimizar formato visual',
  'Destacar proyectos relevantes',
  'Incluir certificaciones',
  'Mejorar descripción de experiencia',
  'Agregar soft skills',
  'Actualizar LinkedIn',
  'Preparar portfolio online'
]

export default function ActionItemsPanel({ selectedItems, onToggle }: ActionItemsPanelProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-300 mb-3 block flex items-center gap-2">
        <FaCheckSquare className="text-purple-400" />
        Action Items (Feedback Rápido)
      </label>
      
      <div className="space-y-2 bg-slate-800 rounded-lg p-3 border border-slate-700 max-h-64 overflow-y-auto">
        {PREDEFINED_ACTION_ITEMS.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={(e) => onToggle(item, e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-slate-300 text-sm">{item}</span>
          </label>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-3 bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
          <p className="text-xs text-purple-300 mb-2">
            <strong>{selectedItems.length}</strong> action items seleccionados:
          </p>
          <ul className="space-y-1">
            {selectedItems.map((item) => (
              <li key={item} className="text-xs text-slate-400">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
