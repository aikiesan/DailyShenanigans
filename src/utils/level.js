import { getEntryScore } from './statsCalculations.js'
import { countExercisesDone, countStretchesDone } from './exercises.js'

// XP: cada ponto de score do diário vale 10, exercício concluído 15,
// alongamento 5. Registrar + treinar todo dia sobe de nível rápido no
// começo e vira maratona no fim — como todo bom RPG.
export const LEVELS = [
  { level: 1, xp: 0, title: 'Broto do Cerrado', icon: '🌱' },
  { level: 2, xp: 150, title: 'Capivara Aprendiz', icon: '🦫' },
  { level: 3, xp: 400, title: 'Explorador da Mata', icon: '🌿' },
  { level: 4, xp: 800, title: 'Cartógrafo Júnior', icon: '🗺️' },
  { level: 5, xp: 1400, title: 'Guardião do Bioma', icon: '🦜' },
  { level: 6, xp: 2200, title: 'Pesquisador de Campo', icon: '🔬' },
  { level: 7, xp: 3200, title: 'Mestre do Pantanal', icon: '🌊' },
  { level: 8, xp: 4500, title: 'Doutor Capivara', icon: '🎓' },
  { level: 9, xp: 6200, title: 'Sábio da Amazônia', icon: '🌳' },
  { level: 10, xp: 8500, title: 'Lenda do Cerrado', icon: '🔥' },
]

export function calculateXP(entries, workouts) {
  const diaryXP = entries.reduce((s, e) => s + getEntryScore(e) * 10, 0)
  const workoutXP = (workouts || []).reduce(
    (s, w) => s + countExercisesDone(w) * 15 + countStretchesDone(w) * 5,
    0
  )
  return diaryXP + workoutXP
}

export function getLevelInfo(entries, workouts) {
  const xp = calculateXP(entries, workouts)
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.xp) current = l
    else break
  }
  const next = LEVELS.find(l => l.xp > xp) || null
  const progress = next
    ? (xp - current.xp) / (next.xp - current.xp)
    : 1
  return { ...current, xp, next, progress, xpToNext: next ? next.xp - xp : 0 }
}
