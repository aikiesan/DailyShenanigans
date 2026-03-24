import { useMemo } from 'react'
import { BIOMES } from '../../utils/biomeTheme'
import { GEO_FACTS, randomFrom } from '../../utils/humor'
import CapybaraReaction from '../shared/CapybaraReaction'

const BIOME_LIST = Object.values(BIOMES)

export default function AboutPage() {
  const fact = useMemo(() => randomFrom(GEO_FACTS), [])

  return (
    <div className="space-y-6 fade-up max-w-3xl mx-auto">
      {/* Hero */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <CapybaraReaction state="happy" size="xl" showText={false} />
        <h1 className="text-3xl font-extrabold text-gray-800 mt-4">
          Daily Shenanigans
        </h1>
        <p className="text-lg text-gray-500 mt-2 font-medium">
          Diário de pesquisa geoespacial com temática de biomas brasileiros
        </p>
        <div className="mt-4 inline-block bg-pampa-50 text-pampa-700 px-4 py-2 rounded-xl text-sm font-semibold">
          Pós-doc NIPE/Unicamp · Geoprocessamento & Sensoriamento Remoto
        </div>
      </div>

      {/* What is this */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up fade-up-delay-1">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span>🗺️</span> O que é isso?
        </h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            O <strong>Daily Shenanigans</strong> é um diário digital para registrar o dia a dia
            da vida acadêmica e de desenvolvimento. Cada seção é inspirada em um bioma
            brasileiro diferente, porque ciência e natureza andam juntas.
          </p>
          <p>
            Seus dados ficam salvos localmente no navegador (localStorage). Você pode
            exportar e importar seus dados em JSON a qualquer momento.
          </p>
          <p>
            Para <strong>persistência permanente</strong>, configure um GitHub Personal
            Access Token no botão <strong>☁️ Sync GitHub</strong> no topo da página.
            Os logs serão salvos automaticamente como <code className="bg-gray-100 px-1 rounded text-xs">data/logs.json</code> no
            repositório, com versionamento completo no git.
          </p>
        </div>
      </div>

      {/* Biomes guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up fade-up-delay-2">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span>🌿</span> Guia dos Biomas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BIOME_LIST.map(biome => (
            <div
              key={biome.key}
              className={`rounded-xl p-4 ${biome.colors.bg} border ${biome.colors.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{biome.icon}</span>
                <span className="text-xl">{biome.animal}</span>
                <span className={`font-bold ${biome.colors.text}`}>{biome.name}</span>
              </div>
              <div className={`text-sm ${biome.colors.textLight} font-medium`}>
                {biome.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Mascote: {biome.animalName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fun fact */}
      <div className="bg-gradient-to-r from-amazonia-50 to-pampa-50 rounded-2xl shadow-sm border border-gray-100 p-6 text-center fade-up fade-up-delay-3">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 justify-center mb-3">
          <span>💡</span> Fato Geo Aleatório
        </h3>
        <p className="text-sm text-gray-600 italic max-w-lg mx-auto">{fact}</p>
      </div>

      {/* Tech stack */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up fade-up-delay-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span>💻</span> Stack Tecnológica
        </h2>
        <div className="flex flex-wrap gap-2">
          {['React', 'Vite', 'Tailwind CSS', 'Recharts', 'React Router', 'localStorage', 'GitHub API'].map(tech => (
            <span
              key={tech}
              className="bg-atlantica-50 text-atlantica-700 px-3 py-1.5 rounded-lg text-sm font-semibold"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 py-4">
        Feito com 🦫 e ☕ em Campinas, SP
      </div>
    </div>
  )
}
