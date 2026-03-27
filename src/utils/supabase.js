import { supabase, isSupabaseConfigured } from './supabaseClient'

export async function fetchAllEntries() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data || []).map(normalizeEntry)
}

export async function upsertEntryRemote(entry, userId) {
  if (!isSupabaseConfigured()) return
  const row = {
    id: entry.id || entry.date,
    date: entry.date,
    todos: entry.todos || [],
    pesquisa: entry.pesquisa || '',
    dev: entry.dev || '',
    notas: entry.notas || '',
    conquistas: entry.conquistas || [],
    mood: entry.mood || '',
    tags: entry.tags || [],
    user_id: userId,
  }
  const { error } = await supabase
    .from('entries')
    .upsert(row, { onConflict: 'id' })
  if (error) throw error
}

export async function deleteEntryRemote(id) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function pushAllEntries(entries, userId) {
  if (!isSupabaseConfigured() || entries.length === 0) return
  const rows = entries.map(entry => ({
    id: entry.id || entry.date,
    date: entry.date,
    todos: entry.todos || [],
    pesquisa: entry.pesquisa || '',
    dev: entry.dev || '',
    notas: entry.notas || '',
    conquistas: entry.conquistas || [],
    mood: entry.mood || '',
    tags: entry.tags || [],
    user_id: userId,
  }))
  const { error } = await supabase
    .from('entries')
    .upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

// Strip Supabase-only fields (user_id, timestamps) from entry for app use
function normalizeEntry(row) {
  return {
    id: row.id,
    date: row.date,
    todos: row.todos || [],
    pesquisa: row.pesquisa || '',
    dev: row.dev || '',
    notas: row.notas || '',
    conquistas: row.conquistas || [],
    mood: row.mood || '',
    tags: row.tags || [],
  }
}
