import { useEntries } from '../../hooks/useEntries'

const STATUS_CONFIG = {
  idle: { icon: '☁️', label: 'Supabase', color: 'text-gray-400' },
  loading: { icon: '🔄', label: 'Sincronizando...', color: 'text-blue-500' },
  saving: { icon: '🔄', label: 'Salvando...', color: 'text-blue-500' },
  synced: { icon: '☁️', label: 'Sincronizado', color: 'text-green-500' },
  error: { icon: '⚠️', label: 'Erro de sync', color: 'text-red-500' },
  offline: { icon: '📴', label: 'Offline', color: 'text-gray-500' },
}

export default function SyncStatus() {
  const { supabaseStatus, isOnline, syncSupabaseNow } = useEntries()

  const status = !isOnline ? 'offline' : supabaseStatus
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  return (
    <button
      onClick={syncSupabaseNow}
      title={`${config.label}${!isOnline ? ' - Modo offline ativo' : ''}`}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-gray-50 ${config.color}`}
    >
      <span className={status === 'loading' || status === 'saving' ? 'animate-spin' : ''}>
        {config.icon}
      </span>
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  )
}
