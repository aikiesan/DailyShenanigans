import { useMemo } from 'react'
import { GEO_FACTS, randomFrom } from '../../utils/humor'

export default function Footer() {
  const fact = useMemo(() => randomFrom(GEO_FACTS), [])

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-lg">🦫</span>
            <span>Daily Shenanigans · Pós-doc NIPE/Unicamp</span>
          </div>
          <div className="text-xs text-gray-400 italic text-center md:text-right max-w-md">
            💡 <span className="font-medium">Fato geo do dia:</span> {fact}
          </div>
        </div>
      </div>
    </footer>
  )
}
