import { useMemo } from 'react'
import { getHeatmapData } from '../../utils/statsCalculations'
import { useEntries } from '../../hooks/useEntries'
import { formatDateShort } from '../../utils/dateUtils'

const INTENSITY_COLORS = [
  'bg-gray-100',        // 0
  'bg-amazonia-100',    // 1
  'bg-amazonia-200',    // 2-3
  'bg-amazonia-400',    // 4-5
  'bg-amazonia-600',    // 6+
]

function getIntensityClass(score) {
  if (score === 0) return INTENSITY_COLORS[0]
  if (score <= 1) return INTENSITY_COLORS[1]
  if (score <= 3) return INTENSITY_COLORS[2]
  if (score <= 5) return INTENSITY_COLORS[3]
  return INTENSITY_COLORS[4]
}

export default function CalendarHeatmap({ days = 182 }) {
  const { entries } = useEntries()
  const data = useMemo(() => getHeatmapData(entries, days), [entries, days])

  // Group by weeks (7-day columns)
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < data.length; i += 7) {
      w.push(data.slice(i, i + 7))
    }
    return w
  }, [data])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <span>🗺️</span> Mapa de Atividade
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Menos</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`heatmap-cell w-3 h-3 rounded-sm ${getIntensityClass(day.score)} cursor-pointer`}
                  title={`${formatDateShort(day.date)}: ${day.score} pontos`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
