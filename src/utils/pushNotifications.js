import { supabase, isSupabaseConfigured } from './supabaseClient'
import { VAPID_PUBLIC_KEY } from './pushConfig'

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function getPermissionState() {
  return isPushSupported() ? Notification.permission : 'unsupported'
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

/** Asks permission, subscribes and stores the subscription in Supabase. */
export async function enableDailyReminder() {
  if (!isPushSupported()) throw new Error('Este navegador não suporta notificações push.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permissão de notificação negada.')

  const reg = await navigator.serviceWorker.ready
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  if (isSupabaseConfigured()) {
    const json = subscription.toJSON()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ endpoint: json.endpoint, subscription: json }, { onConflict: 'endpoint' })
    if (error) throw error
  }
  return subscription
}

export async function disableDailyReminder() {
  const subscription = await getCurrentSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  if (isSupabaseConfigured()) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}
