const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MESES_CURTO = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
]

const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDatePT(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${DIAS_SEMANA[date.getDay()]}, ${d} de ${MESES[m - 1]} de ${y}`
}

export function formatDateShort(isoDate) {
  const [, m, d] = isoDate.split('-').map(Number)
  return `${d} ${MESES_CURTO[m - 1]}`
}

export function formatMonthShort(isoDate) {
  const [, m] = isoDate.split('-').map(Number)
  return MESES_CURTO[m - 1]
}

export function getDayNumber(isoDate) {
  return parseInt(isoDate.split('-')[2], 10)
}

export function getDayOfWeek(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function getDayOfWeekShort(isoDate) {
  return DIAS_CURTO[getDayOfWeek(isoDate)]
}

export function getMonthName(isoDate) {
  const [, m] = isoDate.split('-').map(Number)
  return MESES[m - 1]
}

export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDateRange(startISO, endISO) {
  const dates = []
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return dates
}

/** Returns the last day of a month as ISO string, e.g. '2026-04' → '2026-04-30' */
export function getMonthLastDay(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/** Returns full Portuguese month+year label, e.g. '2026-04' → 'Abril de 2026' */
export function getMonthLabel(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  return `${MESES[m - 1]} de ${y}`
}

export { MESES, MESES_CURTO, DIAS_SEMANA, DIAS_CURTO }
