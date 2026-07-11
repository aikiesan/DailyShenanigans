import { useState, useEffect } from 'react'
import { isPushSupported, getPermissionState, getCurrentSubscription, enableDailyReminder, disableDailyReminder } from '../../utils/pushNotifications'
import { useToast } from '../shared/Toast'

/**
 * Opt-in for the daily 18h push reminder. States:
 * unsupported → hidden · off → enable button · on → active + disable link
 */
export default function PushReminderCard() {
  const [status, setStatus] = useState('checking') // checking | off | on | denied | busy
  const showToast = useToast()

  useEffect(() => {
    if (!isPushSupported()) { setStatus('unsupported'); return }
    if (getPermissionState() === 'denied') { setStatus('denied'); return }
    getCurrentSubscription()
      .then(sub => setStatus(sub ? 'on' : 'off'))
      .catch(() => setStatus('off'))
  }, [])

  if (status === 'unsupported' || status === 'checking') return null

  async function handleEnable() {
    setStatus('busy')
    try {
      await enableDailyReminder()
      setStatus('on')
      showToast('Lembrete diário ativado! Todo dia às 18h 🔔')
    } catch (err) {
      setStatus(getPermissionState() === 'denied' ? 'denied' : 'off')
      showToast(err.message || 'Não foi possível ativar', 'error')
    }
  }

  async function handleDisable() {
    setStatus('busy')
    try {
      await disableDailyReminder()
      setStatus('off')
      showToast('Lembrete desativado')
    } catch {
      setStatus('on')
      showToast('Não foi possível desativar', 'error')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <span className="text-2xl flex-shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-700">Lembrete diário (18h)</div>
        <div className="text-xs text-gray-400">
          {status === 'on' && 'Ativo neste aparelho — notificação todo dia às 18h ✅'}
          {status === 'off' && 'Receba um empurrãozinho para escrever o diário e treinar'}
          {status === 'denied' && 'Notificações bloqueadas — libere nas configurações do site no navegador'}
          {status === 'busy' && 'Um momento...'}
        </div>
      </div>
      {status === 'off' && (
        <button
          onClick={handleEnable}
          className="flex-shrink-0 bg-amazonia-500 hover:bg-amazonia-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors active:scale-95"
        >
          Ativar
        </button>
      )}
      {status === 'on' && (
        <button
          onClick={handleDisable}
          className="flex-shrink-0 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
        >
          desativar
        </button>
      )}
    </div>
  )
}
