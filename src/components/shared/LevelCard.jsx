import { useMemo } from 'react'
import { getLevelInfo } from '../../utils/level'

/** Compact RPG-style level bar: title, XP and progress to the next level. */
export default function LevelCard({ entries, workouts }) {
  const info = useMemo(() => getLevelInfo(entries, workouts), [entries, workouts])

  return (
    <div className="bg-gradient-to-r from-amazonia-600 to-atlantica-600 rounded-2xl shadow-sm p-4 text-white">
      <div className="flex items-center gap-3">
        <span className="text-3xl flex-shrink-0 drop-shadow">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className="font-extrabold text-sm truncate">
              Nível {info.level} · {info.title}
            </span>
            <span className="text-xs font-bold text-white/80">
              {info.xp.toLocaleString('pt-BR')} XP
            </span>
          </div>
          <div className="mt-1.5 h-2.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.round(info.progress * 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-semibold text-white/80 mt-1">
            {info.next
              ? `Faltam ${info.xpToNext.toLocaleString('pt-BR')} XP para ${info.next.icon} ${info.next.title}`
              : 'Nível máximo — você É a lenda 🏆'}
          </div>
        </div>
      </div>
    </div>
  )
}
