import { useStats } from '../../hooks/useStats'
import { getStreakMessage } from '../../utils/humor'
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
    totalEntries,
  } = useStats()

  const capyState = totalEntries === 0 ? 'sleepy' : streak >= 7 ? 'excited' : 'thinking'
  const streakMsg = getStreakMessage(streak)

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

      {/* Badges */}
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
