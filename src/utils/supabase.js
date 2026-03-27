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

export async function upsertEntryRemote(entry) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase
    .from('entries')
    .upsert(entryToRow(entry), { onConflict: 'id' })
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

export async function pushAllEntries(entries) {
  if (!isSupabaseConfigured() || entries.length === 0) return
  const { error } = await supabase
    .from('entries')
    .upsert(entries.map(entryToRow), { onConflict: 'id' })
  if (error) throw error
}

function entryToRow(entry) {
  return {
    id: entry.id || entry.date,
    date: entry.date,
    todos: entry.todos || [],
    pesquisa: entry.pesquisa || '',
    dev: entry.dev || '',
    notas: entry.notas || '',
    conquistas: entry.conquistas || [],
    mood: entry.mood || '',
    tags: entry.tags || [],
  }
}

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
