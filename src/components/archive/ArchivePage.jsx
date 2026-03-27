import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useEntries } from '../../hooks/useEntries'
import { todayISO, daysAgo, formatDateShort } from '../../utils/dateUtils'
import { calculateStreak } from '../../utils/statsCalculations'
import { getStreakMessage, randomFrom, SAVE_MESSAGES } from '../../utils/humor'
import { useToast } from '../shared/Toast'
import EntryCard from './EntryCard'
import CalendarHeatmap from './CalendarHeatmap'
import EmptyState from '../shared/EmptyState'
import CapybaraReaction from '../shared/CapybaraReaction'

export default function ArchivePage() {
  const { entries, exportJSON, importJSON, upsertEntry, createEmptyEntry, getEntry } = useEntries()
  const navigate = useNavigate()
  const showToast = useToast()
  const streak = useMemo(() => calculateStreak(entries), [entries])

  const [quickNote, setQuickNote] = useState('')
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)

  const capyState = useMemo(() => {
    if (entries.length === 0) return 'sleepy'
    if (streak >= 7) return 'excited'
    if (streak >= 3) return 'happy'
    return 'idle'
  }, [entries.length, streak])

  const streakMsg = useMemo(() => getStreakMessage(streak), [streak])

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

      {/* Heatmap */}
      {entries.length > 0 && (
        <div className="fade-up fade-up-delay-1">
          <CalendarHeatmap />
        </div>
      )}

      {/* Entries grid */}
      {entries.length === 0 ? (
        <EmptyState section="archive" />
      ) : (
        <div className="fade-up fade-up-delay-2">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>📋</span> Suas Entradas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(entry => (
              <EntryCard key={entry.date} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
