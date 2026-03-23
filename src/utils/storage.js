const STORAGE_KEY = 'dailyShenanigans_entries'
const DRAFT_PREFIX = 'dailyShenanigans_draft_'

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function loadDraft(date) {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + date)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDraft(date, entry) {
  localStorage.setItem(DRAFT_PREFIX + date, JSON.stringify(entry))
}

export function clearDraft(date) {
  localStorage.removeItem(DRAFT_PREFIX + date)
}

export function exportToJSON(entries) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daily-shenanigans-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return reject(new Error('Nenhum arquivo selecionado'))
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (Array.isArray(data)) {
            resolve(data)
          } else {
            reject(new Error('Formato inválido'))
          }
        } catch {
          reject(new Error('JSON inválido'))
        }
      }
      reader.readAsText(file)
    }
    input.click()
  })
}

export function mergeEntries(existing, imported) {
  const map = new Map()
  existing.forEach(e => map.set(e.id || e.date, e))
  imported.forEach(e => {
    const key = e.id || e.date
    if (!map.has(key)) {
      map.set(key, e)
    }
  })
  return [...map.values()].sort((a, b) => (b.date || b.id).localeCompare(a.date || a.id))
}

export function createEmptyEntry(date) {
  return {
    id: date,
    date,
    todos: [],
    pesquisa: '',
    dev: '',
    notas: '',
    conquistas: [],
    mood: '',
    tags: [],
  }
}
