import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useMonthlyReports } from '../../hooks/useMonthlyReports'
import { useEntries } from '../../hooks/useEntries'
import { useToast } from '../shared/Toast'
import { getMonthLabel } from '../../utils/dateUtils'
import { generateMonthlyReport, getMonthBounds } from '../../utils/generateMonthlyReport'
import { getMoodData } from '../../utils/statsCalculations'
import WordCloud from '../stats/WordCloud'
import MoodTracker from '../stats/MoodTracker'
import CapybaraReaction from '../shared/CapybaraReaction'

export default function MonthlyReportDetail() {
  const { month } = useParams()
  const navigate = useNavigate()
  const { getReport, upsertReport, deleteReport } = useMonthlyReports()
  const { entries } = useEntries()
  const showToast = useToast()

  const saved = getReport(month)
  const label = getMonthLabel(month)

  const { start, end } = useMemo(() => getMonthBounds(month), [month])
  const monthEntries = useMemo(
    () => entries.filter(e => e.date >= start && e.date <= end),
    [entries, start, end]
  )
  const liveReport = useMemo(
    () => monthEntries.length > 0 ? generateMonthlyReport(entries, month) : null,
    [entries, monthEntries.length, month]
  )

  const report = saved || liveReport
  const isHistorical = !!saved && !saved.is_auto_generated
  const hasEntries = monthEntries.length > 0

  // Editable narrative state (only for saving)
  const [editingNarrative, setEditingNarrative] = useState(false)
  const [narrativeText, setNarrativeText] = useState('')
  const [highlight, setHighlight] = useState('')
  const [highlights, setHighlights] = useState(null)

  const displayHighlights = highlights ?? (report?.highlights || [])
  const displayNarrative = editingNarrative ? narrativeText : (report?.narrative || '')

  function handleStartEdit() {
    setNarrativeText(report?.narrative || '')
    setHighlights(report?.highlights || [])
    setEditingNarrative(true)
  }

  function handleSave() {
    const toSave = {
      ...(report || {}),
      id: month,
      month,
      narrative: narrativeText,
      highlights: displayHighlights,
      is_auto_generated: hasEntries && !isHistorical,
    }
    upsertReport(toSave)
    setEditingNarrative(false)
    setHighlights(null)
    showToast('Relatório salvo 📅')
  }

  function handleGenerateAndSave() {
    if (!liveReport) return
    upsertReport({ ...liveReport, highlights: liveReport.highlights || [] })
    showToast('Relatório gerado e salvo ✨')
  }

  function handleDelete() {
    if (window.confirm(`Remover relatório de ${label}?`)) {
      deleteReport(month)
      navigate('/reports')
      showToast('Relatório removido 🗑️')
    }
  }

  function addHighlight() {
    if (!highlight.trim()) return
    setHighlights(prev => [...(prev ?? displayHighlights), highlight.trim()])
    setHighlight('')
  }

  function removeHighlight(i) {
    setHighlights(prev => (prev ?? displayHighlights).filter((_, idx) => idx !== i))
  }

  // Convert mood_distribution object → [{mood, count}] for MoodTracker
  const moodData = useMemo(() => {
    if (!report) return { timeline: [], distribution: [] }
    if (hasEntries) return getMoodData(monthEntries)
    const dist = Object.entries(report.mood_distribution || {}).map(([mood, count]) => ({ mood, count }))
    return { timeline: [], distribution: dist }
  }, [report, hasEntries, monthEntries])

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 fade-up">
        <CapybaraReaction state="sleepy" size="xl" />
        <h2 className="text-2xl font-extrabold text-gray-800 mt-6">Sem dados para {label}</h2>
        <p className="text-gray-500 mt-2">Nenhuma entrada registrada neste mês.</p>
        <button onClick={() => navigate('/reports')} className="mt-6 text-sm font-semibold text-pampa-600 hover:underline">
          ← Voltar aos relatórios
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 fade-up pb-10">
      {/* Top bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/reports')}
              className="text-sm text-gray-400 hover:text-gray-600 font-semibold mb-1 flex items-center gap-1 transition-colors"
            >
              ← Todos os relatórios
            </button>
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              <span>📅</span> {label}
              {saved?.is_auto_generated === false && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pantanal-100 text-pantanal-700">histórico</span>
              )}
              {saved?.is_auto_generated === true && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pampa-100 text-pampa-700">auto-gerado</span>
              )}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {report.days_logged} dias · {report.todos_created} tarefas · {report.conquistas_total} conquistas
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!saved && hasEntries && (
              <button
                onClick={handleGenerateAndSave}
                className="bg-gradient-to-r from-pampa-500 to-pampa-600 hover:from-pampa-600 hover:to-pampa-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 text-sm"
              >
                ✨ Salvar relatório
              </button>
            )}
            {!editingNarrative && (
              <button
                onClick={handleStartEdit}
                className="bg-white border-2 border-cerrado-200 hover:border-cerrado-300 text-cerrado-700 font-semibold px-4 py-2 rounded-xl transition-all text-sm"
              >
                ✏️ Editar
              </button>
            )}
            {saved && (
              <button
                onClick={handleDelete}
                className="bg-white border-2 border-red-200 hover:border-red-300 text-red-500 font-semibold px-4 py-2 rounded-xl transition-all text-sm hover:bg-red-50"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Dias registrados', value: report.days_logged, icon: '📅' },
          { label: 'Conclusão de tarefas', value: `${report.completion_rate}%`, icon: '✅' },
          { label: 'Conquistas', value: report.conquistas_total, icon: '⭐' },
          { label: 'Maior sequência', value: `${report.longest_streak}d`, icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-extrabold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
          <span>📝</span> Narrativa do mês
        </h3>
        {editingNarrative ? (
          <div className="space-y-3">
            <textarea
              value={narrativeText}
              onChange={e => setNarrativeText(e.target.value)}
              rows={8}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pampa-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-amazonia-500 to-amazonia-600 hover:from-amazonia-600 hover:to-amazonia-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition-all active:scale-95 text-sm"
              >
                💾 Salvar
              </button>
              <button
                onClick={() => { setEditingNarrative(false); setHighlights(null) }}
                className="text-gray-400 hover:text-gray-600 font-semibold px-4 py-2 rounded-xl border border-gray-200 text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {displayNarrative || <span className="text-gray-400 italic">Sem narrativa ainda. Clique em Editar para adicionar.</span>}
          </p>
        )}
      </div>

      {/* Highlights */}
      <div className="bg-pampa-50 rounded-2xl border border-pampa-200 p-6">
        <h3 className="text-lg font-bold text-pampa-700 flex items-center gap-2 mb-4">
          <span>🏆</span> Destaques
        </h3>
        {displayHighlights.length === 0 && !editingNarrative && (
          <p className="text-sm text-pampa-400 italic">Nenhum destaque adicionado.</p>
        )}
        <ul className="space-y-2 mb-3">
          {displayHighlights.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-pampa-700">
              <span className="text-pampa-400 flex-shrink-0">▸</span>
              <span className="flex-1">{h}</span>
              {editingNarrative && (
                <button onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
              )}
            </li>
          ))}
        </ul>
        {editingNarrative && (
          <div className="flex gap-2 mt-2">
            <input
              value={highlight}
              onChange={e => setHighlight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHighlight()}
              placeholder="Adicionar destaque..."
              className="flex-1 text-sm border border-pampa-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pampa-400"
            />
            <button
              onClick={addHighlight}
              className="bg-pampa-500 hover:bg-pampa-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Conquistas list */}
      {report.conquistas_list?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
            <span>⭐</span> Conquistas do mês
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.conquistas_list.map((c, i) => (
              <span key={i} className="text-sm bg-cerrado-50 border border-cerrado-200 text-cerrado-700 rounded-xl px-3 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Word Cloud & Mood side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WordCloud words={report.word_cloud} />
        <MoodTracker data={moodData} />
      </div>

      {/* Writing stats */}
      {(report.pesquisa_chars > 0 || report.dev_chars > 0 || report.notas_chars > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
            <span>✍️</span> Produção escrita
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Pesquisa', value: report.pesquisa_chars, color: 'bg-amazonia-500' },
              { label: 'Dev', value: report.dev_chars, color: 'bg-atlantica-500' },
              { label: 'Notas', value: report.notas_chars, color: 'bg-caatinga-500' },
            ].filter(s => s.value > 0).map(stat => {
              const total = report.pesquisa_chars + report.dev_chars + report.notas_chars
              const pct = total > 0 ? Math.round((stat.value / total) * 100) : 0
              return (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold">{stat.label}</span>
                    <span>{stat.value.toLocaleString('pt-BR')} chars ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
