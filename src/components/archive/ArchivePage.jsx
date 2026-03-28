import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { todayISO, daysAgo, formatDateShort } from '../../utils/dateUtils'
import { calculateStreak } from '../../utils/statsCalculations'
import { getWeeklyDigest } from '../../utils/statsCalculations'
import { getStreakMessage, randomFrom, SAVE_MESSAGES, getTimeGreeting } from '../../utils/humor'
import { useToast } from '../shared/Toast'
import EntryCard from './EntryCard'
import CalendarHeatmap from './CalendarHeatmap'
import EmptyState from '../shared/EmptyState'
import CapybaraReaction from '../shared/CapybaraReaction'
import Confetti from '../shared/Confetti'

const MOOD_OPTIONS = ['😄', '😊', '😐', '😔', '😫']

export default function ArchivePage() {
  const { entries, exportJSON, importJSON, upsertEntry, createEmptyEntry, getEntry } = useEntries()
  const navigate = useNavigate()
  const showToast = useToast()
  const streak = useMemo(() => calculateStreak(entries), [entries])

  const [quickNote, setQuickNote] = useState('')
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [flashbackOpen, setFlashbackOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMood, setFilterMood] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const greeting = useMemo(() => getTimeGreeting(), [])

  const capyState = useMemo(() => {
    if (entries.length === 0) return 'sleepy'
    if (streak >= 7) return 'excited'
    if (streak >= 3) return 'happy'
    return 'idle'
  }, [entries.length, streak])

  const streakMsg = useMemo(() => getStreakMessage(streak), [streak])

  // Confetti on streak milestones
  const prevStreakRef = useRef(streak)
  useEffect(() => {
    if ([7, 30, 100].includes(streak) && prevStreakRef.current !== streak) {
      setShowConfetti(true)
    }
    prevStreakRef.current = streak
  }, [streak])

  // Last 7 days for quick navigation pills
  const recentDays = useMemo(() => {
    const entryDates = new Set(entries.map(e => e.date))
    return Array.from({ length: 7 }, (_, i) => {
      const date = daysAgo(i)
      return {
        date,
        label: i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : formatDateShort(date),
        hasEntry: entryDates.has(date),
      }
    })
  }, [entries])

  // "On this day" flashback entries
  const flashbacks = useMemo(() => {
    return [
      { label: '7 dias atrás', entry: getEntry(daysAgo(7)) },
      { label: '14 dias atrás', entry: getEntry(daysAgo(14)) },
      { label: '1 mês atrás', entry: getEntry(daysAgo(30)) },
      { label: '1 ano atrás', entry: getEntry(daysAgo(365)) },
    ].filter(f => f.entry !== null && f.entry !== undefined)
  }, [entries])

  // Weekly digest
  const weeklyDigest = useMemo(() => getWeeklyDigest(entries), [entries])

  // Search + filter
  const filteredEntries = useMemo(() => {
    let result = entries
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e => {
        const text = [
          e.pesquisa, e.dev, e.notas,
          ...(e.conquistas || []),
          ...(e.todos || []).map(t => t.text),
        ].filter(Boolean).join(' ').toLowerCase()
        return text.includes(q) || e.date.includes(q)
      })
    }
    if (filterMood) {
      result = result.filter(e => e.mood === filterMood)
    }
    return result
  }, [entries, searchQuery, filterMood])

  function handleNewEntry() {
    navigate(`/entry/${todayISO()}`)
  }

  async function handleImport() {
    try {
      const count = await importJSON()
      showToast(`${count} entradas importadas com sucesso! 🛰️`)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function handleExport() {
    exportJSON()
    showToast(randomFrom(SAVE_MESSAGES))
  }

  function handleDatePick(e) {
    const val = e.target.value
    if (val) navigate(`/entry/${val}`)
  }

  function saveQuickNote() {
    const text = quickNote.trim()
    if (!text) return
    const today = todayISO()
    const existing = getEntry(today) || createEmptyEntry(today)
    const updated = {
      ...existing,
      notas: existing.notas ? `${existing.notas}\n${text}` : text,
    }
    upsertEntry(updated)
    setQuickNote('')
    showToast('Nota salva! 📝')
  }

  function handleQuickNoteKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveQuickNote()
    }
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Hero section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CapybaraReaction state={capyState} size="lg" showText={false} />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              {entries.length === 0
                ? 'Boas-vindas ao Daily Shenanigans! 🌱'
                : `${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'} registradas`}
            </h2>
            {/* Time-of-day greeting */}
            <p className="text-sm text-gray-500 mt-1 italic">{greeting}</p>
            {streak > 0 && (
              <div className="mt-2 flex items-center gap-2 justify-center md:justify-start">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-cerrado-600">{streak} dias seguidos!</span>
              </div>
            )}
            {streakMsg && (
              <p className="text-sm text-gray-500 mt-1 italic">{streakMsg}</p>
            )}

            {/* Action buttons + date picker */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={handleNewEntry}
                className="bg-gradient-to-r from-amazonia-500 to-amazonia-600 hover:from-amazonia-600 hover:to-amazonia-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                🌱 Hoje ({todayISO().split('-').reverse().join('/')})
              </button>
              <input
                type="date"
                onChange={handleDatePick}
                max={todayISO()}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-gray-50 cursor-pointer"
                title="Ir para uma data específica"
              />
              <button
                onClick={handleImport}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-gray-50"
              >
                📥 Importar
              </button>
              <button
                onClick={handleExport}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-gray-50"
              >
                📤 Exportar
              </button>
            </div>

            {/* Recent days pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {recentDays.map(({ date, label, hasEntry }) => (
                <button
                  key={date}
                  onClick={() => navigate(`/entry/${date}`)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                    hasEntry
                      ? 'bg-amazonia-50 border-amazonia-300 text-amazonia-700 hover:bg-amazonia-100'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {hasEntry && <span>✓</span>}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick note panel */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            onClick={() => setQuickNoteOpen(o => !o)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>{quickNoteOpen ? '▾' : '▸'}</span>
            <span>Nota rápida</span>
          </button>
          {quickNoteOpen && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                onKeyDown={handleQuickNoteKeyDown}
                placeholder="Adicionar nota de hoje... (Enter para salvar)"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amazonia-400 focus:outline-none bg-white text-sm font-medium placeholder-gray-300 transition-colors"
                autoFocus
              />
              <button
                onClick={saveQuickNote}
                className="bg-amazonia-500 hover:bg-amazonia-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors active:scale-95 shadow-sm"
              >
                Salvar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* "On this day" flashback */}
      {flashbacks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 fade-up">
          <button
            onClick={() => setFlashbackOpen(o => !o)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors w-full text-left"
          >
            <span>{flashbackOpen ? '▾' : '▸'}</span>
            <span>📸 Nessa época...</span>
          </button>
          {flashbackOpen && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {flashbacks.map(({ label, entry: e }) => {
                const todos = e.todos || []
                const done = todos.filter(t => t.done).length
                const preview = (e.pesquisa || e.dev || e.notas || '').slice(0, 70)
                return (
                  <button
                    key={e.date}
                    onClick={() => navigate(`/entry/${e.date}`)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-amazonia-50 border border-gray-100 hover:border-amazonia-200 transition-all text-left"
                  >
                    <div className="flex-shrink-0 text-center min-w-[56px]">
                      <div className="text-xs font-bold text-gray-400 uppercase leading-tight">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatDateShort(e.date)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {e.mood && <span className="text-base">{e.mood}</span>}
                        {todos.length > 0 && (
                          <span className="text-xs text-gray-400">{done}/{todos.length} ✓</span>
                        )}
                      </div>
                      {preview ? (
                        <p className="text-xs text-gray-500 truncate">{preview}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Sem texto registrado</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Weekly digest */}
      {weeklyDigest.entryCount > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 fade-up">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📅 Essa semana</h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-amazonia-50 text-amazonia-700 border border-amazonia-200 px-3 py-1.5 rounded-full text-sm font-semibold">
              {weeklyDigest.entryCount} dia{weeklyDigest.entryCount !== 1 ? 's' : ''} 📅
            </span>
            {weeklyDigest.todosCreated > 0 && (
              <span className="bg-cerrado-50 text-cerrado-700 border border-cerrado-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                {weeklyDigest.todosDone}/{weeklyDigest.todosCreated} tarefas ✅
              </span>
            )}
            {weeklyDigest.conquistas > 0 && (
              <span className="bg-pantanal-50 text-pantanal-700 border border-pantanal-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                {weeklyDigest.conquistas} conquista{weeklyDigest.conquistas !== 1 ? 's' : ''} ⭐
              </span>
            )}
            {weeklyDigest.topMood && (
              <span className="bg-pampa-50 text-pampa-700 border border-pampa-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                humor: {weeklyDigest.topMood}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Heatmap */}
      {entries.length > 0 && (
        <div className="fade-up fade-up-delay-1">
          <CalendarHeatmap />
        </div>
      )}

      {/* Entries: search + grid */}
      {entries.length === 0 ? (
        <EmptyState section="archive" />
      ) : (
        <div className="fade-up fade-up-delay-2">
          {/* Search bar + mood filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar em todas as entradas..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amazonia-400 focus:outline-none bg-white text-sm font-medium placeholder-gray-300 transition-colors"
              />
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setFilterMood(filterMood === mood ? null : mood)}
                  className={`w-10 h-10 rounded-xl text-lg transition-all border-2 ${
                    filterMood === mood
                      ? 'bg-amazonia-100 border-amazonia-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  title={`Filtrar por ${mood}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>📋</span> Suas Entradas
            {(searchQuery || filterMood) && (
              <span className="text-sm font-normal text-gray-400">
                ({filteredEntries.length} resultado{filteredEntries.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>

          {filteredEntries.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              Nenhuma entrada encontrada para essa busca 🔍
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map(entry => (
                <EntryCard key={entry.date} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  )
}
