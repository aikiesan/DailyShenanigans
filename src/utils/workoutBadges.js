import { WORKOUT_CATEGORIES, STRETCHES, TOTAL_EXERCISES, countExercisesDone, countStretchesDone, isExerciseDone } from './exercises'
import { entryText } from './entryText'

const CORE_EXERCISES = WORKOUT_CATEGORIES.find(c => c.id === 'core').exercises

function activeDates(workouts) {
  return new Set(workouts.filter(w => countExercisesDone(w) > 0).map(w => w.date))
}

function longestConsecutive(dateSet) {
  const sorted = [...dateSet].sort()
  let best = 0
  let current = 0
  let prev = null
  for (const d of sorted) {
    if (prev && dayDiff(prev, d) === 1) current++
    else current = 1
    best = Math.max(best, current)
    prev = d
  }
  return best
}

function dayDiff(a, b) {
  return Math.round((toDate(b) - toDate(a)) / 86400000)
}

function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const WORKOUT_BADGES = [
  { id: 'primeiro_suor', icon: '💦', name: 'Primeiro Suor', desc: 'Concluiu o primeiro exercício', check: (w) => w.some(x => countExercisesDone(x) > 0) },
  { id: 'treino_cheio', icon: '🏋️', name: 'Treino Cheio', desc: `Todos os ${TOTAL_EXERCISES} exercícios em um dia`, check: (w) => w.some(x => countExercisesDone(x) === TOTAL_EXERCISES) },
  { id: 'zen_alongamento', icon: '🧘', name: 'Zen do Alongamento', desc: `Os ${STRETCHES.length} alongamentos em um dia`, check: (w) => w.some(x => countStretchesDone(x) === STRETCHES.length) },
  { id: 'core_de_pedra', icon: '🪨', name: 'Core de Pedra', desc: 'Bloco Core & Coluna completo em um dia', check: (w) => w.some(x => CORE_EXERCISES.every(ex => isExerciseDone(x, ex))) },
  { id: 'semana_em_movimento', icon: '📆', name: 'Semana em Movimento', desc: '7 dias seguidos de treino', check: (w) => longestConsecutive(activeDates(w)) >= 7 },
  { id: 'dez_na_conta', icon: '✊', name: 'Dez na Conta', desc: '10 dias de treino no total', check: (w) => activeDates(w).size >= 10 },
  { id: 'mes_de_ferro', icon: '🛡️', name: 'Mês de Ferro', desc: '30 dias de treino no total', check: (w) => activeDates(w).size >= 30 },
  { id: 'lombar_agradece', icon: '🦴', name: 'A Lombar Agradece', desc: '7 dias seguidos com bem-estar ≥ 4', check: (w) => {
    const good = new Set(w.filter(x => x.wellness >= 4).map(x => x.date))
    return longestConsecutive(good) >= 7
  } },
  { id: 'semana_estrelada', icon: '🌟', name: 'Semana Estrelada', desc: '7 dias completos seguidos (diário + treino)', check: (w, entries) => {
    const treino = activeDates(w)
    const diario = new Set(entries.filter(e => entryText(e).trim().length > 10).map(e => e.date))
    const full = new Set([...treino].filter(d => diario.has(d)))
    return longestConsecutive(full) >= 7
  } },
]

export function getUnlockedWorkoutBadges(workouts, entries) {
  return WORKOUT_BADGES.filter(b => {
    try {
      return b.check(workouts || [], entries || [])
    } catch {
      return false
    }
  })
}
