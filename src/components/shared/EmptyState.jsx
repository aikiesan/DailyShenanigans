import { randomFrom, EMPTY_STATES } from '../../utils/humor'
import CapybaraReaction from './CapybaraReaction'
import { useMemo } from 'react'

export default function EmptyState({ section = 'archive' }) {
  const message = useMemo(() => {
    const messages = EMPTY_STATES[section] || EMPTY_STATES.archive
    return randomFrom(messages)
  }, [section])

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <CapybaraReaction state="sleepy" size="lg" showText={false} />
      <p className="text-gray-500 text-center mt-4 text-lg font-medium max-w-md">
        {message}
      </p>
    </div>
  )
}
