import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { daysAgo, todayISO, getDayOfWeekShort, getDayNumber } from '../../utils/dateUtils'
import { entryText } from '../../utils/entryText'
import { countExercisesDone } from '../../utils/exercises'

/**
 * "Dia Completo" tracker: a day counts as complete when the diary was
 * written AND at least one exercise was done. Shows the last 7 days
 * and the current complete-day streak — the habit loop in one glance.
 */
export default function WeekTracker({ entries, workouts }) {
  const navigate = useNavigate()

  const { days, streak } = useMemo(() => {
    const entryByDate = new Map(entries.map(e => [e.date, e]))
    const workoutByDate = new Map((workouts || []).map(w => [w.date, w]))

    const statusOf = (date) => {
      const entry = entryByDate.get(date)
      const workout = workoutByDate.get(date)
      const diary = !!entry && entryText(entry).trim().length > 10
      const treino = !!workout && countExercisesDone(workout) > 0
      return { diary, treino, full: diary && treino }
    }

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = daysAgo(6 - i)
      return { date, ...statusOf(date), isToday: date === todayISO() }
    })

    // Streak of consecutive complete days (an incomplete *today* doesn't break it)
    let streak = 0
    let i = 0
    if (!statusOf(todayISO()).full) i = 1
    while (statusOf(daysAgo(i)).full) {
      streak++
      i++
    }

    return { days, streak }
  }, [entries, workouts])

  const today = days[6]
  const nudge = today.full
    ? `⭐ Dia completo! ${streak > 1 ? `${streak} dias completos seguidos.` : 'Que venha o próximo.'}`
    : !today.diary && !today.treino
      ? 'Escreva o diário e faça o treino para fechar o dia com ⭐'
      : today.diary
        ? 'Diário feito ✍️ — falta o treino para fechar o dia 💪'
        : 'Treino feito 💪 — falta o diário para fechar o dia ✍️'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">⭐ Dias completos</h3>
        {streak > 0 && (
          <span className="text-xs font-bold text-cerrado-600 bg-cerrado-50 border border-cerrado-200 px-2.5 py-1 rounded-full">
            🔥 {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map(d => (
          <button
            key={d.date}
            onClick={() => navigate(`/entry/${d.date}`)}
            className="flex flex-col items-center gap-1 group"
            title={`${d.date} — ${d.full ? 'dia completo' : d.diary ? 'só diário' : d.treino ? 'só treino' : 'vazio'}`}
          >
            <span className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-amazonia-600' : 'text-gray-400'}`}>
              {getDayOfWeekShort(d.date)}
            </span>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all group-active:scale-90 ${
                d.full
                  ? 'bg-gradient-to-br from-amazonia-400 to-amazonia-600 border-amazonia-500 text-white shadow-sm'
                  : d.diary
                    ? 'bg-amazonia-50 border-amazonia-300'
                    : d.treino
                      ? 'bg-cerrado-50 border-cerrado-300'
                      : 'bg-gray-50 border-dashed border-gray-200'
              } ${d.isToday ? 'ring-2 ring-amazonia-300 ring-offset-2' : ''}`}
            >
              {d.full ? '⭐' : d.diary ? '✍️' : d.treino ? '💪' : ''}
            </span>
            <span className={`text-[10px] font-semibold ${d.isToday ? 'text-amazonia-600' : 'text-gray-300'}`}>
              {getDayNumber(d.date)}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 font-medium mt-3 text-center">{nudge}</p>
    </div>
  )
}
