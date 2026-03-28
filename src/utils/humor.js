// ═══════════════════════════════════════════════
// 🦫 DEPARTAMENTO DE HUMOR GEOESPACIAL
// ═══════════════════════════════════════════════

export const EMPTY_STATES = {
  todos: [
    'Nenhuma tarefa? O Cerrado agradece a calmaria 🔥',
    'Lista vazia. Até o lobo-guará tá descansando hoje 🐺',
    'Zero tarefas! Ecossistema em equilíbrio perfeito 🌾',
    'Sua lista de tarefas é mais vazia que o Cerrado em agosto 🏜️',
  ],
  pesquisa: [
    'O paper não vai se escrever sozinho... ou vai? 🤔',
    'Área de pesquisa vazia como um bioma sem GPS 🛰️',
    'Nenhuma nota acadêmica? A capivara do NIPE está decepcionada 🦫',
    'Zero pesquisa registrada. O orientador está chorando em algum lugar 😢',
  ],
  dev: [
    'Nenhum código hoje? O mico-leão-dourado não aprova 🐒',
    'Área dev vazia como um repositório recém-criado 💻',
    'git log --oneline: nada aqui. Nem um commit de vergonha 🫠',
    'Stack Overflow tá offline? Só pode ser isso 🤷',
  ],
  notas: [
    'A Caatinga também fica vazia às vezes. Mas ela sempre floresce 🌵',
    'Sem notas? O tatu-bola se escondeu na toca 🦎',
    'Campo de notas mais seco que a Caatinga em outubro 🏜️',
    'Aqui mora o silêncio. E um mandacaru solitário 🌵',
  ],
  conquistas: [
    'Nenhuma conquista ainda? O dia só tá começando! 🏆',
    'O Pantanal não está inundado de conquistas... ainda 🌊',
    'Sem conquistas? Até o tuiuiú voou pra outro lugar 🦩',
    'Zero conquistas. Mas respirar já conta? 💨',
  ],
  archive: [
    'Nenhuma entrada ainda! A biodiversidade do seu diário é zero 🌱',
    'Seu diário está mais vazio que o Pantanal na seca 🏜️',
    'Nenhum registro! Comece a catalogar seus shenanigans 🗺️',
  ],
}

export const TODO_COMPLETED_MESSAGES = [
  'DESMATAMENTO TOTAL DA SUA LISTA! ...mas esse é o desmatamento bom 🌿',
  'TODAS AS TAREFAS COMPLETAS! A capivara está orgulhosa de você! 🦫✨',
  'BIOMA RESTAURADO! Todas as tarefas reflorestadas com sucesso! 🌳',
  '100% DE CONCLUSÃO! Seu índice de produtividade é mais alto que o PIB do agronegócio! 📈',
  'LISTA ZERADA! Até o IBAMA aprovou essa eficiência! 🏛️',
]

export const STREAK_MESSAGES = {
  3: 'TRÊS DIAS SEGUIDOS! A semente da consistência está germinando 🌱',
  7: 'UMA SEMANA INTEIRA! Você é mais consistente que o desmatamento na Amazônia (e com resultados melhores) 🌳',
  14: 'DUAS SEMANAS! Seu compromisso é mais forte que raiz de baobá 🌳',
  30: 'UM MÊS! Você é uma unidade de conservação ambulante 🏞️',
  60: 'DOIS MESES! Nem o INPE monitora tão de perto quanto você 🛰️',
  100: 'CEM DIAS! Você é patrimônio da UNESCO 🏅',
  365: 'UM ANO! Você transcendeu. Você é o bioma agora 🌍',
}

// ─── Daily Prompts ────────────────────────────────────
export const DAILY_PROMPTS = [
  'Qual foi a tarefa que você mais procrastinou hoje? (a capivara não julga) 🦥',
  'Se seu dia fosse um bioma brasileiro, qual seria e por quê? 🌎',
  'O que te surpreendeu — positivamente ou não — nas últimas 24 horas? 🤔',
  'Que problema você resolveu hoje que ainda não anotou em nenhum lugar? 🗺️',
  'O que você aprendeu hoje que não estava planejando aprender? 📚',
  'Qual foi o momento mais capivara do seu dia? (no flow, sem drama) 🦫',
  'Teve alguma conversa que mudou como você pensa sobre algo? 💬',
  'Se você pudesse deletar uma tarefa da lista para sempre, qual seria? 🗑️',
  'Que porcentagem do seu plano de hoje realmente aconteceu? Seja honesto(a) 📊',
  'O que o seu eu de daqui a um ano vai querer que você tivesse registrado hoje? ⏳',
  'Alguma hipótese foi confirmada ou refutada hoje? 🔬',
  'Qual código, texto ou ideia que você escreveu hoje você mais gosta? ✨',
  'O que você evitou fazer hoje e por quê? 🙈',
  'Tem algo que você vem adiando há mais de uma semana? 🌵',
  'Qual foi a parte mais inesperada da sua pesquisa/trabalho hoje? 🛰️',
  'Se você tivesse mais 2 horas hoje, o que teria feito? 🕐',
  'Qual tarefa concluída hoje deu mais satisfação? 🏆',
  'Você pediu ajuda a alguém hoje ou tentou resolver tudo sozinho(a)? 🌳',
  'O que está emperrado há dias e precisa de um empurrão? 🐺',
  'Qual descoberta de hoje merece mais atenção amanhã? 🔍',
  'Em uma palavra: como seu cérebro está agora? 🧠',
  'O que você repetiria nesse dia se pudesse? E o que eliminaria? ♻️',
  'Tem alguma ideia boa que surgiu mas você não parou pra registrar? Escreve aí 💡',
  'Qual tarefa de amanhã você já pode preparar agora? 🌱',
  'O mico-leão-dourado quer saber: qual foi a maior conquista de hoje? 🐒',
]

// ─── Private helpers ──────────────────────────────────
function hasStreakInField(entries, field, days) {
  if (entries.length < days) return false
  const sorted = [...entries].filter(e => e[field] && e[field].length > 5).sort((a, b) => a.date.localeCompare(b.date))
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
      if (streak >= days) return true
    } else {
      streak = 1
    }
  }
  return false
}

function hasWeekdayStreak(entries, days) {
  const dates = new Set(entries.map(e => e.date))
  const sorted = [...dates].sort()
  if (sorted.length < days) return false
  let streak = 0
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i])
    const dow = d.getDay()
    if (dow >= 1 && dow <= 5) {
      streak++
      if (streak >= days) return true
    }
  }
  return false
}

function hasPerfectWeek(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 0; i <= sorted.length - 7; i++) {
    let ok = true
    for (let j = 0; j < 7; j++) {
      const e = sorted[i + j]
      const perfect = e.mood && (e.todos || []).length > 0 && e.pesquisa && e.dev && e.notas && (e.conquistas || []).length > 0
      if (!perfect) { ok = false; break }
      if (j > 0) {
        const prev = new Date(sorted[i + j - 1].date)
        const curr = new Date(e.date)
        if ((curr - prev) / (1000 * 60 * 60 * 24) !== 1) { ok = false; break }
      }
    }
    if (ok) return true
  }
  return false
}

function hasGapAndReturn(entries) {
  if (entries.length < 2) return false
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    if ((curr - prev) / (1000 * 60 * 60 * 24) >= 3) return true
  }
  return false
}

// ─── Badges ───────────────────────────────────────────
export const ACHIEVEMENT_BADGES = [
  { id: 'primeiro_broto', icon: '🌱', name: 'Primeiro Broto', desc: 'Criou sua primeira entrada', check: (entries) => entries.length >= 1 },
  { id: 'queimada_produtiva', icon: '🔥', name: 'Queimada Produtiva', desc: 'Completou 10+ tarefas em um dia', check: (entries) => entries.some(e => (e.todos || []).filter(t => t.done).length >= 10) },
  { id: 'desmatador_papers', icon: '📚', name: 'Desmatador de Papers', desc: 'Escreveu pesquisa por 7 dias seguidos', check: (entries) => hasStreakInField(entries, 'pesquisa', 7) },
  { id: 'cartografo_caos', icon: '🗺️', name: 'Cartógrafo do Caos', desc: '30 entradas totais', check: (entries) => entries.length >= 30 },
  { id: 'sobrevivente_caatinga', icon: '🦎', name: 'Sobrevivente da Caatinga', desc: 'Fez entrada no fim de semana', check: (entries) => entries.some(e => { const d = new Date(e.date); return d.getDay() === 0 || d.getDay() === 6 }) },
  { id: 'mare_alta', icon: '🌊', name: 'Maré Alta no Pantanal', desc: '5+ conquistas em um dia', check: (entries) => entries.some(e => (e.conquistas || []).length >= 5) },
  { id: 'bio_diverso', icon: '🦜', name: 'Biodiversidade Acadêmica', desc: 'Preencheu todas as 5 seções em um dia', check: (entries) => entries.some(e => (e.todos || []).length > 0 && e.pesquisa && e.dev && e.notas && (e.conquistas || []).length > 0) },
  { id: 'full_stack_flora', icon: '🌺', name: 'Full Stack Flora', desc: '10 dias de código registrados', check: (entries) => entries.filter(e => e.dev && e.dev.length > 10).length >= 10 },
  { id: 'gps_humano', icon: '🛰️', name: 'GPS Humano', desc: 'Nunca perdeu um dia útil em 2 semanas', check: (entries) => hasWeekdayStreak(entries, 10) },
  { id: 'ipcc_pessoal', icon: '📊', name: 'IPCC Pessoal', desc: 'Mais de 50 entradas', check: (entries) => entries.length >= 50 },
  // Phase 2A — new badges
  { id: 'escritor_romances', icon: '📖', name: 'Escritor de Romances', desc: 'Escreveu 500+ chars de pesquisa em um dia', check: (entries) => entries.some(e => (e.pesquisa || '').length >= 500) },
  { id: 'resiliente', icon: '🌵', name: 'Resiliente', desc: 'Voltou depois de 3+ dias de pausa', check: (entries) => hasGapAndReturn(entries) },
  { id: 'maratonista_notas', icon: '🏃', name: 'Maratonista de Notas', desc: '100 entradas totais', check: (entries) => entries.length >= 100 },
  { id: 'catador_tarefas', icon: '📋', name: 'Catador de Tarefas', desc: '100 tarefas criadas ao total', check: (entries) => entries.reduce((s, e) => s + (e.todos || []).length, 0) >= 100 },
  { id: 'pesquisador_ironico', icon: '🔬', name: 'Pesquisador Irônico', desc: 'Pesquisa registrada por 14 dias seguidos', check: (entries) => hasStreakInField(entries, 'pesquisa', 14) },
  { id: 'dev_incansavel', icon: '⌨️', name: 'Dev Incansável', desc: 'Dev registrado por 7 dias seguidos', check: (entries) => hasStreakInField(entries, 'dev', 7) },
  { id: 'semana_perfeita', icon: '🌟', name: 'Semana Perfeita', desc: 'Todas as seções preenchidas por 7 dias seguidos', check: (entries) => hasPerfectWeek(entries) },
  { id: 'conquistador_serial', icon: '🏆', name: 'Conquistador Serial', desc: '50 conquistas totais registradas', check: (entries) => entries.reduce((s, e) => s + (e.conquistas || []).length, 0) >= 50 },
  { id: 'veterano_pampa', icon: '📚', name: 'Veterano do Pampa', desc: '200 entradas totais', check: (entries) => entries.length >= 200 },
  { id: 'arqueiro_bioma', icon: '🎯', name: 'Arqueiro do Bioma', desc: '90%+ de conclusão por 10+ dias', check: (entries) => entries.filter(e => { const t = e.todos || []; return t.length >= 3 && t.filter(x => x.done).length / t.length >= 0.9 }).length >= 10 },
]

export const GEO_FACTS = [
  'O Cerrado é a savana mais biodiversa do mundo, com mais de 12.000 espécies de plantas 🌾',
  'A Amazônia produz 20% do oxigênio do mundo. Respire fundo e agradeça 🌬️',
  'A Mata Atlântica originalmente cobria 1.3 milhão de km². Hoje resta 12.4% 😢',
  'O Pantanal é a maior planície alagável do mundo — 150.000 km² de beleza 🌊',
  'A Caatinga é exclusivamente brasileira — nenhum outro país tem esse bioma 🇧🇷',
  'O Pampa gaúcho abriga mais de 3.000 espécies de plantas vasculares 🌿',
  'O Brasil tem 20% de toda a água doce do planeta. Hidrate-se! 💧',
  'Capivaras podem ficar submersas por até 5 minutos. Você consegue prender a respiração? 🦫',
  'O lobo-guará não é lobo nem raposa. É confusão taxonômica ambulante 🐺',
  'O mico-leão-dourado quase foi extinto. Hoje existem ~3.700 indivíduos na natureza 🐒',
]

export const LOADING_MESSAGES = [
  'Calibrando o GPS do seu dia... 🛰️',
  'Consultando a capivara sênior... 🦫',
  'Processando dados geoespaciais dos seus shenanigans... 🗺️',
  'Analisando imagens de satélite da sua produtividade... 📡',
  'O lobo-guará está farejando suas entradas... 🐺',
]

export const SAVE_MESSAGES = [
  'Dados georreferenciados com sucesso! 📍',
  'Entrada salva no banco de dados do bioma! 💾',
  'Shapefile do seu dia atualizado! 🗺️',
  'Coordenadas da produtividade registradas! 🛰️',
]

// ─── Public utilities ────────────────────────────────
export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getStreakMessage(streak) {
  const thresholds = Object.keys(STREAK_MESSAGES).map(Number).sort((a, b) => b - a)
  for (const t of thresholds) {
    if (streak >= t) return STREAK_MESSAGES[t]
  }
  return null
}

export function getUnlockedBadges(entries) {
  return ACHIEVEMENT_BADGES.filter(badge => badge.check(entries))
}

/** Deterministic by date — same prompt all day, cycles through the list */
export function getDailyPrompt(isoDate) {
  const key = parseInt(isoDate.replace(/-/g, ''), 10)
  return DAILY_PROMPTS[key % DAILY_PROMPTS.length]
}

/** Time-of-day greeting, biome-flavored */
export function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) {
    return randomFrom([
      'Bom dia, pesquisador(a)! ☀️ O Cerrado amanhece dourado.',
      'Manhã de shenanigans! ☀️ O lobo-guará já farejou seus planos.',
      'Acordou cedo! ☕ A capivara aprova a dedicação matutina.',
    ])
  }
  if (h >= 12 && h < 18) {
    return randomFrom([
      'Boa tarde! 🌤️ O bioma está em plena atividade.',
      'Tarde produtiva? 🌿 A Amazônia está torcendo por você.',
      'Boa tarde! ☀️ Hora do relatório de campo.',
    ])
  }
  if (h >= 18 && h < 22) {
    return randomFrom([
      'Boa noite! 🌙 Registrando os shenanigans do dia?',
      'Entardecer no Pampa 🌅 — hora de catalogar o dia.',
      'Boa noite! 🦉 A capivara noturna está acordada.',
    ])
  }
  return randomFrom([
    'Ainda acordado(a)? 🌙 O Pantanal também não dorme.',
    'Trabalho noturno detectado 🦇 — a ciência não para.',
    'Madrugada produtiva? 🌙 O INPE te vê pelo satélite.',
  ])
}

/** Generate 3–5 personalized fun facts from existing stats data */
export function generateFunFacts(wordCloud, todoStats, moodData, totalEntries) {
  const facts = []

  // Top word quip
  if (wordCloud.length > 0) {
    const top = wordCloud[0]
    facts.push(randomFrom([
      `Você escreveu "${top.word}" ${top.count} vezes. Tem algo aí? 🤔`,
      `A palavra "${top.word}" aparece ${top.count}x nos seus registros. Alguém obcecado(a)? 👀`,
      `"${top.word}" é sua palavra favorita (${top.count} ocorrências). A capivara anotou 📝`,
    ]))
  }

  // Completion rate quip
  if (todoStats.totalCreated > 0) {
    const r = todoStats.completionRate
    if (r >= 90) facts.push(`Taxa de conclusão de ${r}%? Você é uma máquina do Cerrado 🏆`)
    else if (r >= 70) facts.push(`${r}% de conclusão. Sólido! O orientador ficaria satisfeito 📚`)
    else if (r >= 50) facts.push(`${r}% das tarefas concluídas. Metade do bioma reflorestado 🌱`)
    else facts.push(`Modo sobrevivência: só ${r}% das tarefas foram concluídas. A Caatinga entende 🌵`)
  }

  // Mood personality
  if (moodData.distribution.length > 0) {
    const top = [...moodData.distribution].sort((a, b) => b.count - a.count)[0]
    const desc = {
      '😄': 'incrivelmente animado(a)',
      '😊': 'geralmente bem-humorado(a)',
      '😐': 'no modo neutro (a ciência pede equilíbrio)',
      '😔': 'melancólico(a) às vezes',
      '😫': 'esgotado(a) — você merece férias no Pantanal',
    }[top.mood] || 'misterioso(a)'
    facts.push(`Seu humor favorito é ${top.mood} — você é ${desc} 🧠`)
  }

  // Entries milestone
  if (totalEntries >= 50) facts.push(`${totalEntries} entradas! Você já tem material pra uma tese sobre si mesmo(a) 🎓`)
  else if (totalEntries >= 20) facts.push(`${totalEntries} dias registrados. A biodiversidade do seu diário está crescendo 🌿`)
  else facts.push(`${totalEntries} entradas por enquanto. Todo bioma começa com a primeira semente 🌱`)

  // Avg todos/day
  if (todoStats.avgPerDay > 0) {
    facts.push(`Em média, ${todoStats.avgPerDay} tarefa${todoStats.avgPerDay !== 1 ? 's' : ''} por dia. O Cerrado aprova a disciplina 📋`)
  }

  return facts.slice(0, 5)
}
