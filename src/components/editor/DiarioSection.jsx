import { useRef, useEffect } from 'react'
import BiomeCard from '../shared/BiomeCard'

export default function DiarioSection({ value, onChange }) {
  const textareaRef = useRef(null)

  // Auto-grow with the text so the diary never feels cramped on mobile
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(288, el.scrollHeight) + 'px'
  }, [value])

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <BiomeCard biomeKey="amazonia" title="Diário do Dia" icon="📖">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Despeje aqui tudo o que aconteceu hoje — trabalho, pesquisa, dev, vida, treino, pensamentos... Um texto corrido, sem regras. Organize depois, escreva agora."
        className="w-full min-h-72 px-4 py-3 rounded-xl border-2 border-amazonia-200 focus:border-amazonia-400 focus:outline-none bg-white text-sm font-medium placeholder-amazonia-300 resize-y transition-colors leading-relaxed"
      />
      {value && (
        <div className="mt-2 text-xs text-amazonia-500 font-medium text-right">
          {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'} · {value.length} caracteres
        </div>
      )}
    </BiomeCard>
  )
}
