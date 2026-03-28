import { useStats } from '../../hooks/useStats'
import { getStreakMessage, generateFunFacts } from '../../utils/humor'
import ContributionHeatmap from './ContributionHeatmap'
import CategoryBreakdown from './CategoryBreakdown'
import TodoAnalytics from './TodoAnalytics'
import WordCloud from './WordCloud'
import MoodTracker from './MoodTracker'
import CapybaraReaction from '../shared/CapybaraReaction'

export default function StatsPage() {
  const {
    streak,
    longestStreak,
    heatmap,
    categories,
    todoStats,
    wordCloud,
    moodData,
    badges,
    nextBadge,
    totalEntries,
  } = useStats()

  const capyState = totalEntries === 0 ? 'sleepy' : streak >= 7 ? 'excited' : 'thinking'
  const streakMsg = getStreakMessage(streak)
  const funFacts = generateFunFacts(wordCloud, todoStats, moodData, totalEntries)

  if (totalEntries === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 fade-up">
        <CapybaraReaction state="sleepy" size="xl" />
        <h2 className="text-2xl font-extrabold text-gray-800 mt-6">
          Nenhum dado para analisar
        </h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Comece a registrar seus dias para desbloquear o painel de estatísticas do Pampa!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CapybaraReaction state={capyState} size="lg" showText={false} />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2 justify-center md:justify-start">
              <span>📊</span> Estatísticas do Pampa
            </h2>
            <p className="text-gray-500 mt-1">
              {totalEntries} {totalEntries === 1 ? 'entrada analisada' : 'entradas analisadas'} pelo
              departamento de geoprocessamento de shenanigans
            </p>
            {streakMsg && (
              <p className="text-sm text-pampa-600 mt-2 italic font-medium">{streakMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="fade-up fade-up-delay-1">
        <ContributionHeatmap data={heatmap} streak={streak} longestStreak={longestStreak} />
      </div>

      {/* Next badge progress */}
      {nextBadge && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up fade-up-delay-2">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span>🎯</span> Próxima Conquista
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl flex-shrink-0">{nextBadge.badge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-800">{nextBadge.badge.name}</div>
              <div className="text-xs text-gray-500 mb-2">{nextBadge.badge.desc}</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pampa-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(nextBadge.progress * 100)}%` }}
                />
              </div>
              <div className="text-xs text-pampa-600 mt-1 font-semibold">
                {Math.round(nextBadge.progress * 100)}% concluído
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked badges */}
      {badges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-up fade-up-delay-2">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
            <span>🏅</span> Conquistas Desbloqueadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-pampa-50 border border-pampa-200"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <div className="font-bold text-sm text-pampa-700">{badge.name}</div>
                  <div className="text-xs text-pampa-500">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fun facts */}
      {funFacts.length > 0 && (
        <div className="bg-pampa-50 rounded-2xl border border-pampa-200 p-6 fade-up fade-up-delay-2">
          <h3 className="text-lg font-bold text-pampa-700 flex items-center gap-2 mb-4">
            <span>📣</span> Seus Dados Falam
          </h3>
          <ul className="space-y-2">
            {funFacts.map((fact, i) => (
              <li key={i} className="text-sm italic text-pampa-600 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">▸</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Todo Analytics */}
      <div className="fade-up fade-up-delay-2">
        <TodoAnalytics stats={todoStats} />
      </div>

      {/* Category Breakdown */}
      <div className="fade-up fade-up-delay-3">
        <CategoryBreakdown data={categories} />
      </div>

      {/* Word Cloud & Mood - side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="fade-up fade-up-delay-4">
          <WordCloud words={wordCloud} />
        </div>
        <div className="fade-up fade-up-delay-5">
          <MoodTracker data={moodData} />
        </div>
      </div>
    </div>
  )
}
