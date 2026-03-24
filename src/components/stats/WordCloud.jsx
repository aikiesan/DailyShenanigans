import { BIOMES } from '../../utils/biomeTheme'

const CLOUD_COLORS = [
  '#2e7d32', '#00796b', '#d4a017', '#1565c0', '#c2956b',
  '#689f38', '#b8860b', '#004d40', '#0d47a1', '#926c09',
]

export default function WordCloud({ words }) {
  if (!words || words.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
          <span>☁️</span> Nuvem de Palavras
        </h3>
        <p className="text-sm text-gray-400 italic text-center py-8">
          Escreva mais notas para gerar a nuvem de palavras do seu bioma 🌿
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
        <span>☁️</span> Nuvem de Palavras
      </h3>
      <div className="flex flex-wrap justify-center gap-1 py-4">
        {words.map((item, i) => (
          <span
            key={i}
            className="word-cloud-item cursor-default font-bold"
            style={{
              fontSize: `${item.size}px`,
              color: CLOUD_COLORS[i % CLOUD_COLORS.length],
              opacity: 0.7 + (item.count / (words[0]?.count || 1)) * 0.3,
            }}
            title={`${item.word}: ${item.count}x`}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  )
}
