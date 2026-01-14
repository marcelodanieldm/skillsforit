'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ACTION_ITEM_TEMPLATES,
  ActionItemTemplate,
  getActionItemsByCategory,
  searchActionItems
} from '@/lib/mentor-action-items'

interface SelectedActionItem extends ActionItemTemplate {
  customDescription?: string
}

interface QuickFeedbackEditorProps {
  sessionId: string
  mentorId: string
  onSave: (data: {
    topics: string[]
    actionItems: string[]
    nextSteps: string[]
    content: string
  }) => Promise<void>
  initialTopics?: string[]
  initialActionItems?: string[]
  initialNextSteps?: string[]
  initialContent?: string
}

const categories = [
  { id: 'technical', label: 'Technical Skills', icon: '💻' },
  { id: 'soft-skills', label: 'Soft Skills', icon: '🗣️' },
  { id: 'career', label: 'Career', icon: '🚀' },
  { id: 'interview', label: 'Interview Prep', icon: '🎯' },
  { id: 'tools', label: 'Tools & Setup', icon: '🛠️' }
] as const

export default function QuickFeedbackEditor({
  sessionId,
  mentorId,
  onSave,
  initialTopics = [],
  initialActionItems = [],
  initialNextSteps = [],
  initialContent = ''
}: QuickFeedbackEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ActionItemTemplate['category']>('technical')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<SelectedActionItem[]>([])
  const [topics, setTopics] = useState<string[]>(initialTopics)
  const [nextSteps, setNextSteps] = useState<string[]>(initialNextSteps)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [startTime] = useState(Date.now())
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Cargar datos iniciales
  useEffect(() => {
    if (initialActionItems.length > 0) {
      const items = initialActionItems.map(item => {
        const template = ACTION_ITEM_TEMPLATES.find(t => t.id === item || t.title === item)
        return template || {
          id: `custom-${Date.now()}`,
          category: 'technical' as const,
          title: item,
          description: item,
          estimatedTime: '1 week',
          priority: 'medium' as const
        }
      })
      setSelectedItems(items)
    }
  }, [initialActionItems])

  const availableItems = searchQuery
    ? searchActionItems(searchQuery)
    : getActionItemsByCategory(selectedCategory)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dragging from templates to selected
    if (activeId.startsWith('template-') && overId === 'selected-droppable') {
      const itemId = activeId.replace('template-', '')
      const item = availableItems.find(i => i.id === itemId)
      if (item && !selectedItems.find(i => i.id === item.id)) {
        setSelectedItems([...selectedItems, item])
      }
      return
    }

    // Reorder within selected items
    if (activeId.startsWith('selected-') && overId.startsWith('selected-')) {
      const oldIndex = selectedItems.findIndex(item => `selected-${item.id}` === activeId)
      const newIndex = selectedItems.findIndex(item => `selected-${item.id}` === overId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setSelectedItems(arrayMove(selectedItems, oldIndex, newIndex))
      }
    }
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems]
    newItems.splice(index, 1)
    setSelectedItems(newItems)
  }

  const handleEditDescription = (index: number, customDescription: string) => {
    const newItems = [...selectedItems]
    newItems[index] = { ...newItems[index], customDescription }
    setSelectedItems(newItems)
  }

  const handleAddTopic = () => {
    const topic = prompt('Add topic discussed:')
    if (topic) {
      setTopics([...topics, topic])
    }
  }

  const handleAddNextStep = () => {
    const step = prompt('Add next step:')
    if (step) {
      setNextSteps([...nextSteps, step])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        topics,
        actionItems: selectedItems.map(item => item.customDescription || item.title),
        nextSteps,
        content
      })
      setSaveSuccess(true)
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      setTimeout(() => {
        alert(`✅ Feedback saved in ${elapsed} seconds!`)
        setSaveSuccess(false)
      }, 500)
    } catch (error) {
      alert('Error saving feedback')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const totalTime = selectedItems.reduce((acc, item) => {
    const weeks = item.estimatedTime.includes('week') ? parseInt(item.estimatedTime) || 1 : 0
    const days = item.estimatedTime.includes('day') ? parseInt(item.estimatedTime) || 0 : 0
    const months = item.estimatedTime.includes('month') ? parseInt(item.estimatedTime) || 0 : 0
    return acc + (months * 4) + weeks + (days / 7)
  }, 0)

  // Sortable Template Item Component
  const SortableTemplateItem = ({ item }: { item: ActionItemTemplate }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `template-${item.id}` })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const isSelected = selectedItems.find(i => i.id === item.id)

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`mb-3 p-3 bg-white border rounded-lg cursor-grab transition ${
          isDragging
            ? 'shadow-lg border-blue-500'
            : 'border-gray-200 hover:border-blue-300'
        } ${isSelected ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {item.priority}
              </span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                ⏱️ {item.estimatedTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sortable Selected Item Component
  const SortableSelectedItem = ({ item, index }: { item: SelectedActionItem; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `selected-${item.id}` })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`mb-3 p-3 bg-white border rounded-lg transition ${
          isDragging ? 'shadow-lg border-green-500' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center flex-1">
            <div {...listeners} className="cursor-grab mr-2 text-gray-400 hover:text-gray-600">
              ⋮⋮
            </div>
            <h4 className="font-semibold text-sm text-gray-900 flex-1">{item.title}</h4>
          </div>
          <button
            onClick={() => handleRemoveItem(index)}
            className="text-red-600 hover:text-red-800 text-sm ml-2"
          >
            ✕
          </button>
        </div>
        <textarea
          placeholder="Customize description (optional)..."
          value={item.customDescription || item.description}
          onChange={(e) => handleEditDescription(index, e.target.value)}
          className="w-full text-xs text-gray-600 border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
          rows={2}
        />
        {item.resources && item.resources.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">Resources:</p>
            {item.resources.map((resource, idx) => (
              <a
                key={idx}
                href={resource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block"
              >
                🔗 {resource}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">⚡ Quick Feedback Editor</h2>
        <div className="text-sm text-gray-600">
          Session: <span className="font-mono text-xs">{sessionId}</span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Panel Izquierdo: Templates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">📚 Action Item Templates</h3>
              
              {/* Buscador */}
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              />

              {/* Categorías */}
              {!searchQuery && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Templates */}
            <SortableContext
              items={availableItems.map(item => `template-${item.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="border-2 border-dashed rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto border-gray-300">
                {availableItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No templates found</p>
                ) : (
                  availableItems.map((item) => (
                    <SortableTemplateItem key={item.id} item={item} />
                  ))
                )}
              </div>
            </SortableContext>
          </div>

          {/* Panel Derecho: Selected Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">✅ Selected Action Items ({selectedItems.length})</h3>
              <span className="text-sm text-gray-600">
                Total: ~{Math.round(totalTime)} weeks
              </span>
            </div>

            <SortableContext
              items={selectedItems.map(item => `selected-${item.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id="selected-droppable"
                className="border-2 border-dashed rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto border-gray-300"
              >
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    👈 Drag action items here
                  </p>
                ) : (
                  selectedItems.map((item, index) => (
                    <SortableSelectedItem key={item.id} item={item} index={index} />
                  ))
                )}
              </div>
            </SortableContext>

            {/* Topics y Next Steps */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Topics Discussed</label>
                  <button
                    onClick={handleAddTopic}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {topic}
                      <button
                        onClick={() => setTopics(topics.filter((_, i) => i !== idx))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Next Steps</label>
                  <button
                    onClick={handleAddNextStep}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add
                  </button>
                </div>
                <ul className="space-y-1">
                  {nextSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span className="flex-1">{step}</span>
                      <button
                        onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Additional Notes</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Any additional observations or comments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          🎯 Goal: Complete in <strong>&lt;60 seconds</strong>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || selectedItems.length === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            saving || selectedItems.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : saveSuccess
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? '⏳ Saving...' : saveSuccess ? '✅ Saved!' : '💾 Save Feedback'}
        </button>
      </div>
    </div>
  )
}
