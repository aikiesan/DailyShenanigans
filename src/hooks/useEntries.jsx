import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { loadEntries, saveEntries, exportToJSON, importFromJSON, mergeEntries, createEmptyEntry } from '../utils/storage'
import { getGhToken, saveGhToken, fetchLogsFromGitHub, pushLogsToGitHub } from '../utils/github'
import { fetchAllEntries, upsertEntryRemote, deleteEntryRemote, pushAllEntries } from '../utils/supabase'
import { isSupabaseConfigured } from '../utils/supabaseClient'

const EntriesContext = createContext(null)

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState(() => loadEntries())
  const [ghToken, setGhTokenState] = useState(getGhToken)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [syncError, setSyncError] = useState(null)
  const [supabaseStatus, setSupabaseStatus] = useState('idle')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const shaRef = useRef(null)
  const pushTimerRef = useRef(null)
  const supabasePushTimerRef = useRef(null)
  const skipNextPushRef = useRef(false)
  const initialSyncDone = useRef(false)

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true)
    }
    const goOffline = () => {
      setIsOnline(false)
      if (isSupabaseConfigured()) setSupabaseStatus('offline')
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Persist to localStorage whenever entries change
  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  // Supabase: pull on mount, migrate localStorage data if needed
  useEffect(() => {
    if (!isSupabaseConfigured() || initialSyncDone.current) return
    let cancelled = false
    setSupabaseStatus('loading')

    fetchAllEntries()
      .then(async (remote) => {
        if (cancelled) return
        initialSyncDone.current = true
        const local = loadEntries()

        if (remote.length === 0 && local.length > 0) {
          // First time: migrate localStorage to Supabase
          try {
            await pushAllEntries(local)
            setSupabaseStatus('synced')
          } catch {
            setSupabaseStatus('error')
          }
        } else if (remote.length > 0) {
          // Merge remote (source of truth) with local
          const merged = mergeRemoteLocal(remote, local)
          skipNextPushRef.current = true
          setEntries(merged)
          // Push any local-only entries to Supabase
          const remoteIds = new Set(remote.map(e => e.id || e.date))
          const localOnly = local.filter(e => !remoteIds.has(e.id || e.date))
          if (localOnly.length > 0) {
            pushAllEntries(localOnly).catch(() => {})
          }
          setSupabaseStatus('synced')
        } else {
          setSupabaseStatus('synced')
        }
      })
      .catch(() => {
        if (!cancelled) setSupabaseStatus('error')
      })

    return () => { cancelled = true }
  }, [])

  // Re-sync when coming back online
  useEffect(() => {
    if (!isOnline || !isSupabaseConfigured() || !initialSyncDone.current) return
    setSupabaseStatus('loading')
    pushAllEntries(entries)
      .then(() => setSupabaseStatus('synced'))
      .catch(() => setSupabaseStatus('error'))
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch from Supabase when tab becomes visible (cross-device sync)
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    function handleVisibility() {
      if (!document.hidden && initialSyncDone.current && isOnline) {
        fetchAllEntries()
          .then((remote) => {
            if (remote.length > 0) {
              setEntries(prev => mergeRemoteLocal(remote, prev))
            }
          })
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isOnline])

  // GitHub: pull on mount when token set
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

  const scheduleSupabasePush = useCallback((entry) => {
    if (!isSupabaseConfigured() || !isOnline) return
    clearTimeout(supabasePushTimerRef.current)
    supabasePushTimerRef.current = setTimeout(() => {
      setSupabaseStatus('saving')
      upsertEntryRemote(entry)
        .then(() => setSupabaseStatus('synced'))
        .catch(() => setSupabaseStatus('error'))
    }, 1500)
  }, [isOnline])

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
    scheduleSupabasePush(entry)
  }, [ghToken, schedulePush, scheduleSupabasePush])

  const deleteEntry = useCallback((date) => {
    setEntries(prev => {
      const next = prev.filter(e => e.date !== date)
      if (ghToken) schedulePush(next)
      return next
    })
    if (isSupabaseConfigured() && isOnline) {
      deleteEntryRemote(date).catch(() => setSupabaseStatus('error'))
    }
  }, [ghToken, schedulePush, isOnline])

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
    if (isSupabaseConfigured() && isOnline) {
      pushAllEntries(imported).catch(() => setSupabaseStatus('error'))
    }
    return imported.length
  }, [ghToken, schedulePush, isOnline])

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

  const syncSupabaseNow = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    setSupabaseStatus('loading')
    try {
      await pushAllEntries(entries)
      setSupabaseStatus('synced')
    } catch {
      setSupabaseStatus('error')
    }
  }, [entries])

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
    supabaseStatus,
    isOnline,
    syncSupabaseNow,
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

function mergeRemoteLocal(remote, local) {
  const map = new Map()
  local.forEach(e => map.set(e.id || e.date, e))
  remote.forEach(e => map.set(e.id || e.date, e))
  return [...map.values()].sort((a, b) => (b.date || b.id).localeCompare(a.date || a.id))
}
