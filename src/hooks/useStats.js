import { useMemo } from 'react'
import { useEntries } from './useEntries'
import {
  calculateStreak,
  calculateLongestStreak,
  getHeatmapData,
  getCategoryBreakdown,
  getTodoStats,
  getWordCloud,
  getMoodData,
} from '../utils/statsCalculations'
import { getUnlockedBadges } from '../utils/humor'

export function useStats() {
  const { entries } = useEntries()

  return useMemo(() => {
    const streak = calculateStreak(entries)
    const longestStreak = calculateLongestStreak(entries)
    const heatmap = getHeatmapData(entries)
    const categories = getCategoryBreakdown(entries)
    const todoStats = getTodoStats(entries)
    const wordCloud = getWordCloud(entries)
    const moodData = getMoodData(entries)
    const badges = getUnlockedBadges(entries)

    return {
      streak,
      longestStreak,
      heatmap,
      categories,
      todoStats,
      wordCloud,
      moodData,
      badges,
      totalEntries: entries.length,
    }
  }, [entries])
}
