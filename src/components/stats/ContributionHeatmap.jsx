import { useMemo } from 'react'
import { formatDateShort } from '../../utils/dateUtils'

const INTENSITY_COLORS = [
  '#f3f0ea',  // 0
  '#c8e6c9',  // 1
  '#81c784',  // 2-3
  '#43a047',  // 4-5
  '#1b5e20',  // 6+
]

function getColor(score) {
  if (score === 0) return INTENSITY_COLORS[0]
  if (score <= 1) return INTENSITY_COLORS[1]
  if (score <= 3) return INTENSITY_COLORS[2]
  if (score <= 5) return INTENSITY_COLORS[3]
  return INTENSITY_COLORS[4]
}

export default function ContributionHeatmap({ data, streak, longestStreak }) {
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < data.length; i += 7) {
      w.push(data.slice(i, i + 7))
    }
    return w
  }, [data])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <span>🗺️</span> Mapa de Contribuição
        </h3>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-cerrado-600">🔥 {streak}</div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase">Streak Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-amazonia-600">🏆 {longestStreak}</div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase">Recorde</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="heatmap-cell w-[14px] h-[14px] rounded-[3px] cursor-pointer"
                  style={{ backgroundColor: getColor(day.score) }}
                  title={`${formatDateShort(day.date)}: ${day.score} pontos`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-gray-400 font-medium">
        <span>Menos</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}
