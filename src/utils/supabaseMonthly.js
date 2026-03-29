import { supabase, isSupabaseConfigured } from './supabaseClient'

export async function fetchAllMonthlyReports() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .order('month', { ascending: false })
  if (error) throw error
  return (data || []).map(normalizeReport)
}

export async function upsertMonthlyReportRemote(report) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase
    .from('monthly_reports')
    .upsert(reportToRow(report), { onConflict: 'id' })
  if (error) throw error
}

export async function deleteMonthlyReportRemote(id) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase
    .from('monthly_reports')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function pushAllMonthlyReports(reports) {
  if (!isSupabaseConfigured() || reports.length === 0) return
  const { error } = await supabase
    .from('monthly_reports')
    .upsert(reports.map(reportToRow), { onConflict: 'id' })
  if (error) throw error
}

function reportToRow(report) {
  return {
    id: report.id,
    month: report.month,
    narrative: report.narrative || '',
    highlights: report.highlights || [],
    todos_created: report.todos_created || 0,
    todos_done: report.todos_done || 0,
    completion_rate: report.completion_rate || 0,
    days_logged: report.days_logged || 0,
    longest_streak: report.longest_streak || 0,
    conquistas_total: report.conquistas_total || 0,
    conquistas_list: report.conquistas_list || [],
    mood_distribution: report.mood_distribution || {},
    top_mood: report.top_mood || '',
    word_cloud: report.word_cloud || [],
    pesquisa_chars: report.pesquisa_chars || 0,
    dev_chars: report.dev_chars || 0,
    notas_chars: report.notas_chars || 0,
    is_auto_generated: report.is_auto_generated || false,
  }
}

function normalizeReport(row) {
  return {
    id: row.id,
    month: row.month,
    narrative: row.narrative || '',
    highlights: row.highlights || [],
    todos_created: row.todos_created || 0,
    todos_done: row.todos_done || 0,
    completion_rate: row.completion_rate || 0,
    days_logged: row.days_logged || 0,
    longest_streak: row.longest_streak || 0,
    conquistas_total: row.conquistas_total || 0,
    conquistas_list: row.conquistas_list || [],
    mood_distribution: row.mood_distribution || {},
    top_mood: row.top_mood || '',
    word_cloud: row.word_cloud || [],
    pesquisa_chars: row.pesquisa_chars || 0,
    dev_chars: row.dev_chars || 0,
    notas_chars: row.notas_chars || 0,
    is_auto_generated: row.is_auto_generated || false,
  }
}
