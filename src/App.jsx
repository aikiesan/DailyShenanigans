import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ArchivePage from './components/archive/ArchivePage'
import EditorPage from './components/editor/EditorPage'
import StatsPage from './components/stats/StatsPage'
import AboutPage from './components/about/AboutPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col topo-bg">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<ArchivePage />} />
          <Route path="/entry/:date" element={<EditorPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
