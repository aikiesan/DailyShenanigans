import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { loadEntries, saveEntries, exportToJSON, importFromJSON, mergeEntries, createEmptyEntry } from '../utils/storage'
import { getGhToken, saveGhToken, fetchLogsFromGitHub, pushLogsToGitHub } from '../utils/github'

const EntriesContext = createContext(null)

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState(() => loadEntries())
  const [ghToken, setGhTokenState] = useState(getGhToken)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle'|'loading'|'saving'|'synced'|'error'
  const [syncError, setSyncError] = useState(null)
  const shaRef = useRef(null)
  const pushTimerRef = useRef(null)
  // Track whether current entries came from GitHub pull (to avoid double-push)
  const skipNextPushRef = useRef(false)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  // Pull from GitHub on mount (or when token changes)
  useEffect(() => {
    if (!ghToken) return
    let cancelled = false
    setSyncStatus('loading')
    setSyncError(null)
    fetchLogsFromGitHub(ghToken)
      .then(({ entries: remote, sha }) => {
        if (cancelled) return
        shaRef.current = sha
        if (remote.length > 0) {
          skipNextPushRef.current = true
          setEntries(prev => mergeEntries(prev, remote))
        }
        setSyncStatus('synced')
      })
      .catch(e => {
        if (cancelled) return
        setSyncError(e.message)
        setSyncStatus('error')
      })
    return () => { cancelled = true }
  }, [ghToken])

  const schedulePush = useCallback((entriesToPush) => {
    clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => {
      setSyncStatus('saving')
      setSyncError(null)
      pushLogsToGitHub(ghToken, entriesToPush, shaRef.current)
        .then(newSha => {
          shaRef.current = newSha
          setSyncStatus('synced')
        })
        .catch(e => {
          setSyncError(e.message)
          setSyncStatus('error')
        })
    }, 1500)
  }, [ghToken])

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
      const sorted = next.sort((a, b) => b.date.localeCompare(a.date))
      if (ghToken) schedulePush(sorted)
      return sorted
    })
  }, [ghToken, schedulePush])

  const deleteEntry = useCallback((date) => {
    setEntries(prev => {
      const next = prev.filter(e => e.date !== date)
      if (ghToken) schedulePush(next)
      return next
    })
  }, [ghToken, schedulePush])

  const handleExport = useCallback(() => {
    exportToJSON(entries)
  }, [entries])

  const handleImport = useCallback(async () => {
    const imported = await importFromJSON()
    setEntries(prev => {
      const merged = mergeEntries(prev, imported)
      if (ghToken) schedulePush(merged)
      return merged
    })
    return imported.length
  }, [ghToken, schedulePush])

  const updateGhToken = useCallback((token) => {
    saveGhToken(token)
    setGhTokenState(token)
    if (!token) {
      setSyncStatus('idle')
      setSyncError(null)
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!ghToken) return
    setSyncStatus('saving')
    setSyncError(null)
    try {
      const newSha = await pushLogsToGitHub(ghToken, entries, shaRef.current)
      shaRef.current = newSha
      setSyncStatus('synced')
    } catch (e) {
      setSyncError(e.message)
      setSyncStatus('error')
    }
  }, [ghToken, entries])

  const value = {
    entries,
    getEntry,
    upsertEntry,
    deleteEntry,
    createEmptyEntry,
    exportJSON: handleExport,
    importJSON: handleImport,
    ghToken,
    updateGhToken,
    syncStatus,
    syncError,
    syncNow,
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
