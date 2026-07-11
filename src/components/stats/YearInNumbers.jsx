import { useMemo } from 'react'
import { entryText } from '../../utils/entryText'
import { countExercisesDone } from '../../utils/exercises'
import { calculateLongestStreak } from '../../utils/statsCalculations'
import { todayISO } from '../../utils/dateUtils'

/** Research output of the current year, in numbers that motivate. */
export default function YearInNumbers({ entries, workouts }) {
  const stats = useMemo(() => {
    const year = todayISO().slice(0, 4)
    const yearEntries = entries.filter(e => e.date.startsWith(year))
    const yearWorkouts = (workouts || []).filter(w => w.date.startsWith(year))

    const words = yearEntries.reduce((sum, e) => {
      const t = entryText(e).trim()
      return sum + (t ? t.split(/\s+/).length : 0)
    }, 0)

    const now = new Date()
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
    const daysLogged = yearEntries.length
    const coverage = Math.round((daysLogged / dayOfYear) * 100)
    const treinos = yearWorkouts.filter(w => countExercisesDone(w) > 0).length
    const longestStreak = calculateLongestStreak(yearEntries)
    const thesisPages = Math.round(words / 250) // ~250 palavras por página

    return { year, words, daysLogged, coverage, treinos, longestStreak, thesisPages }
  }, [entries, workouts])

  if (stats.daysLogged === 0) return null

  const tiles = [
    { icon: '✍️', value: stats.words.toLocaleString('pt-BR'), label: 'palavras escritas' },
    { icon: '📅', value: `${stats.daysLogged}`, label: `dias registrados (${stats.coverage}% do ano)` },
    { icon: '💪', value: `${stats.treinos}`, label: stats.treinos === 1 ? 'treino ativo' : 'treinos ativos' },
    { icon: '🔥', value: `${stats.longestStreak}`, label: 'maior sequência (dias)' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
        <span>🗓️</span> {stats.year} em números
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xl">{t.icon}</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-1">{t.value}</div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5 leading-tight">{t.label}</div>
          </div>
        ))}
      </div>
      {stats.thesisPages > 0 && (
        <p className="text-xs text-gray-400 italic mt-3 text-center">
          Isso equivale a ~{stats.thesisPages} página{stats.thesisPages !== 1 ? 's' : ''} de tese. O memorial do pós-doc agradece. 🎓
        </p>
      )}
    </div>
  )
}
