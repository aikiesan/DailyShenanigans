import { useState, useRef, useEffect } from 'react'
import { useEntries } from '../../hooks/useEntries'

const STATUS_CONFIG = {
  idle:    { icon: '☁️',  label: 'Sync GitHub',      color: 'text-gray-400' },
  loading: { icon: '⏳',  label: 'Carregando...',     color: 'text-blue-500' },
  saving:  { icon: '⬆️',  label: 'Salvando...',       color: 'text-blue-500' },
  synced:  { icon: '✅',  label: 'Sincronizado',      color: 'text-green-600' },
  error:   { icon: '⚠️',  label: 'Erro de sync',      color: 'text-red-500' },
}

export default function GitHubSyncButton() {
  const { ghToken, updateGhToken, syncStatus, syncError, syncNow } = useEntries()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(ghToken)
  const panelRef = useRef(null)

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Keep draft in sync with token changes
  useEffect(() => {
    setDraft(ghToken)
  }, [ghToken])

  const cfg = STATUS_CONFIG[syncStatus] || STATUS_CONFIG.idle

  function handleSave(e) {
    e.preventDefault()
    updateGhToken(draft.trim())
    setOpen(false)
  }

  function handleClear() {
    setDraft('')
    updateGhToken('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title={syncError || cfg.label}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-100 ${cfg.color}`}
      >
        <span className="text-base leading-none">{cfg.icon}</span>
        <span className="hidden sm:inline">{cfg.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
          <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
            <span>☁️</span> Sincronizar com GitHub
          </h3>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Salva seus logs como <code className="bg-gray-100 px-1 rounded">data/logs.json</code> no
            repositório. Requer um{' '}
            <strong>Personal Access Token</strong> com permissão <code className="bg-gray-100 px-1 rounded">contents:write</code>.
          </p>

          <form onSubmit={handleSave} className="space-y-2">
            <input
              type="password"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full text-xs font-mono border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazonia-400"
              autoComplete="off"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-amazonia-600 hover:bg-amazonia-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
              >
                Salvar token
              </button>
              {ghToken && (
                <button
                  type="button"
                  onClick={syncNow}
                  disabled={syncStatus === 'saving' || syncStatus === 'loading'}
                  className="flex-1 bg-atlantica-50 hover:bg-atlantica-100 text-atlantica-700 text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Sincronizar agora
                </button>
              )}
            </div>
            {ghToken && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Remover token
              </button>
            )}
          </form>

          {syncError && (
            <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 break-words">
              {syncError}
            </p>
          )}

          {!ghToken && (
            <p className="mt-2 text-xs text-gray-400 text-center">
              Sem token: dados salvos apenas localmente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
