import { useState } from 'react'
import { useWorkouts } from '../../hooks/useWorkouts'
import { createEmptyWorkout } from '../../utils/workoutStorage'
import { WORKOUT_CATEGORIES, STRETCHES, TOTAL_EXERCISES, countExercisesDone, countStretchesDone, isExerciseDone } from '../../utils/exercises'
import { todayISO, formatDatePT } from '../../utils/dateUtils'
import ExerciseIllustration from './ExerciseIllustration'
import WorkoutProgress from './WorkoutProgress'

const WELLNESS_LEVELS = [
  { value: 1, emoji: '😫', label: 'Dor forte' },
  { value: 2, emoji: '😣', label: 'Incomodado' },
  { value: 3, emoji: '😐', label: 'Neutro' },
  { value: 4, emoji: '🙂', label: 'Bem' },
  { value: 5, emoji: '💪', label: 'Ótimo' },
]

const CATEGORY_STYLES = {
  core: { border: 'border-atlantica-200', header: 'from-atlantica-500 to-atlantica-600', bg: 'bg-atlantica-50', accent: 'text-atlantica-600' },
  upper: { border: 'border-amazonia-200', header: 'from-amazonia-500 to-amazonia-600', bg: 'bg-amazonia-50', accent: 'text-amazonia-600' },
  lower: { border: 'border-cerrado-200', header: 'from-cerrado-500 to-cerrado-600', bg: 'bg-cerrado-50', accent: 'text-cerrado-600' },
  cardio: { border: 'border-caatinga-200', header: 'from-caatinga-500 to-caatinga-600', bg: 'bg-caatinga-50', accent: 'text-caatinga-600' },
}

function shiftDate(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function WorkoutPage() {
  const { getWorkout, updateWorkout, status } = useWorkouts()
  const [date, setDate] = useState(todayISO())
  const [tab, setTab] = useState('treino')

  const workout = getWorkout(date) || createEmptyWorkout(date)
  const isToday = date === todayISO()

  const exercisesDone = countExercisesDone(workout)
  const stretchesDone = countStretchesDone(workout)

  function tapExercise(exercise) {
    updateWorkout(date, prev => {
      const current = prev.exercises?.[exercise.id]?.sets || 0
      const nextSets = current >= exercise.targetSets ? 0 : current + 1
      return {
        exercises: {
          ...prev.exercises,
          [exercise.id]: { sets: nextSets, done: nextSets >= exercise.targetSets },
        },
      }
    })
  }

  function toggleStretch(id) {
    updateWorkout(date, prev => ({
      stretches: { ...prev.stretches, [id]: !prev.stretches?.[id] },
    }))
  }

  return (
    <div className="space-y-5 pb-20 fade-up">
      {/* Header: date navigation + summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setDate(d => shiftDate(d, -1))}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg transition-colors flex-shrink-0"
            aria-label="Dia anterior"
          >
            ‹
          </button>
          <div className="text-center min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-800 truncate">
              💪 {formatDatePT(date)}
            </h2>
            {!isToday && (
              <button onClick={() => setDate(todayISO())} className="text-xs font-bold text-amazonia-600 hover:text-amazonia-700">
                ← voltar para hoje
              </button>
            )}
            {isToday && (
              <p className="text-xs text-gray-400 font-medium">
                {status === 'saving' ? 'salvando…' : status === 'error' ? '⚠️ erro ao sincronizar' : status === 'synced' ? '✓ sincronizado' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setDate(d => shiftDate(d, 1))}
            disabled={isToday}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg transition-colors disabled:opacity-30 flex-shrink-0"
            aria-label="Próximo dia"
          >
            ›
          </button>
        </div>

        {/* Progress summary bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amazonia-400 to-amazonia-600 rounded-full transition-all duration-500"
              style={{ width: `${(exercisesDone / TOTAL_EXERCISES) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-600 flex-shrink-0">
            {exercisesDone}/{TOTAL_EXERCISES} exercícios
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { id: 'treino', label: '🏋️ Treino do dia' },
            { id: 'progresso', label: '📈 Progresso' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-amazonia-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'progresso' ? (
        <WorkoutProgress />
      ) : (
        <>
          {/* Daily metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 fade-up fade-up-delay-1">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">📋 Métricas do dia</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-40">
                <label className="text-xs font-bold text-gray-400 block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  placeholder="ex: 78.5"
                  value={workout.weight}
                  onChange={e => updateWorkout(date, { weight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amazonia-400 focus:outline-none text-sm font-semibold"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 block mb-1">Como está o corpo / lombar hoje?</label>
                <div className="flex gap-1.5">
                  {WELLNESS_LEVELS.map(l => (
                    <button
                      key={l.value}
                      onClick={() => updateWorkout(date, { wellness: workout.wellness === l.value ? 0 : l.value })}
                      title={l.label}
                      className={`flex-1 py-2 rounded-xl text-xl transition-all border-2 ${
                        workout.wellness === l.value
                          ? 'border-amazonia-400 bg-amazonia-50 scale-105'
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {l.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Nota rápida (ex: lombar rígida de manhã, melhorou depois do alongamento)"
                value={workout.notes}
                onChange={e => updateWorkout(date, { notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amazonia-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Exercise checklist by category */}
          {WORKOUT_CATEGORIES.map((cat, i) => {
            const style = CATEGORY_STYLES[cat.id]
            return (
              <div key={cat.id} className={`rounded-2xl overflow-hidden shadow-sm border-2 ${style.border} fade-up fade-up-delay-${Math.min(i + 2, 5)}`}>
                <div className={`bg-gradient-to-r ${style.header} px-5 py-3 flex items-center gap-2`}>
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="text-white font-bold text-base">{cat.label}</h3>
                  {cat.priority && (
                    <span className="ml-auto text-xs font-bold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                      prioridade L5-S1
                    </span>
                  )}
                </div>
                <div className={`${style.bg} p-3 space-y-2`}>
                  {cat.exercises.map(ex => {
                    const state = workout.exercises?.[ex.id]
                    const sets = state?.sets || 0
                    const done = isExerciseDone(workout, ex)
                    return (
                      <button
                        key={ex.id}
                        onClick={() => tapExercise(ex)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                          done
                            ? 'bg-amazonia-50 border-amazonia-300'
                            : 'bg-white border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-20 flex-shrink-0 ${done ? 'text-amazonia-500' : style.accent}`}>
                          <ExerciseIllustration id={ex.id} className="w-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-sm ${done ? 'text-amazonia-700' : 'text-gray-700'}`}>
                            {ex.name}
                          </div>
                          <div className="text-xs font-semibold text-gray-400">{ex.targetLabel}</div>
                          {ex.tip && <div className="text-xs text-gray-400 mt-0.5 leading-snug">{ex.tip}</div>}
                          {ex.warning && (
                            <div className="text-xs font-bold text-red-500 mt-1 leading-snug">{ex.warning}</div>
                          )}
                        </div>
                        <div
                          className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-sm border-2 transition-all ${
                            done
                              ? 'bg-amazonia-500 border-amazonia-500 text-white'
                              : sets > 0
                                ? 'bg-cerrado-50 border-cerrado-400 text-cerrado-600'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                        >
                          {done ? '✓' : `${sets}/${ex.targetSets}`}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Stretching reminder */}
          <div className="rounded-2xl overflow-hidden shadow-sm border-2 border-pantanal-200 fade-up fade-up-delay-5">
            <div className="bg-gradient-to-r from-pantanal-500 to-pantanal-600 px-5 py-3 flex items-center gap-2">
              <span className="text-lg">🧘</span>
              <h3 className="text-white font-bold text-base">Alongamentos</h3>
              <span className="ml-auto text-xs font-bold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                {stretchesDone}/{STRETCHES.length}
              </span>
            </div>
            <div className="bg-pantanal-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STRETCHES.map(s => {
                const checked = !!workout.stretches?.[s.id]
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStretch(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                      checked ? 'bg-amazonia-50 border-amazonia-300' : 'bg-white border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-16 flex-shrink-0 ${checked ? 'text-amazonia-500' : 'text-pantanal-500'}`}>
                      <ExerciseIllustration id={s.id} className="w-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${checked ? 'text-amazonia-700' : 'text-gray-700'}`}>{s.name}</div>
                      <div className="text-xs font-semibold text-gray-400">{s.targetLabel}</div>
                    </div>
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 ${
                      checked ? 'bg-amazonia-500 border-amazonia-500 text-white' : 'bg-gray-50 border-gray-200 text-transparent'
                    }`}>
                      ✓
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-medium px-4">
            Toque em um exercício para marcar uma série. Ao completar todas, ele fica verde ✓ (toque de novo para zerar).
          </p>
        </>
      )}
    </div>
  )
}
