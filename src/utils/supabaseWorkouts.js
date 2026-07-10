import { supabase, isSupabaseConfigured } from './supabaseClient'

export async function fetchAllWorkouts() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data || []).map(normalizeWorkout)
}

export async function upsertWorkoutRemote(workout) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase
    .from('workouts')
    .upsert(workoutToRow(workout), { onConflict: 'id' })
  if (error) throw error
}

export async function pushAllWorkouts(workouts) {
  if (!isSupabaseConfigured() || workouts.length === 0) return
  const { error } = await supabase
    .from('workouts')
    .upsert(workouts.map(workoutToRow), { onConflict: 'id' })
  if (error) throw error
}

function workoutToRow(w) {
  const weight = parseFloat(w.weight)
  return {
    id: w.id || w.date,
    date: w.date,
    weight: Number.isFinite(weight) && weight > 0 ? weight : null,
    wellness: w.wellness >= 1 && w.wellness <= 5 ? w.wellness : null,
    notes: w.notes || '',
    exercises: w.exercises || {},
    stretches: w.stretches || {},
  }
}

function normalizeWorkout(row) {
  return {
    id: row.id,
    date: row.date,
    weight: row.weight != null ? String(row.weight) : '',
    wellness: row.wellness || 0,
    notes: row.notes || '',
    exercises: row.exercises || {},
    stretches: row.stretches || {},
  }
}
