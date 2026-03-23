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
