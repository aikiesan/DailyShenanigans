import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loadEntries, saveEntries, exportToJSON, importFromJSON, mergeEntries, createEmptyEntry } from '../utils/storage'

const EntriesContext = createContext(null)

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState(() => loadEntries())

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const getEntry = useCallback((date) => {
    return entries.find(e => e.date === date) || null
  }, [entries])

  const upsertEntry = useCallback((entry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === entry.date)
      let next
      if (idx >= 0) {
        next = [...prev]
        next[idx] = { ...entry }
      } else {
        next = [...prev, { ...entry }]
      }
      return next.sort((a, b) => b.date.localeCompare(a.date))
    })
  }, [])

  const deleteEntry = useCallback((date) => {
    setEntries(prev => prev.filter(e => e.date !== date))
  }, [])

  const handleExport = useCallback(() => {
    exportToJSON(entries)
  }, [entries])

  const handleImport = useCallback(async () => {
    const imported = await importFromJSON()
    setEntries(prev => mergeEntries(prev, imported))
    return imported.length
  }, [])

  const value = {
    entries,
    getEntry,
    upsertEntry,
    deleteEntry,
    createEmptyEntry,
    exportJSON: handleExport,
    importJSON: handleImport,
  }

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const ctx = useContext(EntriesContext)
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider')
  return ctx
}
