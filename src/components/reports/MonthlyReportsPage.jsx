import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMonthlyReports } from '../../hooks/useMonthlyReports'
import { useEntries } from '../../hooks/useEntries'
import { getMonthLabel } from '../../utils/dateUtils'
import { generateMonthlyReport, getMonthBounds } from '../../utils/generateMonthlyReport'
import CapybaraReaction from '../shared/CapybaraReaction'

// Returns 'YYYY-MM' for each month from the earliest entry date through current month
function getMonthRange(entries) {
  if (entries.length === 0) return []
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const earliest = sorted[0].date.slice(0, 7)
  const now = new Date()
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const months = []
  let [y, m] = earliest.split('-').map(Number)
  const [ey, em] = current.split('-').map(Number)
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return months.reverse()
}

function getMonthLastDay(yearMonth) {
  const [y, mo] = yearMonth.split('-').map(Number)
  return new Date(y, mo, 0).getDate()
}

export default function MonthlyReportsPage() {
  const { reports, upsertReport } = useMonthlyReports()
  const { entries } = useEntries()
  const navigate = useNavigate()

  const months = useMemo(() => getMonthRange(entries), [entries])

  // Pre-compute live stats for months that have entries but no saved report
  const monthCards = useMemo(() => {
    return months.map(yearMonth => {
      const saved = reports.find(r => r.month === yearMonth) || null
      const { start, end } = getMonthBounds(yearMonth)
      const monthEntries = entries.filter(e => e.date >= start && e.date <= end)
      const live = monthEntries.length > 0 ? generateMonthlyReport(entries, yearMonth) : null
      return { yearMonth, saved, live, entryCount: monthEntries.length }
    })
  }, [months, reports, entries])

  if (entries.length === 0 && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 fade-up">
        <CapybaraReaction state="sleepy" size="xl" />
        <h2 className="text-2xl font-extrabold text-gray-800 mt-6">Nenhum relatório ainda</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Comece a registrar entradas diárias para gerar relatórios mensais automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CapybaraReaction state="thinking" size="lg" showText={false} />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2 justify-center md:justify-start">
              <span>📅</span> Relatórios Mensais
            </h2>
            <p className="text-gray-500 mt-1">
              {reports.length > 0
                ? `${reports.length} ${reports.length === 1 ? 'relatório salvo' : 'relatórios salvos'} · histórico desde ${months[months.length - 1]}`
                : 'Gere relatórios a partir das suas entradas diárias'}
            </p>
          </div>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthCards.map(({ yearMonth, saved, live, entryCount }) => {
          const display = saved || live
          const label = getMonthLabel(yearMonth)
          const totalDays = getMonthLastDay(yearMonth)
          const hasSaved = !!saved
          const hasEntries = entryCount > 0

          return (
            <div
              key={yearMonth}
              onClick={() => navigate(`/reports/${yearMonth}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-pampa-200 transition-all group"
            >
              {/* Month label + badge */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{yearMonth}</div>
                  <h3 className="text-lg font-extrabold text-gray-800 group-hover:text-pampa-700 transition-colors">
                    {label}
                  </h3>
                </div>
                {hasSaved ? (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-pampa-100 text-pampa-700">salvo</span>
                ) : hasEntries ? (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-cerrado-100 text-cerrado-700">rascunho</span>
                ) : (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-400">vazio</span>
                )}
              </div>

              {display ? (
                <>
                  {/* Stats chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-gray-50 text-gray-600 rounded-lg px-2 py-1 font-semibold">
                      📅 {display.days_logged}/{totalDays} dias
                    </span>
                    {display.todos_created > 0 && (
                      <span className="text-xs bg-gray-50 text-gray-600 rounded-lg px-2 py-1 font-semibold">
                        ✅ {display.completion_rate}%
                      </span>
                    )}
                    {display.conquistas_total > 0 && (
                      <span className="text-xs bg-gray-50 text-gray-600 rounded-lg px-2 py-1 font-semibold">
                        ⭐ {display.conquistas_total}
                      </span>
                    )}
                    {display.top_mood && (
                      <span className="text-xs bg-gray-50 rounded-lg px-2 py-1 font-semibold">
                        {display.top_mood}
                      </span>
                    )}
                  </div>

                  {/* Top words */}
                  {display.word_cloud.length > 0 && (
                    <div className="text-xs text-gray-400 truncate">
                      {display.word_cloud.slice(0, 4).map(w => w.word).join(' · ')}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem entradas neste mês</p>
              )}

              {/* Auto-generate hint for months with entries but no saved report */}
              {!hasSaved && hasEntries && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-pampa-600 font-semibold flex items-center gap-1">
                  <span>✨</span> Clique para gerar e salvar
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
