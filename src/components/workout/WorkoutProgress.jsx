import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWorkouts } from '../../hooks/useWorkouts'
import { TOTAL_EXERCISES, STRETCHES, countExercisesDone, countStretchesDone } from '../../utils/exercises'
import { daysAgo, formatDateShort, todayISO } from '../../utils/dateUtils'

const PERIODS = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
]

export default function WorkoutProgress() {
  const { workouts } = useWorkouts()
  const [period, setPeriod] = useState(30)

  const data = useMemo(() => {
    const cutoff = daysAgo(period - 1)
    const inPeriod = workouts
      .filter(w => w.date >= cutoff && w.date <= todayISO())
      .sort((a, b) => a.date.localeCompare(b.date))

    const daily = inPeriod.map(w => ({
      date: w.date,
      label: formatDateShort(w.date),
      done: countExercisesDone(w),
      stretches: countStretchesDone(w),
      completion: Math.round((countExercisesDone(w) / TOTAL_EXERCISES) * 100),
      weight: parseFloat(w.weight) > 0 ? parseFloat(w.weight) : null,
      wellness: w.wellness >= 1 ? w.wellness : null,
    }))

    const activeDays = daily.filter(d => d.done > 0 || d.stretches > 0)
    const avgCompletion = activeDays.length
      ? Math.round(activeDays.reduce((s, d) => s + d.completion, 0) / activeDays.length)
      : 0

    // Current streak of consecutive days with any exercise/stretch done
    const activeDates = new Set(activeDays.map(d => d.date))
    let streak = 0
    let d = todayISO()
    if (!activeDates.has(d)) d = daysAgo(1) // today not trained yet doesn't break the streak
    while (activeDates.has(d)) {
      streak++
      const [y, m, dd] = d.split('-').map(Number)
      const prev = new Date(y, m - 1, dd - 1)
      d = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`
    }

    const weightData = daily.filter(d => d.weight != null)
    const wellnessData = daily.filter(d => d.wellness != null)

    return { daily, activeDays: activeDays.length, avgCompletion, streak, weightData, wellnessData }
  }, [workouts, period])

  const hasAny = workouts.length > 0

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="grid grid-cols-3 gap-2">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`py-2 rounded-xl text-sm font-bold transition-all ${
              period === p.days ? 'bg-amazonia-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!hasAny ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🏋️</div>
          <p className="text-gray-500 font-semibold">Nenhum treino registrado ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Complete seu primeiro exercício na aba "Treino do dia" e os gráficos aparecem aqui.</p>
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Dias ativos', value: data.activeDays, icon: '📅' },
              { label: 'Conclusão média', value: `${data.avgCompletion}%`, icon: '🎯' },
              { label: 'Sequência', value: `${data.streak}d`, icon: '🔥' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="text-2xl font-extrabold text-gray-800 mt-1">{s.value}</div>
                <div className="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Completion per day */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">🎯 Exercícios concluídos por dia</h3>
            {data.daily.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sem registros no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, TOTAL_EXERCISES]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={24} allowDecimals={false} />
                  <Tooltip formatter={(v, name) => [v, name === 'done' ? 'exercícios' : name]} labelStyle={{ fontWeight: 700 }} />
                  <Bar dataKey="done" fill="#43a047" radius={[4, 4, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weight trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">⚖️ Peso (kg)</h3>
            {data.weightData.length < 2 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Registre seu peso em pelo menos 2 dias para ver a tendência.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip formatter={v => [`${v} kg`, 'peso']} labelStyle={{ fontWeight: 700 }} />
                  <Line type="monotone" dataKey="weight" stroke="#1e88e5" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Wellness trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">🩺 Bem-estar / lombar (1–5)</h3>
            {data.wellnessData.length < 2 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Marque como o corpo está em pelo menos 2 dias para ver a evolução.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.wellnessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip formatter={v => [v, 'bem-estar']} labelStyle={{ fontWeight: 700 }} />
                  <Line type="monotone" dataKey="wellness" stroke="#f0b429" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}
