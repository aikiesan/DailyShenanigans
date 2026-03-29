import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { isSupabaseConfigured } from '../utils/supabaseClient'
import {
  fetchAllMonthlyReports,
  upsertMonthlyReportRemote,
  deleteMonthlyReportRemote,
  pushAllMonthlyReports,
} from '../utils/supabaseMonthly'

const STORAGE_KEY = 'dailyShenanigans_monthly_reports'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {}
}

const MonthlyReportsContext = createContext(null)

export function MonthlyReportsProvider({ children }) {
  const [reports, setReports] = useState(() => loadFromStorage())
  const [supabaseStatus, setSupabaseStatus] = useState('idle')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const pushTimerRef = useRef(null)
  const initialSyncDone = useRef(false)

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
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

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(reports)
  }, [reports])

  // Supabase: pull on mount
  useEffect(() => {
    if (!isSupabaseConfigured() || initialSyncDone.current) return
    let cancelled = false
    setSupabaseStatus('loading')

    fetchAllMonthlyReports()
      .then(async (remote) => {
        if (cancelled) return
        initialSyncDone.current = true
        const local = loadFromStorage()

        if (remote.length === 0 && local.length > 0) {
          try {
            await pushAllMonthlyReports(local)
            setSupabaseStatus('synced')
          } catch {
            setSupabaseStatus('error')
          }
        } else if (remote.length > 0) {
          const merged = mergeReports(remote, local)
          setReports(merged)
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
    pushAllMonthlyReports(reports)
      .then(() => setSupabaseStatus('synced'))
      .catch(() => setSupabaseStatus('error'))
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSupabasePush = useCallback((report) => {
    if (!isSupabaseConfigured() || !isOnline) return
    clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => {
      setSupabaseStatus('saving')
      upsertMonthlyReportRemote(report)
        .then(() => setSupabaseStatus('synced'))
        .catch(() => setSupabaseStatus('error'))
    }, 1500)
  }, [isOnline])

  const getReport = useCallback((month) => {
    return reports.find(r => r.month === month) || null
  }, [reports])

  const upsertReport = useCallback((report) => {
    setReports(prev => {
      const idx = prev.findIndex(r => r.month === report.month)
      let next
      if (idx >= 0) {
        next = [...prev]
        next[idx] = { ...report }
      } else {
        next = [...prev, { ...report }]
      }
      return next.sort((a, b) => b.month.localeCompare(a.month))
    })
    scheduleSupabasePush(report)
  }, [scheduleSupabasePush])

  const deleteReport = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id))
    if (isSupabaseConfigured() && isOnline) {
      deleteMonthlyReportRemote(id).catch(() => setSupabaseStatus('error'))
    }
  }, [isOnline])

  const value = {
    reports,
    getReport,
    upsertReport,
    deleteReport,
    supabaseStatus,
    isOnline,
  }

  return (
    <MonthlyReportsContext.Provider value={value}>
      {children}
    </MonthlyReportsContext.Provider>
  )
}

export function useMonthlyReports() {
  const ctx = useContext(MonthlyReportsContext)
  if (!ctx) throw new Error('useMonthlyReports must be used within MonthlyReportsProvider')
  return ctx
}

function mergeReports(remote, local) {
  const map = new Map()
  local.forEach(r => map.set(r.id, r))
  remote.forEach(r => map.set(r.id, r))
  return [...map.values()].sort((a, b) => b.month.localeCompare(a.month))
}
