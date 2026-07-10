const STORAGE_KEY = 'dailyShenanigans_workouts'

export function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function createEmptyWorkout(date) {
  return {
    id: date,
    date,
    weight: '',
    wellness: 0,
    notes: '',
    exercises: {},
    stretches: {},
  }
}
