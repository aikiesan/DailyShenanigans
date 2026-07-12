// Custom service worker: precaching (workbox) + push notifications.
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA navigation fallback
registerRoute(new NavigationRoute(createHandlerBoundToURL('/DailyShenanigans/index.html')))

// Exercise photos: cache after first view so they work offline
registerRoute(
  ({ request, url }) => request.destination === 'image' && url.pathname.includes('/exercises/'),
  new CacheFirst({
    cacheName: 'exercise-photos',
    plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 180 })],
  })
)

// Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-css' })
)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-files',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
)

// ── Push notifications ────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data?.text() }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Daily Shenanigans 🦫', {
      body: data.body || 'Hora de registrar seu dia! Diário + treino = dia completo ⭐',
      icon: '/DailyShenanigans/icons/icon-192.png',
      badge: '/DailyShenanigans/icons/icon-192.png',
      tag: 'daily-reminder',
      data: { url: data.url || '/DailyShenanigans/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/DailyShenanigans/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const win of windows) {
        if (win.url.includes('/DailyShenanigans/') && 'focus' in win) return win.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
