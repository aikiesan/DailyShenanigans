import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import ArchivePage from './components/archive/ArchivePage'
import EditorPage from './components/editor/EditorPage'

// Lazy routes: keeps the initial mobile bundle small — recharts and the
// stats/reports/workout pages only download when opened.
const WorkoutPage = lazy(() => import('./components/workout/WorkoutPage'))
const StatsPage = lazy(() => import('./components/stats/StatsPage'))
const AboutPage = lazy(() => import('./components/about/AboutPage'))
const MonthlyReportsPage = lazy(() => import('./components/reports/MonthlyReportsPage'))
const MonthlyReportDetail = lazy(() => import('./components/reports/MonthlyReportDetail'))

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <span className="text-4xl animate-bounce">🦫</span>
      <p className="text-sm font-semibold mt-3">Carregando...</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col topo-bg">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<ArchivePage />} />
            <Route path="/entry/:date" element={<EditorPage />} />
            <Route path="/treino" element={<WorkoutPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/reports" element={<MonthlyReportsPage />} />
            <Route path="/reports/:month" element={<MonthlyReportDetail />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
