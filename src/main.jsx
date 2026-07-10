import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { EntriesProvider } from './hooks/useEntries'
import { MonthlyReportsProvider } from './hooks/useMonthlyReports'
import { WorkoutsProvider } from './hooks/useWorkouts'
import { ToastProvider } from './components/shared/Toast'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <EntriesProvider>
        <MonthlyReportsProvider>
          <WorkoutsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </WorkoutsProvider>
        </MonthlyReportsProvider>
      </EntriesProvider>
    </HashRouter>
  </StrictMode>,
)
