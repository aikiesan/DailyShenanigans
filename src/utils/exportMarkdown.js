import { formatDatePT, getMonthLabel } from './dateUtils'
import { entryText } from './entryText'
import { ALL_EXERCISES, STRETCHES, TOTAL_EXERCISES, isExerciseDone } from './exercises'

/**
 * Builds a single chronological Markdown document with ALL data
 * (diary, todos, conquistas, mood, workouts) — the goal is a backlog
 * that's trivially readable by a human or an LLM to reconstruct the
 * timeline of activities and achievements per week/month/year.
 */
export function buildMarkdownExport(entries, workouts) {
  const entryByDate = new Map(entries.map(e => [e.date, e]))
  const workoutByDate = new Map((workouts || []).map(w => [w.date, w]))
  const allDates = [...new Set([...entryByDate.keys(), ...workoutByDate.keys()])].sort()

  const lines = []
  lines.push('# Daily Shenanigans — Backlog completo')
  lines.push('')
  lines.push(`> Exportado em ${formatDatePT(toISO(new Date()))}. ${entries.length} entradas de diário, ${(workouts || []).length} dias de treino.`)
  lines.push('> Estrutura: ano → mês → dia (ordem cronológica). Cada dia traz diário, tarefas, conquistas, humor e treino.')
  lines.push('')

  let currentYear = ''
  let currentMonth = ''

  for (const date of allDates) {
    const [year] = date.split('-')
    const yearMonth = date.slice(0, 7)

    if (year !== currentYear) {
      currentYear = year
      lines.push(`# ${year}`)
      lines.push('')
    }
    if (yearMonth !== currentMonth) {
      currentMonth = yearMonth
      lines.push(`## ${getMonthLabel(yearMonth)}`)
      lines.push('')
    }

    const entry = entryByDate.get(date)
    const workout = workoutByDate.get(date)

    const mood = entry?.mood ? ` — humor: ${entry.mood}` : ''
    lines.push(`### ${formatDatePT(date)}${mood}`)
    lines.push('')

    if (entry) {
      const text = entryText(entry).trim()
      if (text) {
        lines.push('**Diário:**')
        lines.push('')
        lines.push(text)
        lines.push('')
      }

      const todos = entry.todos || []
      if (todos.length > 0) {
        const done = todos.filter(t => t.done).length
        lines.push(`**Tarefas (${done}/${todos.length}):**`)
        todos.forEach(t => lines.push(`- [${t.done ? 'x' : ' '}] ${t.text}`))
        lines.push('')
      }

      const conquistas = entry.conquistas || []
      if (conquistas.length > 0) {
        lines.push('**Conquistas:**')
        conquistas.forEach(c => lines.push(`- ⭐ ${c}`))
        lines.push('')
      }
    }

    if (workout) {
      const doneNames = ALL_EXERCISES.filter(ex => isExerciseDone(workout, ex)).map(ex => ex.name)
      const partial = ALL_EXERCISES
        .filter(ex => !isExerciseDone(workout, ex) && (workout.exercises?.[ex.id]?.sets || 0) > 0)
        .map(ex => `${ex.name} (${workout.exercises[ex.id].sets}/${ex.targetSets})`)
      const stretchNames = STRETCHES.filter(s => workout.stretches?.[s.id]).map(s => s.name)
      const metrics = []
      if (parseFloat(workout.weight) > 0) metrics.push(`peso ${workout.weight} kg`)
      if (workout.wellness >= 1) metrics.push(`bem-estar/lombar ${workout.wellness}/5`)

      if (doneNames.length || partial.length || stretchNames.length || metrics.length || workout.notes) {
        lines.push(`**Treino (${doneNames.length}/${TOTAL_EXERCISES} exercícios${metrics.length ? ' · ' + metrics.join(' · ') : ''}):**`)
        if (doneNames.length) lines.push(`- Concluídos: ${doneNames.join(', ')}`)
        if (partial.length) lines.push(`- Parciais: ${partial.join(', ')}`)
        if (stretchNames.length) lines.push(`- Alongamentos: ${stretchNames.join(', ')}`)
        if (workout.notes?.trim()) lines.push(`- Nota do corpo: ${workout.notes.trim()}`)
        lines.push('')
      }
    }
  }

  return lines.join('\n')
}

export function downloadMarkdownExport(entries, workouts) {
  const md = buildMarkdownExport(entries, workouts)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daily-shenanigans-backlog-${toISO(new Date())}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
