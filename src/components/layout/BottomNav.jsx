import { Link, useLocation } from 'react-router-dom'
import { todayISO } from '../../utils/dateUtils'

export default function BottomNav() {
  const location = useLocation()
  const today = todayISO()

  const items = [
    { to: '/', label: 'Arquivo', icon: '🗂️', active: location.pathname === '/' },
    { to: `/entry/${today}`, label: 'Hoje', icon: '📖', active: location.pathname.startsWith('/entry') },
    { to: '/treino', label: 'Treino', icon: '💪', active: location.pathname.startsWith('/treino') },
    { to: '/stats', label: 'Stats', icon: '📊', active: location.pathname.startsWith('/stats') },
    { to: '/reports', label: 'Meses', icon: '📅', active: location.pathname.startsWith('/reports') },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {items.map(item => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-colors ${
              item.active ? 'text-amazonia-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`text-xl leading-none ${item.active ? '' : 'grayscale opacity-70'}`}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
