import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { useDraft } from '../../hooks/useDraft'
import { useToast } from '../shared/Toast'
import { formatDatePT } from '../../utils/dateUtils'
import { randomFrom, SAVE_MESSAGES } from '../../utils/humor'
import TodoSection from './TodoSection'
import PesquisaSection from './PesquisaSection'
import DevSection from './DevSection'
import NotasSection from './NotasSection'
import ConquistasSection from './ConquistasSection'
import MoodPicker from './MoodPicker'
import DraftStatus from './DraftStatus'
import CapybaraReaction from '../shared/CapybaraReaction'

export default function EditorPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { getEntry, upsertEntry, deleteEntry, createEmptyEntry } = useEntries()
  const { draftStatus, loadExistingDraft, scheduleAutoSave, saveNow, discardDraft } = useDraft(date)
  const showToast = useToast()

  const [entry, setEntry] = useState(() => {
    const draft = loadExistingDraft()
    if (draft) return draft
    const existing = getEntry(date)
    if (existing) return existing
    return createEmptyEntry(date)
  })

  const updateField = useCallback((field, value) => {
    setEntry(prev => {
      const next = { ...prev, [field]: value }
      scheduleAutoSave(next)
      return next
    })
  }, [scheduleAutoSave])

  function handleSave() {
    upsertEntry(entry)
    saveNow(entry)
    discardDraft()
    showToast(randomFrom(SAVE_MESSAGES))
  }

  function handleDelete() {
    if (window.confirm('Tem certeza? Essa ação vai desmatar essa entrada permanentemente 🌳')) {
      deleteEntry(date)
      discardDraft()
      navigate('/')
      showToast('Entrada removida 🗑️')
    }
  }

  function handleBack() {
    if (draftStatus === 'unsaved') {
      if (window.confirm('Rascunho não salvo! Deseja salvar antes de sair?')) {
        handleSave()
      }
    }
    navigate('/')
  }

  // Determine capybara state
  const todosDone = (entry.todos || []).filter(t => t.done).length
  const todosTotal = (entry.todos || []).length
  const allDone = todosTotal > 0 && todosDone === todosTotal
  const hasContent = entry.pesquisa || entry.dev || entry.notas
  const capyState = allDone ? 'happy' : hasContent ? 'working' : 'idle'

  return (
    <div className="space-y-5 pb-20 fade-up">
      {/* Top bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-gray-600 font-semibold mb-1 flex items-center gap-1 transition-colors"
            >
              ← Voltar ao arquivo
            </button>
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              {entry.mood && <span className="text-2xl">{entry.mood}</span>}
              {formatDatePT(date)}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <CapybaraReaction state={capyState} size="sm" showText={false} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-amazonia-500 to-amazonia-600 hover:from-amazonia-600 hover:to-amazonia-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition-all active:scale-95 text-sm"
              >
                💾 Salvar
              </button>
              <button
                onClick={handleDelete}
                className="bg-white border-2 border-red-200 hover:border-red-300 text-red-500 font-semibold px-4 py-2 rounded-xl transition-all text-sm hover:bg-red-50"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Picker */}
      <div className="fade-up fade-up-delay-1">
        <MoodPicker value={entry.mood || ''} onChange={v => updateField('mood', v)} />
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <div className="fade-up fade-up-delay-1">
          <TodoSection todos={entry.todos || []} onChange={v => updateField('todos', v)} />
        </div>
        <div className="fade-up fade-up-delay-2">
          <PesquisaSection value={entry.pesquisa || ''} onChange={v => updateField('pesquisa', v)} />
        </div>
        <div className="fade-up fade-up-delay-3">
          <DevSection value={entry.dev || ''} onChange={v => updateField('dev', v)} />
        </div>
        <div className="fade-up fade-up-delay-4">
          <NotasSection value={entry.notas || ''} onChange={v => updateField('notas', v)} />
        </div>
        <div className="fade-up fade-up-delay-5">
          <ConquistasSection conquistas={entry.conquistas || []} onChange={v => updateField('conquistas', v)} />
        </div>
      </div>

      {/* Draft status bar */}
      <DraftStatus status={draftStatus} onSave={handleSave} />
    </div>
  )
}
