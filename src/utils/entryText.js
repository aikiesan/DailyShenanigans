/**
 * Single source of truth for an entry's long-form text.
 * New entries write everything to `diario`; old entries may only
 * have the legacy sectioned fields (pesquisa/dev/notas).
 * Rule: if diario has content, it IS the text (legacy fields are
 * a pre-migration copy and must not be double-counted).
 */

export function entryText(entry) {
  if (entry.diario && entry.diario.trim()) return entry.diario
  return [entry.pesquisa, entry.dev, entry.notas]
    .filter(v => v && v.trim())
    .join('\n\n')
}

export function hasDiario(entry) {
  return !!(entry.diario && entry.diario.trim())
}

/** Merge legacy sectioned content into diario for display/editing. */
export function withMergedDiario(entry) {
  if (hasDiario(entry)) return entry
  const parts = []
  if (entry.pesquisa?.trim()) parts.push('📚 Pesquisa:\n' + entry.pesquisa.trim())
  if (entry.dev?.trim()) parts.push('💻 Dev:\n' + entry.dev.trim())
  if (entry.notas?.trim()) parts.push('📝 Notas:\n' + entry.notas.trim())
  if (parts.length === 0) return entry
  return { ...entry, diario: parts.join('\n\n') }
}
