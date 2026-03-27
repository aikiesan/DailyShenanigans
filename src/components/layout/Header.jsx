import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import GitHubSyncButton from '../shared/GitHubSyncButton'
import SyncStatus from '../shared/SyncStatus'

const NAV_ITEMS = [
  { to: '/', label: 'Arquivo', icon: '🗂️' },
  { to: '/stats', label: 'Estatísticas', icon: '📊' },
  { to: '/about', label: 'Sobre', icon: '🦫' },
]

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
      {/* Biome gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-cerrado-500 via-amazonia-500 via-30% via-atlantica-500 via-50% via-caatinga-500 via-70% via-pantanal-500 via-85% to-pampa-500" />

      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-3xl group-hover:capybara-bounce inline-block transition-transform">🌿</span>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 leading-tight">
              Daily Shenanigans
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              Registro diário de pesquisa geoespacial · NIPE/Unicamp
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          {NAV_ITEMS.map(item => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amazonia-50 text-amazonia-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <SyncStatus />
          <GitHubSyncButton />
          <button
            onClick={signOut}
            title="Sair"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Sair
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-2xl"
          aria-label="Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1">
          <div className="flex justify-end items-center gap-2 py-1 border-b border-gray-50 mb-1">
            <SyncStatus />
            <GitHubSyncButton />
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              Sair
            </button>
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-amazonia-50 text-amazonia-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
