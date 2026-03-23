import { Link } from 'react-router-dom'
import { formatDateShort, formatDatePT, getDayNumber, formatMonthShort } from '../../utils/dateUtils'

export default function EntryCard({ entry }) {
  const todosDone = (entry.todos || []).filter(t => t.done).length
  const todosTotal = (entry.todos || []).length
  const conquistas = (entry.conquistas || []).length
  const hasContent = entry.pesquisa || entry.dev || entry.notas

  // Determine which biomes have content
  const activeBiomes = []
  if (todosTotal > 0) activeBiomes.push({ color: 'bg-cerrado-400', label: 'Tarefas' })
  if (entry.pesquisa) activeBiomes.push({ color: 'bg-amazonia-400', label: 'Pesquisa' })
  if (entry.dev) activeBiomes.push({ color: 'bg-atlantica-400', label: 'Dev' })
  if (entry.notas) activeBiomes.push({ color: 'bg-caatinga-400', label: 'Notas' })
  if (conquistas > 0) activeBiomes.push({ color: 'bg-pantanal-400', label: 'Conquistas' })

  // Preview text
  const preview = entry.pesquisa || entry.dev || entry.notas || ''
  const previewText = preview.length > 80 ? preview.slice(0, 80) + '…' : preview

  return (
    <Link
      to={`/entry/${entry.date}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all hover:-translate-y-1 overflow-hidden"
    >
      {/* Biome indicator bar */}
      <div className="flex h-1.5">
        {activeBiomes.length > 0 ? (
          activeBiomes.map((b, i) => (
            <div key={i} className={`${b.color} flex-1`} />
          ))
        ) : (
          <div className="bg-gray-200 flex-1" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-800">{getDayNumber(entry.date)}</span>
              <span className="text-sm font-bold text-gray-400 uppercase">{formatMonthShort(entry.date)}</span>
            </div>
            {entry.mood && <span className="text-lg">{entry.mood}</span>}
          </div>

          {todosTotal > 0 && (
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              todosDone === todosTotal
                ? 'bg-amazonia-100 text-amazonia-700'
                : 'bg-cerrado-100 text-cerrado-700'
            }`}>
              ✅ {todosDone}/{todosTotal}
            </div>
          )}
        </div>

        {previewText && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {previewText}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          {/* Biome dots */}
          <div className="flex gap-1.5">
            {activeBiomes.map((b, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${b.color}`} title={b.label} />
            ))}
          </div>

          {conquistas > 0 && (
            <span className="text-xs font-bold text-pantanal-600">
              ⭐ {conquistas}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
