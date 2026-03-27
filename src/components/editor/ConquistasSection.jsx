import { useState } from 'react'
import BiomeCard from '../shared/BiomeCard'
import EmptyState from '../shared/EmptyState'

export default function ConquistasSection({ conquistas, onChange }) {
  const [newItem, setNewItem] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')

  function addConquista() {
    const text = newItem.trim()
    if (!text) return
    onChange([...conquistas, text])
    setNewItem('')
  }

  function deleteConquista(index) {
    onChange(conquistas.filter((_, i) => i !== index))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addConquista()
  }

  function startEdit(index) {
    setEditingIndex(index)
    setEditText(conquistas[index])
  }

  function commitEdit() {
    if (editingIndex === null) return
    const text = editText.trim()
    if (text) {
      onChange(conquistas.map((c, i) => i === editingIndex ? text : c))
    }
    setEditingIndex(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditText('')
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') commitEdit()
    else if (e.key === 'Escape') cancelEdit()
  }

  return (
    <BiomeCard biomeKey="pantanal" title="Conquistas do Dia" icon="⭐">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Submeteu abstract IACBR 2026..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-pantanal-200 focus:border-pantanal-400 focus:outline-none bg-white text-sm font-medium placeholder-pantanal-300 transition-colors"
        />
        <button
          onClick={addConquista}
          className="bg-pantanal-500 hover:bg-pantanal-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors active:scale-95 shadow-sm"
        >
          +
        </button>
      </div>

      {conquistas.length === 0 ? (
        <EmptyState section="conquistas" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {conquistas.map((item, i) => (
            <div
              key={i}
              className="bg-pantanal-100 text-pantanal-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 group"
            >
              <span>⭐</span>
              {editingIndex === i ? (
                <input
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={commitEdit}
                  autoFocus
                  className="text-sm font-medium px-1 py-0.5 rounded border-2 border-pantanal-400 focus:outline-none bg-white text-pantanal-700 w-40"
                />
              ) : (
                <span onClick={() => startEdit(i)} className="cursor-text">{item}</span>
              )}
              <button
                onClick={() => deleteConquista(i)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-pantanal-400 hover:text-red-500 transition-all ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </BiomeCard>
  )
}
