import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { loadWorkouts, saveWorkouts, createEmptyWorkout } from '../utils/workoutStorage'
import { fetchAllWorkouts, upsertWorkoutRemote, pushAllWorkouts } from '../utils/supabaseWorkouts'
import { isSupabaseConfigured } from '../utils/supabaseClient'

const WorkoutsContext = createContext(null)

export function WorkoutsProvider({ children }) {
  const [workouts, setWorkouts] = useState(() => loadWorkouts())
  const [status, setStatus] = useState('idle')
  const pushTimersRef = useRef(new Map())
  const initialSyncDone = useRef(false)

  // Persist to localStorage whenever workouts change
  useEffect(() => {
    saveWorkouts(workouts)
  }, [workouts])

  const pullRemote = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    setStatus('loading')
    try {
      const remote = await fetchAllWorkouts()
      const local = loadWorkouts()
      if (remote.length === 0 && local.length > 0) {
        // First time: migrate local data to Supabase
        await pushAllWorkouts(local)
      } else if (remote.length > 0) {
        // Remote is source of truth; keep local-only days and push them up
        const remoteIds = new Set(remote.map(w => w.id || w.date))
        const localOnly = local.filter(w => !remoteIds.has(w.id || w.date))
        setWorkouts([...remote, ...localOnly].sort((a, b) => b.date.localeCompare(a.date)))
        if (localOnly.length > 0) pushAllWorkouts(localOnly).catch(() => {})
      }
      setStatus('synced')
    } catch {
      setStatus('error')
    }
  }, [])

  // Initial pull
  useEffect(() => {
    if (initialSyncDone.current) return
    initialSyncDone.current = true
    pullRemote()
  }, [pullRemote])

  // Re-fetch when tab becomes visible again (cross-device sync)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && initialSyncDone.current) {
        pullRemote()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [pullRemote])

  const getWorkout = useCallback(
    (date) => workouts.find(w => w.date === date) || null,
    [workouts]
  )

  /**
   * Applies a patch to a day's workout and schedules a debounced remote push.
   * `patch` can be an object or a function (prevWorkout) => partialPatch,
   * so rapid taps never read a stale snapshot.
   */
  const updateWorkout = useCallback((date, patch) => {
    setWorkouts(prev => {
      const existing = prev.find(w => w.date === date)
      const base = existing || createEmptyWorkout(date)
      const resolved = typeof patch === 'function' ? patch(base) : patch
      const updated = { ...base, ...resolved }
      const next = existing
        ? prev.map(w => (w.date === date ? updated : w))
        : [updated, ...prev].sort((a, b) => b.date.localeCompare(a.date))

      // Debounced push (per date) so rapid taps don't spam Supabase
      const timers = pushTimersRef.current
      if (timers.has(date)) clearTimeout(timers.get(date))
      timers.set(date, setTimeout(() => {
        timers.delete(date)
        setStatus('saving')
        upsertWorkoutRemote(updated)
          .then(() => setStatus('synced'))
          .catch(() => setStatus('error'))
      }, 800))

      return next
    })
  }, [])

  return (
    <WorkoutsContext.Provider value={{ workouts, getWorkout, updateWorkout, status, createEmptyWorkout }}>
      {children}
    </WorkoutsContext.Provider>
  )
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext)
  if (!ctx) throw new Error('useWorkouts deve ser usado dentro de WorkoutsProvider')
  return ctx
}
