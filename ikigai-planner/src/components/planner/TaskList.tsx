'use client'

import { useState, useRef } from 'react'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  onUpdate: (id: string, data: Partial<Task>) => void
  onCreate: (text: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onUpdate, onCreate, onDelete }: TaskListProps) {
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddTask = () => {
    const text = newText.trim()
    if (!text) return
    onCreate(text)
    setNewText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddTask()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white">Tareas Adicionales</h2>
      </div>

      <div className="p-3 space-y-1">
        {tasks.length === 0 && (
          <p className="text-xs text-gray-400 py-2 px-1">No hay tareas. Añade una abajo.</p>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 group py-1">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => onUpdate(task.id, { completed: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-400 flex-shrink-0"
            />
            <span
              className="flex-1 text-sm"
              style={{
                color: task.completed ? '#9ca3af' : '#1a1a2e',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.text}
            </span>
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-lg leading-none w-5 h-5 flex items-center justify-center"
              title="Eliminar tarea"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add task input */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-4 h-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Añadir tarea..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-500 placeholder-gray-300"
          />
          {newText.trim() && (
            <button
              onClick={handleAddTask}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{ backgroundColor: '#e8b86d', color: '#1a1a2e', fontWeight: 600 }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
