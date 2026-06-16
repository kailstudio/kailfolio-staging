import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import HeroSequence from './components/HeroSequence.jsx'
import PortfolioSection from './components/PortfolioSection.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import './styles.css'

export default function App() {
  const [detailCat, setDetailCat] = useState(null)

  return (
    <main className="app">
      {/* Animated gradient background — fixed, behind everything */}
      <div className="app-bg" aria-hidden="true" />

      {/* 1 — Hero: parallax bubbles + scroll-driven PNG character */}
      <HeroSequence />

      {/* 2 — Portfolio: glass panel that rises over hero at frame ~75 */}
      <PortfolioSection onProjectOpen={setDetailCat} />

      {/* Footer */}
      <footer className="footer">
        <img src="/logo.svg" alt="Studio KAIL" className="footer-logo" draggable={false} />
        <p>© 2024 Studio KAIL. All rights reserved.</p>
        <a href="mailto:hello@kail.studio">hello@kail.studio</a>
      </footer>

      {/*
       * Project detail — rendered at root so position:fixed covers the
       * full viewport even though PortfolioSection uses backdrop-filter.
       */}
      <AnimatePresence>
        {detailCat && (
          <ProjectDetail
            key={detailCat.id}
            cat={detailCat}
            onClose={() => setDetailCat(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
