import { todayISO, daysAgo, getDayOfWeek, DIAS_CURTO } from './dateUtils'
import { ACHIEVEMENT_BADGES, getUnlockedBadges } from './humor'

// ─── Streaks ─────────────────────────────────────────
export function calculateStreak(entries) {
  if (!entries.length) return 0
  const dates = new Set(entries.map(e => e.date))
  let streak = 0
  let d = todayISO()
  while (dates.has(d)) {
    streak++
    const prev = new Date(d)
    prev.setDate(prev.getDate() - 1)
    d = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`
  }
  return streak
}

export function calculateLongestStreak(entries) {
  if (!entries.length) return 0
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else if (diff > 1) {
      current = 1
    }
  }
  return longest
}

// ─── Heatmap Data ────────────────────────────────────
export function getHeatmapData(entries, days = 365) {
  const dateMap = new Map()
  entries.forEach(e => {
    const score = getEntryScore(e)
    dateMap.set(e.date, score)
  })
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i)
    data.push({ date, score: dateMap.get(date) || 0 })
  }
  return data
}

export function getEntryScore(entry) {
  let score = 0
  if (entry.todos?.length) score += entry.todos.filter(t => t.done).length
  if (entry.pesquisa?.length > 10) score += 2
  if (entry.dev?.length > 10) score += 2
  if (entry.notas?.length > 10) score += 1
  if (entry.conquistas?.length) score += entry.conquistas.length
  return score
}

// ─── Category Breakdown ──────────────────────────────
export function getCategoryBreakdown(entries) {
  let pesquisa = 0, dev = 0, notas = 0, todos = 0, conquistas = 0
  entries.forEach(e => {
    pesquisa += (e.pesquisa || '').length
    dev += (e.dev || '').length
    notas += (e.notas || '').length
    todos += (e.todos || []).length * 20
    conquistas += (e.conquistas || []).length * 30
  })
  return [
    { name: 'Pesquisa', value: pesquisa, biome: 'amazonia' },
    { name: 'Dev', value: dev, biome: 'atlantica' },
    { name: 'Notas', value: notas, biome: 'caatinga' },
    { name: 'Tarefas', value: todos, biome: 'cerrado' },
    { name: 'Conquistas', value: conquistas, biome: 'pantanal' },
  ].filter(c => c.value > 0)
}

// ─── Todo Analytics ──────────────────────────────────
export function getTodoStats(entries) {
  let totalCreated = 0
  let totalCompleted = 0
  const dailyRates = []
  const byDayOfWeek = Array(7).fill(null).map(() => ({ created: 0, completed: 0, days: 0 }))

  entries.forEach(e => {
    const todos = e.todos || []
    const created = todos.length
    const completed = todos.filter(t => t.done).length
    totalCreated += created
    totalCompleted += completed
    const rate = created > 0 ? Math.round((completed / created) * 100) : 0
    dailyRates.push({ date: e.date, rate, created, completed })
    const dow = getDayOfWeek(e.date)
    byDayOfWeek[dow].created += created
    byDayOfWeek[dow].completed += completed
    byDayOfWeek[dow].days++
  })

  const productivityByDay = byDayOfWeek.map((d, i) => ({
    day: DIAS_CURTO[i],
    avgCompleted: d.days > 0 ? Math.round(d.completed / d.days * 10) / 10 : 0,
    avgCreated: d.days > 0 ? Math.round(d.created / d.days * 10) / 10 : 0,
  }))

  return {
    totalCreated,
    totalCompleted,
    completionRate: totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0,
    dailyRates: dailyRates.sort((a, b) => a.date.localeCompare(b.date)),
    productivityByDay,
    avgPerDay: entries.length > 0 ? Math.round(totalCreated / entries.length * 10) / 10 : 0,
  }
}

// ─── Word Cloud ──────────────────────────────────────
const PT_STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'uns', 'umas', 'para', 'por', 'com', 'sem', 'que', 'se', 'não',
  'mais', 'mas', 'ou', 'ao', 'aos', 'à', 'às', 'pelo', 'pela', 'pelos', 'pelas',
  'este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isso', 'isto', 'ele', 'ela',
  'eles', 'elas', 'nós', 'vós', 'eu', 'tu', 'me', 'te', 'lhe', 'nos', 'vos',
  'meu', 'minha', 'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa', 'como', 'foi',
  'ser', 'ter', 'está', 'são', 'tem', 'sobre', 'até', 'muito', 'também', 'já',
  'depois', 'quando', 'então', 'entre', 'ainda', 'só', 'seus', 'suas', 'bem',
  'pode', 'fazer', 'dia', 'hoje', 'the', 'and', 'for', 'with', 'from', 'that',
  'this', 'was', 'are', 'were', 'been', 'have', 'has', 'had', 'will', 'would',
])

export function getWordCloud(entries, maxWords = 50) {
  const freq = new Map()
  entries.forEach(e => {
    const text = [e.pesquisa, e.dev, e.notas, ...(e.conquistas || [])].filter(Boolean).join(' ')
    const words = text.toLowerCase().replace(/[^\w\sáàâãéèêíìîóòôõúùûçñ]/g, '').split(/\s+/)
    words.forEach(w => {
      if (w.length > 2 && !PT_STOPWORDS.has(w)) {
        freq.set(w, (freq.get(w) || 0) + 1)
      }
    })
  })
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxWords)
  const maxFreq = sorted[0]?.[1] || 1
  return sorted.map(([word, count]) => ({
    word,
    count,
    size: Math.max(12, Math.round((count / maxFreq) * 40)),
  }))
}

// ─── Mood Tracking ───────────────────────────────────
export function getMoodData(entries) {
  const withMood = entries.filter(e => e.mood).sort((a, b) => a.date.localeCompare(b.date))
  const moodMap = { '😄': 5, '😊': 4, '😐': 3, '😔': 2, '😫': 1 }
  const timeline = withMood.map(e => ({
    date: e.date,
    mood: e.mood,
    value: moodMap[e.mood] || 3,
  }))
  const distribution = {}
  withMood.forEach(e => {
    distribution[e.mood] = (distribution[e.mood] || 0) + 1
  })
  return {
    timeline,
    distribution: Object.entries(distribution).map(([mood, count]) => ({ mood, count })),
  }
}

// ─── Next Badge Progress ─────────────────────────────
/** Returns { badge, progress (0–1) } for the locked badge closest to unlocking */
export function getNextBadgeProgress(entries) {
  const unlocked = new Set(getUnlockedBadges(entries).map(b => b.id))
  const locked = ACHIEVEMENT_BADGES.filter(b => !unlocked.has(b.id))
  if (!locked.length) return null

  const totalTodos = entries.reduce((s, e) => s + (e.todos || []).length, 0)
  const totalConquistas = entries.reduce((s, e) => s + (e.conquistas || []).length, 0)
  const streak = calculateStreak(entries)
  const pesquisaStreak = _currentFieldStreak(entries, 'pesquisa')
  const devStreak = _currentFieldStreak(entries, 'dev')
  const goodDays = entries.filter(e => {
    const t = e.todos || []
    return t.length >= 3 && t.filter(x => x.done).length / t.length >= 0.9
  }).length

  const withProgress = locked.map(badge => {
    let progress = 0
    switch (badge.id) {
      case 'primeiro_broto':      progress = Math.min(entries.length, 1); break
      case 'queimada_produtiva': { const best = Math.max(0, ...entries.map(e => (e.todos||[]).filter(t=>t.done).length)); progress = Math.min(best / 10, 1); break }
      case 'desmatador_papers':   progress = Math.min(pesquisaStreak / 7, 1); break
      case 'cartografo_caos':     progress = Math.min(entries.length / 30, 1); break
      case 'sobrevivente_caatinga': progress = 0.05; break
      case 'mare_alta': { const best = Math.max(0, ...entries.map(e => (e.conquistas||[]).length)); progress = Math.min(best / 5, 1); break }
      case 'bio_diverso': { const best = Math.max(0, ...entries.map(e => [(e.todos||[]).length>0,!!e.pesquisa,!!e.dev,!!e.notas,(e.conquistas||[]).length>0].filter(Boolean).length)); progress = Math.min(best / 5, 1); break }
      case 'full_stack_flora':    progress = Math.min(entries.filter(e => e.dev && e.dev.length > 10).length / 10, 1); break
      case 'gps_humano':          progress = Math.min(streak / 10, 1); break
      case 'ipcc_pessoal':        progress = Math.min(entries.length / 50, 1); break
      case 'escritor_romances': { const best = Math.max(0, ...entries.map(e => (e.pesquisa||'').length)); progress = Math.min(best / 500, 1); break }
      case 'resiliente':          progress = 0.05; break
      case 'maratonista_notas':   progress = Math.min(entries.length / 100, 1); break
      case 'catador_tarefas':     progress = Math.min(totalTodos / 100, 1); break
      case 'pesquisador_ironico': progress = Math.min(pesquisaStreak / 14, 1); break
      case 'dev_incansavel':      progress = Math.min(devStreak / 7, 1); break
      case 'semana_perfeita':     progress = 0.05; break
      case 'conquistador_serial': progress = Math.min(totalConquistas / 50, 1); break
      case 'veterano_pampa':      progress = Math.min(entries.length / 200, 1); break
      case 'arqueiro_bioma':      progress = Math.min(goodDays / 10, 1); break
      default:                    progress = 0
    }
    return { badge, progress }
  })

  return withProgress.filter(p => p.progress < 1).sort((a, b) => b.progress - a.progress)[0] || null
}

function _currentFieldStreak(entries, field) {
  const sorted = [...entries]
    .filter(e => e[field] && e[field].length > 5)
    .sort((a, b) => b.date.localeCompare(a.date))
  if (!sorted.length) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i].date)
    const curr = new Date(sorted[i - 1].date)
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  return streak
}

// ─── Weekly Digest ───────────────────────────────────
/** Returns summary of the last 7 days */
export function getWeeklyDigest(entries) {
  const cutoff = daysAgo(6)
  const week = entries.filter(e => e.date >= cutoff)
  const todosCreated = week.reduce((s, e) => s + (e.todos || []).length, 0)
  const todosDone = week.reduce((s, e) => s + (e.todos || []).filter(t => t.done).length, 0)
  const conquistas = week.reduce((s, e) => s + (e.conquistas || []).length, 0)
  const moodCount = {}
  week.forEach(e => { if (e.mood) moodCount[e.mood] = (moodCount[e.mood] || 0) + 1 })
  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  return { entryCount: week.length, todosCreated, todosDone, conquistas, topMood }
}
