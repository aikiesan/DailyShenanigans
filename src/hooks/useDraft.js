import { useState, useEffect, useRef, useCallback } from 'react'
import { loadDraft, saveDraft, clearDraft } from '../utils/storage'

export function useDraft(date) {
  const [draftStatus, setDraftStatus] = useState('saved') // 'saved' | 'unsaved' | 'saving'
  const timerRef = useRef(null)
  const entryRef = useRef(null)

  const loadExistingDraft = useCallback(() => {
    return loadDraft(date)
  }, [date])

  const markChanged = useCallback(() => {
    setDraftStatus('unsaved')
  }, [])

  const saveNow = useCallback((entry) => {
    entryRef.current = entry
    saveDraft(date, entry)
    setDraftStatus('saved')
  }, [date])

  const scheduleAutoSave = useCallback((entry) => {
    entryRef.current = entry
    setDraftStatus('unsaved')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveDraft(date, entry)
      setDraftStatus('saved')
    }, 30000)
  }, [date])

  const discardDraft = useCallback(() => {
    clearDraft(date)
    setDraftStatus('saved')
  }, [date])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (entryRef.current && draftStatus === 'unsaved') {
        saveDraft(date, entryRef.current)
      }
    }
  }, [date, draftStatus])

  return {
    draftStatus,
    loadExistingDraft,
    markChanged,
    saveNow,
    scheduleAutoSave,
    discardDraft,
  }
}
