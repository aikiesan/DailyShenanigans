import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { useDraft } from '../../hooks/useDraft'
import { useToast } from '../shared/Toast'
import { formatDatePT, daysAgo } from '../../utils/dateUtils'
import { randomFrom, SAVE_MESSAGES, getDailyPrompt } from '../../utils/humor'
import TodoSection from './TodoSection'
import PesquisaSection from './PesquisaSection'
import DevSection from './DevSection'
import NotasSection from './NotasSection'
import ConquistasSection from './ConquistasSection'
import MoodPicker from './MoodPicker'
import DraftStatus from './DraftStatus'
import CapybaraReaction from '../shared/CapybaraReaction'
import Confetti from '../shared/Confetti'

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
  const [promptDismissed, setPromptDismissed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const updateField = useCallback((field, value) => {
    setEntry(prev => {
      const next = { ...prev, [field]: value }
      scheduleAutoSave(next)
      return next
    })
  }, [scheduleAutoSave])

  const handleSave = useCallback(() => {
    setEntry(current => {
      upsertEntry(current)
      saveNow(current)
      discardDraft()
      return current
    })
    showToast(randomFrom(SAVE_MESSAGES))
  }, [upsertEntry, saveNow, discardDraft, showToast])

  const handleBack = useCallback(() => {
    if (draftStatus === 'unsaved') {
      if (window.confirm('Rascunho não salvo! Deseja salvar antes de sair?')) {
        handleSave()
      }
    }
    navigate('/')
  }, [draftStatus, handleSave, navigate])

  function handleDelete() {
    if (window.confirm('Tem certeza? Essa ação vai desmatar essa entrada permanentemente 🌳')) {
      deleteEntry(date)
      discardDraft()
      navigate('/')
      showToast('Entrada removida 🗑️')
    }
  }

  // Keyboard shortcuts: Ctrl+S / Cmd+S to save, Escape to go back
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }
      if (e.key === 'Escape') {
        const tag = document.activeElement?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          handleBack()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave, handleBack])

  const carryForwardTodos = useCallback(() => {
    setEntry(current => {
      const existingTexts = new Set((current.todos || []).map(t => t.text))
      const carried = []
      for (let i = 1; i <= 7; i++) {
        const pastEntry = getEntry(daysAgo(i))
        if (!pastEntry) continue
        const incomplete = (pastEntry.todos || []).filter(t => !t.done)
        for (const t of incomplete) {
          if (!existingTexts.has(t.text)) {
            existingTexts.add(t.text)
            carried.push({ text: t.text, done: false })
          }
        }
        if (carried.length > 0) break
      }
      if (carried.length > 0) {
        const next = { ...current, todos: [...(current.todos || []), ...carried] }
        scheduleAutoSave(next)
        showToast(`${carried.length} tarefa${carried.length > 1 ? 's' : ''} trazida${carried.length > 1 ? 's' : ''} 📋`)
        return next
      }
      showToast('Nenhuma tarefa incompleta encontrada nos últimos 7 dias')
      return current
    })
  }, [getEntry, scheduleAutoSave, showToast])

  // Confetti when all todos completed (≥3)
  const prevAllDoneRef = useRef(false)
  const todosDone = (entry.todos || []).filter(t => t.done).length
  const todosTotal = (entry.todos || []).length
  const allDone = todosTotal > 0 && todosDone === todosTotal

  useEffect(() => {
    if (allDone && todosTotal >= 3 && !prevAllDoneRef.current) {
      setShowConfetti(true)
    }
    prevAllDoneRef.current = allDone && todosTotal >= 3
  }, [allDone, todosTotal])

  // Completeness ring: 1 point per section filled
  const completeness = [
    !!entry.mood,
    (entry.todos || []).length > 0,
    (entry.pesquisa || '').length > 10,
    (entry.dev || '').length > 10,
    (entry.notas || '').length > 10,
    (entry.conquistas || []).length > 0,
  ].filter(Boolean).length

  const circumference = 119
  const ringColor = completeness === 0 ? '#e5e7eb' : completeness <= 2 ? '#f0b429' : completeness <= 4 ? '#66bb6a' : '#689f38'
  const ringOffset = circumference * (1 - completeness / 6)

  // Daily prompt (hidden once user starts writing)
  const dailyPrompt = getDailyPrompt(date)
  const showPrompt = !promptDismissed && !(entry.pesquisa || '').trim() && !(entry.notas || '').trim()

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
            {/* Completeness ring */}
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg width="48" height="48" className="absolute inset-0">
                <circle cx="24" cy="24" r="19" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="19" fill="none"
                  stroke={ringColor} strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
                />
              </svg>
              <span className="text-xs font-bold" style={{ color: ringColor }}>
                {completeness}/6
              </span>
            </div>
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

      {/* Daily prompt banner — hidden once user starts writing */}
      {showPrompt && (
        <div className="bg-cerrado-50 border border-cerrado-200 rounded-xl px-4 py-3 flex items-start gap-3 fade-up">
          <span className="text-lg flex-shrink-0">💬</span>
          <div className="flex-1">
            <span className="text-xs font-bold text-cerrado-600 uppercase tracking-wide block mb-0.5">Prompt do dia</span>
            <p className="text-sm italic text-cerrado-700">{dailyPrompt}</p>
          </div>
          <button
            onClick={() => setPromptDismissed(true)}
            className="text-cerrado-400 hover:text-cerrado-600 transition-colors text-sm flex-shrink-0 mt-0.5"
            aria-label="Fechar prompt"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mood Picker */}
      <div className="fade-up fade-up-delay-1">
        <MoodPicker value={entry.mood || ''} onChange={v => updateField('mood', v)} />
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <div className="fade-up fade-up-delay-1">
          <TodoSection
            todos={entry.todos || []}
            onChange={v => updateField('todos', v)}
            onCarryForward={carryForwardTodos}
          />
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

      {/* Confetti when all todos done */}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  )
}
