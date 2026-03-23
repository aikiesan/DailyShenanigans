import { useState } from 'react'
import BiomeCard from '../shared/BiomeCard'
import EmptyState from '../shared/EmptyState'

export default function ConquistasSection({ conquistas, onChange }) {
  const [newItem, setNewItem] = useState('')

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
              <span>{item}</span>
              <button
                onClick={() => deleteConquista(i)}
                className="opacity-0 group-hover:opacity-100 text-pantanal-400 hover:text-red-500 transition-all ml-1"
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
