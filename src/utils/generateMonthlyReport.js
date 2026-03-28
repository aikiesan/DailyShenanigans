import { getMonthLastDay, getMonthLabel, MESES } from './dateUtils'
import { getTodoStats, getMoodData, getWordCloud, calculateLongestStreak } from './statsCalculations'

export function getMonthBounds(yearMonth) {
  return {
    start: `${yearMonth}-01`,
    end: getMonthLastDay(yearMonth),
  }
}

export function generateMonthlyReport(entries, yearMonth) {
  const { start, end } = getMonthBounds(yearMonth)
  const monthEntries = entries.filter(e => e.date >= start && e.date <= end)

  const todoStats = getTodoStats(monthEntries)
  const moodData = getMoodData(monthEntries)
  const wordCloud = getWordCloud(monthEntries, 30)
  const longestStreak = calculateLongestStreak(monthEntries)

  const conquistasList = monthEntries.flatMap(e => e.conquistas || [])
  const pesquisaChars = monthEntries.reduce((s, e) => s + (e.pesquisa || '').length, 0)
  const devChars = monthEntries.reduce((s, e) => s + (e.dev || '').length, 0)
  const notasChars = monthEntries.reduce((s, e) => s + (e.notas || '').length, 0)

  // Build mood distribution as object {'😄': 5, ...}
  const moodDistribution = {}
  moodData.distribution.forEach(({ mood, count }) => {
    moodDistribution[mood] = count
  })
  const topMood = moodData.distribution.sort((a, b) => b.count - a.count)[0]?.mood || ''

  const report = {
    id: yearMonth,
    month: yearMonth,
    narrative: '',
    highlights: [],
    todos_created: todoStats.totalCreated,
    todos_done: todoStats.totalCompleted,
    completion_rate: todoStats.completionRate,
    days_logged: monthEntries.length,
    longest_streak: longestStreak,
    conquistas_total: conquistasList.length,
    conquistas_list: conquistasList,
    mood_distribution: moodDistribution,
    top_mood: topMood,
    word_cloud: wordCloud,
    pesquisa_chars: pesquisaChars,
    dev_chars: devChars,
    notas_chars: notasChars,
    is_auto_generated: true,
  }

  report.narrative = buildNarrative(report, yearMonth)
  return report
}

export function buildNarrative(report, yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const { start, end } = getMonthBounds(yearMonth)
  const totalDaysInMonth = parseInt(end.split('-')[2], 10)
  const label = MESES[m - 1]
  const pct = Math.round((report.days_logged / totalDaysInMonth) * 100)

  const lines = []

  lines.push(
    `${label} de ${y} — ${report.days_logged} ${report.days_logged === 1 ? 'dia registrado' : 'dias registrados'} de ${totalDaysInMonth} possíveis (${pct}%).`
  )

  if (report.todos_created > 0) {
    lines.push(
      `📋 ${report.todos_created} ${report.todos_created === 1 ? 'tarefa criada' : 'tarefas criadas'}, ${report.todos_done} concluída${report.todos_done !== 1 ? 's' : ''} (${report.completion_rate}% de conclusão).`
    )
  }

  if (report.conquistas_total > 0) {
    const sample = report.conquistas_list.slice(0, 3).join(', ')
    const more = report.conquistas_total > 3 ? ` e mais ${report.conquistas_total - 3}` : ''
    lines.push(`⭐ ${report.conquistas_total} conquista${report.conquistas_total !== 1 ? 's' : ''}: ${sample}${more}.`)
  }

  if (report.word_cloud.length > 0) {
    const top3 = report.word_cloud.slice(0, 3).map(w => `${w.word} (${w.count}x)`).join(', ')
    lines.push(`🌿 Temas principais: ${top3}.`)
  }

  if (report.top_mood) {
    lines.push(`${report.top_mood} Humor predominante: ${report.top_mood} (${report.mood_distribution[report.top_mood] || 0} dias).`)
  }

  if (report.longest_streak > 1) {
    lines.push(`🔥 Maior sequência do mês: ${report.longest_streak} dias consecutivos.`)
  }

  const totalChars = report.pesquisa_chars + report.dev_chars + report.notas_chars
  if (totalChars > 0) {
    lines.push(`✍️ ${totalChars.toLocaleString('pt-BR')} caracteres escritos no total.`)
  }

  return lines.join('\n')
}
