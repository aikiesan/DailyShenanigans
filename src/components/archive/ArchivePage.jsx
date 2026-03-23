import { useNavigate } from 'react-router-dom'
import { useEntries } from '../../hooks/useEntries'
import { todayISO } from '../../utils/dateUtils'
import { calculateStreak } from '../../utils/statsCalculations'
import { getStreakMessage, randomFrom, SAVE_MESSAGES } from '../../utils/humor'
import { useToast } from '../shared/Toast'
import EntryCard from './EntryCard'
import CalendarHeatmap from './CalendarHeatmap'
import EmptyState from '../shared/EmptyState'
import CapybaraReaction from '../shared/CapybaraReaction'
import { useMemo } from 'react'

export default function ArchivePage() {
  const { entries, exportJSON, importJSON } = useEntries()
  const navigate = useNavigate()
  const showToast = useToast()
  const streak = useMemo(() => calculateStreak(entries), [entries])

  const capyState = useMemo(() => {
    if (entries.length === 0) return 'sleepy'
    if (streak >= 7) return 'excited'
    if (streak >= 3) return 'happy'
    return 'idle'
  }, [entries.length, streak])

  const streakMsg = useMemo(() => getStreakMessage(streak), [streak])

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
            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={handleNewEntry}
                className="bg-gradient-to-r from-amazonia-500 to-amazonia-600 hover:from-amazonia-600 hover:to-amazonia-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                🌱 Hoje ({todayISO().split('-').reverse().join('/')})
              </button>
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
          </div>
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
