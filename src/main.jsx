import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { EntriesProvider } from './hooks/useEntries'
import { ToastProvider } from './components/shared/Toast'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <EntriesProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </EntriesProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
