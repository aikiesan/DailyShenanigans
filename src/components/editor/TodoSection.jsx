import { useState } from 'react'
import BiomeCard from '../shared/BiomeCard'
import EmptyState from '../shared/EmptyState'
import { randomFrom, TODO_COMPLETED_MESSAGES } from '../../utils/humor'

export default function TodoSection({ todos, onChange }) {
  const [newTodo, setNewTodo] = useState('')
  const allDone = todos.length > 0 && todos.every(t => t.done)
  const doneCount = todos.filter(t => t.done).length

  function addTodo() {
    const text = newTodo.trim()
    if (!text) return
    onChange([...todos, { text, done: false }])
    setNewTodo('')
  }

  function toggleTodo(index) {
    const next = todos.map((t, i) => i === index ? { ...t, done: !t.done } : t)
    onChange(next)
  }

  function deleteTodo(index) {
    onChange(todos.filter((_, i) => i !== index))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addTodo()
  }

  return (
    <BiomeCard biomeKey="cerrado" title="Lista de Tarefas" icon="✅">
      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nova tarefa para o bioma..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-cerrado-200 focus:border-cerrado-400 focus:outline-none bg-white text-sm font-medium placeholder-cerrado-300 transition-colors"
        />
        <button
          onClick={addTodo}
          className="bg-cerrado-500 hover:bg-cerrado-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors active:scale-95 shadow-sm"
        >
          +
        </button>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-cerrado-600 mb-1">
            <span>{doneCount}/{todos.length} tarefas</span>
            <span>{Math.round((doneCount / todos.length) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-cerrado-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cerrado-400 to-cerrado-600 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / todos.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div className="bg-amazonia-50 border-2 border-amazonia-200 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm font-bold text-amazonia-700">
            {randomFrom(TODO_COMPLETED_MESSAGES)}
          </p>
        </div>
      )}

      {/* Todo list */}
      {todos.length === 0 ? (
        <EmptyState section="todos" />
      ) : (
        <ul className="space-y-2">
          {todos.map((todo, i) => (
            <li key={i} className="flex items-center gap-3 group">
              <button
                onClick={() => toggleTodo(i)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  todo.done
                    ? 'bg-amazonia-500 border-amazonia-500 text-white'
                    : 'border-cerrado-300 hover:border-cerrado-500'
                }`}
              >
                {todo.done && '✓'}
              </button>
              <span className={`text-sm font-medium flex-1 transition-all ${
                todo.done ? 'line-through text-gray-400' : 'text-gray-700'
              }`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(i)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-sm p-1"
                title="Remover"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </BiomeCard>
  )
}
